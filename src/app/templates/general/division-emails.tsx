import { MedicCredentials } from "@/app/(routes)/operations/division-templates/components/MedicCredentials";
import { DivisionData } from "@/app/constants/divisions";
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
  const bodySignOff = omitBodySignature
    ? ""
    : `\nBe well,\n\n[img]${medicCredentials.signature || "https://i.ibb.co/8DqJghtt/7flpkan.png"}[/img]\n[i]${medicCredentials.name || "Name"}[/i]\n`;
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
