/**
 * A pasted profile, converted into the markup the handbook files are written in.
 *
 * The profile is written somewhere else - the forum's own editor, a document, a
 * copy taken off the live post - and what comes back is not always what these
 * files hold. phpBB appends an id of its own to every tag it stores
 * (`[b:1a2b3c4d]` where the forum shows `[b]`), closes a list item with `[/*]`
 * rather than opening the next one with `[*]`, and quotes a spoiler's title;
 * a copy taken off the rendered page instead of the editor arrives as HTML -
 * `<br>`, `&nbsp;`, `<strong>` - with the newlines of another operating system.
 *
 * None of that is content, and none of it is the member's to clean up by hand:
 * an id left on a tag is a tag `npm run handbook:check` reads back out, a quoted
 * heading is a section the split cannot find, and `[/*]` is a list the parser
 * never closes. So a paste is converted once, here, before anything looks at it.
 *
 * What it deliberately leaves alone is the writing: spacing, trailing
 * whitespace, blank lines, spelling, line order. That is what makes the claim
 * `npm run handbook:check` holds this file to - converting a section that is
 * already in this format changes nothing - and it is why a paste of a profile
 * nobody edited writes no file at all.
 *
 * It imports nothing, on purpose: the Handbook tab converts as the member types,
 * in the browser, so this module must be as portable as the markup it reads.
 */

export type HandbookConversionKind =
  /** phpBB's own tag id: `[b:1a2b3c4d]` is `[b]`. */
  | "tag-id"
  /** phpBB's end of a list item, `[/*]`, where this format opens the next. */
  | "item-end"
  /** A copy off the rendered page: `<br>`, `<p>`, `<div>`. */
  | "html-break"
  /** `<strong>`, `<em>`, `<u>` rather than `[b]`, `[i]`, `[u]`. */
  | "html-emphasis"
  /** `<img src="…">` rather than `[img]…[/img]`. */
  | "html-image"
  /** `<a href="…">` rather than `[url=…]`. */
  | "html-link"
  /** `&nbsp;`, `&amp;` and the rest of the escaped text a copy carries. */
  | "entity"
  /** `[spoiler="Phase 1"]`, which the split cannot match. */
  | "heading-quote"
  /** The other operating system's newlines. */
  | "line-ending"
  /**
   * A close that does not line up with the tag before it, or a tag phpBB closed
   * on the writer's behalf, put where the forum renders it. Not this module's
   * own work - `lib/handbook-markup.ts` does it, and the report says it here so
   * the tab and the terminal tell one story.
   */
  | "tag-order";

export type HandbookConversion = {
  kind: HandbookConversionKind;
  count: number;
  /** One plain line saying what was converted - read by the tab and the terminal. */
  note: string;
};

export type HandbookConversionResult = {
  text: string;
  /** Only what actually happened, in the order it happened. */
  conversions: HandbookConversion[];
};

type Rule = {
  kind: HandbookConversionKind;
  pattern: RegExp;
  replace: (whole: string, groups: (string | undefined)[]) => string;
  note: (count: number) => string;
};

function times(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/**
 * The tags a rendered page carries in place of the forum's own - converted in
 * pairs, so a `<b>` in the middle leaves a `[b]` that closes.
 */
const EMPHASIS: Record<string, string> = {
  strong: "b",
  b: "b",
  em: "i",
  i: "i",
  u: "u",
};

const ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#39": "'",
  "#x27": "'",
};

/**
 * The rules, in the order they have to run: the tag ids before the item ends
 * they turn `[/*:m]` into, and the breaks and emphasis before the entities that
 * would otherwise decode a `<` into something no longer one.
 */
