/**
 * The trainer's own details, and the placeholders the app fills them into.
 *
 * A signed section of the EMR profile ends with the trainer's signature and the
 * file says so in placeholders - `[img]SIGNATURE[/img]`, `[i]Medic Name[/i]`, a
 * line that is just `Rank` (the reinstatement profile's is `SIGNATURE` and
 * `RANK`) - because one file is handed to every trainer. This is the one
 * declaration of how that block is filled, read by the generated post and by the
 * profile an FTO copies, rather than a spelling of it beside each of them.
 *
 * Everything here is pure: no file reads, no database, no network.
 *
 * This module also derived the paperwork page's Guide and Script from the
 * FTP for a while, through the generated `ftp-content.ts` module. It
 * does not any more: those views are written by hand per phase again
 * (`paperwork/lib/phase-notes/`), and what stays derived from the FTP is
 * the profile an FTO is handed - the copy that must never drift.
 */

/**
 * The trainer's own details, as a signature block is signed with them.
 *
 * They come from the member - the name and signature the Staff Page holds, the
 * rank the app resolves - and are never asked for twice. The FTP cannot
 * carry them: it is the same file for every trainer.
 */
export type MedicSignature = {
  /** The saved signature image's URL. */
  signature: string;
  /** The name printed under the signature. */
  name: string;
  /** The rank under that. */
  rank: string;
};

/**
 * The profile's signature block, and where each line of it comes from.
 *
 * A detail the member has not saved is left as the placeholder instead of being
 * blanked, so an empty Staff Page is visible rather than printing nothing.
 *
 * The bare spellings are whole-line on purpose: `Rank` is also a word in the
 * sentences about rank adjustments, and filling that would rewrite the steps.
 */
const SIGNATURE_FILLS: readonly {
  /** The exact text the profile writes. */
  find: string;
  /** True when only a line that is exactly this counts. */
  wholeLine?: boolean;
  from: keyof MedicSignature;
  /** What that line becomes once there is a value for it. */
  write: (value: string) => string;
}[] = [
  {
    find: "[img]SIGNATURE[/img]",
    from: "signature",
    write: (value) => `[img]${value}[/img]`,
  },
  {
    find: "[i]Medic Name[/i]",
    from: "name",
    write: (value) => `[i]${value}[/i]`,
  },
  // What the live profile post has always said under a signature, and what a
  // pasted update puts into the file - the same line, spelled the way a trainer
  // writing their own profile would.
  {
    find: "[i]Fname Lname[/i]",
    from: "name",
    write: (value) => `[i]${value}[/i]`,
  },
  { find: "SIGNATURE", wholeLine: true, from: "signature", write: (value) => value },
  { find: "Rank", wholeLine: true, from: "rank", write: (value) => value },
  { find: "RANK", wholeLine: true, from: "rank", write: (value) => value },
];

/** Fill the member's own details into a piece of FTP text. */
export function fillMedicSignature(
  text: string,
  medic: MedicSignature,
): string {
  let out = text;
  for (const fill of SIGNATURE_FILLS) {
    const value = medic[fill.from].trim();
    if (!value) continue;
    const replacement = fill.write(value);
    out = fill.wholeLine
      ? out
          .split("\n")
          .map((line) => (line.trim() === fill.find ? replacement : line))
          .join("\n")
      : out.split(fill.find).join(replacement);
  }
  return out;
}

/** The block as the profile's own sections write it, before anything is filled. */
const SIGNATURE_BLOCK = `[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
[img]SIGNATURE[/img]
[i]Medic Name[/i]
Rank
[b]Los Santos Emergency Medical Services[/b]
[/divbox]`;

/**
 * The signature block a generated post ends with: the profile's own block, with
 * the member's details in it, rather than a second spelling of the same thing.
 */
export function signatureBlock(medic: MedicSignature): string {
  return fillMedicSignature(SIGNATURE_BLOCK, medic).trim();
}
