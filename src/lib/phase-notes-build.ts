/**
 * A phase's Guide, built from its FTP section rather than kept beside it.
 *
 * A Guide is the trainer-facing read of a profile section - the same steps, the
 * same warnings, the same commands - drawn in the paperwork page's own idiom: the
 * maroon section headers, the chevron and numbered lists, the OOC pills and the
 * click-to-copy command chips. Writing it a second time by hand is what let it
 * drift, and the drift is not hypothetical: `docs/ftp/regular/phase-1.txt`
 * has said for a while that our panics and backups *do* show in PD/SD dispatch
 * while the hand-written Phase 1 still said they do not.
 *
 * So this module is the conversion, in the two directions the app needs:
 *
 *   - `renderPhaseGuide` turns a section's BBCode into the `.tsx` a phase renders
 *     - `npm run notes:build` writes it.
 *   - `guideCoverage` reads a Guide back and says which of the section's steps it
 *     is missing - `npm run notes:check` fails when one has fallen behind.
 *
 * What it deliberately does *not* carry across is the profile's own paperwork: a
 * `[code]` block and the `[spoiler=Paperwork]` beside it are what an FTO posts to
 * the forum, not what a trainer reads, and rendering them into a Guide was tried
 * and undone once already.
 *
 * Pure: text in, source text out. No file reads, no store, no network.
 */

/* ---- the shape of a section, as far as a Guide cares ---- */

export type NoteRun =
  | { kind: "text"; text: string }
  | { kind: "bold"; runs: NoteRun[] }
  | { kind: "italic"; runs: NoteRun[] }
  | { kind: "underline"; runs: NoteRun[] }
  | { kind: "red"; runs: NoteRun[] }
  | { kind: "ooc"; runs: NoteRun[] }
  | { kind: "command"; text: string }
  | { kind: "link"; href: string; runs: NoteRun[] };

/** One `[*]` of a list: the text that leads it, and whatever it contains. */
export type NoteItem = { lead: NoteRun[]; blocks: NoteBlock[] };

export type NoteBlock =
  | { kind: "paragraph"; runs: NoteRun[] }
  | { kind: "heading"; runs: NoteRun[] }
  | { kind: "center"; runs: NoteRun[] }
  | {
      kind: "list";
      ordered: boolean;
      /** What labels the list - the sentence before its first `[*]`. */
      label: NoteRun[] | null;
      /**
       * Whatever block content sits before its first `[*]`.
       *
       * A category is written `[list]Ask the EMR how they'd treat the following
       * injuries:` and then the list itself, so the words that lead it and the
       * list under them are both part of the category - and reading only the
       * label threw the list away, which is a trainer's Guide quietly missing
       * five examples the profile gives.
       */
      before: NoteBlock[];
      items: NoteItem[];
    }
  | { kind: "spoiler"; title: string | null; blocks: NoteBlock[] }
  | { kind: "image"; src: string }
  | { kind: "spacer" };

/* ---- BBCode -> blocks ---- */

type Token =
  | { t: "text"; text: string }
  | { t: "item" }
  | { t: "open"; tag: string; value?: string }
  | { t: "close"; tag: string };

/** Blocks whose contents are the profile's own paperwork, not the trainer's. */
const SKIPPED_TAGS = new Set(["code", "lsemsfooter"]);
const SKIPPED_SPOILERS = [/paperwork/i, /personnel file post/i, /template/i];

/**
 * The tags a section is actually written in.
 *
 * Anything else stays as it was written - the profile teaches in blanks, and
 * `[Callsign]`, `[Lastname]` and `[call]` are what a trainer fills in, not markup.
 * They are declared in `app/constants/profile-placeholders.ts`, and treating one
 * as a tag is what swallows the rest of a section: `[call]` has no `[/call]`, so
 * a reader looking for one reads to the end of the file.
 */
const KNOWN_TAGS = new Set([
  "b",
  "i",
  "u",
  "ooc",
  "c",
  "url",
  "color",
  "size",
  "center",
  "lsemssubtitle",
  "lsemsfooter",
  "divbox",
  "img",
  "list",
  "spoiler",
  "spoil",
  "code",
  "table",
  "hr",
  "cb",
]);

const TAG = /^\[(\/?)([a-zA-Z*][a-zA-Z0-9*]*)(=[^\]]*)?\]/;

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  let text = "";
  const flush = () => {
    if (text.length > 0) {
      tokens.push({ t: "text", text });
      text = "";
    }
  };
  while (index < source.length) {
    // The profile writes an out-of-character aside two ways: the app's own
    // `[ooc]` tag, and the forum's `(( … ))`.
    if (source.startsWith("((", index)) {
      flush();
      tokens.push({ t: "open", tag: "ooc" });
      index += 2;
      continue;
    }
    if (source.startsWith("))", index)) {
      flush();
      tokens.push({ t: "close", tag: "ooc" });
      index += 2;
      continue;
    }
    if (source[index] === "[") {
      const match = TAG.exec(source.slice(index));
      if (match) {
        flush();
        const [, slash, rawTag, rawValue] = match;
        const tag = rawTag.toLowerCase();
        const value = rawValue ? rawValue.slice(1) : undefined;
        if (tag === "*") {
          tokens.push(slash ? { t: "close", tag: "*" } : { t: "item" });
        } else if (!KNOWN_TAGS.has(tag)) {
          // A blank a trainer fills in, or a tag this app has never been taught:
          // shown as written, which is what the profile means by it.
          text += match[0];
          index += match[0].length;
          continue;
        } else if (slash) {
          tokens.push({ t: "close", tag });
        } else {
          tokens.push({ t: "open", tag, value });
        }
        index += match[0].length;
        continue;
      }
    }
    text += source[index];
    index += 1;
  }
  flush();
  return tokens;
}

