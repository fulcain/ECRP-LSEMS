/**
 * The FTD handbook on disk: the one place that reads a section, writes one back,
 * and asks git what it looked like before.
 *
 * A published section is a **file in the repository** and nothing else. There is
 * no database copy and no cache to fall back on: if this deployment cannot write
 * to its own filesystem the write is refused and the caller is handed the text
 * to apply by hand. That is deliberate - handbook content living in two places is
 * exactly how the app and the forum drift apart.
 *
 * `docs/handbook/**` travels with the deployment through
 * `outputFileTracingIncludes` in `next.config.ts`, so a deployed build can still
 * *read* every section and serve it to the editor.
 *
 * Writing a section also assembles the two profiles back into
 * `handbook-content.ts`, because the contract workflow that hands an FTO the
 * profile is a client module and cannot read a file. That module is generated,
 * never edited, and `npm run handbook:check` fails when it stops matching.
 */

import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import {
  HANDBOOK_FORMATS,
  HANDBOOK_SECTIONS,
  handbookFormatOf,
  handbookSection,
  type HandbookFormat,
  type HandbookSection,
} from "@/app/constants/divisions/ftd/handbook";

const run = promisify(execFile);
const ROOT = process.cwd();

/** A section as the editor needs it: the declaration plus the file's own text. */
export type HandbookSectionContent = {
  id: string;
  title: string;
  hint: string;
  format: HandbookFormat["key"];
  formatLabel: string;
  file: string;
  mustKeep: readonly string[];
  content: string;
  /** False when the file could not be read - a deployed build that lost its folder. */
  available: boolean;
};

export type HandbookFormatContent = {
  key: HandbookFormat["key"];
  label: string;
  hint: string;
  sections: HandbookSectionContent[];
};

export type HandbookValidation = {
  /** Publish is refused while this is not empty. */
  problems: string[];
  /** Published anyway, but worth saying out loud. */
  warnings: string[];
};

const TAGS = [
  "b",
  "i",
  "u",
  "s",
  "list",
  "divbox",
  "center",
  "code",
  "spoiler",
  "url",
  "img",
  "quote",
  "color",
  "size",
  "font",
  "highlight",
  "shadow",
  "aligntable",
  "lsemssubtitle",
];
const VOID_TAGS = new Set(["hr", "cb", "cbc", "*", "lsemsfooter"]);

function absolute(file: string): string {
  return path.join(ROOT, file);
}

/** The file's text, or null when it is not there. */
async function readSectionFile(file: string): Promise<string | null> {
  try {
    return await readFile(absolute(file), "utf8");
  } catch {
    return null;
  }
}

/**
 * Every section of every format, in declared order, with its text. A file that
 * cannot be read comes back as `available: false` rather than taking the page
 * down - a missing handbook file is worth seeing, not worth a 500.
 */
export async function readHandbook(): Promise<HandbookFormatContent[]> {
  return Promise.all(
    HANDBOOK_FORMATS.map(async (format) => ({
      key: format.key,
      label: format.label,
      hint: format.hint,
      sections: await Promise.all(
        format.sections.map(async (section) => {
          const content = await readSectionFile(section.file);
          return {
            id: section.id,
            title: section.title,
            hint: section.hint,
            format: format.key,
            formatLabel: format.label,
            file: section.file,
            mustKeep: section.mustKeep ?? [],
            content: content ?? "",
            available: content !== null,
          };
        }),
      ),
    })),
  );
}

/**
 * The document a format builds: its sections in order, one newline between
 * them. This is the profile post as it would be pasted into the forum.
 */
export async function readHandbookDocument(
  key: HandbookFormat["key"],
): Promise<string> {
  const format = HANDBOOK_FORMATS.find((entry) => entry.key === key);
  if (!format) return "";
  const parts = await Promise.all(
    format.sections.map(async (section) => (await readSectionFile(section.file)) ?? ""),
  );
  return parts.join("\n");
}

/** Where the generated module the client reads the profile from lives. */
export const HANDBOOK_CONTENT_MODULE =
  "src/app/constants/divisions/ftd/handbook-content.ts";

/**
 * The generated module's text for the files as they are on disk right now.
 *
 * The contract workflow is a client module: it cannot read a file, so the
 * profile it copies has to reach it some other way. Rather than keep a second
 * copy beside it - which is what had drifted - the sections are assembled into
 * this module, and `npm run handbook:check` fails the moment the two disagree.
 */
