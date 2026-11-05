import { ranksForDivision } from "@/configs/roles";

export const General = {
  label: "General",
  image: "/General.png",
  data: {
    imageSize: "150,150",
    image: "https://i.ibb.co/dsKf0v2p/C6b52lr.png",
    divisionName: "Los Santos Emergency Medical Services",
    // Names and ids come from `DIVISIONS.general` in `src/configs/roles.ts` -
    // a department-wide division, so its rank list is empty.
    ranks: ranksForDivision("general"),
    quickLinks: [
      {
        name: "Department Internal Index",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=570",
      },
      {
        name: "Department Public Index",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=569",
      },
      {
        name: "Public Roster (BLS)",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=55728",
      },
      {
        name: "Private Roster",
        url: "https://gov.eclipse-rp.net/viewtopic.php?p=863079",
      },

      {
        name: "Leave Of Absence",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=613",
      },
      {
        name: "Medical Prescriptions",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=2710",
      },
      {
        name: "Financial Requests",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=2230",
      },
      {
        name: "Ride Along Program",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=577",
      },
      {
        name: "Ride Along Program Formats",
        url: "/divisions/ftd/paperwork?tab=civilianRideAlong",
      },
      {
        name: "General Handbook",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=804",
      },
      {
        name: "Employee Adjustments",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=573",
      },

      {
        name: "Service Firearm",
        url: "https://gov.eclipse-rp.net/viewtopic.php?t=106075#11",
      },

      {
        name: "Financial Requests",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=2230",
	  },

      {
        name: "Divisional Command | Meeting Agenda (Divisional Command+)",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=1983",
	  },
		
    ],
  },
};
