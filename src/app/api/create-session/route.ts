import { NextResponse } from "next/server";

import {
  combineValidation,
  inputText,
  validateDateString,
  validateName,
  validateText,
  validateTimeString,
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
    const res = await fetch(process.env.NEXT_PUBLIC_FTD_SHEET_APPSCRIPT!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-ft-session",
        yourName: inputText(data.yourName).trim(),
        date: inputText(data.date).trim(),
        timeStart: inputText(data.timeStart).trim(),
        timeFinish: inputText(data.timeFinish).trim(),
        emrName: inputText(data.emrName).trim(),
        sessionConducted: inputText(data.sessionConducted).trim(),
      }),
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
