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
