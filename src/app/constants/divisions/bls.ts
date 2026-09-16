import { ranksForDivision } from "@/configs/roles";

export const BLS = {
  label: "Basic Life Support",
  image: "/Division/BLS.png",
  data: {
    imageSize: "150,150",
    image: "https://i.vgy.me/5Mkn7G.png",
    divisionName: "LSEMS Basic Life Support Division",
    // Names and ids come from `DIVISIONS.bls` in `src/configs/roles.ts`, which
    // also gates `/divisions/bls` on these ranks.
    ranks: ranksForDivision("bls"),
    quickLinks: [
      {
        name: "Division Index",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=867",
      },
      {
        name: "Handbook",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=214677",
      },
      {
        name: "Incoming Applications (Division Command+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1948",
      },
      {
        name: "Activity Log (Division Command+)",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=184979",
      },

      {
        name: "Command Handbook (Division Command+)",
        url: "https://gov.eclipse-rp.net/viewtopic.php?p=1055095#p1055095",
      },
      {
        name: "Command Area (Division Command+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1948",
      },
      {
        name: "Student Profiles (Senior BLS Instructors+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1694",
      },
      {
        name: "Discussion Board",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1889",
      },
      {
        name: "Course Reports",
        url: "https://gov.eclipse-rp.net/viewtopic.php?p=573545#p573545",
      },
      {
        name: "BLS Courses",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=578",
      },
      {
        name: "LSPD LSEMS Joint Section Index",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=4277",
      },
      {
        name: "Police Cadet Roster",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=223266",
      },
      {
        name: "Joint BLS Course Reports",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=222067",
      },
      {
        name: "Cadets & BLS Instructors",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=4278",
      },
    ],
  },
};
