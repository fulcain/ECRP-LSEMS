#!/usr/bin/env node
/**
 * Asserts the FTD handbook's declarations match the files on disk.
 *
 * The handbook is editable in the app, which means the app and the repository
 * have to agree about it down to the last file. What this pins:
 *
 *   • every declared section has a file, and every file is a declared section
 *     (an orphan is content nobody can reach, a missing file is a dead link);
 *   • ids and paths are unique, so a link goes to one section only;
 *   • each section still holds the placeholders it declared as un-droppable;
 *   • every section stands on its own, so nobody's spoiler swallows the next
 *     section's body;
 *   • the assembled profile is the sections in declared order, and the generated
 *     module the contract workflow reads is the same text;
 *   • the workflow hands out that module rather than a second copy of the
 *     profile, which is the drift this whole arrangement exists to stop;
 *   • editing it is the Discord admins' and nobody else's - the one gate in the
 *     app that can't be granted from inside it, because it writes the source;
 *   • and neither the editor's route nor its library has a database path, so a
 *     published handbook change can only ever be a change in the repository.
 *
 * Run it after touching `app/constants/divisions/ftd/handbook.ts`, a file under
 * `docs/handbook/`, or the Handbook tab:
 *
 *   npm run handbook:check
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  HANDBOOK_FORMATS,
  HANDBOOK_SECTIONS,
  handbookFormatOf,
  sectionHeading,
  splitHandbookDocument,
} from "@/app/constants/divisions/ftd/handbook";
import { HANDBOOK_DOCUMENTS } from "@/app/constants/divisions/ftd/handbook-content";

let checks = 0;
let failures = 0;

function expect(label: string, actual: unknown, wanted: unknown) {
  checks += 1;
  const ok = JSON.stringify(actual) === JSON.stringify(wanted);
  if (!ok) failures += 1;
  console.log(
    `${ok ? "ok  " : "FAIL"}  ${label}${ok ? "" : `\n        got  ${JSON.stringify(actual)}\n        want ${JSON.stringify(wanted)}`}`,
  );
}

const ROOT = process.cwd();
const DIR = path.join(ROOT, "docs", "handbook");

function read(file: string): string | null {
  try {
    return readFileSync(path.join(ROOT, file), "utf8");
  } catch {
    return null;
  }
}

/** Every file under `docs/handbook/`, relative to the repository root. */
function filesOnDisk(dir = DIR, prefix = "docs/handbook"): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const relative = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) found.push(...filesOnDisk(path.join(dir, entry.name), relative));
    else found.push(relative.split(path.sep).join("/"));
  }
  return found;
}

/* ---- one file per section, one section per file ---- */
const declared = HANDBOOK_SECTIONS.map((section) => section.file);
expect(
  "every declared section has a file",
  declared.filter((file) => read(file) === null),
  [],
);
expect(
  "and every file on disk is a declared section",
  filesOnDisk().filter((file) => !declared.includes(file)),
  [],
);
expect(
  "no file is declared twice",
  new Set(declared).size,
  declared.length,
);
expect(
  "no section id is used twice",
  new Set(HANDBOOK_SECTIONS.map((section) => section.id)).size,
  HANDBOOK_SECTIONS.length,
);
expect(
  "no section is empty",
  HANDBOOK_SECTIONS.filter((section) => !(read(section.file) ?? "").trim()).map(
    (section) => section.id,
  ),
  [],
);
expect(
  "every section is in exactly one format",
  HANDBOOK_SECTIONS.filter((section) => !handbookFormatOf(section)).map(
    (section) => section.id,
  ),
  [],
);
expect(
  "and both formats are non-empty",
  HANDBOOK_FORMATS.map((format) => format.sections.length > 0),
  HANDBOOK_FORMATS.map(() => true),
);

/* ---- the placeholders a section promised to keep ---- */
for (const section of HANDBOOK_SECTIONS) {
  const content = read(section.file) ?? "";
  const missing = (section.mustKeep ?? []).filter(
    (token) => !content.includes(token),
  );
  expect(`${section.id} keeps the placeholders it declares`, missing, []);
}

/* ---- a section is a section: it opens and closes its own spoilers ---- */
for (const section of HANDBOOK_SECTIONS) {
  const content = read(section.file) ?? "";
  const opens = (content.match(/\[spoiler=[^\]]*\]/g) ?? []).length;
  const closes = (content.match(/\[\/spoiler\]/g) ?? []).length;
  // A boundary that falls inside an open spoiler hides the next section's body
  // inside this one's collapse on the forum, which is how the profile's own
  // Personnel File Post template ended up buried in Certification.
  expect(`${section.id} opens and closes its own spoilers`, opens - closes, 0);
}

