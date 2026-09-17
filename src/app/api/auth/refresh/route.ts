import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { toPublicUser } from "@/lib/session";
import { refreshSessionIfStale } from "@/lib/session-refresh";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/refresh
 *
 * Manually trigger the silent refresh - the "re-read my roles now" button.
 * Returns `{ refreshed, reason, user }`, where `refreshed` is false when the
 * read could not be made; the cached cookie is left untouched in that case, and
 * `reason` says why so the page can tell the member what to do about it rather
 * than appearing to do nothing. Never logs the user out: a missing/invalid
 * session is the only 401 case.
 *
 * This is the one caller that passes `explicit`, so it is never answered from
 * cache: pressing the button has to actually ask Discord, otherwise a role
 * that was just removed still looks present and the feature reads as broken.
 *
 * The two reasons that matter most are `no-refresh-token` and
 * `session-expired`: the first means this browser's session was minted before
 * the app stored a Discord refresh token, the second that Discord has retired
 * the one it stored. Neither can be retried away - a fresh sign-in is the only
 * cure, and the UI says so instead of failing silently.
 *
 * Page loads don't need this - the middleware refreshes on every document
 * request and `/api/auth/me` does it in the background. This is the explicit
 * "re-check my roles right now" trigger behind the Staff Page button.
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

  const fresh = await refreshSessionIfStale(token, payload, { explicit: true });
  if (fresh.ok) {
    const res = NextResponse.json({
      refreshed: true,
      carried: fresh.carried ?? false,
      reason: null,
      user: toPublicUser(fresh.payload),
    });
    res.cookies.set({ ...authCookieOptions(), value: fresh.token });
    return res;
  }

  return NextResponse.json({
    refreshed: false,
    reason: fresh.reason,
    user: toPublicUser(payload),
  });
}