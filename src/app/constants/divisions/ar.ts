import { ranksForDivision } from "@/configs/roles";

export const AR = {
  label: "A&R",
  image: "/Division/A&R.png",
  data: {
    imageSize: "235,150",
    image: "https://i.vgy.me/2bdgwx.png",
    divisionName: "Air & Rescue Division",
    // Names and ids come from `DIVISIONS.ar` in `src/configs/roles.ts`, which
    // also gates `/divisions/ar` on these ranks.
    ranks: ranksForDivision("ar"),
    quickLinks: [
      {
        name: "Division Index",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=866",
      },
      {
        name: "Air Branch Manual",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=174011",
      },
      {
        name: "Pilot Student Profiles (Instructor+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=926",
      },
      {
        name: "Ability Course (Instructor+)",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=211472",
      },
      {
        name: "Senior Pilot Profiles (Instructor+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1232",
      },
      {
        name: "Flight Instructor Profiles (Instructor+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=3950",
      },
      {
        name: "Instructor Area (Instructor+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=3545",
      },
      {
        name: "Discussion Board",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1886",
      },
    ],
  },
};
