import { ranksForDivision } from "@/configs/roles";

export const FR = {
  label: "Fire & Rescue",
  image: "/Division/F&R.png",
  data: {
    imageSize: "150,150",
    image: "https://i.vgy.me/r19D8R.png",
    divisionName: "Fire Department",
    // Names and ids come from `DIVISIONS.fr` in `src/configs/roles.ts`.
    ranks: ranksForDivision("fr"),
    quickLinks: [
      {
        name: "Division Index",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=925",
      },
      {
        name: "Handbook",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1727",
      },
      {
        name: "Firefighter Training Profiles (Instructors+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1699",
      },
      {
        name: "Instructor Training Profiles (Instructors+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=2342",
      },
      {
        name: "Instructors Area (Instructors+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=2322",
      },

      {
        name: "Forced Entry Reports",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=70710",
      },
      {
        name: "Duty Reports",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=73329",
      },
      {
        name: "Discussion Board",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1884",
      },
    ],
  },
};
