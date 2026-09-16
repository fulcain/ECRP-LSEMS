import { ranksForDivision } from "@/configs/roles";

export const FOR = {
  label: "Forensics",
  image: "/Division/FOR.png",
  data: {
    imageSize: "150,150",
    image: "https://i.vgy.me/kKRB7S.png",
    divisionName: "Forensics Division",
    // Names and ids come from `DIVISIONS.for` in `src/configs/roles.ts`.
    ranks: ranksForDivision("for"),
    quickLinks: [
      {
        name: "Division Index",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=2568",
      },
      {
        name: "Handbook",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=164012",
      },
      {
        name: "Serologist Training Guide (Instructor+)",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=112252",
      },
      {
        name: "Student Profiles (Instructor+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1959",
      },
      {
        name: "Reports",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=2577",
      },
      {
        name: "Discussion Board",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=2575",
      },
    ],
  },
};
