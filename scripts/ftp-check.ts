#!/usr/bin/env node
/**
 * Asserts the FTD FTP's declarations match the files on disk.
 *
 * The FTP is editable in the app, which means the app and the repository
 * have to agree about it down to the last file. What this pins:
 *
 *   • every declared section has a file, and every file is a declared section
 *     (an orphan is content nobody can reach, a missing file is a dead link);
 *   • ids and paths are unique, so a link goes to one section only;
 *   • the signature block a section ends with is filled from the member's own
 *     Staff Page - once, for the post and for the FTO's copy of the profile;
 *   • each section still holds the placeholders it declared as un-droppable,
 *     in any spelling the app fills (`Fname Lname` is the same name line as
 *     `{{applicantName}}`);
 *   • every section stands on its own, so nobody's spoiler swallows the next
 *     section's body - including after a paste that nests one section inside
 *     another, which the split rebalances;
 *   • every tag and blank a section is written in is one the Guide's renderer
 *     draws or the blanks declaration names - a format that starts using a new
 *     tag otherwise reads as raw markup on every line of the phase;
 *   • a whole profile is pasted in whatever wrote it and converted once, for the
 *     tab, the terminal and the route alike - and converting a section already
 *     in this format changes nothing, which is what makes an unchanged paste
 *     write no file;
 *   • the assembled profile is the sections in declared order, and the generated
 *     module the contract workflow reads is the same text;
 *   • the workflow hands out that module rather than a second copy of the
 *     profile, which is the drift this whole arrangement exists to stop;
 *   • editing it is the Discord admins' and nobody else's - the one gate in the
 *     app that can't be granted from inside it, because it writes the source;
 *   • and neither the editor's route nor its library has a database path, so a
 *     published FTP change can only ever be a change in the repository.
 *
 * Run it after touching `app/constants/divisions/ftd/ftp.ts`, a file under
 * `docs/ftp/`, or the FTP tab:
 *
 *   npm run ftp:check
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  FTP_FORMATS,
  FTP_SECTIONS,
  ftpFormatOf,
  sectionHeading,
  splitFtpDocument,
} from "@/app/constants/divisions/ftd/ftp";
import { FTP_DOCUMENTS } from "@/app/constants/divisions/ftd/ftp-content";
import { convertFtpBbcode } from "@/lib/ftp-bbcode";
import {
  foreignSectionHeadings,
  readFtp,
  validateSection,
} from "@/lib/ftp";
import { importFtpDocument } from "@/lib/ftp-import";
import {
  canonicalFtpTags,
  compareFtpSection,
  readPastedSections,
} from "@/lib/ftp-markup";
import {
  NAME_SPELLINGS,
  carriesPlaceholder,
  isFillInMarker,
} from "@/app/constants/profile-placeholders";
import { fillMedicSignature, signatureBlock } from "@/lib/ftp-notes";
import { paperworkConfig } from "@/app/(routes)/divisions/ftd/paperwork/lib/paperworkConfig";
import {
  allPhaseNotePlacements,
  phaseNotePlacementsForFormat,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/sections";
import { reinstatementConfig } from "@/app/(routes)/divisions/ftd/paperwork/lib/reinstatementConfig";

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
const DIR = path.join(ROOT, "docs", "ftp");

function read(file: string): string | null {
  try {
    return readFileSync(path.join(ROOT, file), "utf8");
  } catch {
    return null;
  }
}

/** Every file under `docs/ftp/`, relative to the repository root. */
function filesOnDisk(dir = DIR, prefix = "docs/ftp"): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const relative = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) found.push(...filesOnDisk(path.join(dir, entry.name), relative));
    else found.push(relative.split(path.sep).join("/"));
  }
  return found;
}

/* ---- one file per section, one section per file ---- */
const declared = FTP_SECTIONS.map((section) => section.file);
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
  new Set(FTP_SECTIONS.map((section) => section.id)).size,
  FTP_SECTIONS.length,
);
expect(
  "no section is empty",
  FTP_SECTIONS.filter((section) => !(read(section.file) ?? "").trim()).map(
    (section) => section.id,
  ),
  [],
);
expect(
  "every section is in exactly one format",
  FTP_SECTIONS.filter((section) => !ftpFormatOf(section)).map(
    (section) => section.id,
  ),
  [],
);
expect(
  "and both formats are non-empty",
  FTP_FORMATS.map((format) => format.sections.length > 0),
  FTP_FORMATS.map(() => true),
);

/* ---- the placeholders a section promised to keep ---- */
for (const section of FTP_SECTIONS) {
  const content = read(section.file) ?? "";
  const missing = (section.mustKeep ?? []).filter(
    (token) => !carriesPlaceholder(content, token),
  );
  expect(`${section.id} keeps the placeholders it declares`, missing, []);
}

/* ---- a section is a section: it opens and closes its own spoilers ---- */
for (const section of FTP_SECTIONS) {
  const content = read(section.file) ?? "";
  // `[spoiler]` opens one as much as `[spoiler=…]` does, so both count.
  const opens = (content.match(/\[spoiler(?:\s*=[^\]]*)?\]/g) ?? []).length;
  const closes = (content.match(/\[\/spoiler\]/g) ?? []).length;
  // A boundary that falls inside an open spoiler hides the next section's body
  // inside this one's collapse on the forum, which is how the profile's own
  // Personnel File Post template ended up buried in Certification.
  expect(`${section.id} opens and closes its own spoilers`, opens - closes, 0);
}