export async function renderHandbookContentModule(): Promise<string> {
  const documents = {
    regular: await readHandbookDocument("regular"),
    reinstatement: await readHandbookDocument("reinstatement"),
  };
  return `/**
 * The handbook's two profiles, assembled - GENERATED FILE, DO NOT EDIT.
 *
 * Written from \`docs/handbook/**\` when a section is published. It exists
 * because the contract workflow is a client module: it cannot read a file, and
 * the profile it copies has to be the handbook's own text rather than a second
 * copy of it - edit the section files, never this.
 *
 * \`npm run handbook:check\` fails when this stops matching the files.
 */

import type { HandbookFormatKey } from "./handbook";

/** Each format's own document: its sections in order, one newline between them. */
export const HANDBOOK_DOCUMENTS: Record<HandbookFormatKey, string> = ${JSON.stringify(
    documents,
    null,
    2,
  )};
`;
}

/**
 * A section's text as of one commit, for looking at what it said before. Reads
 * git's own object store, so it needs a checkout - which the deployed app does
 * not have, and the caller is told so rather than shown an empty page.
 */
export async function readHandbookVersion(
  file: string,
  revision: string,
): Promise<string | null> {
  if (!/^[0-9a-f]{7,40}$/i.test(revision)) return null;
  try {
    const { stdout } = await run("git", ["show", `${revision}:${file}`], {
      cwd: ROOT,
      maxBuffer: 8 * 1024 * 1024,
    });
    return stdout;
  } catch {
    return null;
  }
}

export type HandbookCommit = {
  revision: string;
  date: string;
  subject: string;
  author: string;
};

/** The commits that touched a section - its version history. */
export async function readHandbookHistory(
  file: string,
  limit = 25,
): Promise<HandbookCommit[]> {
  try {
    const { stdout } = await run(
      "git",
      [
        "log",
        `--max-count=${limit}`,
        "--date=short",
        "--format=%h%x1f%ad%x1f%an%x1f%s",
        "--",
        file,
      ],
      { cwd: ROOT, maxBuffer: 1024 * 1024 },
    );
    return stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [revision, date, author, subject] = line.split("\u001f");
        return { revision, date, author, subject };
      });
  } catch {
    // No checkout here: a deployed build has no `.git`, and that is not an error.
    return [];
  }
}

/** Whether this deployment can write its own source files. */
export function canWriteHandbook(): boolean {
  // A serverless build ships the repository read-only, so the editor offers the
  // file to apply by hand instead of promising a write that cannot happen.
  return !process.env.VERCEL;
}

/**
 * The problems a publish must not go through with, and the ones worth mentioning.
 *
 * The `mustKeep` check is the important one: a section replaced wholesale is
 * exactly how a signature image or the trainee's name line disappears, and the
 * member cannot see that from the editor.
 */
export function validateSection(
  section: HandbookSection,
  content: string,
): HandbookValidation {
  const problems: string[] = [];
  const warnings: string[] = [];
  const text = content.trim();

  if (!text) {
    problems.push("The section is empty. Use Discard to put it back.");
    return { problems, warnings };
  }
  for (const token of section.mustKeep ?? []) {
    if (!content.includes(token)) {
      problems.push(
        `The placeholder ${token} is missing. Re-add it before publishing.`,
      );
    }
  }

  // A section owns its spoilers: one left open would swallow the next section's
  // body inside its own collapse on the forum, which is how the profile's
  // Personnel File Post template ended up buried in Certification. This is a
  // refusal rather than a warning because `npm run handbook:check` fails on it,
  // and a publish must not be able to create the state the check rejects.
  const opens = (content.match(/\[spoiler=[^\]]*\]/g) ?? []).length;
  const closes = (content.match(/\[\/spoiler\]/g) ?? []).length;
  if (opens !== closes) {
    problems.push(
      opens > closes
        ? "This section opens a spoiler it never closes - every section has to close its own."
        : "This section closes a spoiler it never opened - every section has to open its own.",
    );
  }

  const stack: string[] = [];
  const pattern = /\[(\/?)([a-zA-Z*]+)(?:=[^\]]*)?\]/g;
  for (let match = pattern.exec(content); match; match = pattern.exec(content)) {
    const [, closing, rawName] = match;
    const name = rawName.toLowerCase();
    if (!TAGS.includes(name) || VOID_TAGS.has(name)) continue;
    if (closing) {
      const open = stack.pop();
      if (open !== name) {
        warnings.push(`A [/${name}] does not line up with the tag before it.`);
        break;
      }
    } else {
      stack.push(name);
    }
  }
  if (stack.length > 0) {
    warnings.push(`These tags are never closed: ${[...new Set(stack)].join(", ")}.`);
  }
  if (!/\[lsemssubtitle\]|\[b\]|\[i\]/.test(content)) {
    warnings.push("No headings or emphasis left in this section.");
  }

  return { problems, warnings };
}

