import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { fetchWithRetry } from "@/lib/fetch-with-retry";

/**
 * POST /api/employee-stats-row/reinstate
 *
 * Reinstates an ex-FTO by moving them from below "Ex FTOs" to above
 * it. The Apps Script `reinstate-employee-stats-row` handler does:
 *   1. Find the row below "Ex FTOs" whose column A matches `name`.
 *   2. `insertRowBefore(sentinelRow)` to open a slot.
 *   3. Copy the source row's full row contents into the new slot.
 *   4. Delete the source row (now shifted +1 by step 2).
 *
 * Access control: the page gate (FT Command) already restricts this
 * route's UI to FTHead / FTAssHead / Command / Consultant via the
 * middleware. We additionally verify the JWT here so a 401 JSON
 * response is returned instead of the middleware's HTML redirect on
 * direct API hits; we do NOT re-check roles since the page is
 * already gated.
 *
 * Expected body: { name: string } - must match an ex-FTO row's
 * column-A value (case-insensitive trim on the Apps Script side).
 */
export async function POST(req: Request) {
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

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const name = String(data.name ?? "").trim();
  if (!name) {
    return NextResponse.json(
      { success: false, error: "Missing or empty 'name'." },
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
          action: "reinstate-employee-stats-row",
          name,
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
