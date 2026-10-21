import { NextResponse } from "next/server";
import { fetchWithRetry } from "@/lib/fetch-with-retry";
import { inputText, validateName } from "@/lib/validation";

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

  const validation = validateName(data.emr, "EMR name");
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
          action: "delete-emr",
          emr: inputText(data.emr).trim(),
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