export type HandbookWriteResult =
  | { ok: true; written: true; file: string; bytes: number }
  | {
      ok: false;
      written: false;
      file: string;
      reason: string;
      content: string;
    };

/** What a write of several sections left behind. */
export type HandbookSectionsWrite = {
  files: string[];
  bytes: number;
  /** The sections whose file actually changed, and the ones that did not. */
  changed: string[];
  unchanged: string[];
};

/**
 * Whether two section texts are the same content, whatever line endings they
 * were read or pasted with - the repository normalises them, so a paste that
 * only differs in `\r` is not a change worth a commit.
 */
function sameText(a: string, b: string): boolean {
  return a.replace(/\r\n/g, "\n") === b.replace(/\r\n/g, "\n");
}

/**
 * Writes several sections, then assembles the module once.
 *
 * Only the sections that actually differ are written. A whole-profile update is
 * the common case - the profile is rewritten elsewhere and pasted back in - and
 * touching all nine files when the change was one line makes the commit that
 * follows unreadable. The unchanged files keep their own history.
 *
 * A whole profile has to move as one unit: regenerating the module per file would
 * leave the assembled profile disagreeing with the sections it is built from on
 * every write but the last, which is the one state `npm run handbook:check`
 * exists to refuse.
 */
export async function writeHandbookSections(
  entries: readonly { id: string; content: string }[],
): Promise<HandbookSectionsWrite | null> {
  if (!canWriteHandbook() || entries.length === 0) return null;

  const files: string[] = [];
  const changed: string[] = [];
  const unchanged: string[] = [];
  let bytes = 0;
  for (const entry of entries) {
    const section = handbookSection(entry.id);
    if (!section) return null;
    const current = await readSectionFile(section.file);
    if (current !== null && sameText(current, entry.content)) {
      unchanged.push(entry.id);
      continue;
    }
    await writeFile(absolute(section.file), entry.content, "utf8");
    files.push(section.file);
    changed.push(entry.id);
    bytes += Buffer.byteLength(entry.content, "utf8");
  }

  // Nothing moved, so the assembled module cannot have moved either.
  if (changed.length === 0) return { files, bytes, changed, unchanged };

  await writeFile(
    absolute(HANDBOOK_CONTENT_MODULE),
    await renderHandbookContentModule(),
    "utf8",
  );
  return { files, bytes, changed, unchanged };
}

/**
 * Writes a section back to its own file. Refuses on a deployment that cannot
 * write, and hands the text back so the member can still apply it - the one
 * thing this must never do is keep the change only in the browser or a database.
 */
export async function writeHandbookSection(
  id: string,
  content: string,
): Promise<HandbookWriteResult | null> {
  const section = handbookSection(id);
  if (!section) return null;

  if (!canWriteHandbook()) {
    return {
      ok: false,
      written: false,
      file: section.file,
      reason:
        "This deployment cannot write to its own files, so the change was not saved.",
      content,
    };
  }

  // The assembled module moves with it, or a published section would leave the
  // profile the contract workflow hands out stale until a rebuild.
  const written = await writeHandbookSections([{ id, content }]);
  // A publish of identical text is not a write, and the caller has to say so
  // rather than report a save that never happened.
  if (written && written.changed.length === 0) {
    return {
      ok: true,
      written: true,
      file: section.file,
      bytes: 0,
    };
  }
  if (!written) return null;
  return {
    ok: true,
    written: true,
    file: section.file,
    bytes: written.bytes,
  };
}

/** The file one section lives in, for the editor's line about where it goes. */
export function handbookFilePath(id: string): string | null {
  return handbookSection(id)?.file ?? null;
}

export { HANDBOOK_SECTIONS, handbookFormatOf };
