/**
 * Silent session refresh - re-reading a member's Discord profile and guild
 * roles, then re-signing the session cookie with what came back.
 *
 * This lives apart from `lib/session.ts` on purpose: it touches no
 * `next/headers` API, so the middleware (Edge runtime) can call it too. The
 * middleware is what makes a rank change show up on the next page load
 * instead of at the next sign-in - it refreshes a stale session *before*
 * deciding what the member may open, so the sidebar, the route gates and the
 * Staff Page all see the same current roles.
 */

import { signSessionToken, type FtdJwtPayload } from "@/lib/jwt";
import {
  DiscordTokenError,
  fetchDiscordUser,
  fetchGuildMember,
  refreshAccessToken,
} from "@/lib/discord";

/**
 * Minimum session age before a page load silently re-fetches the member's
 * Discord profile/roles.
 *
 * The middleware runs on every navigation, so this is also the floor on how
 * often the app calls Discord on its own: at most one round-trip per member
 * per interval, with parallel requests sharing one call via the in-flight
 * dedupe below. Short enough that a promotion shows up on the next reload,
 * long enough that casual navigation can't hammer the API.
 */
export const SESSION_REFRESH_INTERVAL_SECONDS = 60; // 1 minute

/**
 * The same floor for a refresh the caller explicitly asked for - a page load
 * that wants current roles (`/api/auth/me?refresh=1`) or the Staff Page's
 * "Sync from Discord" button.
 *
 * Deliberately much shorter than the automatic interval, and never zero: it
 * is only there so reloading a page over and over can't turn into a Discord
 * request loop.
 */
export const FORCED_REFRESH_MIN_INTERVAL_SECONDS = 5;

/**
 * Why a refresh didn't happen.
 *
 * Every one of these used to be a silent `null`, which is how "the button does
 * nothing" stayed invisible: a member whose cookie predates the refresh token
 * being stored could press Sync for the rest of their session - the cookie
 * lives for a hundred years - and no amount of code would ever read Discord
 * for them. Naming the reason lets the UI say which of these it is, and lets
 * the member fix the one that needs a fresh sign-in.
 */
export type RefreshFailureReason =
  /** The session has no Discord refresh token stored - it needs a fresh sign-in. */
  | "no-refresh-token"
  /** Asked again inside the interval; the cookie is already current. */
  | "throttled"
  /** Discord env vars are missing, so no read is possible. */
  | "not-configured"
  /** Discord answered 404: the member is no longer in the guild. */
  | "left-guild"
  /** The exchange or the profile fetch failed (network, rejected token, 5xx). */
  | "discord-error"
  /**
   * Discord refused the stored refresh token itself (`invalid_grant`): it has
   * been spent, revoked or expired, so no retry will ever read the member's
   * roles again. Like `no-refresh-token` this is permanent for the session, and
   * a fresh sign-in is the only cure - which is why it is named apart from the
   * transient `discord-error` that a member should simply retry.
   */
  | "session-expired";

export type RefreshResult =
  | {
      ok: true;
      payload: FtdJwtPayload;
      token: string;
      /**
       * The session was renewed but Discord was not read: the profile here is
       * the last one we had, not a fresh answer. Callers must say so rather
       * than reporting a re-read that did not happen.
       */
      carried?: boolean;
    }
  | { ok: false; reason: RefreshFailureReason };

// Keyed by the session cookie's token - the thing being redeemed - so every
// request holding the same cookie shares one Discord round-trip instead of
// racing. Keying by member would not do: two requests from one member carrying
// two different cookies are two different tokens, and only one of them can
// still be alive.
const refreshInFlight = new Map<string, Promise<RefreshResult>>();

/**
 * An exchange that already happened, kept briefly so the same cookie can be
 * redeemed again without a second call.
 *
 * This is what makes a spent refresh token recoverable. Discord's refresh
 * tokens are single-use: redeeming one retires it and hands back a replacement
 * in the response. The app redeems a cookie from several places at once - the
 * middleware on a page load, the header and the Staff Page on mount - and a
 * response whose Set-Cookie the browser never applies (an aborted prefetch, a
 * superseded RSC fetch) spends the token and drops the replacement. Every later
 * read is then refused with `invalid_grant`, so a role added in Discord never
 * appears and a removed one never disappears - a frozen session that only a
 * fresh sign-in could clear.
 *
 * Remembering the exchange answers that stuck cookie with the token it should
 * already have, and the response re-sets it.
 */
