import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { refreshSessionIfStale, toPublicUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 *
 * Returns the signed-in user (or 401 when signed out). Called by the
 * header on every page load, so it doubles as the silent-refresh trigger:
 * when the session JWT is older than `SESSION_REFRESH_INTERVAL_SECONDS`,
 * it re-fetches the user's Discord profile + roles, re-signs the cookie,
 * and returns the fresh data. Any refresh failure falls back to the
 * cached cookie — a stale session never becomes a logged-out one here.
 */
export async function GET() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const payload = await verifySessionToken(token);
  if (!payload) return NextResponse.json({ user: null }, { status: 401 });

  const fresh = await refreshSessionIfStale(payload);
  if (fresh) {
    const res = NextResponse.json({ user: toPublicUser(fresh.payload) });
    res.cookies.set({ ...authCookieOptions(), value: fresh.token });
    return res;
  }

  return NextResponse.json({ user: toPublicUser(payload) });
}