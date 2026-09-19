import { ranksForDivision } from "@/configs/roles";

export const MOUNTAIN_RESCUE = {
  label: "Mountain Rescue",
  image: "/Division/A&R.png",
  data: {
    imageSize: "235,150",
    image: "https://i.vgy.me/2bdgwx.png",
    divisionName: "Mountain Rescue Division",
    // Names and ids come from `DIVISIONS.mountainRescue` in
    // `src/configs/roles.ts`, where Air & Rescue leadership is shared with the
    // Pilot division.
    ranks: ranksForDivision("mountainRescue"),
    quickLinks: [
      {
        name: "Division Index",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=866",
      },
      {
        name: "Ground Branch Handbook",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=160335",
      },
      {
        name: "Mountain Rescue Student Profiles (Instructor+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1675",
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
