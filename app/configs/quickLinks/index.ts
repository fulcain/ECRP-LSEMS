// import { General } from "../general";
import { AR } from "./a-r";
// import { AMU } from "./amu";
import { BLS } from "./bls";
// import { CRU } from "./cru";
// import { FR } from "./f-r";
// import { FOR } from "./for";
// import { FS } from "./fs";
// import { FT } from "./ft";
// import { IA } from "./ia";
// import { LIFEGUARD } from "./lifeguard";
// import { PR } from "./pr";
// import { RED } from "./red";

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
  BLS,
  // AMU,
  // FOR,
  // CRU,
  // FR,
  // FS,
  // FT,
  // PR,
  AR,
  // RED,
  // LIFEGUARD,
  // IA,
  // General,
];