/* ---- a section holds its own text and no other section's ---- */
// The accident this catches is a whole profile pasted into the editor for one
// section: the header then carries every phase as well, the joined document says
// them twice, and the split can no longer tell where a section begins. It is a
// refusal at publish time because it is a state this script fails on - a file
// that reaches it is one nobody meant to create.
const stored = await readFtp();
function carriesForeignHeading(id: string, content: string): boolean {
  const section = FTP_SECTIONS.find((candidate) => candidate.id === id);
  if (!section) return false;
  return validateSection(
    section,
    content,
    foreignSectionHeadings(stored, id),
  ).problems.some((problem) => problem.includes("no other section's"));
}
expect(
  "no section file carries another section's heading",
  FTP_SECTIONS.filter((section) =>
    carriesForeignHeading(section.id, read(section.file) ?? ""),
  ).map((section) => section.id),
  [],
);
// The first two sections of the regular profile: the header, which has no
// heading of its own, and the phase below it - pasting the second into the first
// is the mistake that is refused.
if (FTP_FORMATS[0].sections.length > 1) {
  const [header, next] = FTP_FORMATS[0].sections;
  const merged = `${read(header.file) ?? ""}\n${sectionHeading(read(next.file) ?? "") ?? ""}\nbody`;
  expect(
    "and a whole profile pasted into one section is refused",
    carriesForeignHeading(header.id, merged),
    true,
  );
  expect(
    "while that section's own text is still publishable",
    carriesForeignHeading(header.id, read(header.file) ?? ""),
    false,
  );
}

/* ---- the profile a format builds is its sections, in order ---- */
for (const format of FTP_FORMATS) {
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
    NAME_SPELLINGS.some((spelling) => document.includes(spelling)),
    true,
  );
  // The contract workflow is a client module and cannot read a file, so it
  // copies the profile out of the generated module. These two are the same text
  // or the FTO pastes something the FTP does not say.
  expect(
    `the generated ${format.key} document is exactly its files`,
    FTP_DOCUMENTS[format.key],
    document,
  );
}

/* ---- a whole profile can be pasted back in and split up again ---- */
// The member writes the profile somewhere else and pastes the finished document,
// so a section is found again by its own heading. A section that stopped opening
// with one would send the paste into the wrong files - and a paste is the one
// edit nobody reads line by line before publishing.
for (const format of FTP_FORMATS) {
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
  const split = splitFtpDocument(pieces, document);
  expect(`the ${format.key} profile splits back up`, split.ok, true);
  expect(
    `and splitting it loses nothing`,
    split.ok && split.sections.map((entry) => entry.content).join("\n") === document,
    true,
  );
}

/* ---- a paste that nests a section inside another still splits cleanly ---- */
// The live regular profile keeps its Personnel File Post template inside
// Certification, so that section's own close sits under the template's body.
// A section file has to stand on its own, so the split hands the enclosing
// section's close back to it - the failure this catches is a paste that leaves
// Certification unclosed and Personnel File Post carrying a stray close, which
// is what the update refused every profile paste over.
const nesting = FTP_FORMATS.find((format) => format.key === "regular");
if (nesting) {
  const pieces = nesting.sections.map((section) => ({
    id: section.id,
    title: section.title,
    content: read(section.file) ?? "",
  }));
  const certification = pieces.findIndex((piece) => piece.id === "certification");
  const personnel = pieces.findIndex(
    (piece) => piece.id === "personnel-file-post",
  );
  const nested = pieces.map((piece) => piece.content);
  const at = nested[certification].lastIndexOf("[/spoiler]");
  nested[certification] = nested[certification].slice(0, at).trimEnd();
  nested[personnel] = `${nested[personnel]}\n[/spoiler]`;

  const split = splitFtpDocument(pieces, nested.join("\n"));
  expect("a paste that nests a section inside another splits", split.ok, true);
  const balance = (content: string) =>
    (content.match(/\[spoiler(?:\s*=[^\]]*)?\]/g) ?? []).length -
    (content.split("[/spoiler]").length - 1);
  expect(
    "and every section of it still opens and closes its own spoilers",
    split.ok ? split.sections.map((entry) => balance(entry.content)) : [],
    nesting.sections.map(() => 0),
  );
  // Per section, so a failure names the one that landed wrong and shows the two
  // tails it is deciding between rather than the whole profile twice over. The
  // blank lines a paste left above a section's close are the paste's spacing,
  // not the section's content: the cut puts that close on its own line, and what
  // this asserts is that the text landed in the file it was cut from.
  const asCut = (text: string) => text.replace(/\n+(?=\[\/spoiler\]$)/, "\n");
  const roundTrip = split.ok ? split.sections.map((entry) => entry.content) : [];
  expect(
    "so the paste lands in the sections it was cut from",
    nesting.sections
      .map((section, at) => ({ section, at }))
      .filter(({ at }) => asCut(roundTrip[at]) !== asCut(pieces[at].content))
      .map(
        ({ section, at }) =>
          `${section.id}: got ${JSON.stringify(roundTrip[at]?.slice(-30))} want ${JSON.stringify(pieces[at].content.slice(-30))}`,
      ),
    [],
  );
}

