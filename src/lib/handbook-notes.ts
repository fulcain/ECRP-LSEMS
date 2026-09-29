/**
 * The paperwork page's Guide and Script, built from the handbook itself.
 *
 * The FTD Paperwork tab used to keep its own hand-written copy of the training
 * material - a React component per phase and a spoken transcript beside it - and
 * by the time the EMR profile moved into `docs/handbook/**` that copy had already
 * drifted from it (it still told trainers panic calls showed in PD/SD dispatch
 * after the handbook stopped saying so). Keeping the same material twice is the
 * failure this replaced, so both views are derived here instead:
 *
 *   - the **Guide** is the handbook section rendered through the app's own BBCode
 *     renderer, so what a trainer reads is what the profile says;
 *   - the **Script** is that same section turned into paste-friendly lines, which
 *     is a plain text transform and needs no other copy either.
 *
 * Everything here is pure: no file reads, no database, no network. The sections
 * come from the generated `handbook-content.ts` module, which is what a publish
 * rewrites - so updating a profile updates both views, every page that shows
 * them, and the profile the contract workflow hands an FTO, from one paste.
 */

import type { HandbookFormatKey } from "@/app/constants/divisions/ftd/handbook";
import { HANDBOOK_SECTION_TEXTS } from "@/app/constants/divisions/ftd/handbook-content";

/** One section's own text, or null when this build has no such section. */
export function handbookSectionText(
  format: HandbookFormatKey,
  sectionId: string,
): string | null {
  return HANDBOOK_SECTION_TEXTS[format]?.[sectionId] ?? null;
}

/**
 * The text of one `[spoiler=…]` inside a section, when a page is about that part
 * of it rather than the whole thing - the reinstatement ride-along paperwork
 * lives inside the certification section, and showing a ride-along trainer the
 * whole certification would be the wrong page.
 *
 * Spoilers nest, so this counts rather than matching to the first close.
 */
export function handbookSpoiler(text: string, title: string): string | null {
  const open = `[spoiler=${title}]`;
  const start = text.indexOf(open);
  if (start === -1) return null;
  let depth = 1;
  const pattern = /\[spoiler=[^\]]*\]|\[\/spoiler\]/g;
  pattern.lastIndex = start + open.length;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    if (match[0] === "[/spoiler]") {
      depth -= 1;
      if (depth === 0) return text.slice(start, match.index + match[0].length);
    } else {
      depth += 1;
    }
  }
  return text.slice(start);
}

/** A `[spoiler=…]` heading's own title, for rendering the piece under it. */
export function spoilerTitle(block: string): string | null {
  const match = block.match(/^\[spoiler=([^\]]*)\]/);
  return match ? match[1] : null;
}

/**
 * The section as paste-friendly spoken lines, in the format the Script view
 * already understands: a `## ` line is a heading, `|| … ||` is something for the
 * trainer to read rather than say, `(( … ))` is OOC, and a backticked span is a
 * command the reader can copy on its own.
 *
 * A spoken script cannot be invented from BBCode - the handbook is written as
 * instructions, not as a monologue - so this reads it out faithfully rather than
 * pretending to be prose, and the paperwork templates (which nobody reads aloud)
 * become a line pointing at the Guide.
 */
export function spokenFromBbcode(source: string): string {
  let text = source.replace(/\r\n/g, "\n");

  // The session-details forms: a trainer reading these aloud helps nobody, and
  // they are the bulk of a section's length.
  text = text.replace(
    /\[code\][\s\S]*?\[\/code\]/g,
    "\n@@@Paperwork template\n|| The session form for this phase is in the Guide view - copy it from there. ||\n",
  );

  // Structural markers first, while the tags are still there to recognise.
  text = text
    .replace(/\[spoiler=([^\]]*)\]/g, "\n@@@$1\n")
    .replace(/\[spoil\]/g, "\n")
    .replace(/\[\/spoiler\]/g, "\n")
    // The phase's own title line, and the bold verdict under it.
    .replace(/\[lsemssubtitle\]([\s\S]*?)\[\/lsemssubtitle\]/g, "\n@@@$1\n")
    .replace(/\[center\]\[b\]([\s\S]*?)\[\/b\]\[\/center\]/g, "\n@@@$1\n")
    // A list item becomes its own line first, and only then is a heading looked
    // for on it: the formats write a category as the first thing in an item, and
    // the colour-and-bold pair is anchored to a line because the same pair also
    // tints `10-8` mid-sentence in a radio call - which is not a heading.
    .replace(/\[\*\]/g, "\n")
    .replace(/\[list[^\]]*\]|\[\/list\]/g, "\n")
    .replace(
      /^[ \t]*\[color=#[0-9A-Fa-f]{6}\]\[b\]([^\n]*?)\[\/b\]\[\/color\][ \t]*$/gm,
      "\n@@@$1\n",
    )
    .replace(
      /^[ \t]*\[b\]\[color=#[0-9A-Fa-f]{6}\]([^\n]*?)\[\/color\]\[\/b\][ \t]*$/gm,
      "\n@@@$1\n",
    );

  const out: string[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const heading = line.match(/^@@@(.*)$/);
    if (heading) {
      const title = inline(heading[1]).replace(/\*+/g, "").trim();
      if (title) out.push(`## ${title}`);
      continue;
    }
    const spoken = inline(line);
    if (spoken) out.push(spoken);
  }
  return out.join("\n\n");
}

/** One line's text with the forum markup taken off it. */
function inline(text: string): string {
  const cleaned = text
    // Spacer lines carry nothing anyone can read.
    .replace(/\[color=transparent\][\s\S]*?\[\/color\]/g, " ")
    .replace(/\[img\][\s\S]*?\[\/img\]/g, " ")
    .replace(/\[url=([^\]]*)\]([\s\S]*?)\[\/url\]/g, "$2")
    .replace(/\[c\]([\s\S]*?)\[\/c\]/gi, "`$1`")
    .replace(/\[ooc\]([\s\S]*?)\[\/ooc\]/gi, "(( $1 ))")
    // Italics in these formats are the optional-or-worth-noting lines, which is
    // exactly what the Script view renders a `||` note for.
    .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "|| $1 ||")
    .replace(/\[(?:cb|cbc|hr|lsemsfooter)\]/gi, " ")
    .replace(/\[\/?[a-zA-Z][^\]]*\]/g, "")
    // The formats write emphasis as `**…**`, which the forum does not render -
    // reading it aloud is not a reason to keep the asterisks.
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned
    .replace(/\(\s+/g, "((")
    .replace(/\s+\)\)/g, "))")
    .replace(/\|\|\s+/g, "|| ")
    .replace(/\s+\|\|/g, " ||")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

/** Every section id this build knows, for the checks and the mapping. */
export function handbookSectionIds(format: HandbookFormatKey): string[] {
  return Object.keys(HANDBOOK_SECTION_TEXTS[format] ?? {});
}