/* ---- the profile a format builds is its sections, in order ---- */
for (const format of HANDBOOK_FORMATS) {
  const parts = format.sections.map((section) => read(section.file) ?? "");
  const document = parts.join("\n");
  expect(
    `the ${format.key} profile is its ${format.sections.length} sections in order`,
    format.sections.every((section, index) =>
      document.includes(parts[index]) && parts[index].length > 0,
    ),
    true,
  );
  // A profile that lost its own name line is the failure this catches: the post
  // has to say which member and which training it is about.
  expect(
    `the ${format.key} profile still names the member`,
    /\{\{applicantName\}\}|FName LName/.test(document),
    true,
  );
  // The contract workflow is a client module and cannot read a file, so it
  // copies the profile out of the generated module. These two are the same text
  // or the FTO pastes something the handbook does not say.
  expect(
    `the generated ${format.key} document is exactly its files`,
    HANDBOOK_DOCUMENTS[format.key],
    document,
  );
}

/* ---- a whole profile can be pasted back in and split up again ---- */
// The member writes the profile somewhere else and pastes the finished document,
// so a section is found again by its own heading. A section that stopped opening
// with one would send the paste into the wrong files - and a paste is the one
// edit nobody reads line by line before publishing.
for (const format of HANDBOOK_FORMATS) {
  const pieces = format.sections.map((section) => ({
    id: section.id,
    title: section.title,
    content: read(section.file) ?? "",
  }));
  expect(
    `every ${format.key} section but the first opens with its own heading`,
    pieces
      .slice(1)
      .filter((piece) => sectionHeading(piece.content) === null)
      .map((piece) => piece.id),
    [],
  );

  const document = pieces.map((piece) => piece.content).join("\n");
  const split = splitHandbookDocument(pieces, document);
  expect(`the ${format.key} profile splits back up`, split.ok, true);
  expect(
    `and splitting it loses nothing`,
    split.ok && split.sections.map((entry) => entry.content).join("\n") === document,
    true,
  );
}

/* ---- the profile is handed out from the handbook, not from a second copy ---- */
/** The longest backtick literal in a module - a profile pasted back in shows up here. */
function longestLiteral(code: string): number {
  let longest = 0;
  let i = 0;
  while (i < code.length) {
    if (code[i] !== "`") { i += 1; continue; }
    let j = i + 1;
    while (j < code.length && code[j] !== "`") j += 1;
    longest = Math.max(longest, j - i);
    i = j + 1;
  }
  return longest;
}

const CONSUMERS = [
  [
    "src/app/(routes)/management/supervisor/components/contract/workflows/recruitment.tsx",
    "regular",
  ],
  [
    "src/app/(routes)/management/supervisor/components/contract/workflows/reinstatement.tsx",
    "reinstatement",
  ],
] as const;
for (const [file, key] of CONSUMERS) {
  const code = readFileSync(path.join(ROOT, file), "utf8");
  expect(
    `${path.basename(file)} hands out the handbook's ${key} profile`,
    code.includes(`HANDBOOK_DOCUMENTS.${key}`),
    true,
  );
  expect(
    `${path.basename(file)} embeds no profile of its own`,
    longestLiteral(code) < 20_000,
    true,
  );
}

/* ---- the generated module is generated, and reaches for nothing ---- */
const contentModule = readFileSync(
  path.join(ROOT, "src/app/constants/divisions/ftd/handbook-content.ts"),
  "utf8",
);
expect(
  "the contract workflow's copy says it is generated",
  /GENERATED FILE, DO NOT EDIT/.test(contentModule),
  true,
);
expect(
  "and reads no file and no database of its own",
  /node:fs|@\/lib\/store|mongodb/i.test(contentModule),
  false,
);

/* ---- a published handbook change is a change in the repository ---- */
const SOURCES = [
  "src/app/api/handbook/route.ts",
  "src/lib/handbook.ts",
  "src/components/handbook/handbook-manager.tsx",
  "src/app/constants/divisions/ftd/handbook.ts",
  "src/app/(routes)/divisions/ftd/fd-command/page.tsx",
  "src/app/(routes)/divisions/ftd/fd-command/components/command-tabs.tsx",
];
for (const source of SOURCES) {
  const code = readFileSync(path.join(ROOT, source), "utf8");
  expect(
    `${path.basename(source)} keeps no database copy of the handbook`,
    /@\/lib\/store|mongodb|MongoClient/i.test(code),
    false,
  );
}
// A publish must not be able to get past the validation: the route checks the
// section's placeholders and only then writes, in that order - for one section
// and for a whole pasted profile alike.
const route = readFileSync(path.join(ROOT, SOURCES[0]), "utf8");

