/**
 * A whole profile, pasted once and put in place everywhere it is kept.
 *
 * The member writes the profile somewhere else and brings back the finished
 * document, and the whole of that job is here: convert what the paste is written
 * in (`lib/handbook-bbcode.ts`), work out which profile it is, cut it back into
 * the sections its own headings mark, refuse a section that would lose a
 * placeholder, and write the files that actually differ. Writing those also
 * rebuilds the module the contract workflow copies the profile from and the phase
 * Guides and Scripts the paperwork page shows, so "everywhere it is kept" is the
 * section files, that module and those pages - none of them is a second copy of
 * the profile, and none of them is left holding the old text because someone
 * forgot a second command.
 *
 * It is one function because three callers need the same answer: the Handbook
 * tab's paste, `POST /api/handbook`, and `npm run handbook:import`. A paste that
 * reached the files by any other path would be a paste that skipped the
 * conversion or the placeholder check, which is exactly the two things that make
 * a paste safe to accept without reading it line by line.
 */

import {
  type HandbookFormatKey,
  type HandbookSection,
} from "@/app/constants/divisions/ftd/handbook";
import {
  convertHandbookBbcode,
  type HandbookConversion,
} from "@/lib/handbook-bbcode";
import {
  HANDBOOK_SECTIONS,
  canWriteHandbook,
  foreignSectionHeadings,
  readHandbook,
  validateSection,
  writeHandbookSections,
} from "@/lib/handbook";
import {
  compareHandbookSection,
  describeTagRepair,
  readPastedSections,
} from "@/lib/handbook-markup";
import { phaseNotePlacementsForFormat } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/sections";
import {
  writePhaseNotesForSections,
  type PhaseNotesSkip,
} from "@/lib/phase-notes-write";

/** Where one section of a paste would land - or where it did. */
export type HandbookImportSection = {
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

export type HandbookImportReport =
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
      format: HandbookFormatKey;
      formatLabel: string;
      /** What the paste had to be converted for; empty when it needed nothing. */
      conversions: HandbookConversion[];
      sections: HandbookImportSection[];
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
    };

function refuse(
  status: number,
  error: string,
  problems: string[] = [],
  warnings: string[] = [],
): HandbookImportReport {
  return { ok: false, status, error, problems, warnings };
}

type Formats = Awaited<ReturnType<typeof readHandbook>>[number];
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
export async function importHandbookDocument(input: {
  content: string;
  /** The format the paste belongs to; worked out from the paste when omitted. */
  format?: string;
  write?: boolean;
}): Promise<HandbookImportReport> {
  const write = input.write === true;
  if (!input.content.trim()) {
    return refuse(422, "Nothing was pasted.");
  }
  if (write && !canWriteHandbook()) {
    // Rewriting nine files at once is not something to hand over to apply by
    // hand, so this one says where it has to happen instead of pretending.
    return refuse(
      409,
      "Replacing a whole profile rewrites every section file at once, so it has to be done on a local development server.",
    );
  }

  const stored = await readHandbook();
  const { text, conversions } = convertHandbookBbcode(input.content);

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
  // None of that is a change to write, and `compareHandbookSection` is where that
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
  const sections: HandbookImportSection[] = format.sections.map((section) => {
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
    const match = compareHandbookSection(section.content, pasted?.content ?? "");
    return {
      id: section.id,
      title: section.title,
      file: section.file,
      state: match.same ? "same" : "changed",
      kind: match.kind,
      reason: match.reason,
    };
  });
  const idsIn = (state: HandbookImportSection["state"]) =>
    sections.filter((section) => section.state === state).map((section) => section.id);

  const problems: string[] = [];
  const warnings: string[] = [];
  for (const entry of split.sections) {
    const state = sections.find((section) => section.id === entry.id)?.state;
    const section: HandbookSection | undefined = HANDBOOK_SECTIONS.find(
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

  // Writing the sections also rebuilds the module the contract workflow copies
  // the profile from, which is the other half of "everywhere".
  const result = await writeHandbookSections(entries, { keepProtected: true });
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
