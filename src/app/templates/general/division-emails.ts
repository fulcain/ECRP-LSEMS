import type { MedicCredentials } from "@/app/(routes)/operations/division-templates/components/MedicCredentials";
import { getCurrentDateFormatted } from "@/app/helpers/getCurrentDateFormatted";
import type { DivisionData } from "@/app/constants/divisions";
import {
  getDirectorTitle,
  getDirectorTitleForDivision,
} from "@/app/constants/general/directorRoles";

export const generateEmailTemplate = ({
  medicCredentials,
  selectedRank,
  subject,
  recipient,
  date,
  division,
  divisionLabel,
  omitBodySignature = false,
  omitRecipientSection = false,
  bodySignOffText,
}: {
  medicCredentials: MedicCredentials;
  selectedRank: string;
  subject?: string;
  date: string;
  recipient: string;
  division?: DivisionData;
  divisionLabel?: string;
  omitBodySignature?: boolean;
  omitRecipientSection?: boolean;
  bodySignOffText?: string;
}) => {
  const isGeneralDivision = divisionLabel?.trim().toLowerCase() === "general";

  // Department-wide template: always show the held director title. Division
  // templates only show it when the director covers that division.
  const directorTitle = isGeneralDivision
    ? getDirectorTitle(medicCredentials.directorRole)
    : getDirectorTitleForDivision(medicCredentials.directorRole, divisionLabel);
  const roleLine = directorTitle
    ? `${directorTitle} / ${medicCredentials.rank}`
    : selectedRank
      ? `${selectedRank} / ${medicCredentials.rank}`
      : medicCredentials.rank;

  const locationParam = isGeneralDivision
    ? "Pillbox Hill Medical Center | Paleto Bay Medical Center"
    : division?.divisionName;

  // omitRecipientSection drops the "Dear …," greeting and the closing
  // signature bar; omitBodySignature drops the body sign-off. Separators ride
  // inside the kept branches, so an omitted piece leaves no blank line behind.
  const greeting =
    !omitRecipientSection && recipient ? `[b]Dear ${recipient}[/b],\n\n` : "";
  // The closing line is the member's own when typed, the default otherwise.
  const bodySignOffLine = bodySignOffText?.trim() || "Be well,";
  const bodySignOff = omitBodySignature
    ? ""
    : `\n${bodySignOffLine}\n\n[img]${medicCredentials.signature || "https://i.ibb.co/8DqJghtt/7flpkan.png"}[/img]\n[i]${medicCredentials.name || "Name"}[/i]\n`;
  const closingBar = omitRecipientSection
    ? ""
    : `\n[divbox=#8d1717][color=transparent]spacer[/color][/divbox]\n[divbox4=eeeeee]\n[mdsig name="${medicCredentials.name || "Name"}" role="${roleLine}" img="${medicCredentials.signature || "https://i.ibb.co/8DqJghtt/7flpkan.png"}" height=38]\n[/divbox4]`;

  return `[mdheader2
title="${subject ? `${subject} | ${date}` : `${date}`}"
location="${locationParam}"
date=""
logo="${division?.image || "https://i.ibb.co/3mzQcHXM/QYXPM0p.png"}"
department="One Team, One Mission, Saving Lives"
][/mdheader2]
[divbox4=eeeeee]
${greeting}MESSAGE TEXT GOES HERE
${bodySignOff}[/divbox4]${closingBar}`;
};

/**
 * Re-injects the fields that stay live while the body is edited - the header's
 * title line and the greeting - so a member who has typed into the box still
 * sees the subject they just picked, without losing their edits.
 *
 * Shared with the discussion boards, which build a body the same way.
 */
export function applyLiveFields(
  body: string,
  subject: string,
  recipient: string,
  date: string,
): string {
  let out = body;
  const titleValue = subject ? `${subject} | ${date}` : date;
  out = out.replace(/(^|\n)title="[^"]*"/, `$1title="${titleValue}"`);
  const greeting = recipient ? `[b]Dear ${recipient}[/b],` : "";
  if (/\[b\]Dear [^\n]*\n/.test(out)) {
    out = out.replace(/\[b\]Dear [^\n]*\n/, greeting ? `${greeting}\n` : "");
  } else if (greeting) {
    // Count the [mdsig] bars: a template built without the recipient section
    // has none, so leave greeting-less bodies alone.
    const mdsigCount = (out.match(/\[mdsig\b/g) ?? []).length;
    if (mdsigCount > 0) {
      out = out.replace(/(\[divbox4=eeeeee\]\r?\n)/, `$1${greeting}\n`);
    }
  }
  return out;
}

/**
 * A discussion board topic's body: the division's own template with the body
 * signature and the closing sign box left off - the two boxes the Division
 * Templates page calls "Body signature" and "Closing signature" - because a
 * discussion post is not a letter to anybody. The greeting goes with them, so
 * what is left is the division's header and an empty box to write in.
 */
export function generateDiscussionBoardBody({
  medicCredentials,
  division,
  divisionLabel,
  subject,
  date,
}: {
  medicCredentials: MedicCredentials;
  division?: DivisionData;
  divisionLabel?: string;
  subject: string;
  /** Passed in by a composer that also live-patches the title line. */
  date?: string;
}): string {
  return generateEmailTemplate({
    medicCredentials,
    selectedRank: medicCredentials.rank,
    division,
    divisionLabel,
    subject,
    recipient: "",
    date: date ?? getCurrentDateFormatted(),
    omitBodySignature: true,
    omitRecipientSection: true,
  });
}
