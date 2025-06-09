import { General } from "../general";
import { AR } from "./a-r";
import { AMU } from "./amu";
import { BLS } from "./bls";
import { CRU } from "./cru";
import { FR } from "./f-r";
import { FOR } from "./for";
import { FT } from "./ft";
import { PR } from "./pr";

export type Divisions = {
  label: string;
  image: string;
  data: DivisionData;
};

type DivisionData = {
  image: string;
  imageSize: string;
  divisionName: string;
  rank: string;
};

export const divisions: Divisions[] = [
  BLS,
  AMU,
  FOR,
  CRU,
  FR,
  FT,
  PR,
  AR,
  General,
];

export const pmTemplate = ({
  date,
  division,
  medicCredentials,
}: {
  date: string;
  division: DivisionData;
  medicCredentials: {
    name: string;
    signature: string;
    rank: string;
  };
}) => {
  const rankLine = division.rank
    ? `[b]${medicCredentials.rank} | ${division.rank}[/b]`
    : `[b]${medicCredentials.rank}[/b]`;

  return `[LSEMSfooter][/LSEMSfooter]
[divbox=white]
[fimg=${division.imageSize}]${division.image}[/fimg][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]${division.divisionName}[/size][/b]
[size=95]"One Team, One Mission, Saving Lives"[/size][/font]
[size=115]Subject[/size]
[size=95]${date}[/size]
[/right][/aligntable]

[hr]

[b]Dear [RANK, NAME][/b],

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
