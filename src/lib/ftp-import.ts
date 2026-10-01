/**
 * A whole profile, pasted once and put in place everywhere it is kept.
 *
 * The member writes the profile somewhere else and brings back the finished
 * document, and the whole of that job is here: convert what the paste is written
 * in (`lib/ftp-bbcode.ts`), work out which profile it is, cut it back into
 * the sections its own headings mark, refuse a section that would lose a
 * placeholder, and write the files that actually differ. Writing those also
 * rebuilds the module the contract workflow copies the profile from and the phase
 * Guides and Scripts the paperwork page shows, so "everywhere it is kept" is the
 * section files, that module and those pages - none of them is a second copy of
 * the profile, and none of them is left holding the old text because someone
 * forgot a second command.
 *
 * It is one function because three callers need the same answer: the FTP
 * tab's paste, `POST /api/ftp`, and `npm run ftp:import`. A paste that
 * reached the files by any other path would be a paste that skipped the
 * conversion or the placeholder check, which is exactly the two things that make
 * a paste safe to accept without reading it line by line.
 */

import {
  type FtpFormatKey,
  type FtpSection,
} from "@/app/constants/divisions/ftd/ftp";
import {
  convertFtpBbcode,
  type FtpConversion,
} from "@/lib/ftp-bbcode";
import {
  FTP_SECTIONS,
  FTP_CONTENT_MODULE,
  canWriteFtp,
  foreignSectionHeadings,
  readFtp,
  validateSection,
  writeFtpSections,
  ftpAbsolute,
} from "@/lib/ftp";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import {
  commitFtpFiles,
  commitsThroughGitHub,
  type GitHubFileChange,
} from "@/lib/github-ftp";
import {
  compareFtpSection,
  describeTagRepair,
  readPastedSections,
} from "@/lib/ftp-markup";
import { phaseNotePlacementsForFormat } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/sections";
import {
  writePhaseNotesForSections,
  type PhaseNotesSkip,
} from "@/lib/phase-notes-write";

/** Where one section of a paste would land - or where it did. */
export type FtpImportSection = {
  id: string;
  title: string;
  file: string;
  /**
   * `kept` is the profile's own header, which an update never rewrites: it is
   * the same on every profile and not what the paste is about.
   */
  state: "changed" | "same" | "kept";
  /** How the comparison came out - what the tab badges the section with. */
  kind: "identical" | "tags" | "placed" | "written" | "kept";
  /**
   * One plain line saying what was compared - the answer to "why is this one
   * changed?", which a list of file names does not give.
   */
  reason: string;
};

export type FtpImportReport =
  | {
      ok: false;
      /** What a route answers with - a refusal knows how hard it is. */
      status: number;
      error: string;
      problems: string[];
      warnings: string[];
    }
  | {
      ok: true;
      format: FtpFormatKey;
      formatLabel: string;
      /** What the paste had to be converted for; empty when it needed nothing. */
      conversions: FtpConversion[];
      sections: FtpImportSection[];
      changed: string[];
      unchanged: string[];
      kept: string[];
      warnings: string[];
      /** False for a paste that was only looked at. */
      written: boolean;
      files: string[];
      bytes: number;
      /**
       * The phase Guides and Scripts this update rewrote, from the repository
       * root.
       *
       * They are the same material read by a trainer, so an update that moved a
       * phase and left its guide saying last month's profile would be the drift
       * this whole arrangement exists to end - and an update accepted against a
       * profile is a statement that the profile is current, so every phase of
       * that profile is read again rather than only the sections it changed. A
       * phase whose notes come out identical is not written at all.
       *
       * They are always this paste's own profile's phases: the ride-along
       * checklist feeds both profiles, and an update answers for the one it was
       * read as.
       */
      notes: string[];
      /** The components whose Guide or Script this update rewrote. */
      notesPhases: string[];
      /** The phases left as they were, with the reason. */
      notesSkipped: PhaseNotesSkip[];
      /** The commit that carries the update, when the deployment commits. */
      commit?: string;
    };

function refuse(
  status: number,
  error: string,
  problems: string[] = [],
  warnings: string[] = [],
): FtpImportReport {
  return { ok: false, status, error, problems, warnings };
}

