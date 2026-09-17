/**
 * Thin Discord OAuth2 + REST helpers.
 *
 * Two endpoints are used:
 *   • POST https://discord.com/api/oauth2/token    (code → access_token)
 *   • GET  https://discord.com/api/users/@me       (identity)
 *   • GET  https://discord.com/api/users/@me/guilds/{guildId}/member
 *     (returns the user's roles within *our* guild, or 404 if they
 *      have not joined it)
 *
 * `jose` is not required here - these are plain `fetch` calls. We only use
 * jose for *our own* session JWT.
 */

const DISCORD_API = "https://discord.com/api";

export const DISCORD_OAUTH_SCOPES = ["identify", "guilds.members.read"];

/** Subset of Discord's user object we actually keep. */
export interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar: string | null;
}

/**
 * Subset of the guild-member object we care about. Discord returns more;
 * `roles` are the role snowflakes the user holds in our guild.
 */
export interface DiscordGuildMember {
  roles: string[];
  nick?: string | null;
}

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

/**
 * A rejection from Discord's token endpoint, kept typed so a caller can tell a
 * *dead* refresh token (`invalid_grant` - spent, revoked or expired) from a
 * transient problem. The two need opposite handling: the first is permanent for
 * that session and only a fresh sign-in cures it, the second is worth retrying.
 */
export class DiscordTokenError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(status: number, code: string | null, body: string) {
    super(
      `Discord token endpoint answered ${status}${code ? ` (${code})` : ""}: ${body}`,
    );
    this.name = "DiscordTokenError";
    this.status = status;
    this.code = code;
  }
}

/** Reads the `error` field out of Discord's OAuth error body, if it has one. */
function errorCodeOf(body: string): string | null {
  try {
    const parsed = JSON.parse(body) as { error?: unknown };
    return typeof parsed.error === "string" ? parsed.error : null;
  } catch {
    return null;
  }
}

/** Build the Discord authorize URL the user is redirected to. */
export function buildDiscordAuthorizeUrl(opts: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL(`${DISCORD_API}/oauth2/authorize`);
  url.searchParams.set("client_id", opts.clientId);
  url.searchParams.set("redirect_uri", opts.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", DISCORD_OAUTH_SCOPES.join(" "));
  url.searchParams.set("state", opts.state);
  url.searchParams.set("prompt", "none");
  return url.toString();
}

/**
 * Exchange the OAuth `code` for an access token. Throws on non-2xx so the
 * caller can return a clean 500 response.
 */
export async function exchangeCodeForToken(opts: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}): Promise<DiscordTokenResponse> {
  const body = new URLSearchParams({
    client_id: opts.clientId,
    client_secret: opts.clientSecret,
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
  });

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new DiscordTokenError(res.status, errorCodeOf(text), text);
  }
  return (await res.json()) as DiscordTokenResponse;
}

/**
 * Exchange a stored refresh token for a fresh access token.
 * Discord refresh tokens don't expire, so this is safe to reuse for
 * the lifetime of the session unless the user revokes the app.
 *
 * The body carries only `grant_type` and `refresh_token` (plus the client
 * credentials), because that is the whole of what Discord documents for this
 * grant - `redirect_uri` belongs to the authorization_code exchange. Verified
 * against the live endpoint: a token exchange with and without `redirect_uri`
 * is answered identically, so omitting it is not what a rejected refresh is.
 *
 * The token is single-use: redeeming it retires it, and the response carries
 * the one that replaces it. Callers must persist the new one - the old one is
 * dead the moment this returns.
 */
export async function refreshAccessToken(opts: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<DiscordTokenResponse> {
  const body = new URLSearchParams({
    client_id: opts.clientId,
    client_secret: opts.clientSecret,
    grant_type: "refresh_token",
    refresh_token: opts.refreshToken,
  });

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new DiscordTokenError(res.status, errorCodeOf(text), text);
  }
  return (await res.json()) as DiscordTokenResponse;
}

export async function fetchDiscordUser(
  accessToken: string,
): Promise<DiscordUser> {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Discord /users/@me failed: ${res.status}`);
  }
  return (await res.json()) as DiscordUser;
}

/**
 * Returns the guild-member info for the user, or `null` if they haven't
 * joined the guild (Discord responds with 404 in that case).
 */
export async function fetchGuildMember(
  accessToken: string,
  guildId: string,
): Promise<DiscordGuildMember | null> {
  const res = await fetch(
    `${DISCORD_API}/users/@me/guilds/${guildId}/member`,      { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Discord guild-member fetch failed: ${res.status}`);
  }
  return (await res.json()) as DiscordGuildMember;
}

/** Builds the CDN URL for a user's avatar, or returns null when unset. */
export function discordAvatarUrl(
  userId: string,
  avatarHash: string | null,
): string | null {
  if (!avatarHash) return null;
  const ext = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=128`;
}