/* ---- a paste is judged by what it says, not by how phpBB spelled it ---- */
// The profile published on the forum is written the way phpBB left it: it closes
// a tag the writer left open, and it closes the tags between a closing tag and
// the one it matches - `[b][center]…[/b][/center]` and `…[/center][/b]` are one
// post to every reader. Those are the same section, so calling them an edit sends
// a member hunting for a change nobody made; writing them back is worse, because
// it puts the forum's spelling over files that were put right by hand. What holds
// both halves is that every file already *is* this text, and that a paste carrying
// phpBB's order is not a change at all.
expect(
  "every section file is already the text the tags are put right to",
  FTP_SECTIONS.map((section) => ({
    id: section.id,
    repaired: canonicalFtpTags(read(section.file) ?? "").repaired,
  })).filter((entry) => entry.repaired !== 0),
  [],
);
expect(
  "a close that does not line up closes the tag it was written inside",
  canonicalFtpTags("[b][center]x[/b][/center]").text,
  "[b][center]x[/center][/b]",
);
expect(
  "a close with nothing to close is dropped",
  canonicalFtpTags("[spoiler=A][/b]x[/spoiler]").text,
  "[spoiler=A]x[/spoiler]",
);
expect(
  "a tag left open is closed where the thing it was opened in closes",
  canonicalFtpTags("[spoiler=A]\n[divbox=white]\nx\n[/spoiler]").text,
  "[spoiler=A]\n[divbox=white]\nx\n[/divbox][/spoiler]",
);
expect(
  "and a pair written the other way round is put back in order",
  canonicalFtpTags("[list]\n[spoiler=A]\nx\n[/list][/spoiler]").text,
  "[list]\n[spoiler=A]\nx\n[/spoiler][/list]",
);
expect(
  "a section carrying its tags the forum's way is not an edit",
  compareFtpSection(
    "[b][center]x[/center][/b]",
    "[b][center]x[/b][/center]",
  ).same,
  true,
);
expect(
  "while a word that moved is",
  compareFtpSection("[b]10-4[/b]", "[b]10-43[/b]").kind,
  "written",
);
expect(
  "and the report says which word, not just that there is one",
  /10-4/.test(compareFtpSection("[b]10-4[/b]", "[b]10-43[/b]").reason),
  true,
);
/** A section with every correctly nested close pair written the way phpBB stores it. */
function asPhpbbStoresIt(text: string): string {
  return text.replace(
    /\[\/center\]\[\/([a-z]+)\]/g,
    (_whole, name: string) => `[/${name}][/center]`,
  );
}

// End to end, through the one whole-profile path: the live profile with every
// correctly nested close pair written the way phpBB stores it, and then the same
// paste with one word changed.
const spelled = FTP_FORMATS.find((format) => format.key === "regular");
if (spelled) {
  const pieces = spelled.sections.map((section) => ({
    id: section.id,
    title: section.title,
    content: read(section.file) ?? "",
  }));
  const document = pieces.map((piece) => asPhpbbStoresIt(piece.content)).join("\n");
  expect(
    "the paste really is written the forum's way",
    document !== pieces.map((piece) => piece.content).join("\n"),
    true,
  );
  const forumSpelling = await importFtpDocument({
    content: document,
    format: "regular",
    write: false,
  });
  expect(
    "and an update of it writes nothing",
    forumSpelling.ok ? forumSpelling.changed : ["refused"],
    [],
  );
  expect(
    "while saying what it had to put right",
    forumSpelling.ok && forumSpelling.conversions.some((conversion) => conversion.kind === "tag-order"),
    true,
  );
  const edited = await importFtpDocument({
    content: document.replace("MANAGING THEIR UNIT**", "MANAGING THEIR UNITttttt**"),
    format: "regular",
    write: false,
  });
  expect(
    "an edit to the writing is still an edit",
    edited.ok ? edited.changed : ["refused"],
    ["phase-2"],
  );
}
// What the write hands over is the paste with its tags put right, so the forum's
// spelling can never reach the files - and the tab decides it the same way, or it
// promises an update the route then reports differently.
for (const format of FTP_FORMATS) {
  const pieces = format.sections.map((section) => ({
    id: section.id,
    title: section.title,
    content: read(section.file) ?? "",
  }));
  const placed = readPastedSections(
    pieces,
    pieces.map((piece) => asPhpbbStoresIt(piece.content)).join("\n"),
  ).split;
  expect(
    `every ${format.key} section handed to the write is the text the tags are put right to`,
    placed.ok
      ? placed.sections
          .map((entry) => ({
            id: entry.id,
            repaired: canonicalFtpTags(entry.content).repaired,
          }))
          .filter((entry) => entry.repaired !== 0)
      : ["unusable"],
    [],
  );
}

