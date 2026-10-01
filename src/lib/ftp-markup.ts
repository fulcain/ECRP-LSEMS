/**
 * The tags a section is written in - and what a paste's tags have to agree with.
 *
 * A section is BBCode, and phpBB is forgiving of it in a way these files are not:
 * it closes a tag a writer left open, and it closes the tags between a closing
 * tag and the one it matches, so `[b][center]…[/b][/center]` and
 * `[b][center]…[/center][/b]` are the same post to every reader of the forum.
 * The profile published on the forum is therefore often *not* written the way
 * `docs/handbook/**` is, and a paste of it that reached the importer as it stands
 * would come back as a section changed - which is a person sent hunting for an
 * edit nobody made, when all that differs is where phpBB put the brackets.
 *
 * So the tags are put right here, once, in one pure function: a close that does
 * not match the tag before it closes the ones opened inside it first, a close
 * with nothing to close is dropped, and a tag left open is closed where the
 * thing it was opened in closes. That is exactly what phpBB renders, which is
 * what makes it a spelling and not a change - and `npm run handbook:check`
 * holds both halves of that claim: every file in `docs/handbook/**` already is
 * this text, and a paste that differs from a file only by this is the same
 * section, not an edit.
 *
 * It is pure and browser-safe, because the Handbook tab decides what a paste
 * would change as the member types and the route decides it again on the way in.
 * Two answers to one question is how a panel promises an update the write then
 * refuses.
 */

import {
  splitHandbookDocument,
  type HandbookSplitResult,
  type HandbookSplitSection,
} from "@/app/constants/divisions/ftd/handbook";

/**
 * The tags that wrap something, which is every tag a section's balance is about.
 *
 * A tag outside this list is not markup to the app: a blank written like one
 * (`[Callsign]`, `[Lastname]`) is shown as written, and an unknown token is a
 * tag the renderer has not learned - `npm run handbook:check` fails on that
 * rather than a paste in flight guessing at it.
 */
export const HANDBOOK_TAGS: readonly string[] = [
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

/**
 * The tags that stand on their own.
 *
 * `[cb]` is a checkbox and `[hr]` a rule: neither is closed, so neither belongs
 * on the stack. `lsemsfooter` is in here on purpose - it is written as an empty
 * pair (`[lsemsfooter][/lsemsfooter]`) and a repair has no business moving
 * either half of it.
 */
export const HANDBOOK_VOID_TAGS: ReadonlySet<string> = new Set([
  "hr",
  "cb",
  "cbc",
  "*",
  "lsemsfooter",
]);

/** One bracket token a section carries, and whether it opens or closes. */
export type HandbookTagToken = {
  raw: string;
  name: string;
  closing: boolean;
};

const TAG_TOKEN = /\[(\/?)([a-zA-Z*]+)(?:=[^\]]*)?\]/g;

/** Whether a tag is one this app tracks - the only ones a repair may move. */
function tracked(name: string): boolean {
  return HANDBOOK_TAGS.includes(name) && !HANDBOOK_VOID_TAGS.has(name);
}

/**
 * Every tag token in a section, in the order it is written.
 *
 * Only the names the section is written in: a `[Callsign]` is a blank and a
 * `[Pending Certification] Fname Lname` of teaching text is neither, so neither
 * is reported as a tag.
 */
export function handbookTagTokens(text: string): HandbookTagToken[] {
  return placedTags(text).map(({ raw, name, closing }) => ({ raw, name, closing }));
}

/** The same tokens, with where each one sits - a repair moves them about. */
function placedTags(
  text: string,
): (HandbookTagToken & { index: number })[] {
  const tokens: (HandbookTagToken & { index: number })[] = [];
  TAG_TOKEN.lastIndex = 0;
  for (let match = TAG_TOKEN.exec(text); match; match = TAG_TOKEN.exec(text)) {
    const name = match[2].toLowerCase();
    if (!tracked(name)) continue;
    tokens.push({
      raw: match[0],
      name,
      closing: match[1] === "/",
      index: match.index,
    });
  }
  return tokens;
}

export type HandbookTagRepair = {
  text: string;
  /** How many closes were moved, added or dropped. Zero means it was already right. */
  repaired: number;
};

/** One line for a notice or a terminal: what a paste's own tags had to be put right for. */
export function describeTagRepair(count: number): string {
  return `${count} tag close${count === 1 ? "" : "s"} put in the order the forum renders them`;
}

