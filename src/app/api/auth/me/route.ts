import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { toPublicUser } from "@/lib/session";
import { refreshSessionIfStale } from "@/lib/session-refresh";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 *
 * Returns the signed-in user (or 401 when signed out). Called by the
 * header on every page load, so it doubles as a silent-refresh trigger:
 * when the session JWT is older than `SESSION_REFRESH_INTERVAL_SECONDS`,
 * it re-fetches the user's Discord profile + roles, re-signs the cookie,
 * and returns the fresh data. Any refresh failure falls back to the
 * cached cookie - a stale session never becomes a logged-out one here.
 *
 * A page load has usually refreshed already (the middleware does it on
 * every document request), so this normally answers from the cookie.
 *
 * `?refresh=1` asks for a current read instead of settling for a recent one
 * (the shorter forced window in `session-refresh.ts`), which is what the
 * Staff Page and the paperwork forms pass on mount: navigating to them should
 * show a rank granted a moment ago, not wait out the background interval.
 */
export async function GET(req: NextRequest) {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const payload = await verifySessionToken(token);
  if (!payload) return NextResponse.json({ user: null }, { status: 401 });

  const force = req.nextUrl.searchParams.get("refresh") === "1";
  const fresh = await refreshSessionIfStale(payload, { force });
  if (fresh.ok) {
    const res = NextResponse.json({
      user: toPublicUser(fresh.payload),
      refreshed: true,
      reason: null,
    });
    res.cookies.set({ ...authCookieOptions(), value: fresh.token });
    return res;
  }

  // `reason` travels with the cached user so a caller can tell "Discord said
  // nothing new" from "Discord could not be asked" - the second is what a
  // member has to act on, and it was invisible before.
  return NextResponse.json({
    user: toPublicUser(payload),
    refreshed: false,
    reason: fresh.reason,
  });
}