import { NextResponse } from "next/server";

import {
  findPaperworkConfig,
  hasMongoPaperworkStore,
} from "@/lib/paperwork/amu-store";
import { GENERATED_PAPERWORK } from "@/app/constants/paperwork/generated";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ divisionKey: string }> },
) {
  if (!hasMongoPaperworkStore()) {
    return NextResponse.json({ success: true, config: null });
  }

  try {
    const { divisionKey } = await params;
    if (!/^[a-z][a-zA-Z0-9]*$/.test(divisionKey)) {
      return NextResponse.json(
        { success: false, error: "Invalid division key." },
        { status: 400 },
      );
    }
    const source = GENERATED_PAPERWORK.find((entry) => entry.division.key === divisionKey);
    const config = (await findPaperworkConfig(divisionKey)) ?? source ?? null;
    return NextResponse.json({
      success: true,
      config,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Paperwork could not be loaded from the database." },
      { status: 503 },
    );
  }
}
