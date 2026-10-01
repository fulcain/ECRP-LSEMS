/**
 * Bringing a member's existing profile up to the FTP's current text.
 *
 * The job this serves: the FTP's wording moves on, but the profiles already
 * posted on GOV do not - so a trainer pastes a member's current profile here
 * and gets the same profile written in the FTP's own words. What belongs to the
 * member is kept; what belongs to the FTP is taken from the FTP:
 *
 * - the profile's header - the student information - is kept verbatim, because
 *   it is the one section a paste never rewrites (`protectedFromPaste`);
 * - every other section is the FTP's own text, with each session's signature
 *   block and its completed ticks carried over from the paste, and the
 *   student's name filled where the FTP leaves a blank for one.
 *
 * Pure, like the rest of the FTP text handling: the tab previews the merge as
 * the paste is typed, so nothing here may read a file, a store or the clock.
 */

import {
  FTP_FORMATS,
  sectionHeading,
  type FtpFormatKey,
} from "@/app/constants/divisions/ftd/ftp";
import { FTP_SECTION_TEXTS } from "@/app/constants/divisions/ftd/ftp-content";
import { NAME_SPELLINGS } from "@/app/constants/profile-placeholders";
import { convertFtpBbcode } from "@/lib/ftp-bbcode";

export type ProfileUpdateResult =
  | {
      ok: true;
      /** The updated profile, ready to copy. */
      output: string;
      /** The student information came from the paste rather than the template. */
      headerKept: boolean;
      /** Sections rewritten from the FTP, by the name the tab calls them. */
      replaced: string[];
      /** Sections the paste did not have, taken fresh from the FTP. */
      added: string[];
      /** Sections whose signature block was carried over. */
      signaturesCarried: string[];
      /** Sections whose completed ticks were carried over. */
      ticksCarried: string[];
      /** Blanks the trainer still has to fill, by the token the text shows. */
      unfilled: string[];
      warnings: string[];
    }
  | { ok: false; reason: string };

const HEADER_MARKER = "[lsemssubtitle]SIGNATURE[/lsemssubtitle]";

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Trim and collapse whitespace, so two lines compare equal across a re-wrap. */
function normalizeLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function textOf(format: FtpFormatKey, id: string): string {
  return FTP_SECTION_TEXTS[format][id] ?? "";
}

/** A heading's title, as the declaration and a paste each spell it. */
function headingTitle(heading: string): string {
  return heading
    .slice("[spoiler=".length, -1)
    .replace(/^"|"$/g, "")
    .replace(/:\w{6,}$/, "")
    .trim();
}

/**
 * What a section's paste was signed with.
 *
 * The signature block is the one part of a session section that names the
 * trainer who ran it, so an update carries it rather than replacing the record
 * with the signed-in member's own identity.
 */
function carriedSignature(oldText: string): {
  image: string | null;
  name: string | null;
  rank: string | null;
} | null {
  const at = oldText.lastIndexOf(HEADER_MARKER);
  if (at === -1) return null;
  const block = oldText.slice(at + HEADER_MARKER.length, oldText.indexOf("[/divbox]", at));

  const imageMatch = block.match(/\[img\]([^[\]]+)\[\/img\]/);
  // A template that was never filled signs with the placeholder itself.
  const image =
    imageMatch && imageMatch[1].trim() !== "SIGNATURE" ? imageMatch[1].trim() : null;

  const nameMatch = block.match(/\[i\]([^[\]]+)\[\/i\]/);
  const name =
    nameMatch && !(NAME_SPELLINGS as readonly string[]).includes(nameMatch[1].trim())
      ? nameMatch[1].trim()
      : null;

  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && line !== "[/divbox]");
  const anchor = name ?? (image ? `[img]${image}[/img]` : null);
  const atLine = anchor ? lines.findIndex((line) => line === anchor) : -1;
  const rank =
    lines
      .slice(atLine + 1)
      .find(
        (line) =>
          !line.startsWith("[") &&
          !line.includes("Los Santos Emergency Medical Services") &&
          line !== "Rank" &&
          line !== "RANK",
      ) ?? null;

  return { image, name, rank };
}