/* ---- the signature block is signed, not retyped ---- */
// Every signed section of a profile ends with the trainer's own block, and the
// section only says so in placeholders - the same file is handed to every
// trainer. What a copy of it needs instead is the member's details, and there is
// one declaration of how that block is filled: the paperwork's generated post,
// the Guide beside it, and the profile an FTO copies.
const trainer = {
  signature: "https://example.test/sig.png",
  name: "A Trainer",
  rank: "Lead Paramedic",
};
const signed = signatureBlock(trainer);
expect(
  "a generated post signs with the member's own signature",
  signed.includes(`[img]${trainer.signature}[/img]`),
  true,
);
expect("and their printed name", signed.includes("[i]A Trainer[/i]"), true);
expect(
  "and their rank",
  signed.split("\n").includes("Lead Paramedic"),
  true,
);
expect(
  "with no placeholder left standing in it",
  ["[img]SIGNATURE[/img]", "[i]Medic Name[/i]", "Rank"].filter((token) =>
    signed.split("\n").includes(token),
  ),
  [],
);
expect(
  "a member with nothing saved keeps the placeholder instead of signing blank",
  signatureBlock({ signature: "", name: "", rank: "" }).includes(
    "[img]SIGNATURE[/img]",
  ),
  true,
);
expect(
  "the reinstatement block's bare lines are filled the same way",
  fillMedicSignature("SIGNATURE\nRANK", trainer),
  `${trainer.signature}\nLead Paramedic`,
);
expect(
  "a name line spelled the way the live profile post spells it is the same line",
  fillMedicSignature("[i]Fname Lname[/i]", trainer),
  "[i]A Trainer[/i]",
);
expect(
  "and filling does not rewrite a sentence that only mentions the word",
  fillMedicSignature("The title should read -> Rank Adjustment | Name", trainer),
  "The title should read -> Rank Adjustment | Name",
);
const generators = [
  "src/app/(routes)/divisions/ftd/paperwork/lib/generateBBCode.ts",
  "src/app/(routes)/divisions/ftd/paperwork/lib/generateReinstatementBBCode.ts",
].map((file) => read(file) ?? "");
expect(
  "both paperwork generators sign from that one block",
  generators.map((code) => code.includes("signatureBlock(")),
  generators.map(() => true),
);
expect(
  "and neither writes a signature block of its own",
  generators.map((code) => code.includes("[img]${values.signature")),
  generators.map(() => false),
);
expect(
  "and each form signs with the trainer's own saved name, not a retyped one",
  [
    "src/app/(routes)/divisions/ftd/paperwork/components/PaperworkForm.tsx",
    "src/app/(routes)/divisions/ftd/paperwork/components/ReinstatementForm.tsx",
  ].map((file) => (read(file) ?? "").includes("ftoName: details.ftoName")),
  [true, true],
);
/* ---- a name the app fills is one the FTP may keep ---- */
// Two things replace a name in a template and they have to agree: the copy flow
// that fills it in, and the FTP that refuses to lose it. One declaration,
// or a paste spelling the name the old way is refused for no reason.
const contractActions =
  read(
    "src/app/(routes)/management/supervisor/components/contract/actions.ts",
  ) ?? "";
expect(
  "the copy flow reads the one declaration of the name spellings",
  contractActions.includes(
    'from "@/app/constants/profile-placeholders"',
  ),
  true,
);
expect(
  "and keeps no list of its own",
  contractActions.includes("const NAME_PLACEHOLDERS"),
  false,
);
expect(
  "the FTP check reads that same declaration",
  carriesPlaceholder("…Fname Lname…", "{{applicantName}}"),
  true,
);

/* ---- the profile is handed out from the FTP, not from a second copy ---- */
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
    `${path.basename(file)} hands out the FTP's ${key} profile`,
    code.includes(`FTP_DOCUMENTS.${key}`),
    true,
  );
  expect(
    `${path.basename(file)} embeds no profile of its own`,
    longestLiteral(code) < 20_000,
    true,
  );
}

/* ---- the paperwork Guides are built from the FTP ---- */
// A Guide is built from the phase's FTP section: a trainer reading a guide
// that disagrees with the profile is worse off than one with no guide at all,
// which is how the Phase 1 notes came to still say panics do not show in PD/SD
// dispatch after the section had stopped saying it. So it is *converted*, not
// written twice (`lib/phase-notes-build.ts`, driven by `npm run notes:build` and
// by the FTP tab's own update), and what these hold is that there is one per
// phase and that it is drawn rather than pasted.
const PHASE_NOTES_DIR =
  "src/app/(routes)/divisions/ftd/paperwork/lib/phase-notes";
const REGISTRY = `${PHASE_NOTES_DIR}/registry.tsx`;
const registry = read(REGISTRY) ?? "";
const notesFiles: string[] = [];
(function walk(dir: string) {
  for (const entry of readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const next = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(next);
    else notesFiles.push(next);
  }
})(PHASE_NOTES_DIR);

