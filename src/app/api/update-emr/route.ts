import { NextResponse } from "next/server";
import { fetchWithRetry } from "@/lib/fetch-with-retry";
import {
  combineValidation,
  INPUT_LIMITS,
  inputText,
  validateDateString,
  validateName,
  validateOptionalBoolean,
  validateText,
  validateUrl,
} from "@/lib/validation";

export async function POST(req: Request) {
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
    validateName(data.originalEMR, "Original EMR name"),
    validateName(data.EMR, "EMR name"),
    validateUrl(data.profileLink, "EMR profile link"),
    validateDateString(data.startDate, "Start date"),
    validateDateString(data.trainingReminder, "Training reminder date"),
    validateDateString(data.fourWeeks, "Four weeks date"),
    validateOptionalBoolean(data.reminderSent, "Reminder sent"),
    validateOptionalBoolean(data.reinstatee, "Reinstatee"),
    validateOptionalBoolean(data.loa, "LOA"),
    validateText(data.notes, "Notes", {
      required: false,
      max: INPUT_LIMITS.notes,
    }),
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update-emr",
          originalEMR: inputText(data.originalEMR).trim(),
          EMR: inputText(data.EMR).trim(),
          profileLink: inputText(data.profileLink).trim(),
          reminderSent: data.reminderSent === true || data.reminderSent === "true",
          reinstatee: data.reinstatee === true || data.reinstatee === "true",
          loa: data.loa === true || data.loa === "true",
          notes: inputText(data.notes).trim(),
          startDate: inputText(data.startDate).trim(),
          trainingReminder: inputText(data.trainingReminder).trim(),
          fourWeeks: inputText(data.fourWeeks).trim(),
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

    // Treat the Apps Script call as successful when the HTTP request succeeded,
    // unless the script explicitly reported failure. Apps Script web apps often
    // return non-JSON (redirect/HTML) bodies even on success, so we can't rely
    // on the body shape alone.
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