const SPACE = /\s+/g;

/**
 * The profile is not always nested the way it reads, and one case is worth
 * fixing before anything else looks at it: a warning line is written
 * `[b][center]…[/b][/center]` in two of the phases, closing `[b]` before the
 * `[center]` that contains it. Left alone, the centred line is read as emphasis
 * and the Guide loses the callout it should be.
 */
const LIST_OPEN = /\[list(?:=[^\]]*)?\]/g;
const LIST_CLOSE = /\[\/list\]/g;

/** A `[*]` that names a category rather than a step of one. */
const CATEGORY_START = /^\[\*\]\s*\[color=#800000\]\[b\]/i;

/**
 * A phase is one list of named categories, so a category that starts inside the
 * one before it is a `[list]` somebody left open - phpBB closes it for the member
 * and the forum draws the category nested, which is not what the phase means.
 * The close is put back where it belongs before the nesting is read: `listImbalance`
 * still reports it, so the section can be fixed, but a Guide is not held hostage
 * to a missing bracket in the profile.
 */
function repairCategoryNesting(source: string): string {
  if (source.split(/\r?\n/).every((line) => !CATEGORY_START.test(line.trim()))) {
    return source;
  }
  const out: string[] = [];
  let depth = 0;
  let baseline: number | null = null;
  for (const line of source.split(/\r?\n/)) {
    if (CATEGORY_START.test(line.trim())) {
      if (baseline === null) baseline = depth;
      else {
        while (depth > baseline) {
          out.push("[/list]");
          depth -= 1;
        }
      }
    }
    out.push(line);
    depth += (line.match(LIST_OPEN) ?? []).length;
    depth -= (line.match(LIST_CLOSE) ?? []).length;
  }
  return out.join("\n");
}

function normalizeSection(source: string): string {
  const swapped = source.replace(
    /\[b\](\s*)\[center\]([\s\S]*?)\[\/b\]\s*\[\/center\]/g,
    (_match, gap: string, body: string) =>
      `[center]${gap}[b]${body}[/b][/center]`,
  );
  return repairCategoryNesting(swapped);
}

/** The emphasis markers the forum does not render, so a Guide does not either. */
function cleanText(text: string): string {
  return text.replace(/\*\*/g, "").replace(SPACE, " ");
}

/** One run of nodes: what leads it, and whatever block content sits inside. */
function readFlow(
  tokens: Token[],
  state: { index: number },
  stop: (token: Token) => boolean,
): { lead: NoteRun[]; blocks: NoteBlock[] } {
  let lead: NoteRun[] = [];
  let pending: NoteRun[] = [];
  const blocks: NoteBlock[] = [];
  let hasBlock = false;

  const flush = () => {
    const cleaned = trimRuns(pending);
    pending = [];
    if (cleaned.length === 0) return;
    if (hasBlock) blocks.push({ kind: "paragraph", runs: cleaned });
    else lead = cleaned;
  };
  const push = (block: NoteBlock) => {
    flush();
    hasBlock = true;
    blocks.push(block);
  };

  while (state.index < tokens.length) {
    const token = tokens[state.index];
    if (stop(token)) break;
    state.index += 1;

    if (token.t === "text") {
      pending.push({ kind: "text", text: cleanText(token.text) });
      continue;
    }
    if (token.t === "item") {
      // An `[*]` outside a list (a `[divbox]` heading marker, say) is a break.
      flush();
      continue;
    }
    if (token.t === "close") continue; // stray close: nothing to attach it to

    const { tag, value } = token;
    if (SKIPPED_TAGS.has(tag)) {
      skipUntilClose(tokens, state, tag);
      continue;
    }
    if (tag === "list") {
      push(readList(tokens, state, value === "1"));
      continue;
    }
    if (tag === "spoiler" || tag === "spoil") {
      const title = value ?? null;
      const inner = readFlow(
        tokens,
        state,
        (candidate) => candidate.t === "close" && candidate.tag === tag,
      );
      skipUntilClose(tokens, state, tag);
      if (title && SKIPPED_SPOILERS.some((pattern) => pattern.test(title))) continue;
      const lead =
        inner.lead.length > 0
          ? [{ kind: "paragraph" as const, runs: inner.lead }]
          : [];
      push({ kind: "spoiler", title, blocks: [...lead, ...inner.blocks] });
      continue;
    }
    if (tag === "img") {
      // An image is a picture, not a step a Guide has to say - the oath's
      // banner and sign-off are decoration either way.
      skipUntilClose(tokens, state, "img");
      continue;
    }
    if (tag === "lsemssubtitle") {
      push({ kind: "heading", runs: readInline(tokens, state, tag, [tag]) });
      continue;
    }
    if (tag === "center") {
      push({ kind: "center", runs: readInline(tokens, state, tag, [tag]) });
      continue;
    }
    if (tag === "color" && (value ?? "").toLowerCase() === "transparent") {
      readUntilClose(tokens, state, "color");
      push({ kind: "spacer" });
      continue;
    }
    if (tag === "hr") {
      push({ kind: "spacer" });
      continue;
    }
    if (tag === "cb") {
      // The profile's checkbox: a mark on a form, not a word a trainer reads.
      // Written without a close, so it has to be dropped on sight.
      continue;
    }
    // A wrapper the Guide has no use for: its contents belong to this level.
    if (tag === "divbox" || tag === "size" || tag === "table") {
      continue;
    }
    pending.push(...inlineFrom(tokens, state, tag, value, []));
  }
  flush();
  return { lead, blocks };
}

function readList(
  tokens: Token[],
  state: { index: number },
  ordered: boolean,
): NoteBlock {
  const items: NoteItem[] = [];
  let label: NoteRun[] | null = null;
  // Whatever sits before the first `[*]` labels the list ("Explain call
  // priority:") rather than being a step of it.
  const first = readFlow(
    tokens,
    state,
    (token) =>
      token.t === "item" || (token.t === "close" && token.tag === "list"),
  );
  label = first.lead.length > 0 ? first.lead : null;
  const before = first.blocks;
  while (state.index < tokens.length) {
    const token = tokens[state.index];
    if (token.t === "close" && token.tag === "list") {
      state.index += 1;
      break;
    }
    if (token.t === "item") {
      state.index += 1;
      const item = readFlow(
        tokens,
        state,
        (candidate) =>
          candidate.t === "item" ||
          (candidate.t === "close" && candidate.tag === "list"),
      );
      items.push({ lead: item.lead, blocks: item.blocks });
      continue;
    }
    state.index += 1; // a stray close; nothing to attach it to
  }
  return { kind: "list", ordered, label, before, items };
}

/**
 * A tag's contents as runs, consumed up to and including its close.
 *
 * The profile is not always nested the way it reads: a heading is written
 * `[b][center]…[/b][/center]`, which closes `[b]` before the `[center]` around
 * it. So a close belongs to the innermost tag still open that names it, and a
 * close naming a tag further out ends this one rather than being swallowed -
 * otherwise the first overlapping pair eats the rest of the section.
 */
function readInline(
  tokens: Token[],
  state: { index: number },
  closing: string,
  open: readonly string[],
): NoteRun[] {
  const runs: NoteRun[] = [];
  while (state.index < tokens.length) {
    const token = tokens[state.index];
    if (token.t === "close") {
      if (token.tag === closing) {
        state.index += 1;
        break;
      }
      if (open.includes(token.tag)) break;
      state.index += 1;
      continue;
    }
    state.index += 1;
    if (token.t === "text") {
      runs.push({ kind: "text", text: cleanText(token.text) });
      continue;
    }
    if (token.t === "item") continue;
    runs.push(...inlineFrom(tokens, state, token.tag, token.value, open));
  }
  return trimRuns(runs);
}

function inlineFrom(
  tokens: Token[],
  state: { index: number },
  tag: string,
  value: string | undefined,
  open: readonly string[],
): NoteRun[] {
  const inner = readInline(tokens, state, tag, [...open, tag]);
  switch (tag) {
    case "img":
      // An image inside a run of text is a picture, not words a Guide says -
      // the oath's banner and sign-off are decoration either way.
      return [];
    case "b":
      return [{ kind: "bold", runs: inner }];
    case "i":
      return [{ kind: "italic", runs: inner }];
    case "u":
      return [{ kind: "underline", runs: inner }];
    case "ooc":
      return [{ kind: "ooc", runs: inner }];
    case "c":
      return [{ kind: "command", text: runsToText(inner) }];
    case "url":
      return [{ kind: "link", href: value ?? "", runs: inner }];
    case "color": {
      const hex = (value ?? "").replace("#", "").toLowerCase();
      // The profile marks what a trainer reads out loud in red.
      return hex === "bf0000" ? [{ kind: "red", runs: inner }] : inner;
    }
    default:
      return inner;
  }
}

function skipUntilClose(
  tokens: Token[],
  state: { index: number },
  tag: string,
): string {
  return readUntilClose(tokens, state, tag);
}

/** Consumes tokens up to and including the close of `tag`, as plain text. */
function readUntilClose(
  tokens: Token[],
  state: { index: number },
  tag: string,
): string {
  let depth = 1;
  let text = "";
  while (state.index < tokens.length) {
    const token = tokens[state.index];
    state.index += 1;
    if (token.t === "open" && token.tag === tag) depth += 1;
    else if (token.t === "close" && token.tag === tag) {
      depth -= 1;
      if (depth === 0) break;
    } else if (token.t === "text") text += token.text;
  }
  return text;
}

/* ---- runs ---- */

/** Drops empty runs and trims the whitespace at either end of the sequence. */
function trimRuns(runs: NoteRun[]): NoteRun[] {
  const kept: NoteRun[] = [];
  for (const run of runs) {
    // A wrapper around nothing - `[b][ooc][/ooc][/b]` - is nothing: keeping it
    // would draw an empty pill inside an empty hold, which is both pointless and
    // a component with no children.
    if (run.kind !== "text" && runsToText([run]).length === 0) continue;
    if (run.kind === "text" && run.text.length === 0) continue;
    const previous = kept[kept.length - 1];
    if (previous && previous.kind === "text" && run.kind === "text") {
      previous.text += run.text;
      continue;
    }
    kept.push(run);
  }
  if (kept.length > 0 && kept[0].kind === "text") {
    kept[0] = { kind: "text", text: kept[0].text.replace(/^\s+/, "") };
  }
  const last = kept[kept.length - 1];
  if (last && last.kind === "text") {
    kept[kept.length - 1] = {
      kind: "text",
      text: last.text.replace(/\s+$/, ""),
    };
  }
  return kept.filter((run) => run.kind !== "text" || run.text.length > 0);
}

/** What a run sequence says, however it is drawn. */
export function runsToText(runs: readonly NoteRun[]): string {
  return runs
    .map((run) => {
      switch (run.kind) {
        case "text":
          return run.text;
        case "command":
          return run.text;
        case "link":
          return runsToText(run.runs);
        default:
          return runsToText(run.runs);
      }
    })
    .join("");
}

/** The plain text of every run in a block, in the order a reader meets it. */
function blocksToText(blocks: readonly NoteBlock[]): string[] {
  const out: string[] = [];
  const walkItems = (items: readonly NoteItem[]) => {
    for (const item of items) {
      const text = collapse(runsToText(item.lead));
      if (text.length > 0) out.push(text);
      walk(item.blocks);
    }
  };
  const walk = (entries: readonly NoteBlock[]) => {
    for (const block of entries) {
      switch (block.kind) {
        case "paragraph":
        case "heading":
        case "center": {
          const text = collapse(runsToText(block.runs));
          if (text.length > 0) out.push(text);
          break;
        }
        case "list":
          if (block.label) {
            const text = collapse(runsToText(block.label));
            if (text.length > 0) out.push(text);
          }
          walk(block.before);
          walkItems(block.items);
          break;
        case "spoiler":
          walk(block.blocks);
          break;
        // An image is a picture, not a step a Guide has to say - the oath's
        // banner and sign-off are decoration either way.
        case "image":
        default:
          break;
      }
    }
  };
  walk(blocks);
  return out;
}

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function parseFtpSection(source: string): NoteBlock[] {
  const tokens = tokenize(normalizeSection(source));
  return readFlow(tokens, { index: 0 }, () => false).blocks;
}

/**
 * The lists a section opens and never closes, and the closes with nothing open.
 *
 * phpBB closes a stray list for the member, so a section can be unbalanced and
 * still read correctly on the forum - but a Guide is drawn from the nesting, and
 * one missing `[/list]` moves a whole category inside the one before it. So the
 * imbalance is named, with the line, rather than drawn into the wrong shape.
 */
export type ListImbalance = {
  opens: number;
  closes: number;
  /** The line each `[list]` still open at the end of the section starts on. */
  unclosed: number[];
  /** The line each `[/list]` with nothing open before it sits on. */
  stray: number[];
  /**
   * The lines where a category starts deeper than the one before it - which is
   * where a missing `[/list]` shows, and so where a member has to look.
   */
  suspects: number[];
};

export function listImbalance(source: string): ListImbalance | null {
  const open: number[] = [];
  const stray: number[] = [];
  const suspects: number[] = [];
  let opens = 0;
  let closes = 0;
  let depth = 0;
  // Every category of a phase starts at the same depth, so one that starts
  // deeper is a category that landed inside the one before it.
  let categoryDepth: number | null = null;

  source.split(/\r?\n/).forEach((line, index) => {
    const lineNumber = index + 1;
    const at = depth;
    if (CATEGORY_START.test(line.trim())) {
      if (categoryDepth === null) categoryDepth = at;
      else if (at > categoryDepth) suspects.push(lineNumber);
    }
    for (const match of line.matchAll(/\[(\/?)list(?:=[^\]]*)?\]/g)) {
      if (match[1]) {
        closes += 1;
        depth -= 1;
        if (open.length > 0) open.pop();
        else stray.push(lineNumber);
      } else {
        opens += 1;
        depth += 1;
        open.push(lineNumber);
      }
    }
  });

  if (opens === closes && stray.length === 0) return null;
  return { opens, closes, unclosed: open, stray, suspects };
}