const recentRefreshes = new Map<
  string,
  { result: RefreshResult; expires: number }
>();

/** How long a spent token's exchange stays replayable. */
const REFRESH_REPLAY_TTL_MS = 10 * 60 * 1000;

// Cap the replay map so a long-lived worker can't accumulate every cookie it
// has ever redeemed.
const REFRESH_REPLAY_MAX_ENTRIES = 500;

// Members whose refresh failed, so the middleware retrying on every page load
// logs it once instead of on each navigation. Cleared when a refresh works.
const refreshFailedFor = new Set<string>();

function sessionAgeSeconds(payload: FtdJwtPayload): number {
  const issuedAt =
    typeof payload.iat === "number" ? payload.iat * 1000 : Number.NaN;
  return Number.isFinite(issuedAt) ? (Date.now() - issuedAt) / 1000 : Infinity;
}

/**
 * Re-read the member from Discord and re-sign the session, or return `null`
 * to leave the cached cookie alone.
 *
 * The `reason` on a refusal says which of these it was:
 *   • `throttled` - the session is younger than the interval (`force` uses the
 *     shorter FORCED_REFRESH_MIN_INTERVAL_SECONDS, `explicit` has no interval),
 *     so the cookie is already current;
 *   • `no-refresh-token` / `session-expired` - nothing can re-read this session
 *     again and a fresh sign-in is the only cure;
 *   • `not-configured`, `left-guild` or `discord-error` - this attempt failed,
 *     and the next one may not.
 *
 * Callers keep using the cached payload in every one of those cases: the app
 * degrades to slightly stale roles rather than ever ending a session.
 *
 * `token` is the raw session cookie being redeemed, and it is the unit of
 * deduplication: every request holding that cookie shares one exchange, and a
 * cookie Discord has already retired is answered from that exchange rather than
 * being sent again (where it would fail and leave the member's roles frozen).
 *
 * `explicit: true` is for a person pressing a button - "re-read my roles now"
 * - and skips the age check entirely, because a click is not a loop. Both
 * throttles exist to stop *automatic* reads (a page that reloads itself, a
 * component that mounts twice) from turning into a Discord request loop; a
 * deliberate click answered from cache is the one outcome that reads as the
 * feature being broken. Repeated clicks still share a single round-trip when
 * they overlap, via the in-flight dedupe below.
 */
export async function refreshSessionIfStale(
  token: string,
  payload: FtdJwtPayload,
  options?: { force?: boolean; explicit?: boolean },
): Promise<RefreshResult> {
  if (!payload.refreshToken) return { ok: false, reason: "no-refresh-token" };

  // Checked before the interval, not after: a member stuck with a spent cookie
  // must be handed the current one on their very next request, whether that is
  // a page load, a background read or a button press.
  const replayed = replayRefresh(token);
  if (replayed) return replayed;

  if (!options?.explicit) {
    const minAge = options?.force
      ? FORCED_REFRESH_MIN_INTERVAL_SECONDS
      : SESSION_REFRESH_INTERVAL_SECONDS;
    if (sessionAgeSeconds(payload) < minAge) {
      return { ok: false, reason: "throttled" };
    }
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!clientId || !clientSecret || !guildId) {
    return { ok: false, reason: "not-configured" };
  }

  const existing = refreshInFlight.get(token);
  if (existing) return await existing;

  // refreshToken is non-null here thanks to the early return above; passing
  // it explicitly keeps the narrowing across the function boundary.
  const run = doDiscordRefresh(payload, {
    clientId,
    clientSecret,
    guildId,
    refreshToken: payload.refreshToken,
  });
  refreshInFlight.set(token, run);
  try {
    const result = await run;
    rememberRefresh(token, result);
    return result;
  } finally {
    refreshInFlight.delete(token);
  }
}

/**
 * The exchange this cookie already produced, if it is still worth replaying.
 *
 * Only a successful exchange is remembered: a transient failure must stay
 * retryable, or a moment of Discord downtime would be cached for ten minutes
 * as "nothing to be done".
 */
function replayRefresh(token: string): RefreshResult | null {
  const entry = recentRefreshes.get(token);
  if (!entry) return null;
  if (entry.expires <= Date.now()) {
    recentRefreshes.delete(token);
    return null;
  }
  return entry.result;
}

