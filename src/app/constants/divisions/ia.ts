import { ranksForDivision } from "@/configs/roles";

export const IA = {
  label: "Internal Affairs",
  image: "/Division/IA.png",
  data: {
    imageSize: "150,150",
    image: "https://i.vgy.me/B2897L.png",
    divisionName: "Internal Affairs Division",
    // Names and ids come from `DIVISIONS.ia` in `src/configs/roles.ts`.
    ranks: ranksForDivision("ia"),
    quickLinks: [],
  },
};