/** One function's own source, so an order can be asserted inside it. */
function functionBody(source: string, name: string): string {
  const start = source.indexOf(`async function ${name}(`);
  if (start === -1) return "";
  const ends = [
    source.indexOf("\nasync function ", start + 1),
    source.indexOf("\nexport async function ", start + 1),
  ].filter((at) => at > -1);
  return source.slice(start, ends.length > 0 ? Math.min(...ends) : source.length);
}

const sectionPublish = functionBody(route, "POST");
const formatPublish = functionBody(route, "replaceFormat");
expect(
  "publishing one section validates before it writes",
  sectionPublish.indexOf("validateSection(") > -1 &&
    sectionPublish.indexOf("validateSection(") <
      sectionPublish.indexOf("writeHandbookSection("),
  true,
);
expect(
  "and replacing a whole profile validates every section before it writes",
  formatPublish.indexOf("validateSection(") > -1 &&
    formatPublish.indexOf("validateSection(") <
      formatPublish.indexOf("writeHandbookSections("),
  true,
);
expect(
  "which the route only does from a paste it could split",
  formatPublish.indexOf("splitHandbookDocument(") > -1 &&
    formatPublish.indexOf("splitHandbookDocument(") <
      formatPublish.indexOf("writeHandbookSections("),
  true,
);
// The update path is one button per declared format, and it only offers what
// actually differs: a paste that says nothing new must be told so rather than
// rewriting the whole format.
const managerSource = readFileSync(path.join(ROOT, SOURCES[2]), "utf8");
expect(
  "the Handbook tab offers an update for every format",
  /data\.formats\.map/.test(managerSource) &&
    /Update \{format\.label\}/.test(managerSource),
  true,
);
expect(
  "and it only writes the sections a paste actually changes",
  /sameSectionText/.test(managerSource) &&
    /changedCount/.test(managerSource) &&
    /changed\.length === 0/.test(managerSource),
  true,
);

/* ---- editing the handbook is the Discord admins', and nobody else's ---- */
// The one gate in this app that writes source files. Everything else is a stored
// row or a Discord role, and either of those could be handed out from inside the
// app - which is exactly what must not happen here.
const tabPage = readFileSync(
  path.join(ROOT, "src/app/(routes)/divisions/ftd/fd-command/page.tsx"),
  "utf8",
);
const tabClient = readFileSync(
  path.join(
    ROOT,
    "src/app/(routes)/divisions/ftd/fd-command/components/command-tabs.tsx",
  ),
  "utf8",
);
expect(
  "the publish route answers to the Discord admins",
  /isDiscordAdmin\(/.test(route),
  true,
);
expect(
  "and the Command page decides the tab on the server",
  /isDiscordAdmin\(/.test(tabPage),
  true,
);
expect(
  "the Handbook tab is withheld from everyone else",
  /tab\.value !== "handbook" \|\| canEditHandbook/.test(tabClient),
  true,
);
expect(
  "and a ?tab=handbook link is not a way in",
  /canEditHandbook && <HandbookManager \/>/.test(tabClient),
  true,
);
expect(
  "the page says it only works locally",
  /only works on a local development server/.test(
    readFileSync(path.join(ROOT, SOURCES[2]), "utf8"),
  ),
  true,
);

// The folder has to travel with the deployment, or a deployed build reads an
// empty handbook and every section looks missing.
const nextConfig = readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
expect(
  "the handbook folder is traced into the deployment",
  ["/api/handbook", "/divisions/ftd/fd-command"].every((route) =>
    nextConfig.includes(route),
  ) && nextConfig.includes("./docs/handbook/**/*"),
  true,
);

console.log(
  `\n${checks - failures}/${checks} checks passed - ${HANDBOOK_SECTIONS.length} sections in ${HANDBOOK_FORMATS.length} formats, ${filesOnDisk().length} files`,
);
if (failures > 0) {
  console.log(
    "A section that was applied by hand leaves the generated module behind - run `npm run handbook:sync` and commit both.",
  );
}
process.exitCode = failures > 0 ? 1 : 0;
