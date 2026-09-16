import { ranksForDivision } from "@/configs/roles";

export const LIFEGUARD = {
  label: "Lifeguard",
  image: "/Division/LG.png",
  data: {
    imageSize: "150,150",
    image: "https://i.vgy.me/x7lwCB.png",
    divisionName: "Lifeguard Division",
    // Names and ids come from `DIVISIONS.lifeguard` in `src/configs/roles.ts`.
    ranks: ranksForDivision("lifeguard"),
    quickLinks: [],
  },
};
