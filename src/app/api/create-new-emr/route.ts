import { NextResponse } from "next/server";

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
    const res = await fetch(process.env.NEXT_PUBLIC_FTD_SHEET_APPSCRIPT!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "create-new-emr",
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
    });

    const text = await res.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch {
      result = { success: false, raw: text };
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error posting to webhook:", err);
    return NextResponse.json({ success: false, error: String(err) });
  }
}
