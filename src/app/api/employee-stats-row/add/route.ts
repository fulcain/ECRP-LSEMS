import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { fetchWithRetry } from "@/lib/fetch-with-retry";
import { inputText, validateName } from "@/lib/validation";

/**
 * POST /api/employee-stats-row/add
 *
 * Adds a single active FTO to the "Employee Stats" sheet. The Apps
 * Script handler `add-employee-stats-row` finds the row whose column A
 * is exactly "Ex FTOs" (the sentinel), inserts a brand-new blank row
 * just above it, and writes the supplied name into column A plus
 * `0` into column B plus the standard session-count formula into
 * column C plus `"FALSE"` into the four ribbon columns.
 *
 * Access control: the page gate (FT Command) already restricts this
 * route's UI to FTHead / FTAssHead / Command / Consultant via the
 * middleware. We additionally verify the JWT here so a 401 JSON
 * response is returned instead of the middleware's HTML redirect on
 * direct API hits; we do NOT re-check roles since the page is
 * already gated.
 *
 * Expected body: { name: string }
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

  const validation = validateName(data.name, "Name");
  if (!validation.ok) {
    return NextResponse.json(
      { success: false, error: validation.error },
      { status: 400 },
    );
  }

  const name = inputText(data.name).trim();

  try {
    const res = await fetchWithRetry(
      process.env.NEXT_PUBLIC_FTD_SHEET_APPSCRIPT!,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-employee-stats-row",
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