/**
 * A section's text with its tags put in the order phpBB would have rendered.
 *
 * Nothing outside a bracket moves, so the writing - spacing, blank lines,
 * spelling - is left exactly as it was: this is the same document, spelled the
 * way the handbook spells it.
 */
export function canonicalHandbookTags(text: string): HandbookTagRepair {
  const tokens = placedTags(text);
  const stack: string[] = [];
  const pieces: string[] = [];
  let cursor = 0;
  let repaired = 0;
  let consumed = -1;

  for (let index = 0; index < tokens.length; index += 1) {
    if (index === consumed) continue;
    const token = tokens[index];
    if (!token.closing) {
      stack.push(token.name);
      continue;
    }

    const at = stack.lastIndexOf(token.name);
    if (at === -1) {
      // A close with nothing open to close: phpBB renders it as noise, so it is.
      pieces.push(text.slice(cursor, token.index));
      cursor = token.index + token.raw.length;
      repaired += 1;
      continue;
    }
    if (at === stack.length - 1) {
      stack.pop();
      continue;
    }

    const top = stack[stack.length - 1];
    const next = tokens[index + 1];
    // The pair written the other way round - `[/list][/spoiler]` where the list
    // was opened inside the spoiler - is the commonest way this arrives: both
    // brackets are there and both names are right, only the order is phpBB's.
    // Reading them in the order it renders them puts both back where they go.
    if (next && next.closing && next.name === top) {
      pieces.push(text.slice(cursor, token.index));
      pieces.push(`[/${top}]`);
      pieces.push(token.raw);
      pieces.push(text.slice(token.index + token.raw.length, next.index));
      stack.length = at;
      cursor = next.index + next.raw.length;
      consumed = index + 1;
      repaired += 2;
      continue;
    }

    // Otherwise everything opened inside it closes first, right where it belongs
    // - which is where the closing tag before it was always meant to land.
    pieces.push(text.slice(cursor, token.index));
    for (let depth = stack.length - 1; depth > at; depth -= 1) {
      pieces.push(`[/${stack[depth]}]`);
      repaired += 1;
    }
    // The close lands on its own tag, so that one goes with it.
    stack.length = at;
    cursor = token.index;
  }

  pieces.push(text.slice(cursor));
  // A tag the section never closed is closed where the thing it was opened in
  // closed, which for a tag open to the end of the section is the section's end.
  // The trailing whitespace stays outside it, so the file's own last line is
  // still its last line.
  if (stack.length > 0) {
    const tail = pieces.pop() ?? "";
    const trimmed = tail.replace(/\s+$/, "");
    pieces.push(trimmed);
    for (let depth = stack.length - 1; depth >= 0; depth -= 1) {
      pieces.push(`[/${stack[depth]}]`);
      repaired += 1;
    }
    pieces.push(tail.slice(trimmed.length));
  }

  return { text: pieces.join(""), repaired };
}

/**
 * Cut a pasted profile into its sections with each section's own tags put right.
 *
 * The repair is per section rather than per document on purpose: a profile nests
 * one section inside another (the regular one keeps its Personnel File Post
 * template inside Certification), so a tag left open in one section would
 * otherwise be closed in the next one's file - the wrong section, by a whole
 * heading.
 */
export function readPastedSections(
  sections: readonly HandbookSplitSection[],
  document: string,
): { split: HandbookSplitResult; repaired: number } {
  const split = splitHandbookDocument(sections, document);
  if (!split.ok) return { split, repaired: 0 };
  let repaired = 0;
  const fixed = split.sections.map((section) => {
    const canonical = canonicalHandbookTags(section.content);
    repaired += canonical.repaired;
    return { id: section.id, content: canonical.text };
  });
  return { split: { ok: true, sections: fixed }, repaired };
}

/** Whether two section texts are the same content, line endings aside. */
export function sameHandbookText(a: string, b: string): boolean {
  return a.replace(/\r\n/g, "\n") === b.replace(/\r\n/g, "\n");
}

/**
 * A section with the whitespace between its own tags taken out.
 *
 * How the tags are laid out - a close on a line of its own, a blank line between
 * two of them - is the files' writing rather than the section's content, and the
 * forum hands back neither: a close glued to the tag before it and the same close
 * on its own line are one post. Only a line break *between* two tags goes, so the
 * writing inside a section is still compared word for word.
 */
