import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { refreshSessionIfStale, toPublicUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/refresh
 *
 * Manually trigger the throttled silent refresh. Returns
 * `{ refreshed, user }` — `refreshed` is false when the session was
 * younger than `SESSION_REFRESH_INTERVAL_SECONDS` or the refresh failed
 * (in which case the cached cookie is left untouched). Never logs the
 * user out: a missing/invalid session is the only 401 case.
 *
 * Client-side code (header, paperwork forms) doesn't need to call this —
 * `/api/auth/me` already refreshes in the background on page loads. This
 * exists for on-demand triggers like "re-check my roles" buttons or
 * window-focus handlers.
 */
export async function POST() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { refreshed: false, user: null },
      { status: 401 },
    );
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json(
      { refreshed: false, user: null },
      { status: 401 },
    );
  }

  const fresh = await refreshSessionIfStale(payload);
  if (fresh) {
    const res = NextResponse.json({
      refreshed: true,
      user: toPublicUser(fresh.payload),
    });
    res.cookies.set({ ...authCookieOptions(), value: fresh.token });
    return res;
  }

  return NextResponse.json({ refreshed: false, user: toPublicUser(payload) });
}