expect(
  "the Guide is the paperwork's own writing, not the profile printed back",
  /ftpSectionText\(/.test(registry),
  false,
);
const mapped = new Set(
  [...registry.matchAll(/^ {2}(\w+): \{/gm)].map((match) => match[1]),
);
const declaredPhases = [
  ...Object.keys(paperworkConfig),
  ...Object.keys(reinstatementConfig),
];
expect(
  "every phase of the paperwork is given a Guide",
  declaredPhases.filter((key) => !mapped.has(key)),
  [],
);
// A Guide carries the section's *words* - that is the point of building it from
// the section - so what may not be in there is the section's *markup*: a view of
// the profile is the paperwork page's own components, and the profile itself is
// what `components/ftp/bbcode-preview.tsx` renders in the FTP tab.
const PASTED_MARKUP =
  /\[(?:list|spoiler|spoil|divbox|lsemssubtitle|lsemsfooter|code|url|img|center|ooc|c|cb|color|size)\b/i;
// Only the views themselves: the email bodies beside them are paste-ready forum
// posts on purpose, and markup is what they are made of.
const notesViews = allPhaseNotePlacements().map(
  (placement) => placement.guide,
);
const pasted: string[] = notesViews
  .filter((file) => PASTED_MARKUP.test(read(file) ?? ""))
  .map((file) => `${file} carries FTP markup`);
expect("and no Guide is the profile pasted in", pasted, []);

/* ---- the Hippocratic Oath is handed over a line at a time, always ---- */
// The oath is read out loud one sentence at a time, so each cert Guide carries
// it as one copyable line per sentence - no banner or sign-off image in the way.
// This is the builder's behaviour, not a one-off edit: if the builder ever stops
// splitting the oath into `OathLine`s, or a Guide slips back to carrying it as
// one wall of text with its images, these fail.
const buildSource = readFileSync(
  path.join(ROOT, "src/lib/phase-notes-build.ts"),
  "utf8",
);
expect(
  "the builder hands the oath over a line at a time",
  /hippocratic/i.test(buildSource) &&
    /OathLine/.test(buildSource) &&
    /splitOathLines/.test(buildSource),
  true,
);
const oathGuides = allPhaseNotePlacements()
  .map((placement) => placement.guide)
  .filter((file) => /hippocratic/i.test(read(file) ?? ""));
expect(
  "and every oath Guide draws each line with its own copy",
  oathGuides.length > 0 &&
    oathGuides.every((file) => {
      const source = read(file) ?? "";
      const oathLines = (source.match(/<OathLine>/g) ?? []).length;
      // The covenant is a dozen-odd sentences; anything fewer means the oath
      // is being carried as one block again.
      return oathLines >= 10 && !/i\.ibb\.co/.test(source);
    }),
  true,
);
expect(
  "and the oath is the only place a Guide needs line-splitting",
  (read("src/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/certPassed.tsx") ?? "")
    .match(/<OathLine>/g)?.length === (read("src/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/certFailed.tsx") ?? "").match(/<OathLine>/g)?.length,
  true,
);

/* ---- and every phase names the section its Guide is drawn from ---- */
// The Guide is the trainers' writing and the FTP is the profile, so the two
// are allowed to say a thing differently - which is exactly why each phase has to
// name the section it is drawn from. `npm run notes:build` converts that section
// into the phase's Guide, and `npm run notes:check` says which of its steps a
// Guide has stopped carrying; a phase that names nothing is a phase neither can
// reach, which is how one came to still say panics do not show in PD/SD dispatch
// long after the profile had stopped saying so.
const placements = allPhaseNotePlacements();
expect(
  "every phase names the FTP section its Guide is drawn from",
  placements
    .filter(
      (placement) =>
        !FTP_SECTIONS.some((section) => section.id === placement.section),
    )
    .map((placement) => `${placement.component} -> ${placement.section}`),
  [],
);
expect(
  "and every one of those Guides is a file the app renders",
  placements
    .filter((placement) => (read(placement.guide) ?? "").trim().length === 0)
    .map((placement) => placement.guide),
  [],
);


/* ---- the FTP can be drawn: a tag it uses is a tag the renderer knows ---- */
// `components/ftp/bbcode-preview.tsx` is the app's one renderer of a
// section, so a tag it does not know is text a reader sees as `[ooc] … [/ooc]`
// on every line - and a blank like `[Callsign]` treated as a tag swallowed
// everything after it. Every bracket token in the FTP is therefore either
// something that renderer draws or a declared blank, and a new one fails here
// until it is one of those.
const previewSource = readFileSync(
  path.join(ROOT, "src/components/ftp/bbcode-preview.tsx"),
  "utf8",
);
const drawnTags = new Set(
  [
    ...previewSource
      .slice(
        previewSource.indexOf("const VOID_TAGS"),
        previewSource.indexOf("function openFor("),
      )
      .matchAll(/"([a-z*][a-z0-9*]*)"/g),
  ].map((match) => match[1]),
);
expect(
  "the app's section renderer declares what it draws",
  drawnTags.size > 20,
  true,
);
expect(
  "and it only tracks a tag it draws, so a blank cannot swallow a section",
  /!WRAPPING_TAGS\.has\(tag\)/.test(previewSource) &&
    /openFor\(stack, tag\)/.test(previewSource),
  true,
);
const undrawnTags = new Set<string>();
for (const section of FTP_SECTIONS) {
  const tokens = (read(section.file) ?? "").matchAll(
    /\[(?:\/)?([a-zA-Z*][a-zA-Z0-9]*)(?:=[^\]]*)?\]/g,
  );
  for (const token of tokens) {
    const tag = token[1].toLowerCase();
    if (!drawnTags.has(tag) && !isFillInMarker(tag)) undrawnTags.add(tag);
  }
}
expect(
  "and every tag a section uses is drawn, and every blank declared",
  [...undrawnTags],
  [],
);

/* ---- the generated module is generated, and reaches for nothing ---- */
const contentModule = readFileSync(
  path.join(ROOT, "src/app/constants/divisions/ftd/ftp-content.ts"),
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

/* ---- a published FTP change is a change in the repository ---- */
const SOURCES = [
  "src/app/api/ftp/route.ts",
  "src/lib/ftp.ts",
  "src/components/ftp/ftp-manager.tsx",
  "src/app/constants/divisions/ftd/ftp.ts",
  "src/app/(routes)/divisions/ftd/fd-command/page.tsx",
  "src/app/(routes)/divisions/ftd/fd-command/components/command-tabs.tsx",
  "src/lib/ftp-bbcode.ts",
  "src/lib/ftp-import.ts",
  "src/lib/ftp-markup.ts",
];
for (const source of SOURCES) {
  const code = readFileSync(path.join(ROOT, source), "utf8");
  expect(
    `${path.basename(source)} keeps no database copy of the FTP`,
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
expect(
  "publishing one section validates before it writes",
  sectionPublish.indexOf("validateSection(") > -1 &&
    sectionPublish.indexOf("validateSection(") <
      sectionPublish.indexOf("writeFtpSection("),
  true,
);
// Replacing a whole profile is one function (`lib/ftp-import.ts`) because
// three callers need the same answer, so these read that function's own source
// rather than the route's - the route delegates, and says so in the next block.
const importerSource = readFileSync(
  path.join(ROOT, "src/lib/ftp-import.ts"),
  "utf8",
);
const formatPublish = functionBody(importerSource, "importFtpDocument");
// The Guides are rebuilt by the write itself rather than by a second
// command a member has to know about, and they are rebuilt for the profile the
// paste was read as: the paste is taken as that profile being current, so a guide
// already behind its section is not left behind it.
expect(
  "and an update rebuilds every Guide that profile is read by",
  /writeFtpSections\(/.test(importerSource) &&
    /writePhaseNotesForSections\(\s*phaseNotePlacementsForFormat\(format\.key\)/.test(
      importerSource,
    ),
  true,
);
// Every phase of the profile the paste was read as is in the rebuild, and every
// section it is built from is one the FTP declares - so the set is the
// format's own phases, neither a subset of them nor a path nobody declared.
expect(
  "which is every phase of that format and no other",
  (["regular", "reinstatement"] as const).every((format) => {
    const placements = phaseNotePlacementsForFormat(format);
    return (
      placements.length > 0 &&
      placements.every(
        (placement) =>
          placement.component !== undefined &&
          FTP_SECTIONS.some(
            (section) => section.id === placement.section,
          ),
      )
    );
  }) &&
    phaseNotePlacementsForFormat("regular").every(
      (placement) =>
        !placement.component.toLowerCase().startsWith("reinstatement"),
    ) &&
    phaseNotePlacementsForFormat("reinstatement").every((placement) =>
      placement.component.toLowerCase().startsWith("reinstatement"),
    ),
  true,
);
expect(
  "and replacing a whole profile validates every section before it writes",
  formatPublish.indexOf("validateSection(") > -1 &&
    formatPublish.indexOf("validateSection(") <
      formatPublish.indexOf("writeFtpSections("),
  true,
);
expect(
  "which it only does from a paste it could split",
  formatPublish.indexOf("readPastedSections(") > -1 &&
    formatPublish.indexOf("readPastedSections(") <
      formatPublish.indexOf("writeFtpSections("),
  true,
);
// The update path is one button per declared format, and it only offers what
// actually differs: a paste that says nothing new must be told so rather than
// rewriting the whole format.
const managerSource = readFileSync(path.join(ROOT, SOURCES[2]), "utf8");
const routeSource = readFileSync(path.join(ROOT, SOURCES[0]), "utf8");
const librarySource = readFileSync(path.join(ROOT, SOURCES[1]), "utf8");
expect(
  "the FTP tab offers an update for every format",
  /data\.formats\.map/.test(managerSource) &&
    /Update \{format\.label\}/.test(managerSource),
  true,
);
// The tab decides what a paste would change as it is typed, and the route decides
// it again on the way in. Two answers to one question is how a panel promises an
// update the write then refuses, so both ask the one function.
expect(
  "and the tab and the importer decide a paste the same way",
  /compareFtpSection\(/.test(managerSource) &&
    /readPastedSections\(/.test(managerSource) &&
    /compareFtpSection\(/.test(importerSource) &&
    /readPastedSections\(/.test(importerSource) &&
    !/sameSectionText/.test(managerSource),
  true,
);
expect(
  "and it only writes the sections a paste actually changes",
  /compareFtpSection\(/.test(managerSource) &&
    /changedCount/.test(managerSource) &&
    /changedCount === 0/.test(managerSource),
  true,
);
// An update that writes no section file still rebuilds the paperwork, so what
// the button says when nothing changed is the rebuild rather than "nothing to
// update" - the wording that had a member think their update had not run.
expect(
  "and an update with nothing to write says what it does rebuild",
  /Rebuild the Guides/.test(managerSource) &&
    /notesPhases/.test(managerSource),
  true,
);
// The sections an update leaves alone are handed over as the file's own text, so
// the write skips them for the same reason it skips any section that already
// says this - and the file keeps the layout it was written in.
expect(
  "while the ones it leaves alone are offered as the text they already are",
  /state === "changed"/.test(importerSource) &&
    /pastedById/.test(importerSource),
  true,
);

// An update is about the phases. The profile's own header is not the member's to
// change through a paste, so the section is declared and the update path skips it
// - a paste carrying a blank header would otherwise replace it silently.
const headerSections = FTP_SECTIONS.filter((section) =>
  section.id.endsWith("header"),
);
expect(
  "the profile headers are declared out of reach of an update",
  headerSections.filter((section) => section.protectedFromPaste !== true).map(
    (section) => section.id,
  ),
  [],
);
expect(
  "and the update path skips what it may not rewrite",
  /keepProtected: true/.test(importerSource) &&
    /kept: result\.kept/.test(importerSource) &&
    /protectedFromPaste/.test(importerSource),
  true,
);
expect(
  "and the library's write path skips a section nothing may rewrite",
  /options\.keepProtected && section\.protectedFromPaste/.test(librarySource),
  true,
);
expect(
  "and the tab says a protected section was kept",
  /section\.protectedFromPaste/.test(managerSource) &&
    /kept/.test(managerSource),
  true,
);
// The tab writes a whole profile and nothing smaller, which is what makes an
// update honest: a section edited on its own is one that no longer agrees with
// the profile it came from. The route refuses the header as well, so a request
// that names it directly cannot put a different header in place either.
expect(
  "and the tab offers no way to write one section on its own",
  /Publish|writeFtpSection\(/.test(managerSource),
  false,
);
expect(
  "and the header is refused whichever door a request comes in by",
  /section\.protectedFromPaste[\s\S]{0,300}status: 403/.test(routeSource),
  true,
);

/* ---- a paste is converted before anything looks at it ---- */
// phpBB writes an id of its own on every tag it stores, closes a list item with
// `[/*]` rather than opening the next one with `[*]`, quotes a spoiler's title and
// keeps whatever newlines wrote it, and a copy taken off the rendered page rather
// than out of the editor arrives as HTML. None of that is content: a paste that
// reached the split as it arrived would fail on the first quoted heading and land
// a `[b:1a2b3c4d]` in a section file. One converter holds it, and the tab, the
// terminal and the route all go through it before they go any further.
const bbcodeSource = readFileSync(
  path.join(ROOT, "src/lib/ftp-bbcode.ts"),
  "utf8",
);
// The tab converts as the member types, in the browser, so this module may not
// reach for a file, a database or a server-only library - importing `lib/ftp`
// here would put `node:child_process` in the client bundle.
expect(
  "the converter runs in the browser as well as in the terminal",
  /node:|from "next\/|@\/lib\/store|@\/lib\/FTP"/.test(bbcodeSource),
  false,
);
expect(
  "and it says which conversions it can make",
  ["tag-id", "item-end", "html-break", "html-emphasis", "entity", "heading-quote"].filter(
    (kind) => !bbcodeSource.includes(`"${kind}"`),
  ),
  [],
);

// A sample written the way phpBB and a rendered page hand a profile back, and
// what the files have to hold once it has been through the converter.
const rawSample = [
  '[spoiler="Phase 1"]',
  '<strong>Bold</strong> text&nbsp;here<br>and [b:1a2b3c4d]a tag[/b:1a2b3c4d]',
  "[list]",
  "[*]one[/*]",
  "[*:1a2b3c4d]two[/*:m]",
  "[/list:u]",
  "[/spoiler]",
].join("\r\n");
const convertedSample = convertFtpBbcode(rawSample);
expect(
  "a paste in phpBB's own flavour comes back in the FTP's",
  convertedSample.text,
  [
    "[spoiler=Phase 1]",
    "[b]Bold[/b] text here",
    "and [b]a tag[/b]",
    "[list]",
    "[*]one",
    "[*]two",
    "[/list]",
    "[/spoiler]",
  ].join("\n"),
);
expect(
  "and every conversion it made is named",
  convertedSample.conversions.map((conversion) => conversion.kind),
  [
    "line-ending",
    "html-break",
    "html-emphasis",
    "entity",
    "tag-id",
    "item-end",
    "heading-quote",
  ],
);
// The claim the whole arrangement rests on: the files are already in the format
// the converter produces, so a pasted profile nobody edited writes no file - and
// a member who pastes the profile as it stands is told nothing differed rather
// than handed nine rewritten sections.
expect(
  "and converting a section that is already in this format changes nothing",
  FTP_SECTIONS.filter((section) => {
    const content = read(section.file) ?? "";
    const converted = convertFtpBbcode(content);
    return converted.text !== content || converted.conversions.length > 0;
  }).map((section) => section.id),
  [],
);

/** A profile as phpBB and a rendered page would hand it back, reversibly. */
function asPasted(document: string): string {
  return document
    .replace(/\[spoiler=([^\]]+)\]/g, '[spoiler="$1"]')
    .replace(/\[\/?b\]/g, (tag) => `${tag.slice(0, -1)}:1a2b3c4d]`)
    .replace(/^\[\*\](.*)$/gm, "[*]$1[/*]")
    .replace(/\n(\[lsemssubtitle\])/g, "<br>$1")
    .replace(/] /, "]&nbsp;")
    .replace(/\n/g, "\r\n");
}

for (const format of FTP_FORMATS) {
  const document = format.sections
    .map((section) => read(section.file) ?? "")
    .join("\n");
  const report = await importFtpDocument({
    content: asPasted(document),
    write: false,
  });
  expect(
    `a pasted ${format.key} profile is read back as that profile`,
    report.ok && report.format === format.key,
    true,
  );
  expect(
    `and it lands in the files it was cut from`,
    report.ok && report.changed.length === 0 && report.conversions.length > 0,
    true,
  );
  expect(
    `while the ${format.key} header is still not an update's to rewrite`,
    report.ok
      ? report.sections
          .filter((section) => section.state === "kept")
          .map((section) => section.id)
      : [],
    format.sections
      .filter((section) => section.protectedFromPaste)
      .map((section) => section.id),
  );
}

// One importer, so a paste cannot convert in the tab and not in the terminal, or
// split in the route and not in the app.
expect(
  "the route hands a whole profile to that one importer",
  /importFtpDocument\(/.test(routeSource) &&
    !/splitFtpDocument\(/.test(routeSource),
  true,
);
expect(
  "and hands back what it rebuilt, and what it could not",
  /report\.notes\b/.test(routeSource) &&
    /report\.notesPhases/.test(routeSource) &&
    /report\.notesSkipped/.test(routeSource),
  true,
);
expect(
  "and so does the terminal's entry point",
  /importFtpDocument\(/.test(
    readFileSync(path.join(ROOT, "scripts/ftp-import.ts"), "utf8"),
  ),
  true,
);
expect(
  "and the tab converts what it is given before it previews it",
  /convertFtpBbcode\(/.test(managerSource),
  true,
);
expect(
  "and the conversion happens before the split",
  formatPublish.indexOf("convertFtpBbcode(") > -1 &&
    formatPublish.indexOf("convertFtpBbcode(") <
      formatPublish.indexOf("readPastedSections("),
  true,
);

/* ---- editing the FTP is the Discord admins', and nobody else's ---- */
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
  "the publish route answers to the FTP gate",
  /canEditFtp\(/.test(route),
  true,
);
expect(
  "and the Command page decides the tab on the server",
  /mayEditFtp\(/.test(tabPage),
  true,
);
// The gate itself is one function, and it is read from the role registry -
// never from a matrix row the permission editor could hand out, and never by
// guessing a role from its name.
expect(
  "the gate is one function the route and the page share",
  /export function canEditFtp\(/.test(
    readFileSync(path.join(ROOT, "src/lib/role-config.ts"), "utf8"),
  ) &&
    /DISCORD_ADMIN_IDS/.test(
      readFileSync(path.join(ROOT, "src/lib/role-config.ts"), "utf8"),
    ),
  true,
);
expect(
  "the FTP tab is withheld from everyone else",
  /tab\.value !== "ftp" \|\| canEditFtp/.test(tabClient),
  true,
);
expect(
  "and a ?tab=ftp link is not a way in",
  /canEditFtp && <FtpManager \/>/.test(tabClient),
  true,
);
expect(
  "the page says it only works locally when it cannot commit",
  /only works on a local development server/.test(
    readFileSync(path.join(ROOT, SOURCES[2]), "utf8"),
  ),
  true,
);

/* ---- a restore is an update of an older version ---- */
// Going back must be the same pipeline as going forward: the restore reads the
// old section files and hands them to the one importer, so it cannot skip the
// conversion, the split or the placeholder check on its way in.
const restoreBody = functionBody(routeSource, "restoreVersion");
expect(
  "a restore is the same importer a paste goes through",
  restoreBody.includes("importFtpDocument(") &&
    restoreBody.includes("fileAtCommit(") &&
    restoreBody.includes("readFtpVersion("),
  true,
);
expect(
  "and restores whole profiles only, skipping one that already agrees",
  restoreBody.includes("FTP_FORMATS") && restoreBody.includes("differs"),
  true,
);
// The version history is git's own, wherever it lives - GitHub on a deployment
// that commits, the checkout's log on a development machine - and never a
// second record the app keeps beside it.
expect(
  "the version history is the repository's, not a second record",
  /get\("history"\) === "all"/.test(routeSource) &&
    /commitHistory\(files, 100\)/.test(routeSource) &&
    /readFtpHistoryAll\(files, 100\)/.test(routeSource),
  true,
);
// The `ftp:` prefix on an update's or a restore's subject is the convention
// the panel filters on - without it, the history is every commit that happened
// to touch a section file, which is not a version of the FTP.
expect(
  "the history is filtered to ftp: commits only",
  /startsWith\("ftp:"\)/.test(routeSource) &&
    /ftp: update/.test(
      readFileSync(path.join(ROOT, "src/lib/ftp-import.ts"), "utf8"),
    ) &&
    /ftp: restore/.test(routeSource),
  true,
);
// A commit is the record of a change, so an update that moves nothing - the
// paste already agreed, and the Guides already said it - writes no commit.
const stagedBody = functionBody(
  readFileSync(path.join(ROOT, "src/lib/ftp-import.ts"), "utf8"),
  "stagedUpdate",
);
expect(
  "an update that moved nothing commits nothing",
  /changed\.length === 0 && notes\.files\.length === 0/.test(stagedBody),
  true,
);

// The folder has to travel with the deployment, or a deployed build reads an
// empty FTP and every section looks missing.
const nextConfig = readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
expect(
  "the FTP folder is traced into the deployment",
  ["/api/ftp", "/divisions/ftd/fd-command"].every((route) =>
    nextConfig.includes(route),
  ) && nextConfig.includes("./docs/ftp/**/*"),
  true,
);

console.log(
  `\n${checks - failures}/${checks} checks passed - ${FTP_SECTIONS.length} sections in ${FTP_FORMATS.length} formats, ${filesOnDisk().length} files`,
);
if (failures > 0) {
  console.log(
    "A section that was applied by hand leaves the generated module behind - run `npm run ftp:sync` and commit both.",
  );
}
process.exitCode = failures > 0 ? 1 : 0;
