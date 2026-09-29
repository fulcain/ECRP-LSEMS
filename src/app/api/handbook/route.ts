import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { isDiscordAdmin } from "@/lib/role-config";
import {
  HANDBOOK_FORMATS,
  handbookSection,
  splitHandbookDocument,
} from "@/app/constants/divisions/ftd/handbook";
import {
  canWriteHandbook,
  readHandbook,
  readHandbookHistory,
  readHandbookVersion,
  validateSection,
  writeHandbookSection,
  writeHandbookSections,
} from "@/lib/handbook";

/**
 * GET  /api/handbook          - every section, its text, and whether this
 *                               deployment can write one back.
 * GET  /api/handbook?id=…     - that section's history (git, when there is one).
 * GET  /api/handbook?id=…&at=…- what that section said at one commit.
 * POST /api/handbook          - publish one section. Body: `{ id, content }`.
 * POST /api/handbook          - or replace a whole profile at once, which is how
 *                               a member who writes it elsewhere gets it in:
 *                               body `{ format, content }`, split back into the
 *                               format's sections at their own headings.
 *
 * The handbook is a set of files in the repository (`docs/handbook/**`), so this
 * route reads and writes files and nothing else. There is deliberately no
 * database path: on a deployment that cannot write its own files the publish is
 * refused, with the text handed back so it can still be applied by hand.
 *
 * Who may do this is `DISCORD_ADMIN_IDS` and nothing else. Every other gate in
 * the app is a stored row or a Discord role, and either could be handed out from
 * inside the app; this endpoint writes the repository, so it is gated on the one
 * identity the app cannot grant - and re-read here rather than trusting that the
 * request came from the page that shows the editor.
 */

export const dynamic = "force-dynamic";

type Editor =
  | { ok: true }
  | { ok: false; response: NextResponse };

async function requireEditor(): Promise<Editor> {
  const jar = await import("next/headers").then((mod) => mod.cookies());
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not signed in." }, { status: 401 }),
    };
  }
  const session = await verifySessionToken(token);
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not signed in." }, { status: 401 }),
    };
  }
  if (!isDiscordAdmin(session.discordId)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Forbidden: the handbook is edited by the Discord admins named in DISCORD_ADMIN_IDS.",
        },
        { status: 403 },
      ),
    };
  }
  return { ok: true };
}

export async function GET(request: Request) {
  const editor = await requireEditor();
  if (!editor.ok) return editor.response;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  // A section's history, and one version of it: only a checkout can answer, and
  // an empty list is how a deployed build says it has none.
  if (id) {
    const section = handbookSection(id);
    if (!section) {
      return NextResponse.json({ error: "No such section." }, { status: 404 });
    }
    const at = url.searchParams.get("at");
    if (at) {
      const content = await readHandbookVersion(section.file, at);
      if (content === null) {
        return NextResponse.json(
          { error: "That version could not be read here." },
          { status: 404 },
        );
      }
      return NextResponse.json({ id, at, content });
    }
    return NextResponse.json({
      id,
      history: await readHandbookHistory(section.file),
    });
  }

  return NextResponse.json({
    writable: canWriteHandbook(),
    formats: await readHandbook(),
  });
}

/**
 * Replace a whole profile from a pasted document.
 *
 * What an update is about is the phases. The profile's own header (who the
 * trainee is, when they were hired, the checklist) is the same on every profile,
 * so a section declared `protectedFromPaste` is skipped rather than written -
 * a paste carrying a blank or differently-shaped header would otherwise replace
 * it silently. Editing that section by hand still publishes it.
 *
 * The paste is compared against the files as they stand and only the sections
 * that differ are written, so an update that touched one phase leaves one file
 * changed rather than the whole format. The assembled module is rebuilt once if
 * anything moved, so the pasted profile and the sections it is cut into can never
 * be seen apart. The split is refused rather than guessed at: a missing heading
 * names the section it could not find, and a section that would lose a placeholder
 * it must keep is refused per section, exactly like a single-section publish.
 */
async function replaceFormat(key: string, content: string) {
  const format = HANDBOOK_FORMATS.find((entry) => entry.key === key);
  if (!format) {
    return NextResponse.json({ error: "No such format." }, { status: 404 });
  }
  if (!canWriteHandbook()) {
    // Handing nine files over to apply by hand is not a workflow, so this one
    // says where it has to happen instead of pretending otherwise.
    return NextResponse.json(
      {
        reason:
          "Replacing a whole profile rewrites every section file at once, so it has to be done on a local development server.",
      },
      { status: 409 },
    );
  }

  const stored = (await readHandbook()).find((entry) => entry.key === format.key);
  const split = splitHandbookDocument(stored?.sections ?? [], content);
  if (!split.ok) {
    return NextResponse.json({ error: split.reason }, { status: 422 });
  }

  const problems: string[] = [];
  const warnings: string[] = [];
  for (const entry of split.sections) {
    const section = handbookSection(entry.id);
    if (!section) continue;
    // A section this update may not write is not validated either: its own file
    // is what stands, so a placeholder missing from the paste is nothing to do
    // with it - and refusing the whole update over a header nobody changed would
    // make the guard worse than the problem.
    if (section.protectedFromPaste) {
      warnings.push(
        `${section.title} was left as it is - an update does not rewrite the profile's header.`,
      );
      continue;
    }
    const validation = validateSection(section, entry.content);
    problems.push(
      ...validation.problems.map((problem) => `${section.title}: ${problem}`),
    );
    warnings.push(
      ...validation.warnings.map((warning) => `${section.title}: ${warning}`),
    );
  }
  if (problems.length > 0) {
    return NextResponse.json(
      { error: problems[0], problems },
      { status: 422 },
    );
  }

  const result = await writeHandbookSections(split.sections, {
    keepProtected: true,
  });
  if (!result) {
    return NextResponse.json(
      { error: "The sections could not be written." },
      { status: 500 },
    );
  }
  return NextResponse.json({
    written: true,
    files: result.files,
    bytes: result.bytes,
    // The paste is the new truth, but only the sections that actually differ
    // were written - the rest keep their own history, and saying which is which
    // is what makes the commit that follows reviewable. `kept` is the header,
    // which a paste is not allowed to rewrite at all.
    changed: result.changed,
    unchanged: result.unchanged,
    kept: result.kept,
    warnings,
  });
}

export async function POST(request: Request) {
  const editor = await requireEditor();
  if (!editor.ok) return editor.response;

  let body: { id?: unknown; format?: unknown; content?: unknown };
  try {
    body = (await request.json()) as {
      id?: unknown;
      format?: unknown;
      content?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content : "";
  if (typeof body.format === "string") {
    return replaceFormat(body.format, content);
  }

  const id = typeof body.id === "string" ? body.id : "";
  const section = handbookSection(id);
  if (!section) {
    return NextResponse.json({ error: "No such section." }, { status: 404 });
  }

  const validation = validateSection(section, content);
  if (validation.problems.length > 0) {
    return NextResponse.json(
      { error: validation.problems[0], problems: validation.problems },
      { status: 422 },
    );
  }

  const result = await writeHandbookSection(id, content);
  if (!result) {
    return NextResponse.json({ error: "No such section." }, { status: 404 });
  }
  if (!result.ok) {
    // Handed back rather than stored anywhere: the member applies it and commits
    // it, which is the only way a handbook change reaches the repository.
    return NextResponse.json(
      {
        written: false,
        file: result.file,
        reason: result.reason,
        content: result.content,
        warnings: validation.warnings,
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    written: true,
    file: result.file,
    bytes: result.bytes,
    warnings: validation.warnings,
  });
}