/** A completed tick in the paste becomes one in the new section. */
function carryTicks(newText: string, oldText: string): { text: string; carried: number } {
  const oldLines = new Set(oldText.split("\n").map(normalizeLine));
  let carried = 0;
  const text = newText
    .split("\n")
    .map((line) => {
      if (!line.includes("[cb]") || line.includes("[cbc]")) return line;
      const filled = normalizeLine(line).replace("[cb]", "[cbc]");
      if (!oldLines.has(filled)) return line;
      carried += 1;
      return line.replace("[cb]", "[cbc]");
    })
    .join("\n");
  return { text, carried };
}

/**
 * Fill one new section from what the paste held.
 *
 * Order matters: the trainer's signed name is replaced first, wrapped in its
 * own [i] tags, so the student's name can then take every remaining spelling
 * the app fills - a bare `Fname Lname` in a personnel-file line is the student,
 * never the trainer.
 */
function fillSection(
  newText: string,
  oldText: string | undefined,
  studentName: string | null,
): { text: string; signature: boolean; ticks: number } {
  let text = newText;
  let signature = false;
  let ticks = 0;

  if (oldText) {
    const carried = carryTicks(text, oldText);
    text = carried.text;
    ticks = carried.carried;

    const signed = carriedSignature(oldText);
    if (signed) {
      if (signed.image) {
        const image = `[img]${signed.image}[/img]`;
        text = text.split("[img]SIGNATURE[/img]").join(image);
        text = text
          .split("\n")
          .map((line) => (line.trim() === "SIGNATURE" ? image : line))
          .join("\n");
      }
      if (signed.name) {
        text = text.split("[i]Fname Lname[/i]").join(`[i]${signed.name}[/i]`);
        text = text.split("[i]FName LName[/i]").join(`[i]${signed.name}[/i]`);
        text = text.split("[i]Fname lname[/i]").join(`[i]${signed.name}[/i]`);
      }
      if (signed.rank) {
        text = text
          .split("\n")
          .map((line) => {
            const trimmed = line.trim();
            if (trimmed !== "Rank" && trimmed !== "RANK") return line;
            return line.replace(trimmed, signed.rank as string);
          })
          .join("\n");
      }
      signature = Boolean(signed.image || signed.name || signed.rank);
    }
  }

  if (studentName) {
    text = text.split("{{applicantName}}").join(studentName);
    // What is left over after the trainer names were taken is the student's.
    for (const spelling of NAME_SPELLINGS) {
      if (spelling === "{{applicantName}}") continue;
      text = text.replace(
        new RegExp(`(?<!\\[i\\])${escapeRegExp(spelling)}(?!\\[\\/i\\])`, "g"),
        studentName,
      );
    }
  }

  return { text, signature, ticks };
}

/** The blanks a finished profile must not still show, as the text spells them. */
function unfilledTokens(output: string): string[] {
  const found = new Set<string>();
  for (const token of output.match(/{{[^}]+}}/g) ?? []) found.add(token);
  for (const line of output.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "SIGNATURE" || trimmed === "RANK" || trimmed === "Rank") {
      found.add(trimmed);
    }
  }
  if (output.includes("[img]SIGNATURE[/img]")) found.add("[img]SIGNATURE[/img]");
  for (const spelling of NAME_SPELLINGS) {
    if (spelling !== "{{applicantName}}" && output.includes(spelling)) {
      found.add(spelling);
    }
  }
  for (const date of ["DD/MMM/YYYY", "DD/MMM/2023"]) {
    if (output.includes(date)) found.add(date);
  }
  return [...found];
}

function field(header: string, label: string): string | null {
  const match = header.match(
    new RegExp(`\\[b\\]${label}:\\[\\/b\\][ \\t]*([^\\n]+)`),
  );
  const value = match?.[1]?.trim();
  return value && value.length > 0 ? value : null;
}

