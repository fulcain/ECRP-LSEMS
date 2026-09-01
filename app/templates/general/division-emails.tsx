import { MedicCredentials } from "@/app/(routes)/email-templates/components/MedicCredentials";
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
}: {
  medicCredentials: MedicCredentials;
  selectedRank: string;
  subject?: string;
  date: string;
  recipient: string;
  division?: DivisionData;
  divisionLabel?: string;
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

  return `[mdheader2
title="${subject ? `${subject} | ${date}` : `${date}`}"
location="${locationParam}"
date=""
logo="${division?.image || "https://i.ibb.co/3mzQcHXM/QYXPM0p.png"}"
department="One Team, One Mission, Saving Lives"
][/mdheader2]
[divbox4=eeeeee]
${recipient ? `[b]Dear ${recipient}[/b],` : ""}

MESSAGE TEXT GOES HERE

Be well,

[img]${medicCredentials.signature || "https://i.ibb.co/8DqJghtt/7flpkan.png"}[/img]
[i]${medicCredentials.name || "Name"}[/i]
[/divbox4]
[divbox=#8d1717][color=transparent]spacer[/color][/divbox]
[divbox4=eeeeee]
[mdsig name="${medicCredentials.name || "Name"}" role="${roleLine}" img="${medicCredentials.signature || "https://i.ibb.co/8DqJghtt/7flpkan.png"}" height=38]
[/divbox4]`;
};
