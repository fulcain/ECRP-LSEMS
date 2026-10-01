#!/usr/bin/env node
/**
 * Puts a pasted profile in place everywhere the FTP is kept.
 *
 * The flow this exists for is one paste: the profile is written somewhere else -
 * the forum's own editor, a document, the live post copied off the page - and the
 * finished document is handed over as it is. What comes back is not always
 * written the way `docs/ftp/**` is: phpBB appends its own id to every tag
 * (`[b:1a2b3c4d]`), closes a list item with `[/*]`, quotes a spoiler's title, and
 * a copy off the rendered page arrives as HTML with the newlines of another
 * operating system. All of that is converted, the paste is worked out to be the
 * Regular profile or the Reinstatement one by its own section headings, and only
 * the section files that actually differ are written - and the generated module
 * the contract workflow copies the profile from is rebuilt with them, so there is
 * nothing left holding the old text.
 *
 * The phase Guides and Scripts are rebuilt too, for every phase of the profile the
 * paste was read as: they are the same material read by a trainer, and a guide
 * left saying last month's profile is the drift this exists to end. That part is
 * not a second command to remember - it runs inside the write - and a phase left
 * alone, or one there is nothing to build for, is named rather than passed over
 * silently.
 *
 * It is the same `importFtpDocument` the FTP tab and `POST
 * /api/ftp` run, so a paste cannot behave one way in the terminal and
 * another in the app.
 *
 *   npm run ftp:import -- profile.txt
 *   npm run ftp:import -- < profile.txt
 *   npm run ftp:import -- --format=reinstatement profile.txt
 *   npm run ftp:import -- --dry profile.txt
 *
 * `--dry` is the same run without the write. It is what to reach for first when
 * the paste is a new one: it says which profile it was read as, what it changed,
 * and which sections it would touch, before any file moves - and because nothing
 * was written, no Guide or Script was rebuilt either.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { phaseNotePlacementsForFormat } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/sections";
import { importFtpDocument } from "@/lib/ftp-import";
import { planPhaseNotes } from "@/lib/phase-notes-write";

const USAGE = `Usage: npm run ftp:import -- [--format=<regular|reinstatement>] [--dry] [file]

  file            the pasted profile, or nothing to read it from stdin
  --format=<key>  which profile it is, when it should not be worked out from the paste
  --dry           say what would happen and write nothing
`;

const argv = process.argv.slice(2);
if (argv.includes("--help") || argv.includes("-h")) {
  console.log(USAGE);
  process.exit(0);
}

const dry = argv.some((arg) =>
  ["--dry", "--dry-run", "--preview", "--no-write"].includes(arg),
);
const formatArg = argv.find((arg) => arg.startsWith("--format="));
const formatFlag = argv.indexOf("--format");
const format =
  formatArg?.slice("--format=".length) ??
  (formatFlag > -1 ? argv[formatFlag + 1] : undefined);
const file = argv.find((arg) => !arg.startsWith("-") && arg !== format);

let content: string;
try {
  content = file
    ? readFileSync(path.resolve(process.cwd(), file), "utf8")
    : readFileSync(0, "utf8");
} catch {
  console.error(file ? `Could not read ${file}.` : "Could not read the paste.");
  process.exit(1);
}

const report = await importFtpDocument({ content, format, write: !dry });

if (!report.ok) {
  console.error(`\n  ${report.error}\n`);
  for (const problem of report.problems) console.error(`  - ${problem}`);
  if (report.problems.length > 0) console.error(`\n  ${USAGE}`);
  process.exit(1);
}

if (report.conversions.length > 0) {
  console.log(`\n  Converted before looking at it:`);
  for (const conversion of report.conversions) {
    console.log(`    - ${conversion.note}`);
  }
} else {
  console.log(`\n  Nothing to convert - the paste is written the way the FTP is.`);
}
console.log(
  `\n  Read as the ${report.formatLabel} profile${
    format ? "" : ", worked out from the paste's own headings"
  }.`,
);

const stateWidth = Math.max(...report.sections.map((section) => section.state.length));
for (const section of report.sections) {
  const note =
    section.state === "kept"
      ? "  (an update never rewrites the profile's header)"
      : section.kind === "identical"
        ? "  (already identical)"
        : section.kind === "tags"
          ? "  (the tags it left crossed or open are put right)"
          : section.kind === "placed"
            ? "  (the same words and tags, placed differently)"
            : "";
  console.log(
    `    ${section.state.padEnd(stateWidth)}  ${section.title.padEnd(28)} ${section.file}${note}`,
  );
  // Why, not just whether - a profile is long lines, and the word that differs
  // sits at the end of two that look the same.
  if (section.state === "changed") console.log(`        ${section.reason}`);
}
for (const warning of report.warnings) console.log(`\n  note: ${warning}`);

if (dry) {
  // The notes are decided from the profile the paste was read as, so a dry run can
  // name the Guides and Scripts the write would move rather than leaving them to
  // be discovered afterwards.
  const plan = await planPhaseNotes(
    phaseNotePlacementsForFormat(report.format),
  );
  for (const entry of plan.writes) {
    console.log(`    would rebuild  ${entry.file}`);
  }
  for (const skip of plan.skipped) {
    console.log(`    would leave    ${skip.component} - ${skip.reason}`);
  }
  console.log(
    `\n  Dry run: ${report.changed.length} of ${report.sections.length} section${
      report.sections.length === 1 ? "" : "s"
    } would change, and nothing was written.\n`,
  );
  process.exit(0);
}

if (report.changed.length === 0) {
  console.log(
    `\n  Nothing differed - the section files already say this, so no file was written.\n`,
  );
  process.exit(0);
}

console.log(
  `\n  Wrote ${report.files.length} file${
    report.files.length === 1 ? "" : "s"
  } (${(report.bytes / 1024).toFixed(1)} KB) and rebuilt the generated module with them,` +
    `\n  so the profile the contract workflow hands an FTO is the same text.`,
);
for (const file of report.notes) console.log(`    rebuilt  ${file}`);
for (const skip of report.notesSkipped) {
  console.log(`    left     ${skip.component} - ${skip.reason}`);
}
if (report.notes.length === 0) {
  console.log(`    the phase notes already say this - none was rewritten`);
}
console.log(
  `\n  Commit the lot: the section files, the generated module, and the phase notes.\n`,
);
