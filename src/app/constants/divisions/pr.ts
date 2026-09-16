import { ranksForDivision } from "@/configs/roles";

export const PR = {
  label: "Public Relations",
  image: "/Division/PR.png",
  data: {
    imageSize: "150,150",
    image: "https://i.vgy.me/fRFYsK.png",
    divisionName: "Public Relations Division",
    // Names and ids come from `DIVISIONS.pr` in `src/configs/roles.ts`.
    ranks: ranksForDivision("pr"),
    quickLinks: [
      {
        name: "Division Index",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1066",
      },
      {
        name: "Handbook",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=66106",
      },
      {
        name: "Photo Library",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=177874",
      },
      {
        name: "Publications [Draft]",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1241",
      },
      {
        name: "Contracts",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1240",
      },
      {
        name: "Discussion Board",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1894",
      },
      {
        name: "Events",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1067",
      },
      {
        name: "Press Releases",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=572",
      },
      {
        name: "PR - Training Profiles (Senior+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=3602",
      },
    ],
  },
};
