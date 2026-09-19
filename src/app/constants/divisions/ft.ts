import { ranksForDivision } from "@/configs/roles";

export const FT = {
  label: "Field Training",
  image: "/Division/FT.png",
  data: {
    imageSize: "150,150",
    image: "https://i.vgy.me/gLgUWA.png",
    divisionName: "Field Training Division",
    // Names and ids come from `DIVISIONS.ftd` in `src/configs/roles.ts`, which
    // also gates the workspace on these ranks.
    ranks: ranksForDivision("ftd"),
    quickLinks: [
      {
        name: "Division Index",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=599",
      },
      {
        name: "Handbook",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=87381",
      },
      {
        name: "FTO Student Profiles (Field Training Instructor+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1161",
      },
      {
        name: "EMR Training Time Reminder (Field Training Instructor+)",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=178482",
      },
      {
        name: "FT Session Reports",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSdRDNSsxhEgMgegEoDdd1NURAB84RgPKwaK34nD2emK2k24sg/viewform",
      },
      {
        name: "Student Area",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1926",
      },
      {
        name: "EMR Profiles",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=617",
      },
      {
        name: "Reinstatement Training Program",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=601",
      },
      {
        name: "Quiz Area",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=3748",
      },
      {
        name: "Discussion Board",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1882",
      },
      {
        name: "FTD - Command Area",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1928",
      },
      
    ],
  },
};