type Formats = Awaited<ReturnType<typeof readFtp>>[number];
type Chosen = { ok: true; format: Formats } | { ok: false; error: string; problems: string[] };

/**
 * Which profile a paste is, worked out from the paste.
 *
 * The two formats are separate documents, not variants of one, so the answer is
 * either a format whose every section heading is in the paste or nothing - and
 * "nothing" has to name what each format was looking for, because a paste that
 * lost one heading looks exactly like a paste of the other profile until the two
 * are tried.
 */
function fitFormat(formats: readonly Formats[], document: string): Chosen {
  const tried = formats.map((format) => ({
    format,
    split: readPastedSections(format.sections, document).split,
  }));
  const fits = tried.filter((entry) => entry.split.ok);
  if (fits.length === 1) return { ok: true, format: fits[0].format };
  if (fits.length > 1) {
    return {
      ok: false,
      error: `This paste fits ${fits
        .map((entry) => entry.format.label)
        .join(" and ")}, so which profile it is has to be said out loud.`,
      problems: [],
    };
  }
  return {
    ok: false,
    error:
      "This paste is not a whole profile - it matches neither the Regular one nor the Reinstatement one.",
    problems: tried.map(
      (entry) => `${entry.format.label}: ${entry.split.ok ? "" : entry.split.reason}`,
    ),
  };
}

/**
 * Reads a pasted profile back into the section files, and says what it touched.
 *
 * `write: false` is the same run without the write - what the tab shows the
 * member before they press the button, and what `--dry` prints - so the preview
 * and the update are decided by the same code and cannot disagree.
 */
