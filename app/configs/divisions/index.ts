import { General } from "../general";
import { AR } from "./a-r";
import { AMU } from "./amu";
import { BLS } from "./bls";
import { CRU } from "./cru";
import { FR } from "./f-r";
import { FOR } from "./for";
import { FS } from "./fs";
import { FT } from "./ft";
import { IA } from "./ia";
import { LIFEGUARD } from "./lifeguard";
import { PR } from "./pr";
import { RED } from "./red";

export type Divisions = {
  label: string;
  image: string;
  data: DivisionData;
};

type DivisionData = {
  image: string;
  imageSize: string;
  divisionName: string;
  ranks: string[] | string;
};

export const divisions: Divisions[] = [
  BLS,
  AMU,
  General,
  FT,
  RED,
  CRU,
  FOR,
  FR,
  FS,
  PR,
  AR,
  LIFEGUARD,
  IA,
];

export const communicationUpdate: Divisions[] = [CRU, AMU];

type MedicCredentials = {
  name: string;
  signature: string;
  rank: string;
};

export const pmTemplate = ({
  date,
  division,
  medicCredentials,
  selectedRank,
  subject,
  recipient,
}: {
  date: string;
  division: DivisionData;
  selectedRank: string;
  medicCredentials: MedicCredentials;
  subject?: string;
  recipient?: string;
}) => {
  const rankLine = selectedRank
    ? `[b]${medicCredentials.rank} | ${selectedRank}[/b]`
    : `[b]${medicCredentials.rank}[/b]`;

  const subjectLine =
    subject && subject.trim() !== "" ? `[size=115]${subject}[/size]` : "";

  const recipientLine =
    recipient && recipient.trim() !== "" ? `[b]Dear ${recipient}[/b],` : "";

  return `[LSEMSfooter][/LSEMSfooter]
[divbox=white]
[fimg=${division.imageSize}]${division.image}[/fimg][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]${division.divisionName}[/size][/b]
${subjectLine}[size=95]${date}[/size]
[/right][/aligntable]

[hr]
${recipientLine}

[hr]
[b]Kind regards,[/b]

[img]${medicCredentials.signature}[/img]
[i]${medicCredentials.name}[/i]
${rankLine}
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]
`;
};

export const generateSignature = ({
  medicCredentials,
  selectedRank,
}: {
  medicCredentials: MedicCredentials;
  selectedRank: string;
}) => {
  const rankLine = selectedRank
    ? `[b]${medicCredentials.rank} | ${selectedRank}[/b]`
    : `[b]${medicCredentials.rank}[/b]`;

  return `[img]${medicCredentials.signature}[/img]
[i]${medicCredentials.name}[/i]
${rankLine}
`;
};

export const generateNewTemplate = ({
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
    ? `${medicCredentials.rank} | ${selectedRank}`
    : `${medicCredentials.rank}`;

  const subjectLine =
    subject && subject.trim() !== ""
      ? `[b][size=110]${subject}[/size][/b]`
      : `[b][size=110]Subject[/size][/b]`;

  const formattedDate = `[b][size=95]${date}[/size][/b]`;

  const isGeneralDivision =
    division?.divisionName?.trim().toLowerCase() ===
    "los santos emergency medical services".toLowerCase();

  const divisionImage =
    !isGeneralDivision && division?.image
      ? `[float=right][fimg=${division.imageSize || "150,150"}]${division.image}[/fimg][/float]`
      : "";

  const divisionTitle =
    !isGeneralDivision &&
    division?.divisionName &&
    division.divisionName.trim() !== ""
      ? `[font=Arial][b][size=150]${division.divisionName}[/size][/b][/font]\n`
      : "";

  const recipientLine =
    recipient && recipient.trim() !== "" ? `[b]Dear ${recipient}[/b],\n` : "";

  const divisionSection =
    !isGeneralDivision && (divisionImage || divisionTitle)
      ? `[divbox4=eeeeee]${divisionImage}${divisionTitle}[/divbox4]\n`
      : "";

  return `[mdheader 
title="" 
location="Pillbox Hill Medical Center" 
date=" | Paleto Bay Medical Center"
department="One Team, One Mission, Saving Lives"][/mdheader]
${divisionSection}[divbox4=eeeeee]
${subjectLine} 
${formattedDate}
[hr][/hr]
${recipientLine}MESSAGE TEXT GOES HERE
[hr][/hr]
[/divbox4]
[divbox=#8d1717][color=transparent]UwU[/color][/divbox][divbox4=eeeeee]
[mdsig name="${medicCredentials.name || "Name"}" role="${rankLine}" img=${medicCredentials.signature || "https://i.imgur.com/7flpkan.png"} height=38]
[/divbox4]`;
};
