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

  const subjectLine = subject && subject.trim() !== ""
    ? `[size=115]${subject}[/size]\n`
    : "";

  const recipientLine = recipient && recipient.trim() !== ""
    ? `[b]Dear ${recipient}[/b],\n\n`
    : "";

  return `[LSEMSfooter][/LSEMSfooter]
[divbox=white]
[fimg=${division.imageSize}]${division.image}[/fimg][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]${division.divisionName}[/size][/b]
${subjectLine}[size=95]${date}[/size]
[/right][/aligntable]

[hr]

${recipientLine}[hr]
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