export async function importFtpDocument(input: {
  content: string;
  /** The format the paste belongs to; worked out from the paste when omitted. */
  format?: string;
  write?: boolean;
  /**
   * Who is making the update, for the commit the GitHub backend authors. Only
   * read when the deployment commits rather than writing its own checkout.
   */
  author?: { name: string; email: string };
  /**
   * The whole commit subject, when the caller needs it to say something other
   * than "from a pasted profile" - a restore names the version it went back to.
   */
  commitSubject?: string;
}): Promise<FtpImportReport> {
  const write = input.write === true;
  if (!input.content.trim()) {
    return refuse(422, "Nothing was pasted.");
  }
  if (write && !canWriteFtp()) {
    // Rewriting nine files at once is not something to hand over to apply by
    // hand, so this one says where it has to happen instead of pretending.
    return refuse(
      409,
      "Replacing a whole profile rewrites every section file at once, so it has to be done on a local development server.",
    );
  }

  const stored = await readFtp();
  const { text, conversions } = convertFtpBbcode(input.content);

  let format: Formats | undefined;
  if (input.format) {
    format = stored.find((entry) => entry.key === input.format);
    if (!format) return refuse(404, "No such format.");
  } else {
    const chosen = fitFormat(stored, text);
    if (!chosen.ok) return refuse(422, chosen.error, chosen.problems);
    format = chosen.format;
  }

  // The split puts each section's own tags right as it cuts them out, because a
  // profile published on the forum is written the way the forum left it: a close
  // glued to the wrong tag, a tag left open where phpBB closed it for the writer.
  // None of that is a change to write, and `compareFtpSection` is where that
  // is decided - on both sides of the paste, so a section nobody edited is not
  // reported as one they did.
  const { split, repaired } = readPastedSections(format.sections, text);
  if (!split.ok) return refuse(422, split.reason);
  if (repaired > 0) {
    conversions.push({
      kind: "tag-order",
      count: repaired,
      note: describeTagRepair(repaired),
    });
  }

  // The paste is compared against the files as they stand, so a member sees what
  // an update actually touches - and an update that changed one phase leaves one
  // file changed rather than the whole format.
  const sections: FtpImportSection[] = format.sections.map((section) => {
    const pasted = split.sections.find((entry) => entry.id === section.id);
    if (section.protectedFromPaste) {
      return {
        id: section.id,
        title: section.title,
        file: section.file,
        state: "kept",
        kind: "kept",
        reason: "An update never rewrites the profile's header.",
      };
    }
    const match = compareFtpSection(section.content, pasted?.content ?? "");
    return {
      id: section.id,
      title: section.title,
      file: section.file,
      state: match.same ? "same" : "changed",
      kind: match.kind,
      reason: match.reason,
    };
  });
  const idsIn = (state: FtpImportSection["state"]) =>
    sections.filter((section) => section.state === state).map((section) => section.id);

  const problems: string[] = [];
  const warnings: string[] = [];
  for (const entry of split.sections) {
    const state = sections.find((section) => section.id === entry.id)?.state;
    const section: FtpSection | undefined = FTP_SECTIONS.find(
      (candidate) => candidate.id === entry.id,
    );
    if (!section) continue;
    // A section this update may not write is ignored outright: not written, not
    // validated, and not mentioned. Its own file is what stands, so a placeholder
    // missing from the paste is nothing to do with it - an update that never
    // touches the profile's header has nothing to say about it either.
    if (state === "kept") continue;
    // Nor is a section the paste already agrees with: a warning is about what an
    // update is about to do, and an update that leaves a file alone has nothing
    // to warn about - including about wording that is the file's own.
    if (state !== "changed") continue;
    const validation = validateSection(
      section,
      entry.content,
      foreignSectionHeadings(stored, section.id),
    );
    problems.push(
      ...validation.problems.map((problem) => `${section.title}: ${problem}`),
    );
    warnings.push(
      ...validation.warnings.map((warning) => `${section.title}: ${warning}`),
    );
  }
  if (problems.length > 0) {
    return refuse(422, problems[0], problems, warnings);
  }

  if (!write) {
    return {
      ok: true,
      format: format.key,
      formatLabel: format.label,
      conversions,
      sections,
      changed: idsIn("changed"),
      unchanged: idsIn("same"),
      kept: idsIn("kept"),
      warnings,
      written: false,
      files: [],
      bytes: 0,
      // Nothing was written, so nothing downstream of it was rebuilt either.
      notes: [],
      notesPhases: [],
      notesSkipped: [],
    };
  }

  // A section this update leaves alone is handed over as the file's own text: the
  // file stands, layout and all, and the write skips it for the same reason it
  // skips any section that already says this.
  const pastedById = new Map(split.sections.map((entry) => [entry.id, entry.content]));
  const entries = format.sections.map((section) => ({
    id: section.id,
    content:
      sections.find((entry) => entry.id === section.id)?.state === "changed"
        ? (pastedById.get(section.id) ?? section.content)
        : section.content,
  }));

  // Wherever committing is configured - a deployment or a dev server with the
  // token - the update is staged and handed to the GitHub backend as one commit;
  // nowhere else it writes in place and the member commits by hand. Both paths
  // run the same generators, so the committed files and the local ones cannot
  // differ.
  if (commitsThroughGitHub()) {
    return stagedUpdate(
      format,
      entries,
      input.author,
      conversions,
      sections,
      warnings,
      input.commitSubject,
    );
  }

  // Writing the sections also rebuilds the module the contract workflow copies
  // the profile from, which is the other half of "everywhere".
  const result = await writeFtpSections(entries, { keepProtected: true });
  if (!result) {
    return refuse(500, "The sections could not be written.", [], warnings);
  }

  // The Guides and Scripts a trainer reads are built from those sections, so they
  // move with them - the whole profile's worth, because a paste is taken as the
  // profile being current and a guide already behind its section would otherwise
  // stay behind it. Only what actually differs is written, so the second update
  // in a row leaves the files that did not move alone.
  const notes = await writePhaseNotesForSections(
    phaseNotePlacementsForFormat(format.key),
  );

  return {
    ok: true,
    format: format.key,
    formatLabel: format.label,
    conversions,
    sections,
    changed: result.changed,
    unchanged: result.unchanged,
    kept: result.kept,
    warnings,
    written: true,
    files: result.files,
    bytes: result.bytes,
    notes: notes.files,
    notesPhases: notes.phases,
    notesSkipped: notes.skipped,
  };
}

