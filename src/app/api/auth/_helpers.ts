import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/cookies";
import { signSessionToken } from "@/lib/jwt";

/**
 * Read an env var and throw a readable error if it's missing.
 * Used at the start of every auth route so misconfig fails fast.
 */
export function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export async function signAndSetSessionCookie(
  payload: Parameters<typeof signSessionToken>[0],
): Promise<void> {
  const token = await signSessionToken(payload);
  const jar = await cookies();
  jar.set({ ...authCookieOptions(), value: token });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set({ ...authCookieOptions(), value: "", maxAge: 0 });
}

/* ---------- OAuth state helpers ---------- */

const STATE_COOKIE = "ftd_oauth_state";
const STATE_TTL_SECONDS = 60 * 10; // 10 min

interface OAuthStatePayload extends JWTPayload {
  returnTo: string;
  guildId: string;
  nonce: string;
}

function stateSecret(): Uint8Array {
  // Reuse the same JWT_SECRET - it's already a high-entropy symmetric key.
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var is not set");
  return new TextEncoder().encode(secret);
}

/**
 * Sign the CSRF `state` token we give Discord. Encodes:
 *   • returnTo  - where to send the user after callback
 *   • guildId   - guards against an attacker swapping guild IDs
 *   • nonce     - random per-request value (so identical returnTos differ)
 * The same string is stored as a short-lived httpOnly cookie so the
 * callback can compare the value Discord echoes back with what we set.
 */
export async function signOAuthState(
  payload: Pick<OAuthStatePayload, "returnTo" | "guildId">,
): Promise<string> {
  return await new SignJWT({
    returnTo: payload.returnTo,
    guildId: payload.guildId,
    nonce: crypto.randomUUID(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${STATE_TTL_SECONDS}s`)
    .sign(stateSecret());
}

/**
 * Verify `state` and read it from the cookie in one shot. Returns null
 * if no state cookie, the cookie is missing, or the JWT is invalid.
 *
 * NOTE: callers must still compare the *value* the cookie holds with the
 * `state` query-param Discord sends - by binding BOTH to the same JWT
 * we keep the comparison cheap (string equality).
 */
export async function verifyOAuthState(
  state: string,
): Promise<Pick<OAuthStatePayload, "returnTo" | "guildId"> | null> {
  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(STATE_COOKIE)?.value;
    if (!cookieValue || cookieValue !== state) return null;

    const { payload } = await jwtVerify(state, stateSecret(), {
      algorithms: ["HS256"],
    });
    const data = payload as OAuthStatePayload;
    if (typeof data.returnTo !== "string" || typeof data.guildId !== "string") {
      return null;
    }
    return { returnTo: data.returnTo, guildId: data.guildId };
  } catch {
    return null;
  }
}

// Re-export so auth routes only need one import line.
export { AUTH_COOKIE_NAME, STATE_COOKIE };
