#!/usr/bin/env node
/**
 * Builds the paperwork page's phase Guides from the handbook, and says when one
 * of them has fallen behind it.
 *
 * A Guide is built from the phase's handbook section. Writing it by hand is how
 * it stopped agreeing with the profile: the section has said for a while that our
 * panics and backups do show in PD/SD dispatch while the Phase 1 notes still said
 * they do not.
 *
 *   npm run notes:build            what each Guide is missing, step by step
 *   npm run notes:build --write    write the Guides from their sections
 *   npm run notes:check            the same report, and a drift is an exit code
 *
 * The Handbook tab runs the same write itself, for the sections a pasted update
 * changed, so a member never has to know this command exists to get a guide that
 * matches the profile.
 *
 * Run `npm run notes:check` after touching `docs/handbook/` or a Guide.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { HANDBOOK_SECTIONS } from "@/app/constants/divisions/ftd/handbook";
import { allPhaseNotePlacements } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/sections";
import {
  guideCoverage,
  handbookSteps,
  listImbalance,
} from "@/lib/phase-notes-build";
import { writePhaseNotesForSections } from "@/lib/phase-notes-write";

const ROOT = process.cwd();
const WRITE = process.argv.includes("--write");
const CHECK = process.argv.includes("--check");

const placements = allPhaseNotePlacements();

function read(file: string): string | null {
  try {
    return readFileSync(path.join(ROOT, file), "utf8");
  } catch {
    return null;
  }
}

function short(text: string, width = 92): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > width ? `${flat.slice(0, width - 1)}…` : flat;
}

if (WRITE) {
  // One write, whoever asks for it: the tab and this command go through the same
  // function, so a Guide cannot be built one way here and another way there. This
  // command is the whole handbook's worth at once, which is what accepts the
  // conversion in the first place.
  const result = await writePhaseNotesForSections(placements);
  for (const file of result.files) {
    console.log(`✎ ${file}`);
  }
  for (const skip of result.skipped) {
    console.log(`• ${skip.component} - ${skip.reason}`);
  }
  console.log(
    `\n${result.files.length} file${result.files.length === 1 ? "" : "s"} written, ${result.skipped.length} phase${result.skipped.length === 1 ? "" : "s"} left as they are.`,
  );
} else {
  let inStep = 0;
  let unsaid = 0;
  let unreadable = 0;

  for (const placement of placements) {
    const section = HANDBOOK_SECTIONS.find(
      (candidate) => candidate.id === placement.section,
    );
    const label = `${placement.component} (${placement.guide})`;
    if (!section) {
      unreadable += 1;
      console.log(
        `✗ ${label} - ${placement.section} is not a declared handbook section`,
      );
      continue;
    }
    const handbook = read(section.file) ?? "";
    if (handbookSteps(handbook).length === 0) {
      inStep += 1;
      console.log(
        `• ${label} - ${section.file} carries no steps of its own, so this view is the trainers' own writing`,
      );
      continue;
    }

    // Read against the words, not the markup: a Guide is allowed its own layout
    // - it is not allowed to stop saying a step.
    const coverage = guideCoverage(handbook, read(placement.guide) ?? "");
    const behind = coverage.missing.length;
    const imbalance = listImbalance(handbook);

    if (behind === 0 && coverage.changed.length === 0) {
      inStep += 1;
      console.log(
        `✓ ${label} - ${coverage.steps.length} steps, all of them as ${section.file} says`,
      );
      continue;
    }

    unsaid += behind;
    console.log(
      `${behind > 0 ? "✗" : "•"} ${label} - ${coverage.steps.length} steps in ${section.file}`,
    );
    console.log(
      `    guide   ${coverage.same} carried, ${coverage.changed.length} in its own words, ${coverage.missing.length} not said at all`,
    );
    if (imbalance) {
      console.log(
        `    note   ${imbalance.opens} lists opened and ${imbalance.closes} closed - read as one category per name${
          imbalance.suspects.length > 0
            ? `; a \`[/list]\` is missing above line ${imbalance.suspects[0]}`
            : ""
        }`,
      );
    }
    let shown = 0;
    for (const finding of coverage.missing) {
      if (shown >= 12) break;
      console.log(`    unsaid: ${short(finding.step)}`);
      shown += 1;
    }
    console.log(
      `    -> edit ${section.file} if the section itself is wrong, then \`npm run notes:build --write\``,
    );
  }

  console.log(
    `\n${inStep}/${placements.length} phases are in step with their handbook section.`,
  );
  if (unsaid > 0 && CHECK) {
    console.log(
      "A view that stopped saying what the section says is a trainer reading last month's profile - the Handbook tab rebuilds them on an accepted update, and `npm run notes:build --write` does it for all of them.",
    );
  }
  process.exitCode = CHECK && (unsaid > 0 || unreadable > 0) ? 1 : 0;
}
