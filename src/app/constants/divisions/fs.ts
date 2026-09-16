import { ranksForDivision } from "@/configs/roles";

export const FS = {
  label: "Fire Safety",
  image: "/Division/FS.png",
  data: {
    imageSize: "150,150",
    image: "https://i.vgy.me/rs0ORy.png",
    divisionName: "Fire Safety",
    // Names and ids come from `DIVISIONS.fs` in `src/configs/roles.ts`, where
    // the four leadership roles are shared with Fire & Rescue.
    ranks: ranksForDivision("fs"),
    quickLinks: [],
  },
};
