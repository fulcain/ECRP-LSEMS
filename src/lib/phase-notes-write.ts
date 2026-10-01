/**
 * Writes a phase's Guide from the section it is drawn from.
 *
 * The conversion is one thing (`lib/phase-notes-build.ts`); this is the half that
 * touches the disk, and both callers go through it so a Guide written by the
 * FTP tab and one written by `npm run notes:build --write` cannot differ:
 * the update path asks for the sections a paste actually changed, and the command
 * asks for every section in the FTP.
 *
 * Planning and writing are two functions for the same reason the importer has a
 * `write: false`: what the notes *would* say is knowable without moving a file, so
 * a preview and the write it precedes are decided by one piece of code.
 *
 * Two things are deliberately not written. A phase whose section has no steps of
 * its own has no Guide to build - the ride-along checklist is the trainers'
 * writing - and a section whose lists do not balance is read with the missing
 * close put back (`repairCategoryNesting`), because a profile is one list of
 * categories and holding a Guide hostage to a bracket in the profile helps
 * nobody. The imbalance is still reported, by `listImbalance`, so the section
 * itself can be fixed.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { FTP_SECTIONS } from "@/app/constants/divisions/ftd/ftp";
import type { PhaseNotePlacement } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/sections";
import {
  ftpSteps,
  renderPhaseGuide,
} from "@/lib/phase-notes-build";

export type PhaseNotesSkip = {
  component: string;
  section: string;
  reason: string;
};

export type PhaseNotesWrite = {
  /** The files written, from the root the write ran in. */
  files: string[];
  /** The components whose Guide moved - the phases a member sees change. */
  phases: string[];
  /** The phases left exactly as they were, and why. */
  skipped: PhaseNotesSkip[];
};

/** A Guide with its text, before anything is written. */
export type PhaseNotesPlan = {
  writes: { file: string; content: string; component: string }[];
  skipped: PhaseNotesSkip[];
};

/**
 * What the Guide and Script for each of `placements` would say.
 *
 * The caller names the phases rather than the sections, because a section can
 * feed two phases in two formats - the ride-along checklist does - and an update
 * to one profile must not report on the other's.
 *
 * `root` is the directory the paths are relative to - the app's own checkout by
 * default, and something else when a caller wants to see what would be written
 * without writing it over the member's own notes.
 */
export async function planPhaseNotes(
  placements: readonly PhaseNotePlacement[],
  options: { root?: string } = {},
): Promise<PhaseNotesPlan> {
  const root = options.root ?? process.cwd();
  const writes: PhaseNotesPlan["writes"] = [];
  const skipped: PhaseNotesSkip[] = [];

  for (const placement of placements) {
    const section = FTP_SECTIONS.find(
      (candidate) => candidate.id === placement.section,
    );
    if (!section) {
      skipped.push({
        component: placement.component,
        section: placement.section,
        reason: "the section is not declared in the FTP",
      });
      continue;
    }
    const ftp = await readFile(path.join(root, section.file), "utf8").catch(
      () => "",
    );
    if (ftpSteps(ftp).length === 0) {
      skipped.push({
        component: placement.component,
        section: section.id,
        reason: `${section.file} carries no steps of its own, so this view is the trainers' own writing`,
      });
      continue;
    }

    writes.push({
      file: placement.guide,
      component: placement.component,
      content: renderPhaseGuide({
        sectionId: section.id,
        file: section.file,
        component: placement.component,
        ftp,
      }),
    });
  }

  return { writes, skipped };
}

/**
 * Writes the Guide for every one of `placements`, leaving a file that
 * already says exactly this where it is.
 */
export async function writePhaseNotesForSections(
  placements: readonly PhaseNotePlacement[],
  options: { root?: string } = {},
): Promise<PhaseNotesWrite> {
  const root = options.root ?? process.cwd();
  const plan = await planPhaseNotes(placements, options);
  const files: string[] = [];
  const phases = new Set<string>();

  for (const entry of plan.writes) {
    const full = path.join(root, entry.file);
    const current = await readFile(full, "utf8").catch(() => null);
    if (current === entry.content) continue;
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, entry.content, "utf8");
    files.push(entry.file);
    phases.add(entry.component);
  }

  return { files, phases: [...phases], skipped: plan.skipped };
}
