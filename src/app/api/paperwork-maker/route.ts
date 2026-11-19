import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { isDiscordAdmin } from "@/lib/role-config";
import { isPaperworkMakerAvailable } from "@/lib/paperwork/availability";
import {
  planDivision,
  readEmblemNames,
  readGeneratedConfigs,
  writePlan,
} from "@/lib/paperwork/generate";
import type { PaperworkConfig } from "@/lib/paperwork/schema";

/**
 * GET /api/paperwork-maker
 *   every generated config on disk, so a format that was generated can be
 *   reopened in the maker and edited, plus the emblem names `public/Division`
 *   holds, so the maker can offer them instead of asking for a path
 *
 * POST /api/paperwork-maker
 *   `{ mode: "plan", config }`     - validate and return every file it would write
 *   `{ mode: "generate", config }` - write those files in this checkout
 *
 * Development only, and only for a `DISCORD_ADMIN_IDS` developer: the tool
 * writes the repository, which is the one thing no stored rule may hand out. The
 * page gate is not this gate - both are checked here because a request can arrive
 * without ever loading the page.
 *
 * `plan` is read-only and is what the UI shows before anything is written.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CONFIG_BYTES = 500_000;

type Maker =
  | { ok: true }
  | { ok: false; response: NextResponse };

async function requireMaker(): Promise<Maker> {
  if (!isPaperworkMakerAvailable()) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error:
            "The Paperwork Maker only runs on a development server. It cannot write files on a deployment.",
        },
        { status: 404 },
      ),
    };
  }

  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Not signed in." },
        { status: 401 },
      ),
    };
  }
  if (!isDiscordAdmin(session.discordId)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error:
            "Forbidden: the Paperwork Maker writes the repository, so it is limited to the developers named in DISCORD_ADMIN_IDS.",
        },
        { status: 403 },
      ),
    };
  }
  return { ok: true };
}

export async function GET() {
  const maker = await requireMaker();
  if (!maker.ok) return maker.response;

  return NextResponse.json({
    success: true,
    configs: await readGeneratedConfigs(),
    emblems: await readEmblemNames(),
  });
}

export async function POST(request: Request) {
  const maker = await requireMaker();
  if (!maker.ok) return maker.response;

  let body: { mode?: unknown; config?: unknown };
  try {
    body = (await request.json()) as { mode?: unknown; config?: unknown };
  } catch {
    return NextResponse.json(
      { success: false, error: "Expected a JSON body." },
      { status: 400 },
    );
  }

  if (JSON.stringify(body.config ?? null).length > MAX_CONFIG_BYTES) {
    return NextResponse.json(
      { success: false, error: "That config is too large to generate." },
      { status: 413 },
    );
  }

  const config = body.config as PaperworkConfig;
  if (!config || typeof config !== "object" || !config.division) {
    return NextResponse.json(
      { success: false, error: "The body must carry a paperwork config." },
      { status: 400 },
    );
  }

  const plan = await planDivision(config);

  if (body.mode === "generate") {
    if (!plan.ok) {
      return NextResponse.json(
        { success: false, problems: plan.problems },
        { status: 422 },
      );
    }
    const write = await writePlan(plan);
    return NextResponse.json({
      success: write.refused.length === 0,
      written: write.written,
      unchanged: write.unchanged,
      refused: write.refused,
      plan,
    });
  }

  if (body.mode !== undefined && body.mode !== "plan") {
    return NextResponse.json(
      { success: false, error: "mode must be “plan” or “generate”." },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: plan.ok, plan });
}