function rememberRefresh(token: string, result: RefreshResult) {
  if (!result.ok) return;

  const now = Date.now();
  recentRefreshes.set(token, { result, expires: now + REFRESH_REPLAY_TTL_MS });

  if (recentRefreshes.size > REFRESH_REPLAY_MAX_ENTRIES) {
    for (const [key, entry] of recentRefreshes) {
      if (entry.expires <= now) recentRefreshes.delete(key);
    }
  }
}

async function doDiscordRefresh(
  payload: FtdJwtPayload,
  env: {
    clientId: string;
    clientSecret: string;
    guildId: string;
    refreshToken: string;
  },
): Promise<RefreshResult> {
  let tokenResp: Awaited<ReturnType<typeof refreshAccessToken>>;
  try {
    tokenResp = await refreshAccessToken({
      clientId: env.clientId,
      clientSecret: env.clientSecret,
      refreshToken: env.refreshToken,
    });
  } catch (err) {
    const reason = refusalReason(err);
    logOnce(payload.discordId, reason, err);
    return { ok: false, reason };
  }

  /**
   * The exchange above has already retired the token we sent, so from here on
   * the replacement **must** reach the cookie: dropping it is what turns one
   * failed read into a session that can never re-read itself, which is how a
   * role added in Discord stops ever showing up.
   */
  const renew = (): Promise<RefreshResult> => renewSession(payload, tokenResp);

  try {
    const [user, member] = await Promise.all([
      fetchDiscordUser(tokenResp.access_token),
      fetchGuildMember(tokenResp.access_token, env.guildId),
    ]);

    // Left the guild: there are no roles to read, and the last ones we know
    // keep the member on the pages they already had rather than signing them
    // out. The session is still renewed - a 404 can be a blip, and the next
    // sign-in sorts out a real departure.
    if (!member) {
      logOnce(payload.discordId, "left-guild", null);
      return await renew();
    }

    const freshPayload: FtdJwtPayload = {
      discordId: user.id,
      username: user.username,
      globalName: user.global_name ?? undefined,
      nick: member.nick ?? undefined,
      avatar: user.avatar,
      roles: member.roles,
      // Discord rotates refresh tokens, so the new cookie must carry the one
      // that came back - keeping the old one would end the session early.
      refreshToken: tokenResp.refresh_token || payload.refreshToken,
    };

    const token = await signSessionToken(freshPayload);
    refreshFailedFor.delete(payload.discordId);
    return { ok: true, payload: freshPayload, token };
  } catch (err) {
    logOnce(payload.discordId, "discord-error", err);
    return await renew();
  }
}

/**
 * Keep the profile we already had and swap in the refresh token the exchange
 * just returned, so the session stays able to re-read itself even when the
 * profile fetch that followed it failed.
 */
async function renewSession(
  payload: FtdJwtPayload,
  tokenResp: { access_token: string; refresh_token: string },
): Promise<RefreshResult> {
  const renewed: FtdJwtPayload = {
    ...payload,
    refreshToken: tokenResp.refresh_token || payload.refreshToken,
  };
  try {
    return {
      ok: true,
      payload: renewed,
      token: await signSessionToken(renewed),
      carried: true,
    };
  } catch (err) {
    logOnce(payload.discordId, "discord-error", err);
    return { ok: false, reason: "discord-error" };
  }
}

/** One line per member per distinct failure, not one per page load. */
function logOnce(discordId: string, reason: RefreshFailureReason, err: unknown) {
  if (refreshFailedFor.has(discordId)) return;
  refreshFailedFor.add(discordId);
  console.warn(
    `[session-refresh] Discord read failed (${reason}), keeping the cached session:`,
    err,
  );
}

/**
 * A refresh token Discord has retired - spent, revoked or expired - is
 * terminal for that session: retrying can never read the member's roles again,
 * and only a fresh sign-in replaces it. Everything else (network, 5xx, a
 * malformed answer) is worth trying again.
 */
function refusalReason(err: unknown): RefreshFailureReason {
  if (
    err instanceof DiscordTokenError &&
    (err.status === 401 || err.code === "invalid_grant")
  ) {
    return "session-expired";
  }
  return "discord-error";
}
