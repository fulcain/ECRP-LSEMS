import { ranksForDivision } from "@/configs/roles";

export const AMU = {
  label: "AMU",
  image: "/Division/AMU.png",
  data: {
    imageSize: "150,150",
    image: "https://i.vgy.me/58UddL.png",
    divisionName: "Advanced Medicine Unit",
    // Names and ids come from `DIVISIONS.amu` in `src/configs/roles.ts`.
    ranks: ranksForDivision("amu"),
    quickLinks: [
      {
        name: "Paperwork Generator",
        url: "https://lsems-amu-paperwork.netlify.app/",
      },
      {
        name: "Division Index",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1135",
      },
      {
        name: "Handbook",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=178535",
	  },
	  {
        name: "Command Handbook (Division Command+)",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=215347",
      },
      {
        name: "Command Area (Division Command+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1955",
      },
      {
        name: "Incoming Applications (Division Command+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=2293",
      },
      {
        name: "Attending Physician Area (Attending Physician+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=3808",
      },
      {
        name: "Student Profiles (Attending Physician+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1224",
      },
      {
        name: "Research Papers",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=63193",
      },
      {
        name: "Discussion Board",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1754",
      },
      {
        name: "Patient Files",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1223",
      },
      {
        name: "Formats",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=49218",
      },
      {
        name: "AMU Public Requests",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=3641",
      },
      {
        name: "Communication Update Form",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=167625",
      },
    ],
  },
};
