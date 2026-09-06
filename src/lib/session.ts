import { signSessionToken, type FtdJwtPayload } from "@/lib/jwt";
import {
  fetchDiscordUser,
  fetchGuildMember,
  discordAvatarUrl,
  refreshAccessToken,
} from "@/lib/discord";

/**
 * Minimum session age before we silently re-fetch the user's Discord
 * profile/roles. Short enough that any page load after a minute gets
 * fresh stats, long enough that rapid navigation can't hammer Discord:
 * `/api/auth/me` runs on every navigation, but at most one refresh per
 * user per interval happens (parallel fetches share one round-trip via
 * the in-flight dedupe below).
 */
export const SESSION_REFRESH_INTERVAL_SECONDS = 60; // 1 minute

/** Shape sent to the client by `/api/auth/me` and `/api/auth/refresh`. */
export interface PublicUser {
  discordId: string;
  username: string;
  globalName: string | null;
  nick: string | null;
  avatar: string | null;
  avatarUrl: string | null;
  roles: string[];
}

export function toPublicUser(p: FtdJwtPayload): PublicUser {
  return {
    discordId: p.discordId,
    username: p.username,
    globalName: p.globalName ?? null,
    nick: p.nick ?? null,
    avatar: p.avatar,
    avatarUrl: discordAvatarUrl(p.discordId, p.avatar),
    roles: p.roles,
  };
}

/**
 * Silently refresh a stale session: re-fetches the user's Discord profile
 * and guild roles with the stored refresh token, re-signs the JWT with the
 * fresh data, and returns both the new payload and token string.
 *
 * Returns `null` (caller keeps the cached cookie) when:
 *   • the session is younger than `SESSION_REFRESH_INTERVAL_SECONDS`,
 *   • the JWT predates `refreshToken` storage,
 *   • the refresh token is missing/invalid, the user left the guild, or
 *     Discord is unreachable — the app degrades to stale data instead of
 *     ever killing a session.
 */
// Keyed by discordId so concurrent requests from the SAME user (e.g. the
// header's UserMenu and a paperwork form's useHighestRank both fetch
// /api/auth/me on mount) share one Discord round-trip instead of two.
type RefreshResult = {
  payload: FtdJwtPayload;
  token: string;
} | null;
const refreshInFlight = new Map<string, Promise<RefreshResult>>();

export async function refreshSessionIfStale(
  payload: FtdJwtPayload,
): Promise<RefreshResult> {
  if (!payload.refreshToken) return null;

  const issuedAt =
    typeof payload.iat === "number" ? payload.iat * 1000 : Number.NaN;
  if (
    Number.isFinite(issuedAt) &&
    Date.now() - issuedAt < SESSION_REFRESH_INTERVAL_SECONDS * 1000
  ) {
    return null;
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!clientId || !clientSecret || !guildId) return null;

  const existing = refreshInFlight.get(payload.discordId);
  if (existing) return existing;

  // refreshToken is non-null here thanks to the early return above; passing
  // it explicitly keeps the narrowing across the function boundary.
  const run = doDiscordRefresh(
    payload,
    { clientId, clientSecret, guildId, refreshToken: payload.refreshToken },
  );
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
      redirectUri: process.env.DISCORD_REDIRECT_URI,
    });

    const [user, member] = await Promise.all([
      fetchDiscordUser(tokenResp.access_token),
      fetchGuildMember(tokenResp.access_token, env.guildId),
    ]);

    // Left the guild — keep whatever we had rather than signing a cookie
    // with no roles. The next login will handle them properly.
    if (!member) return null;

    const freshPayload: FtdJwtPayload = {
      discordId: user.id,
      username: user.username,
      globalName: user.global_name ?? undefined,
      nick: member.nick ?? undefined,
      avatar: user.avatar,
      roles: member.roles,
      refreshToken: payload.refreshToken,
    };

    const token = await signSessionToken(freshPayload);
    return { payload: freshPayload, token };
  } catch (err) {
    console.error("[session-refresh]", err);
    return null;
  }
}