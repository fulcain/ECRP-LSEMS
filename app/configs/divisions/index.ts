import { BLS } from "./bls";
import { AMU } from "./amu";
import { FOR } from "./for";
import { CRU } from "./cru";
import { FR } from "./f-r";
import { FT } from "./ft";
import { PR } from "./pr";
import { AR } from "./a-r";
import { General } from "../general";

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
}: {
  date: string;
  division: DivisionData;
}) => {
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
[i]Dmitry Petrov[/i]
[b]EMT-I | ${division.rank}[/b]
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]
`;
};
