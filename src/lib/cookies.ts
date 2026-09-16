import { ENTRY_ROUTE } from "@/configs/routes";
import { SESSION_TTL_SECONDS } from "@/lib/jwt";

/**
 * Cookie name used for the FTD session JWT.
 * Edge `Request` and Node API routes both understand this format.
 */
export const AUTH_COOKIE_NAME = "ftd_auth";

/**
 * Where the app sends a user who lands on `/login` without a `returnTo`
 * (and where the Discord OAuth flow falls back to if its `returnTo`
 * turns out not to be a same-origin path).
 *
 * That is the entry point, `/`, which the middleware resolves to the first
 * page the member's own roles open - FT Sessions for a trainer, the Staff Page
 * for anyone else. Sending everybody to one page would dump most of the
 * department on an access-denied screen right after signing in.
 */
export const DEFAULT_RETURN_TO = ENTRY_ROUTE;

/**
 * Cookie-options used by both sign-in (callback) and sign-out (logout)
 * routes. `NextResponse.cookies.set` and `cookies().set` both accept
 * this object directly.
 */
export function authCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

/**
 * Read the auth cookie from an Edge `Request` (middleware) OR a Next.js
 * route-handler `Request`. Returns `undefined` if missing.
 *
 * `req.headers.get("cookie")` works the same in both runtimes.
 */
export function readAuthCookie(req: Request): string | undefined {
  const raw = req.headers.get("cookie");
  if (!raw) return undefined;
  const cookies = raw.split(/;\s*/);
  for (const part of cookies) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const name = part.slice(0, eq);
    const value = part.slice(eq + 1);
    if (name === AUTH_COOKIE_NAME) return value;
  }
  return undefined;
}
