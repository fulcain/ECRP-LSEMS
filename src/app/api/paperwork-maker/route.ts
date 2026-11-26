import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { isDiscordAdmin } from "@/lib/role-config";
import { isPaperworkMakerAvailable } from "@/lib/paperwork/availability";
import {
  hasMongoPaperworkStore,
  ensurePaperworkWorkspaces,
  readAMUPaperwork,
  readAllPaperworkConfigs,
  writePaperworkConfig,
} from "@/lib/paperwork/amu-store";
import {
  planDivision,
  readEmblemNames,
  readGeneratedConfigs,
  writePlan,
} from "@/lib/paperwork/generate";
import type { PaperworkConfig } from "@/lib/paperwork/schema";
import { validatePaperworkConfig } from "@/lib/paperwork/schema";
import { DIVISION_ENTRIES } from "@/configs/roles";
import { GENERATED_PAPERWORK } from "@/app/constants/paperwork/generated";

/**
 * GET /api/paperwork-maker
 *   all saved divisions from MongoDB when configured, otherwise generated configs on disk,
 *   plus the emblem names `public/Division` holds
 *
 * POST /api/paperwork-maker
 *   `{ mode: "plan", config }`     - validate and return every file it would write
 *   `{ mode: "generate", config }` - save a division to MongoDB or write files locally
 *
 * Only `DISCORD_ADMIN_IDS` developers can use it. Production accepts database
 * saves for any division; local generation may write files. Both gates are repeated
 * here because a request can arrive without loading the page.
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

  if (hasMongoPaperworkStore()) {
    try {
      const amu = await readAMUPaperwork();
      const sourceKeys = new Set(GENERATED_PAPERWORK.map((entry) => entry.division.key));
      await ensurePaperworkWorkspaces(
        [
          ...GENERATED_PAPERWORK,
          ...DIVISION_ENTRIES
            .filter(([key]) => key !== "cru" && !sourceKeys.has(key))
            .map(([key, division]) => ({
            version: 1,
            division: {
              key,
              label: division.label,
              description: `${division.label} paperwork formats.`,
              pages: [{
                key: "paperwork",
                label: "Paperwork",
                purpose: `Create and organize ${division.label} paperwork.`,
                groups: [{ label: "Formats", formats: [] }],
              }],
            },
            } satisfies PaperworkConfig)),
        ],
      );
      const stored = await readAllPaperworkConfigs();
      const configs = [amu, ...stored.filter((entry) => entry.division.key !== "amu")];
      return NextResponse.json({
        success: true,
        configs,
        emblems: await readEmblemNames(),
      });
    } catch {
      return NextResponse.json(
          { success: false, error: "Paperwork formats could not be loaded from the database." },
        { status: 503 },
      );
    }
  }

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

  const productionBuild = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
  if (hasMongoPaperworkStore()) {
    if (body.mode !== "generate") {
      return NextResponse.json(
        { success: false, error: "Database paperwork edits must be saved." },
        { status: 403 },
      );
    }
    const validation = validatePaperworkConfig(config);
    if (!validation.ok) {
      return NextResponse.json(
        { success: false, problems: validation.problems },
        { status: 422 },
      );
    }
    try {
      await writePaperworkConfig(config);
      return NextResponse.json({
        success: true,
        written: [`${config.division.label} formats`],
        backedUp: true,
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Paperwork formats could not be saved to the database." },
        { status: 503 },
      );
    }
  }
  if (productionBuild) {
    return NextResponse.json(
      { success: false, error: "Production paperwork editing requires MongoDB." },
      { status: 403 },
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
