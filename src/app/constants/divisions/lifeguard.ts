import { ranksForDivision } from "@/configs/roles";

export const LIFEGUARD = {
  label: "Lifeguard",
  image: "/Division/A&R.png",
  data: {
    imageSize: "235,150",
    image: "https://i.vgy.me/2bdgwx.png",
    divisionName: "A&R - Lifeguard Branch",
    // Names and ids come from `DIVISIONS.lifeguard` in `src/configs/roles.ts`.
    ranks: ranksForDivision("lifeguard"),
    quickLinks: [],
  },
};