/**
 * Paste a member's profile in; get it back in the FTP's current words.
 *
 * Sections are found again by their own `[spoiler=…]` heading, so a paste is
 * whole profile or nothing: the tool never guesses at where a section begins.
 * A section the paste does not have - one the FTP gained since the profile was
 * written - is taken fresh from the FTP, which is the point of updating.
 */
export function updatePastedProfile(
  formatKey: FtpFormatKey,
  rawPaste: string,
): ProfileUpdateResult {
  const format = FTP_FORMATS.find((entry) => entry.key === formatKey);
  if (!format) return { ok: false, reason: "That format is not declared." };

  const paste = convertFtpBbcode(rawPaste).text;
  if (!paste.trim()) {
    return { ok: false, reason: "Nothing pasted yet." };
  }

  // Where each declared section begins in the paste. Headings are matched by
  // their title rather than their exact tag, so phpBB's tag ids and quoted
  // titles still find their section after the conversion.
  const titles = new Map<string, string>();
  for (const section of format.sections) {
    const heading = sectionHeading(textOf(formatKey, section.id));
    if (heading) titles.set(headingTitle(heading), section.id);
  }

  const lines = paste.split("\n");
  const bounds: { line: number; id: string; title: string }[] = [];
  for (const [index, line] of lines.entries()) {
    const match = line.trim().match(/^\[spoiler=([^\]]+)\]/);
    if (!match) continue;
    const id = titles.get(headingTitle(match[0]));
    if (id && !bounds.some((bound) => bound.id === id)) {
      bounds.push({ line: index, id, title: match[0] });
    }
  }
  if (bounds.length === 0) {
    return {
      ok: false,
      reason:
        "None of the profile's section headings were recognised in the paste. Paste the whole profile, from its first line, exactly as it stands on the forum.",
    };
  }

  const sectionAt = (id: string): string | undefined => {
    const at = bounds.findIndex((bound) => bound.id === id);
    if (at === -1) return undefined;
    const start = bounds[at].line + 1;
    const end = at + 1 < bounds.length ? bounds[at + 1].line : lines.length;
    return lines.slice(start, end).join("\n");
  };

  const headerSection = format.sections.find(
    (section) => section.protectedFromPaste,
  );
  const pastedHeader = headerSection
    ? lines.slice(0, bounds[0].line).join("\n").trim()
    : "";

  const warnings: string[] = [];
  const headerKept = pastedHeader.length > 0;
  if (headerSection && !headerKept) {
    warnings.push(
      "The paste had nothing above the first section heading, so the FTP's own header was used - the student information needs filling in.",
    );
  }

  const studentName =
    field(pastedHeader, "Student Name") ?? field(pastedHeader, "Reinstatee Name");
  if (!studentName) {
    warnings.push(
      "The student's name could not be read from the header - fill the name lines in by hand before posting.",
    );
  }

  const replaced: string[] = [];
  const added: string[] = [];
  const signaturesCarried: string[] = [];
  const ticksCarried: string[] = [];
  const pieces: string[] = [];

  if (headerKept && headerSection) {
    pieces.push(pastedHeader);
  } else if (headerSection) {
    pieces.push(textOf(formatKey, headerSection.id));
  }

  for (const section of format.sections) {
    if (section.protectedFromPaste) continue;
    const pasted = sectionAt(section.id);
    const filled = fillSection(
      textOf(formatKey, section.id),
      pasted,
      studentName,
    );
    if (filled.signature) signaturesCarried.push(section.title);
    if (pasted) replaced.push(section.title);
    else added.push(section.title);
    pieces.push(filled.text.trimEnd());
    if (filled.ticks > 0) ticksCarried.push(section.title);
  }

  const output = pieces.filter((piece) => piece.trim() !== "").join("\n");
  const unfilled = unfilledTokens(output);

  return {
    ok: true,
    output,
    headerKept,
    replaced,
    added,
    signaturesCarried,
    ticksCarried,
    unfilled,
    warnings,
  };
}
