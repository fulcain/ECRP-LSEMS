import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { fetchWithRetry } from "@/lib/fetch-with-retry";
import { hasSessionEditAccess } from "@/lib/role-config";
import {
  combineValidation,
  inputText,
  validateDateString,
  validateName,
  validateRowNumber,
  validateText,
  validateTimeString,
} from "@/lib/validation";

/**
 * POST /api/update-session
 *
 * Updates a single row in the "FT Sessions" sheet. The row is
 * located by the *composite* of (Date, Your Name, Time Start, Time
 * Finish, EMR's Name) so we don't depend on a fragile Timestamp
 * format. Access is restricted to the same FTO Command-or-better
 * role triple (FTHead / FTAssHead / Command) - see
 * `hasSessionEditAccess`.
 *
 * Expected body shape (everything is a string):
 *   {
 *     originalRowNumber,   // 1-based sheet row
 *     originalTimestamp,   // optional sanity check
 *     yourName,
 *     date,
 *     timeStart,
 *     timeFinish,
 *     emrName,
 *     sessionConducted,
 *   }
 */
export async function POST(req: Request) {
  // We intentionally verify the JWT inside the route handler instead
  // of routing `/api/update-session` through `ROUTE_ACCESS` - for API
  // routes a 403 JSON response is more useful than the middleware's
  // generic HTML redirect, and it keeps the route-role table focused
  // on UI pages.
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
          "Forbidden: updating FT sessions requires FTHead, FTAssHead, or Command.",
      },
      { status: 403 },
    );
  }

  let data: Record<string, unknown>;
  try {
    data = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const validation = combineValidation(
    validateRowNumber(data.originalRowNumber),
    validateText(data.originalTimestamp, "Original timestamp", {
      required: false,
      max: 100,
      allowMarkup: true,
    }),
    validateName(data.yourName, "Instructor's name"),
    validateDateString(data.date, "Session date"),
    validateTimeString(data.timeStart, "Start time"),
    validateTimeString(data.timeFinish, "Finish time"),
    validateName(data.emrName, "EMR's name"),
    validateText(data.sessionConducted, "Session conducted", { max: 500 }),
  );

  if (!validation.ok) {
    return NextResponse.json(
      { success: false, error: validation.error },
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
          action: "update-ft-session",
          originalRowNumber: String(data.originalRowNumber).trim(),
          originalTimestamp: inputText(data.originalTimestamp).trim(),
          yourName: inputText(data.yourName).trim(),
          date: inputText(data.date).trim(),
          timeStart: inputText(data.timeStart).trim(),
          timeFinish: inputText(data.timeFinish).trim(),
          emrName: inputText(data.emrName).trim(),
          sessionConducted: inputText(data.sessionConducted).trim(),
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
    // success (the 30x redirect dance). Treat the call as successful
    // when the HTTP request itself succeeded AND the script didn't
    // explicitly report failure.
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