function withoutTagGaps(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\]\s*\n\s*(?=\[)/g, "]");
}

/** The words of a section: its text with its own tags taken out of it. */
function wordsOf(text: string): string {
  return withoutTagGaps(text).replace(TAG_TOKEN, (whole, _closing, rawName: string) =>
    tracked(String(rawName).toLowerCase()) ? "" : whole,
  );
}

/** Every tag the section carries, so a moved tag is not a missing one. */
function tagSet(text: string): string {
  return handbookTagTokens(text)
    .map((token) => token.raw)
    .sort()
    .join("");
}

/**
 * One plain line saying where two sections first part company.
 *
 * It quotes each side from the character the two stop agreeing at rather than
 * the whole line: a profile is made of long lines, so the one word that differs
 * sits at the far end of two lines that otherwise look identical - which is
 * exactly the answer "changed" was missing.
 */
function firstDifference(fileText: string, pasteText: string): string {
  const file = fileText.split("\n");
  const paste = pasteText.split("\n");
  for (let index = 0; index < Math.max(file.length, paste.length); index += 1) {
    const at = file[index];
    const it = paste[index];
    if (at === it) continue;
    if (at === undefined) {
      return `the paste adds ${quote((it ?? "").trim(), 0)}`;
    }
    if (it === undefined) {
      return `the paste drops ${quote(at.trim(), 0)}`;
    }
    const mine = at.trim();
    const theirs = it.trim();
    let common = 0;
    while (
      common < mine.length &&
      common < theirs.length &&
      mine[common] === theirs[common]
    ) {
      common += 1;
    }
    return `the file says ${quote(mine, common)} where the paste says ${quote(
      theirs,
      common,
    )}`;
  }
  return "the two differ in ways this cannot name";
}

/** A line, quoted from the character it stops agreeing at - the rest is context. */
function quote(line: string, at: number): string {
  const from = Math.max(0, at - 24);
  const window = line.slice(from, from + 100);
  const ellipsis = from + 100 < line.length ? "…" : "";
  return `\`${from > 0 ? "…" : ""}${window}${ellipsis}\``;
}

export type HandbookSectionMatch = {
  /** Whether the file already says what the paste says. */
  same: boolean;
  /**
   * What it came down to: `identical` word for word, `tags` with the paste's own
   * tags put right, `placed` the same words and tags laid out differently, or
   * `written` - the paste says something this file does not.
   */
  kind: "identical" | "tags" | "placed" | "written";
  /** One plain line saying what was compared - shown instead of a bare "changed". */
  reason: string;
};

/**
 * What a pasted section has to say for itself, against the file it would replace.
 *
 * Three things count as the file already saying it: the same text; the same text
 * with the paste's own tags put in order (which is how the forum leaves them);
 * and the same words and the same tags with the tags placed differently. Every
 * one of them is the same post on the forum, so writing any of them over the file
 * would be an update that changes nothing - and an update that moved a file for
 * nobody is a commit nobody can read.
 *
 * What is left is a difference in the writing, and that is the answer worth
 * giving: the section, and the first line where the two disagree.
 */
export function compareHandbookSection(
  fileText: string,
  pasteText: string,
): HandbookSectionMatch {
  const file = withoutTagGaps(fileText);
  const paste = withoutTagGaps(pasteText);
  if (file === paste) {
    return { same: true, kind: "identical", reason: "Identical." };
  }
  const repaired = withoutTagGaps(canonicalHandbookTags(pasteText).text);
  if (file === repaired) {
    return {
      same: true,
      kind: "tags",
      reason:
        "The tags it left crossed or open are put right, and that is what this file already says.",
    };
  }
  // The same words carrying the same tags, with the tags sitting somewhere else:
  // the italics a writer wrapped a whole oath in, put on its first line by phpBB.
  // Both versions say the same thing to a reader, and the file's own layout is
  // the one that stays.
  if (
    wordsOf(file) === wordsOf(repaired) &&
    tagSet(file) === tagSet(repaired)
  ) {
    return {
      same: true,
      kind: "placed",
      reason: "The same words and tags, placed differently - this file stands.",
    };
  }
  return {
    same: false,
    kind: "written",
    reason: firstDifference(file, paste),
  };
}
