import { NextResponse } from "next/server";

import { FTP_FORMATS, FTP_SECTIONS, ftpSection } from "@/app/constants/divisions/ftd/ftp";
import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import {
  commitHistory,
  fileAtCommit,
  isGitHubCommitConfigured,
} from "@/lib/github-ftp";
import { verifySessionToken } from "@/lib/jwt";
import { canEditFtp } from "@/lib/role-config";
import {
  canWriteFtp,
  foreignSectionHeadings,
  readFtp,
  readFtpHistory,
  readFtpHistoryAll,
  readFtpVersion,
  validateSection,
  writeFtpSection,
} from "@/lib/ftp";
import { importFtpDocument } from "@/lib/ftp-import";
import { sameFtpText } from "@/lib/ftp-markup";

/**
 * GET  /api/ftp          - every section, its text, and whether this
 *                               deployment can write one back.
 * GET  /api/ftp?id=…     - that section's history (git, when there is one).
 * GET  /api/ftp?id=…&at=…- what that section said at one commit.
 * POST /api/ftp          - publish one section. Body: `{ id, content }`.
 * POST /api/ftp          - or replace a whole profile at once, which is how
 *                               a member who writes it elsewhere gets it in:
 *                               body `{ format, content }`, converted from
 *                               whatever the paste was written in and split back
 *                               into the format's sections at their headings.
 *
 * The FTP is a set of files in the repository (`docs/ftp/**`), so this
 * route reads and writes files and nothing else. There is deliberately no
 * database path: on a deployment that cannot write its own files the publish is
 * refused, with the text handed back so it can still be applied by hand.
 *
 * Who may do this is FTD Head, Assistant Head of FTD and Command+ (with the
 * Discord admins named in `DISCORD_ADMIN_IDS` always in) - the same triple the
 * FTD Command page gates on, re-read here rather than trusting that the request
 * came from the page that shows the editor.
 */

export const dynamic = "force-dynamic";

type Editor =
  | { ok: true; session: { roles: string[]; discordId?: string; username?: string | null } }
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
  if (!canEditFtp(session.roles, session.discordId)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Forbidden: the FTP is edited by FTD Head, Assistant Head of FTD and Command+.",
        },
        { status: 403 },
      ),
    };
  }
  return { ok: true, session };
}

export async function GET(request: Request) {
  const editor = await requireEditor();
  if (!editor.ok) return editor.response;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  // A section's history, and one version of it. On a deployment that commits,
  // GitHub answers; on a checkout, git does. An empty list is how a build with
  // neither says it has no history.
  if (id) {
    const section = ftpSection(id);
    if (!section) {
      return NextResponse.json({ error: "No such section." }, { status: 404 });
    }
    const at = url.searchParams.get("at");
    if (at) {
      const content = isGitHubCommitConfigured()
        ? await fileAtCommit(section.file, at)
        : await readFtpVersion(section.file, at);
      if (content === null) {
        return NextResponse.json(
          { error: "That version could not be read here." },
          { status: 404 },
        );
      }
      return NextResponse.json({ id, at, content });
    }
    const history = isGitHubCommitConfigured()
      ? await commitHistory([section.file])
      : await readFtpHistory(section.file);
    return NextResponse.json({ id, history });
  }

  // The whole FTP's history, for the version panel: every FTP commit, newest
  // first. The `ftp:` prefix on an update's or a restore's subject is the
  // convention the panel filters on, so a rename or an unrelated edit that
  // happened to touch a section file is not offered as a version to go back
  // to. GitHub answers on a deployment that commits; a checkout reads its own
  // git. The limit is wider than the panel shows because the filter shrinks
  // what comes back.
  if (url.searchParams.get("history") === "all") {
    const files = FTP_SECTIONS.map((section) => section.file);
    const all = isGitHubCommitConfigured()
      ? await commitHistory(files, 100)
      : await readFtpHistoryAll(files, 100);
    return NextResponse.json({ history: all.filter((entry) => entry.message.startsWith("ftp:")) });
  }

  return NextResponse.json({
    writable: canWriteFtp(),
    commits: isGitHubCommitConfigured(),
    formats: await readFtp(),
  });
}

/**
 * Restores a version: reads a past commit's section files and publishes them
 * back through the normal update, so going back is the same pipeline as going
 * forward - one commit, authored by the member who pressed the button.
 *
 * Only whole profiles are restorable. A single section's history is viewable
 * from the editor, but putting one section back alone is exactly the
 * section-by-section editing the update path exists to end.
 *
 * Each format is put back only if the version actually differs from what the
 * files say now - a rollback to a commit that touched one profile leaves the
 * other one, and its history, exactly where they are.
 */
