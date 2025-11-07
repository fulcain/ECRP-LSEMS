import { MedicCredentials } from "@/app/(routes)/email-templates/components/MedicCredentials";
import { DivisionData } from "@/app/constants/divisions";

export const generateEmailTemplate = ({
  medicCredentials,
  selectedRank,
  subject,
  recipient,
  date,
  division,
}: {
  medicCredentials: MedicCredentials;
  selectedRank: string;
  subject?: string;
  date: string;
  recipient: string;
  division?: DivisionData;
}) => {
  const rankLine = selectedRank
    ? `${selectedRank} / ${medicCredentials.rank}`
    : `${medicCredentials.rank}`;

  const isGeneralDivision =
    division?.divisionName?.trim().toLowerCase() ===
    "los santos emergency medical services".toLowerCase();

  const locationParam = isGeneralDivision
    ? "Pillbox Hill Medical Center | Paleto Bay Medical Center"
    : division?.divisionName;

  return `[mdheader2
title="${subject || "Subject"} | ${date}"
location="${locationParam}"
date=""
logo="${division?.image || "https://i.imgur.com/QYXPM0p.png"}"
department="One Team, One Mission, Saving Lives"
][/mdheader2]
[divbox4=eeeeee]
[b]${recipient ? `Dear ${recipient}` : "Recipient"}[/b],

MESSAGE TEXT GOES HERE

Be well,

[img]${medicCredentials.signature || "https://i.imgur.com/7flpkan.png"}[/img]
[i]${medicCredentials.name || "Name"}[/i]
[/divbox4]
[divbox=#8d1717][color=transparent]spacer[/color][/divbox]
[divbox4=eeeeee]
[mdsig name="${medicCredentials.name || "Name"}" role="${rankLine}" img="${medicCredentials.signature || "https://i.imgur.com/7flpkan.png"}" height=38]
[/divbox4]`;
};
