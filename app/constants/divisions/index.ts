import { AMU } from "./amu";
import { BLS } from "./bls";
// import { CRU } from "./cru";
import { FR } from "./f-r";
import { FOR } from "./for";
import { FS } from "./fs";
import { FT } from "./ft";
import { General } from "./general";
import { IA } from "./ia";
import { LIFEGUARD } from "./lifeguard";
import { MOUNTAIN_RESCUE } from "./mountain-rescue";
import { PILOT } from "./pilot";
import { PR } from "./pr";
import { RED } from "./red";

export type Divisions = {
  label: string;
  image: string;
  data: DivisionData;
};

export type DivisionData = {
  image: string;
  imageSize: string;
  divisionName: string;
  ranks: string[] | string;
  quickLinks: QuickLink[];
};

type QuickLink = {
  name: string;
  url: string;
};

type Links = {
  label: string;
  image: string;
  data: {
    quickLinks: QuickLink[];
  };
};

export const links: Links[] = [
  General,
  BLS,
  FT,
  AMU,
  RED,
  PR,
  FR,
  FOR,
  MOUNTAIN_RESCUE,
  PILOT,
  // CRU,
  // FS,
  // LIFEGUARD,
  // IA,
];

export const divisions: Divisions[] = [
  General,
  BLS,
  AMU,
  FT,
  RED,
  FOR,
  FR,
  FS,
  PR,
  MOUNTAIN_RESCUE,
  PILOT,
  LIFEGUARD,
  IA,
  // CRU,
];