async function restoreVersion(
  editor: { session: { roles: string[]; discordId?: string; username?: string | null } },
  commit: string,
) {
  if (!/^[0-9a-f]{7,40}$/i.test(commit)) {
    return NextResponse.json(
      { error: "That version could not be identified." },
      { status: 400 },
    );
  }
  const author = {
    name: editor.session.username || "LSEMS FTP",
    email: `${editor.session.discordId ?? "unknown"}@users.noreply.github.com`,
  };
  const stored = await readFtp();
  const restored: { format: string; label: string; changed: string[]; commit?: string }[] = [];
  const problems: string[] = [];
  for (const format of FTP_FORMATS) {
    // The document is the version's own sections in the declaration's order -
    // the same shape a pasted profile arrives in, so it goes through the one
    // importer with its conversion, split and placeholder checks intact. The
    // header is carried along but never written, whichever text it held then.
    const parts: string[] = [];
    let differs = false;
    for (const section of format.sections) {
      const current =
        stored
          .find((entry) => entry.key === format.key)
          ?.sections.find((entry) => entry.id === section.id)?.content ?? "";
      const at = isGitHubCommitConfigured()
        ? await fileAtCommit(section.file, commit)
        : await readFtpVersion(section.file, commit);
      // A section this version predates keeps its own text.
      parts.push(at ?? current);
      if (
        !section.protectedFromPaste &&
        at !== null &&
        !sameFtpText(at, current)
      ) {
        differs = true;
      }
    }
    if (!differs) continue;

    const report = await importFtpDocument({
      content: parts.join("\n"),
      format: format.key,
      write: true,
      author,
      commitSubject: `ftp: restore ${format.label} to ${commit.slice(0, 12)}`,
    });
    if (!report.ok) {
      problems.push(`${format.label}: ${report.error}`);
      continue;
    }
    restored.push({
      format: report.format,
      label: report.formatLabel,
      changed: report.changed,
      commit: report.commit,
    });
  }

  if (restored.length === 0) {
    return NextResponse.json(
      problems.length > 0
        ? { error: problems[0], problems }
        : {
            error:
              "The files already say what that version says - there is nothing to restore.",
          },
      { status: problems.length > 0 ? 422 : 409 },
    );
  }
  return NextResponse.json({ written: true, restored });
}

/**
 * Replace a whole profile from a pasted document.
 *
 * The conversion, the split, the placeholder check and the write are one
 * function - `importFtpDocument` - shared with `npm run ftp:import`
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
async function replaceFormat(
  key: string,
  content: string,
  editor: { session: { roles: string[]; discordId?: string; username?: string | null } },
) {
  const report = await importFtpDocument({
    content,
    format: key,
    write: true,
    author: {
      name: editor.session.username || "LSEMS FTP",
      email: `${editor.session.discordId ?? "unknown"}@users.noreply.github.com`,
    },
  });
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
    // The commit the update landed in, when the deployment commits - the link
    // the tab shows so "what just changed" is one click away.
    commit: report.commit,
  });
}

export async function POST(request: Request) {
  const editor = await requireEditor();
  if (!editor.ok) return editor.response;

  let body: {
    id?: unknown;
    format?: unknown;
    content?: unknown;
    restore?: unknown;
    commit?: unknown;
  };
  try {
    body = (await request.json()) as {
      id?: unknown;
      format?: unknown;
      content?: unknown;
      restore?: unknown;
      commit?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  // Restoring a version is an update like any other: the old text of a whole
  // profile, pasted back in and published - the same pipeline, the same commit,
  // and a message that says where the text came from.
  if (body.restore === true) {
    return restoreVersion(
      editor,
      typeof body.commit === "string" ? body.commit : "",
    );
  }

  const content = typeof body.content === "string" ? body.content : "";
  if (typeof body.format === "string") {
    return replaceFormat(body.format, content, editor);
  }

  const id = typeof body.id === "string" ? body.id : "";
  const section = ftpSection(id);
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
    foreignSectionHeadings(await readFtp(), id),
  );
  if (validation.problems.length > 0) {
    return NextResponse.json(
      { error: validation.problems[0], problems: validation.problems },
      { status: 422 },
    );
  }

  const result = await writeFtpSection(id, content);
  if (!result) {
    return NextResponse.json({ error: "No such section." }, { status: 404 });
  }
  if (!result.ok) {
    // Handed back rather than stored anywhere: the member applies it and commits
    // it, which is the only way a FTP change reaches the repository.
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