/** Every step a section says, as plain text - what a Guide has to carry. */
export function ftpSteps(source: string): string[] {
  return blocksToText(parseFtpSection(source)).filter(
    (step) => step.length >= 12,
  );
}

/* ---- blocks -> the Guide component ---- */

const PRIMITIVES =
  "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/primitives";

/**
 * The oath is said a line at a time, so it is carried a line at a time: split at
 * the sentence ends, then wrap any sentence that runs past ~100 characters at a
 * natural pause, so every line is one breath of the covenant.
 */
function splitOathLines(text: string): string[] {
  const sentences = text.match(/[^.?!]+[.?!]*\s*/g) ?? [text];
  const lines: string[] = [];
  for (const sentence of sentences.map((s) => s.trim()).filter(Boolean)) {
    if (sentence.length <= 100) {
      lines.push(sentence);
      continue;
    }
    let current = "";
    for (const word of sentence.split(" ")) {
      if (current && `${current} ${word}`.length > 100) {
        lines.push(current);
        current = word;
      } else {
        current = current ? `${current} ${word}` : word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function jsxText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

function attribute(value: string): string {
  return JSON.stringify(value);
}

type Emit = { used: Set<string> };

/** The JSX for a run sequence, on one line so its spaces survive. */
function emitRuns(runs: readonly NoteRun[], emit: Emit): string {
  return runs
    .map((run) => {
      switch (run.kind) {
        case "text":
          return jsxText(run.text);
        case "bold":
          emit.used.add("Bold");
          return `<Bold>${emitRuns(run.runs, emit)}</Bold>`;
        case "italic":
          emit.used.add("Em");
          return `<Em>${emitRuns(run.runs, emit)}</Em>`;
        case "underline":
          emit.used.add("Underline");
          return `<Underline>${emitRuns(run.runs, emit)}</Underline>`;
        case "red":
          emit.used.add("Tinted");
          return `<Tinted tone="red">${emitRuns(run.runs, emit)}</Tinted>`;
        case "ooc":
          emit.used.add("OOC");
          return `<OOC>${emitRuns(run.runs, emit)}</OOC>`;
        case "command":
          emit.used.add("Command");
          return `<Command>${jsxText(run.text)}</Command>`;
        case "link":
          emit.used.add("BbLink");
          return `<BbLink href=${attribute(run.href)}>${emitRuns(
            run.runs,
            emit,
          )}</BbLink>`;
      }
    })
    .join("");
}

/** Whether a run sequence is nothing but an aside a trainer reads to themselves. */
function isAside(runs: readonly NoteRun[]): boolean {
  const only = runs.filter(
    (run) => run.kind !== "text" || run.text.trim().length > 0,
  );
  return (
    only.length === 1 && only[0].kind === "ooc" && runs.length === only.length
  );
}

/**
 * A phase is written as one numbered list of named categories, each holding its
 * own steps: a `[list=1]` whose every `[*]` is a maroon name and then a `[list]`.
 * Read that way it is a `Category` per name; read as plain nesting it is a
 * numbered list of one-item sub-lists, which is not what a trainer is looking at.
 */
type CategoryGroup = {
  lead: NoteRun[];
  before: NoteBlock[];
  list: Extract<NoteBlock, { kind: "list" }>;
  after: NoteBlock[];
};

function categoryGroups(
  block: Extract<NoteBlock, { kind: "list" }>,
): CategoryGroup[] | null {
  if (!block.ordered || block.items.length < 2) return null;
  const groups: CategoryGroup[] = [];
  for (const item of block.items) {
    const at = item.blocks.findIndex((entry) => entry.kind === "list");
    if (at === -1) return null;
    if (collapse(runsToText(item.lead)).length === 0) return null;
    groups.push({
      lead: item.lead,
      before: item.blocks.slice(0, at),
      list: item.blocks[at] as Extract<NoteBlock, { kind: "list" }>,
      after: item.blocks.slice(at + 1),
    });
  }
  return groups;
}

function emitList(
  block: Extract<NoteBlock, { kind: "list" }>,
  emit: Emit,
  indent: string,
): string[] {
  // A list of no items still says something: its label and whatever it
  // introduces ("Helpful Questions" and the questions it carries) - dropping
  // them here is dropping a step the section says.
  if (block.items.length === 0) return emitLeadIn(block, emit, indent);
  const groups = categoryGroups(block);
  if (groups) {
    emit.used.add("Category");
    const lines: string[] = [];
    // A category written before the first `[*]` of the list that names the
    // others - reinstatement's Certification does - is the outer list's own
    // lead, and it is a category like any other.
    lines.push(...emitLeadIn(block, emit, indent));
    for (const group of groups) {
      for (const entry of group.before) {
        lines.push(...emitBlock(entry, emit, indent));
      }
      const title = collapse(runsToText(group.lead)).replace(/:\s*$/, "");
      lines.push(`${indent}<Category title=${attribute(title)} ordered>`);
      // What the category says before its own steps: the sentence that leads
      // them, and any list it introduces. Both are the trainer's to read, so
      // both go inside the category they belong to.
      lines.push(...emitLeadIn(group.list, emit, `${indent}  `));
      for (const step of group.list.items) {
        lines.push(...emitItem(step, emit, `${indent}  `));
      }
      lines.push(`${indent}</Category>`);
      for (const entry of group.after) {
        lines.push(...emitBlock(entry, emit, indent));
      }
    }
    return lines;
  }

  const wrapper = block.ordered ? "NumberedList" : "BulletList";
  emit.used.add(wrapper);
  const lines: string[] = [];
  if (block.label && runsToText(block.label).trim().length > 0) {
    emit.used.add("SubHeading");
    lines.push(`${indent}<SubHeading>${emitRuns(block.label, emit)}</SubHeading>`);
  }
  for (const entry of block.before) {
    lines.push(...emitBlock(entry, emit, indent));
  }
  lines.push(`${indent}<${wrapper}>`);
  for (const item of block.items) {
    lines.push(...emitItem(item, emit, `${indent}  `));
  }
  lines.push(`${indent}</${wrapper}>`);
  return lines;
}

/**
 * What a list says before its first `[*]`: the sentence that leads it as prose,
 * and the blocks it introduces, in the order a reader meets them.
 */
function emitLeadIn(
  block: Extract<NoteBlock, { kind: "list" }>,
  emit: Emit,
  indent: string,
): string[] {
  const lines: string[] = [];
  const label = block.label ? runsToText(block.label).trim() : "";
  if (label.length > 0) {
    lines.push(...emitBlock({ kind: "paragraph", runs: block.label ?? [] }, emit, indent));
  }
  for (const entry of block.before) {
    lines.push(...emitBlock(entry, emit, indent));
  }
  return lines;
}

function emitItem(item: NoteItem, emit: Emit, indent: string): string[] {
  const lines: string[] = [];
  const lead = item.lead.length > 0 ? emitRuns(item.lead, emit) : "";
  if (lead.length === 0 && item.blocks.length === 0) return [];
  if (item.blocks.length === 0) {
    emit.used.add("Item");
    lines.push(`${indent}<Item>${lead}</Item>`);
    return lines;
  }
  emit.used.add("Item");
  lines.push(`${indent}<Item>`);
  if (lead.length > 0) lines.push(`${indent}  ${lead}`);
  for (const block of item.blocks) {
    lines.push(...emitBlock(block, emit, `${indent}  `));
  }
  lines.push(`${indent}</Item>`);
  return lines;
}

function emitBlock(block: NoteBlock, emit: Emit, indent: string): string[] {
  switch (block.kind) {
    case "paragraph":
      if (block.runs.length === 0) return [];
      if (isAside(block.runs)) {
        emit.used.add("OOC");
        return [
          `${indent}<div className="mt-1">`,
          `${indent}  ${emitRuns(block.runs, emit)}`,
          `${indent}</div>`,
        ];
      }
      emit.used.add("ParaItem");
      emit.used.add("ParagraphList");
      return [
        `${indent}<ParagraphList>`,
        `${indent}  <ParaItem>${emitRuns(block.runs, emit)}</ParaItem>`,
        `${indent}</ParagraphList>`,
      ];
    case "heading":
      if (block.runs.length === 0) return [];
      emit.used.add("SubHeading");
      return [
        `${indent}<SubHeading>${emitRuns(block.runs, emit)}</SubHeading>`,
      ];
    case "center":
      if (block.runs.length === 0) return [];
      emit.used.add("WarningCallout");
      return [
        `${indent}<WarningCallout>`,
        `${indent}  ${emitRuns(block.runs, emit)}`,
        `${indent}</WarningCallout>`,
      ];
    case "list":
      return emitList(block, emit, indent);
    case "spoiler": {
      const body: string[] = [];
      // The Hippocratic Oath is handed over line by line: each line copies on
      // its own so the trainer can read it out one sentence at a time. The
      // reinstatement profile nests the oath's sentences inside a second
      // spoiler, so the split descends into it rather than reading one block.
      const isOath = block.title?.toLowerCase().includes("hippocratic") ?? false;
      const oathLines = (blocks: typeof block.blocks): void => {
        for (const inner of blocks) {
          if (inner.kind === "spoiler") {
            oathLines(inner.blocks);
            continue;
          }
          if (inner.kind !== "paragraph" && inner.kind !== "center") continue;
          emit.used.add("OathLine");
          for (const line of splitOathLines(runsToText(inner.runs))) {
            body.push(`${indent}  <OathLine>${jsxText(line)}</OathLine>`);
          }
        }
      };
      if (isOath) {
        oathLines(block.blocks);
      } else {
        for (const inner of block.blocks) {
          body.push(...emitBlock(inner, emit, `${indent}  `));
        }
      }
      // A collapse with nothing in it is not a collapse a trainer can use.
      if (body.length === 0) return [];
      emit.used.add("Spoiler");
      const title = block.title ? ` title=${attribute(block.title)}` : "";
      return [`${indent}<Spoiler${title}>`, ...body, `${indent}</Spoiler>`];
    }
    case "image":
      emit.used.add("Figure");
      return [`${indent}<Figure src=${attribute(block.src)} />`];
    case "spacer":
      emit.used.add("Divider");
      return [`${indent}<Divider />`];
  }
}

const PRIMITIVE_ORDER = [
  "Bold",
  "BulletList",
  "Category",
  "Command",
  "Divider",
  "Em",
  "EyebrowLabel",
  "OathLine",
  "Figure",
  "Item",
  "NumberedList",
  "OOC",
  "ParagraphList",
  "ParaItem",
  "Spoiler",
  "SubHeading",
  "Tinted",
  "Underline",
  "BbLink",
  "WarningCallout",
];

/**
 * The Guide component for a section: the same steps, in the paperwork page's own
 * components, so a trainer reads the profile the members actually update.
 */
export function renderPhaseGuide(input: {
  /** The section's own id, so the file says where it came from. */
  sectionId: string;
  /** The section's file, for the comment at the top. */
  file: string;
  /** The component the registry imports. */
  component: string;
  /** The section's BBCode, exactly as the FTP holds it. */
  ftp: string;
}): string {
  const parsed = parseFtpSection(input.ftp);
  // Every section wraps its own body in one `[spoiler=Phase …]` - that is the
  // section, not a collapse inside it, so the Guide draws what is in it.
  const blocks =
    parsed.length === 1 && parsed[0].kind === "spoiler"
      ? parsed[0].blocks
      : parsed;
  const emit: Emit = { used: new Set() };

  // The section's own subtitle is the phase: what it is, and how long it runs.
  const first = blocks[0];
  const eyebrow =
    first && first.kind === "heading" ? collapse(runsToText(first.runs)) : "";
  const rest = eyebrow.length > 0 ? blocks.slice(1) : blocks;

  const body: string[] = [];
  for (const block of rest) {
    body.push(...emitBlock(block, emit, "      "));
  }
  if (eyebrow.length > 0) emit.used.add("EyebrowLabel");

  const imports = PRIMITIVE_ORDER.filter((name) => emit.used.has(name));
  const header = [
    `"use client";`,
    imports.length > 0
      ? `import {\n  ${imports.join(",\n  ")},\n} from ${attribute(PRIMITIVES)};`
      : "",
    eyebrow.length > 0 ? `import { Clock } from "lucide-react";` : "",
    `/**`,
    ` * The ${input.component.replace(/Notes$/, "")} guide, built from \`${input.file}\`.`,
    ` *`,
    ` * Generated by \`npm run notes:build\` from that section - edit the FTP,`,
    ` * not this file, and run the command again. \`npm run notes:check\` fails when`,
    ` * this Guide has fallen behind the section it is drawn from.`,
    ` */`,
    `export function ${input.component}() {`,
    `  return (`,
    `    <div className="space-y-2.5">`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  const eyebrowBlock =
    eyebrow.length > 0
      ? [
          `      <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-2.5">`,
          `        <EyebrowLabel icon={Clock}>`,
          `          ${jsxText(eyebrow)}`,
          `        </EyebrowLabel>`,
          `      </div>`,
        ]
      : [];

  const footer = [`    </div>`, `  );`, `}`];

  return [
    header,
    ...eyebrowBlock,
    ...body,
    ...footer,
  ]
    .join("\n")
    .concat("\n");
}

/* ---- a Guide, read back ---- */

/**
 * A component as the lines a reader sees: imports, comments, tags and the
 * `{" "}` spacers between them say nothing a trainer reads, so each line of the
 * file is stripped down to its words and the file becomes a list of them.
 *
 * The words in a component's own attributes stay, because that is where some of
 * them are written: a category heading is `<Category title="Unit Management">`,
 * which a reader sees as plainly as the items under it. Stripping the whole tag
 * read a Guide that draws a heading as one that never says it - which is what
 * made `npm run notes:check` report every category in the FTP as unsaid.
 */
/**
 * The words a tag is drawn from - a category's own heading, and nothing else.
 *
 * A `<Category title="Unit Management">` reads to a trainer exactly as the
 * heading it draws does, so the words are kept where the tag goes; the tag's
 * classes, its ordering flag and its URL attributes are not words anybody reads.
 */
const TEXT_ATTRIBUTES = /\b(?:title|caption|label|alt)="([^"]*)"/g;

function attributesOf(tag: string): string {
  const words: string[] = [];
  TEXT_ATTRIBUTES.lastIndex = 0;
  for (let match = TEXT_ATTRIBUTES.exec(tag); match; match = TEXT_ATTRIBUTES.exec(tag)) {
    words.push(match[1]);
  }
  return words.join(" ");
}

export function guideLines(source: string): string[] {
  const flat = source
    // `://` of a link's address is not a line comment; stripped as one it took
    // the rest of the line with it - the link's own words included.
    .replace(/:\/\//g, "\u0000")
    .replace(/^"use client";?$/gm, " ")
    .replace(/^\s*import[\s\S]*?from\s+"[^"]*";/gm, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ")
    .replace(/className=\{?[^}>]*\}?/g, " ")
    .replace(/\{[^{}]*\}/g, " ")
    .replace(/<[^>]*>/g, (tag) => ` ${attributesOf(tag)} `)
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&(?:rsquo|lsquo|apos);/g, "'")
    .replace(/&(?:ldquo|rdquo|quot);/g, '"')
    .replace(/&(?:#123|lt);/g, "{")
    .replace(/&(?:#125|gt);/g, "}")
    .replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~-]/g, " ")
    .replace(/\u0000/g, "://");
  return flat
    .split("\n")
    .map((line) => collapse(line))
    .filter((line) => line.length > 0);
}

/** Everything a Guide says, as one string, for a reader that wants it whole. */
export function guidePlainText(source: string): string {
  return guideLines(source).join(" ");
}

export type StepState = "same" | "changed" | "missing";

export type StepFinding = {
  /** The step, as the FTP says it. */
  step: string;
  state: StepState;
  /** How much of the step the Guide carries, 0 to 1. */
  covered: number;
  /** The closest line the Guide has, when it has anything like it. */
  closest: string | null;
};

export type GuideCoverage = {
  steps: StepFinding[];
  /** Steps the Guide carries word for word. */
  same: number;
  /** Steps the Guide has, said differently - a rewrite, or a wording that moved. */
  changed: StepFinding[];
  /** Steps the Guide never says at all. */
  missing: StepFinding[];
};

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 0);
}

/**
 * How much of `needle` a stretch of the Guide carries, in the order it is said.
 *
 * Order rather than position, because a Guide is allowed its own sentences: a
 * word inserted or dropped should not cost the whole step, while a step whose
 * words are no longer there at all scores nothing however long the file is.
 */
/** The words of `lines[start..end]` joined, for a step carried a line at a time. */
function spreadHit(lines: readonly string[], start: number, end: number): string {
  return lines.slice(start, end + 1).join(" ");
}

function carries(candidate: string, needle: readonly string[]): number {
  const haystack = words(candidate);
  if (needle.length === 0) return 1;
  if (haystack.length === 0) return 0;
  let hits = 0;
  let at = 0;
  for (const word of needle) {
    const found = haystack.indexOf(word, at);
    if (found === -1) continue;
    hits += 1;
    at = found + 1;
  }
  return hits / needle.length;
}

/**
 * How much of the section a Guide carries.
 *
 * Compared word by word rather than character by character, and against the best
 * matching stretch rather than the file as a whole, because a Guide is allowed to
 * be written differently - "10-4 is affirmative" is the FTP's "10-4 -
 * Affirmative", and a check that demanded the same punctuation would be a check
 * nobody could satisfy. What it will not accept is a step that stopped being
 * said: the profile saying panics do show in PD/SD dispatch while the Guide still
 * says they do not is exactly the drift this is for.
 */
export function guideCoverage(ftp: string, guideSource: string): GuideCoverage {
  const lines = guideLines(guideSource);
  // A step can be written across two lines of a component, so a step is looked
  // for in one line and in each pair of neighbours, and the best one wins.
  const windows: string[] = lines.flatMap((line, index) =>
    index + 1 < lines.length ? [line, `${line} ${lines[index + 1]}`] : [line],
  );

  const steps = ftpSteps(ftp).map((step): StepFinding => {
    const needle = words(step);
    if (needle.length === 0) {
      return { step, state: "same", covered: 1, closest: null };
    }
    let best = 0;
    let closest: string | null = null;
    for (const window of windows) {
      const covered = carries(window, needle);
      if (covered > best) {
        best = covered;
        closest = window;
      }
    }
    // A long step carried a line at a time - the oath is handed over line by
    // line, each with its own copy button - is still the Guide saying it, so
    // the step's words are also looked for spread across a run of neighbours.
    if (best < 0.9 && windows.length >= 4) {
      let hits = 0;
      for (let start = 0; start < lines.length; start += 1) {
        hits = carries(lines[start], needle);
        let spread = hits;
        for (
          let end = start + 1;
          end < lines.length && end - start < 24;
          end += 1
        ) {
          spread = Math.max(spread, carries(`${spreadHit(lines, start, end)}`, needle));
          if (spread >= 0.9) break;
        }
        if (spread > best) {
          best = spread;
          closest = `lines ${start + 1}-${Math.min(start + 24, lines.length)} of the Guide`;
        }
        if (best >= 0.9) break;
      }
    }
    // A step carried whole is the Guide saying it; most of it is a wording that
    // moved, and a word or two is a step that stopped being said.
    const state: StepState =
      best >= 0.9 ? "same" : best >= 0.6 ? "changed" : "missing";
    return {
      step,
      state,
      covered: best,
      closest: state === "same" ? null : closest,
    };
  });

  return {
    steps,
    same: steps.filter((finding) => finding.state === "same").length,
    changed: steps.filter((finding) => finding.state === "changed"),
    missing: steps.filter((finding) => finding.state === "missing"),
  };
}
