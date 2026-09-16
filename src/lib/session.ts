/**
 * Reading the session for a server component or a route handler.
 *
 * The refresh side - re-reading Discord and re-signing the cookie - lives in
 * `lib/session-refresh.ts`, which touches no request-scoped API so the
 * middleware can use it too.
 */

import { cookies } from "next/headers";
import { verifySessionToken, type FtdJwtPayload } from "@/lib/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { discordAvatarUrl } from "@/lib/discord";

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

/**
 * The verified session for the current request, read from the auth cookie.
 *
 * For server components that need to know who is asking - the sidebar uses it
 * to leave out the pages a member may not open. Returns `null` when signed out
 * or when the token doesn't verify, and callers must read that as "no access"
 * rather than "no restrictions".
 */
export async function getSession(): Promise<FtdJwtPayload | null> {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
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