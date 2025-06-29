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
  FOR,
  CRU,
  FR,
  FS,
  FT,
  PR,
  AR,
  RED,
  LIFEGUARD,
  IA,
  General,
];

export const pmTemplate = ({
  date,
  division,
  medicCredentials,
  selectedRank,
}: {
  date: string;
  division: DivisionData;
  selectedRank: string;
  medicCredentials: {
    name: string;
    signature: string;
    rank: string;
  };
}) => {
  const rankLine = selectedRank
    ? `[b]${medicCredentials.rank} | ${selectedRank}[/b]`
    : `[b]${medicCredentials.rank}[/b]`;

  return `[LSEMSfooter][/LSEMSfooter]
[divbox=white]
[fimg=${division.imageSize}]${division.image}[/fimg][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]${division.divisionName}[/size][/b]
[size=115]Subject[/size]
[size=95]${date}[/size]
[/right][/aligntable]

[hr]

[b]Dear [/b],

[hr]
[b]Kind regards,[/b]

[img]https://i.imgur.com/qLrboSu.png[/img]
[i]${medicCredentials.name}[/i]
${rankLine}
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]
`;
};