/**
 * Runs the same write into a scratch root and commits what changed.
 *
 * Staging rather than committing section-by-section is what keeps the update one
 * commit: the section files, the generated module and the phase Guides are
 * computed exactly as a local write computes them, and the GitHub backend is
 * handed the finished files in one go. A failure anywhere before the commit
 * leaves the repository untouched.
 */
async function stagedUpdate(
  format: Formats,
  entries: readonly { id: string; content: string }[],
  author: { name: string; email: string } | undefined,
  conversions: FtpConversion[],
  sections: FtpImportSection[],
  warnings: string[],
  commitSubject?: string,
): Promise<FtpImportReport> {
  const stage = await mkdtemp(path.join(tmpdir(), "FTP-"));
  try {
    // The stage begins as the FTP as it stands, so a write that leaves a
    // file alone stages its current text and the commit carries no change for it.
    for (const section of FTP_SECTIONS) {
      await mkdir(path.join(stage, path.dirname(section.file)), { recursive: true });
      await copyFile(ftpAbsolute(section.file), path.join(stage, section.file)).catch(
        () => {},
      );
    }
    // The write helpers read the checkout, so the stage is reached by running
    // them with the process rooted there: the same functions, one cwd over.
    const previous = process.cwd();
    try {
      process.chdir(stage);
      const staged = await writeFtpSections(entries, { keepProtected: true });
      if (!staged) return refuse(500, "The sections could not be written.", [], warnings);
      const notes = await writePhaseNotesForSections(
        phaseNotePlacementsForFormat(format.key),
      );

      // An update that moved nothing - the paste already agreed with the files,
      // and the Guides already said what the sections say - writes no commit at
      // all, the same as the local path writes no file. A commit is the record
      // of a change, and an empty one would be a version in the history that
      // stands for nothing.
      if (staged.changed.length === 0 && notes.files.length === 0) {
        return {
          ok: true,
          format: format.key,
          formatLabel: format.label,
          conversions,
          sections,
          changed: staged.changed,
          unchanged: staged.unchanged,
          kept: staged.kept,
          warnings,
          written: true,
          files: [],
          bytes: staged.bytes,
          notes: [],
          notesPhases: [],
          notesSkipped: notes.skipped,
        };
      }

      // Every file the update produced, plus the generated module the write
      // already rebuilt - the same set a local commit would carry.
      const paths = [...staged.files, FTP_CONTENT_MODULE, ...notes.files];
      const files: GitHubFileChange[] = paths.map((file) => ({
        path: file,
        content: readFileSync(path.join(stage, file), "utf8"),
      }));
      const label = changedTitles(staged.changed);
      const commit = await commitFtpFiles({
        files,
        // The `ftp:` prefix is the convention the version panel filters on:
        // every FTP update and restore carries it, so the history is the FTP's
        // own rather than every commit that touched a file.
        message:
          commitSubject ??
          `ftp: update ${format.label}${label ? ` - ${label}` : " - no section changed, Guides rebuilt"}`,
        authorName: author?.name || "LSEMS FTP",
        authorEmail: author?.email || "FTP@lsems.app",
      });
      if (!commit.ok) return refuse(502, commit.reason, [], warnings);

      // A dev server has the checkout the deployment has not, so the update
      // lands in it too: the local files agree with what was pushed, and the
      // next paste compares against what GitHub now holds.
      if (!process.env.VERCEL) {
        for (const file of files) {
          await mkdir(path.join(previous, path.dirname(file.path)), { recursive: true });
          await writeFile(path.join(previous, file.path), file.content, "utf8");
        }
      }

      return {
        ok: true,
        format: format.key,
        formatLabel: format.label,
        conversions,
        sections,
        changed: staged.changed,
        unchanged: staged.unchanged,
        kept: staged.kept,
        warnings,
        written: true,
        files: paths,
        bytes: staged.bytes,
        notes: notes.files,
        notesPhases: notes.phases,
        notesSkipped: notes.skipped,
        commit: commit.commitUrl,
      };
    } finally {
      process.chdir(previous);
    }
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

/** The section titles behind the changed ids, for the commit subject. */
function changedTitles(changed: readonly string[]): string {
  return changed
    .map((id) => FTP_SECTIONS.find((section) => section.id === id)?.title ?? id)
    .slice(0, 4)
    .join(", ");
}