const RULES: readonly Rule[] = [
  {
    kind: "line-ending",
    pattern: /\r\n|\r/g,
    replace: () => "\n",
    note: (count) => times(count, "Windows line ending"),
  },
  {
    kind: "html-break",
    pattern: /<br\s*\/?>|<\/?(?:p|div)\b[^>]*>/gi,
    replace: () => "\n",
    note: (count) => `${times(count, "HTML line break")} turned into a newline`,
  },
  {
    kind: "html-image",
    // A rendered page hands over the picture and its src; the forum wants the
    // two wrapped, which is how the sections that carry an image are written.
    pattern: /<img\b[^>]*?src\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))[^>]*>/gi,
    replace: (_whole, groups) => `[img]${groups[0] ?? groups[1] ?? groups[2] ?? ""}[/img]`,
    note: (count) => `${times(count, "HTML image")} turned into [img]…[/img]`,
  },
  {
    kind: "html-link",
    pattern:
      /<a\b[^>]*?href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))[^>]*>([\s\S]*?)<\/a\s*>/gi,
    replace: (_whole, groups) => {
      const href = groups[0] ?? groups[1] ?? groups[2] ?? "";
      const label = (groups[3] ?? "").trim();
      return label && label !== href ? `[url=${href}]${label}[/url]` : `[url]${href}[/url]`;
    },
    note: (count) => `${times(count, "HTML link")} turned into [url]…[/url]`,
  },
  {
    kind: "html-emphasis",
    pattern: /<\/?(strong|b|em|i|u)\s*>/gi,
    replace: (whole, groups) => {
      const tag = EMPHASIS[(groups[0] ?? "").toLowerCase()] ?? "";
      return whole.startsWith("</") ? `[/${tag}]` : `[${tag}]`;
    },
    note: (count) => `${times(count, "HTML emphasis tag")} turned into [b] and [i]`,
  },
  {
    kind: "entity",
    pattern: /&(nbsp|amp|lt|gt|quot|apos|#39|#x27);/gi,
    replace: (_whole, groups) => ENTITIES[(groups[0] ?? "").toLowerCase()] ?? "",
    note: (count) => `${times(count, "escaped character")} (&nbsp;, &amp;) decoded`,
  },
  {
    kind: "tag-id",
    // phpBB writes its own id at the very end of every tag it stores - after the
    // tag's argument, which is what the last `:` before the bracket is. The
    // id is eight hex characters; phpBB2's older `[list:u]` and `[/*:m]` are
    // spelled here too, because a paste from an old post carries them.
    pattern: /\[(\/?[a-zA-Z*][^[\]]*?):(?:[0-9a-fA-F]{8}|[uom])\]/g,
    replace: (_whole, groups) => `[${groups[0] ?? ""}]`,
    note: (count) => `${times(count, "phpBB tag id")} stripped ([b:1a2b3c4d] is [b])`,
  },
  {
    kind: "item-end",
    pattern: /\[\/\*\]/g,
    replace: () => "",
    note: (count) =>
      `${times(count, "[/*] list-item end")} dropped - this format opens each item with [*]`,
  },
  {
    kind: "heading-quote",
    pattern: /\[spoiler\s*=\s*(["'])([^"'\]]*)\1\]/gi,
    replace: (_whole, groups) => `[spoiler=${groups[1] ?? ""}]`,
    note: (count) =>
      `${times(count, "quoted section heading")} unquoted, so the split can find the section`,
  },
];

/**
 * Converts a pasted document, and says what it changed.
 *
 * An empty list of conversions is the answer for text that is already written
 * the way the handbook is - which is the whole of what a paste of an unchanged
 * profile should be able to report.
 */
export function convertHandbookBbcode(raw: string): HandbookConversionResult {
  let text = raw;
  const conversions: HandbookConversion[] = [];

  for (const rule of RULES) {
    let count = 0;
    text = text.replace(rule.pattern, (...args: unknown[]) => {
      const whole = String(args[0]);
      const groups = args
        .slice(1, -2)
        .map((group) => (group === undefined ? undefined : String(group)));
      count += 1;
      return rule.replace(whole, groups);
    });
    if (count > 0) conversions.push({ kind: rule.kind, count, note: rule.note(count) });
  }

  return { text, conversions };
}

/** One line for a notice or a terminal: what a paste had to be converted for. */
export function describeConversions(
  conversions: readonly HandbookConversion[],
): string {
  return conversions.map((conversion) => conversion.note).join("; ");
}
