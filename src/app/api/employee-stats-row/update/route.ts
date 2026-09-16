import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { fetchWithRetry } from "@/lib/fetch-with-retry";

/**
 * POST /api/employee-stats-row/update
 *
 * Updates a single Employee Stats sheet row by **1-based sheet row
 * number** (`originalRowNumber`). Mirrors the same strategy as
 * `/api/update-session`: sheet-row-based lookups dodge every CSV /
 * published-sheet drift hazard by being strictly positional.
 *
 * The Apps Script handler also does a string-equality sanity check on
 * `originalName` against the row at the supplied number, so a CSV /
 * live-sheet desync (e.g. someone else inserts a row at the same
 * number between fetch and submit) refuses to silently rewrite the
 * wrong row.
 *
 * Access control: the page gate (FT Command) already restricts this
 * route's UI to FTHead / FTAssHead / Command / Consultant via the
 * middleware. We additionally verify the JWT here so a 401 JSON
 * response is returned instead of the middleware's HTML redirect on
 * direct API hits; we do NOT re-check roles since the page is
 * already gated.
 *
 * Expected body:
 *   {
 *     originalRowNumber:  number | string,    // 1-based sheet row
 *     originalName?:      string,             // optional sanity check
 *     name:               string,             // new value (column A)
 *   }
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

  if (
    data.originalRowNumber === undefined ||
    data.originalRowNumber === null ||
    String(data.originalRowNumber) === ""
  ) {
    return NextResponse.json(
      { success: false, error: "Missing originalRowNumber." },
      { status: 400 },
    );
  }

  const newName = String(data.name ?? "").trim();
  if (!newName) {
    return NextResponse.json(
      { success: false, error: "Missing or empty 'name'." },
      { status: 400 },
    );
  }

  // Optional ribbon booleans - when the client supplies any of these,
  // the Apps Script writes them to columns E (5), F (6), G (7), H (8)
  // alongside the new name. We forward undefined as null so the
  // Apps Script can distinguish "not supplied" (skip the cell) from
  // "supplied as false".
  const toBool = (v: unknown): boolean | null => {
    if (v === undefined) return null;
    if (typeof v === "boolean") return v;
    if (typeof v === "string") {
      const t = v.trim().toLowerCase();
      if (t === "true") return true;
      if (t === "false") return false;
    }
    return null;
  };
  const r15 = toBool(data.r15);
  const r40 = toBool(data.r40);
  const r100 = toBool(data.r100);
  const r165 = toBool(data.r165);

  try {
    const res = await fetchWithRetry(
      process.env.NEXT_PUBLIC_FTD_SHEET_APPSCRIPT!,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-employee-stats-row",
          originalRowNumber: String(data.originalRowNumber),
          originalName:
            data.originalName !== undefined
              ? String(data.originalName).trim()
              : "",
          name: newName,
          // Only forward the keys the client actually supplied so the
          // Apps Script handler can skip a cell when the boolean is
          // null (vs. writing FALSE when it's explicitly false).
          ...(r15 !== null ? { r15 } : {}),
          ...(r40 !== null ? { r40 } : {}),
          ...(r100 !== null ? { r100 } : {}),
          ...(r165 !== null ? { r165 } : {}),
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
