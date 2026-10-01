import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { isDiscordAdmin } from "@/lib/role-config";
import { handbookSection } from "@/app/constants/divisions/ftd/handbook";
import {
  canWriteHandbook,
  foreignSectionHeadings,
  readHandbook,
  readHandbookHistory,
  readHandbookVersion,
  validateSection,
  writeHandbookSection,
} from "@/lib/handbook";
import { importHandbookDocument } from "@/lib/handbook-import";

/**
 * GET  /api/handbook          - every section, its text, and whether this
 *                               deployment can write one back.
 * GET  /api/handbook?id=…     - that section's history (git, when there is one).
 * GET  /api/handbook?id=…&at=…- what that section said at one commit.
 * POST /api/handbook          - publish one section. Body: `{ id, content }`.
 * POST /api/handbook          - or replace a whole profile at once, which is how
 *                               a member who writes it elsewhere gets it in:
 *                               body `{ format, content }`, converted from
 *                               whatever the paste was written in and split back
 *                               into the format's sections at their headings.
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
 * The conversion, the split, the placeholder check and the write are one
 * function - `importHandbookDocument` - shared with `npm run handbook:import`
 * and with the tab's own preview, so the three cannot disagree about what a
 * paste does. This route's whole job is to answer for it: who may ask, and
 * which status a refusal is.
 *
 * What an update is about is the phases. The profile's own header (who the
 * trainee is, when they were hired, the checklist) is the same on every profile,
 * so a section declared `protectedFromPaste` is skipped rather than written -
 * a paste carrying a blank or differently-shaped header would otherwise replace
 * it silently.
 *
 * An accepted update takes the paperwork page's Guides and Scripts with it, for
 * every phase of the profile the paste was read as: those are read by the trainers
 * who run the phase, and one that still describes last month's profile is the
 * drift this all exists to end. A phase whose notes come out identical is left
 * where it is, so the rebuild is visible in the result but not in the diff.
 */
async function replaceFormat(key: string, content: string) {
  const report = await importHandbookDocument({ content, format: key, write: true });
  if (!report.ok) {
    // A deployment that cannot write is a refusal, not a failure: the member is
    // told where the update has to happen rather than shown an error.
    if (report.status === 409) {
      return NextResponse.json(
        { reason: report.error, problems: report.problems },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: report.error, problems: report.problems, warnings: report.warnings },
      { status: report.status },
    );
  }
  return NextResponse.json({
    written: true,
    format: report.format,
    files: report.files,
    bytes: report.bytes,
    // The paste is the new truth, but only the sections that actually differ
    // were written - the rest keep their own history, and saying which is which
    // is what makes the commit that follows reviewable. `kept` is the header,
    // which a paste is not allowed to rewrite at all, and `conversions` is what
    // the paste had to be converted for on the way in.
    changed: report.changed,
    unchanged: report.unchanged,
    kept: report.kept,
    conversions: report.conversions,
    // The phase Guides and Scripts read from those sections were rewritten with
    // them, and the ones left alone say why - a trainer's guide is the first
    // place a stale profile shows, so it is not left to a second command.
    notes: report.notes,
    notesPhases: report.notesPhases,
    notesSkipped: report.notesSkipped,
    warnings: report.warnings,
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

  // The profile's own header is not an update's to rewrite, whichever way the
  // request came in: an update skips it, and this refuses it outright, so no
  // route can put a different header in place than the one the file holds.
  if (section.protectedFromPaste) {
    return NextResponse.json(
      { error: `${section.title} is not an update's to rewrite.` },
      { status: 403 },
    );
  }

  // A section holds its own text and no other section's, and the only way to
  // know which headings those are is to read the files - a whole profile pasted
  // in here would otherwise be published as one section.
  const validation = validateSection(
    section,
    content,
    foreignSectionHeadings(await readHandbook(), id),
  );
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
