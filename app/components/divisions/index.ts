import { BLS } from "./bls";
import { AMU } from "./amu";
import { FOR } from "./for";
import { CRU } from "./cru";
import { FR } from "./f-r";
import { FT } from "./ft";
import { PR } from "./pr";
import { AR } from "./a-r";

export const divisions = [BLS, AMU, FOR, CRU, FR, FT, PR, AR];

export const pmTemplate = ({ date, division }) => {
  return `[LSEMSfooter][/LSEMSfooter]
[divbox=white]
[fimg=150,150]${division.image}[/fimg][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
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
