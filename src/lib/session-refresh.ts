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
  | "discord-error";

export type RefreshResult =
  | { ok: true; payload: FtdJwtPayload; token: string }
  | { ok: false; reason: RefreshFailureReason };

// Keyed by discordId so concurrent requests from the SAME member (the
// middleware, the header's UserMenu and the Staff Page all read the session
// on one page load) share one Discord round-trip instead of racing - which
// also matters because Discord rotates the refresh token on every use.
const refreshInFlight = new Map<string, Promise<RefreshResult>>();

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
 * `null` means one of:
 *   • the session is younger than the interval (`force` uses the shorter
 *     FORCED_REFRESH_MIN_INTERVAL_SECONDS, `explicit` has no interval at all),
 *     so the cookie is already current;
 *   • the JWT predates `refreshToken` storage;
 *   • the refresh token is missing/invalid, the member left the guild, or
 *     Discord is unreachable.
 *
 * Callers keep using the cached payload in every one of those cases: the app
 * degrades to slightly stale roles rather than ever ending a session.
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
  payload: FtdJwtPayload,
  options?: { force?: boolean; explicit?: boolean },
): Promise<RefreshResult> {
  if (!payload.refreshToken) return { ok: false, reason: "no-refresh-token" };

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

  const existing = refreshInFlight.get(payload.discordId);
  if (existing) return existing;

  // refreshToken is non-null here thanks to the early return above; passing
  // it explicitly keeps the narrowing across the function boundary.
  const run = doDiscordRefresh(payload, {
    clientId,
    clientSecret,
    guildId,
    refreshToken: payload.refreshToken,
  });
  refreshInFlight.set(payload.discordId, run);
  try {
    return await run;
  } finally {
    refreshInFlight.delete(payload.discordId);
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
  try {
    const tokenResp = await refreshAccessToken({
      clientId: env.clientId,
      clientSecret: env.clientSecret,
      refreshToken: env.refreshToken,
    });

    const [user, member] = await Promise.all([
      fetchDiscordUser(tokenResp.access_token),
      fetchGuildMember(tokenResp.access_token, env.guildId),
    ]);

    // Left the guild - keep whatever we had rather than signing a cookie
    // with no roles. The next login will handle them properly.
    if (!member) return { ok: false, reason: "left-guild" };

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
    if (!refreshFailedFor.has(payload.discordId)) {
      refreshFailedFor.add(payload.discordId);
      console.error(
        "[session-refresh] Discord refresh failed, keeping the cached session:",
        err,
      );
    }
    return { ok: false, reason: "discord-error" };
  }
}
