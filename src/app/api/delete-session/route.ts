import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { fetchWithRetry } from "@/lib/fetch-with-retry";
import { hasSessionEditAccess } from "@/lib/role-config";

/**
 * POST /api/delete-session
 *
 * Deletes a single row in "FT Sessions" by 1-based sheet row number
 * (sent as `originalRowNumber`). Same Command+ role gate as
 * `/api/update-session` - see `hasSessionEditAccess`.
 *
 * Expected body shape:
 *   { originalRowNumber, originalTimestamp? }
 *
 * `originalTimestamp` is optional; when supplied, the Apps Script
 * re-verifies the cell at `originalRowNumber` matches before
 * deleting, so a CSV row-order drift can't quietly nuke the
 * wrong row.
 */
export async function POST(req: Request) {
  // We verify the JWT inside the route handler (no `ROUTE_ACCESS`
  // entry for `/api/delete-session`) so a 403 JSON response is
  // returned instead of the middleware's HTML redirect, and so
  // the route-role table stays focused on UI pages.
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Invalid or expired session" },
      { status: 401 },
    );
  }

  if (!hasSessionEditAccess(payload.roles, payload.discordId)) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Forbidden: deleting FT sessions requires FTHead, FTAssHead, or Command.",
      },
      { status: 403 },
    );
  }

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  try {
    const res = await fetchWithRetry(
      process.env.NEXT_PUBLIC_FTD_SHEET_APPSCRIPT!,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-ft-session",
          ...data,
        }),
        redirect: "follow",
      },
    );

    const text = await res.text();
    let result: Record<string, unknown> = {};
    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text };
    }

    // Apps Script often returns non-JSON or unexpected bodies on
    // success (the 30x redirect dance). Treat the call as
    // successful when the HTTP request itself succeeded AND the
    // script didn't explicitly report failure.
    return NextResponse.json({
      ...result,
      success: res.ok && result.success === true,
    });
  } catch (err) {
    console.error("Error posting to webhook:", err);
    return NextResponse.json({
      success: false,
      error: "Failed to reach Apps Script after retries (DNS/network).",
      detail: String(err),
    });
  }
}
