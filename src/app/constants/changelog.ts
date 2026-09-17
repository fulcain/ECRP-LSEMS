export type ChangeType = "feature" | "change";

export type ChangeItem = {
  type: ChangeType;
  description: string;
};

export type ChangeLogEntry = {
  date: string;
  title?: string;
  changes: ChangeItem[];
};

export const changeLog: ChangeLogEntry[] = [
  {
    date: "Sep 16, 2026",
    changes: [
      {
        type: "change",
        description:
          "The app has been migrated into the LSEMS workspace: every page now sits under its own sidebar section, access is decided from your Discord roles in one place, and older links redirect to the new addresses.",
      },
      {
        type: "feature",
        description:
          "The Staff Page gained a Discord Profile tab: your Discord account (avatar and handle), the rank and director title the app resolves from your roles, and every role it recognised - with the divisional roles listed apart from the department ones.",
      },
    ],
  },
  {
    date: "Sep 2, 2026",
    changes: [
      {
        type: "feature",
        description: "Added a Templates page with an LOA template.",
      },
    ],
  },
  {
    date: "Sep 1, 2026",
    changes: [
      {
        type: "feature",
        description:
          "Added a live editable preview to the Division Email Templates Template Options, with edits saved locally.",
      },
    ],
  },
  {
    date: "Aug 26, 2026",
    changes: [
      {
        type: "feature",
        description:
          "Added an All Hands Meeting template to Supervisor Tools with generated meeting details, signature fields, and posting instructions.",
      },
    ],
  },
  {
    date: "Aug 26, 2026",
    changes: [
      {
        type: "feature",
        description:
          "Added an LSEMS Dashboard button to the LOA personnel-file sections for quick task access.",
      },
      {
        type: "feature",
        description:
          "Added automatic field filling for LOA Active and Extended forms from pasted LOA titles.",
      },
      {
        type: "feature",
        description:
          "Added six RED reinstatement formats, including on-hold, received, employment offer, contract, accepted, and denied responses.",
      },
      {
        type: "change",
        description:
          "Refreshed the app UI with a cleaner operations-focused layout, icon navigation, improved mobile controls, and more consistent page headers.",
      },
    ],
  },
  {
    date: "Aug 16th, 2026",
    changes: [
      {
        type: "feature",
        description:
          "Added Resignation to supervisor tab.",
      },
    ],
  },
  {
    date: "Aug 3, 2026",
    changes: [
      {
        type: "feature",
        description:
          "Added Course Reports (Joint, Normal, On the Spot) and Upcoming Course builders as new tabs on the BLS page.",
      },
      {
        type: "change",
        description:
          "Moved the Upcoming Course page into the BLS page.",
      },
      {
        type: "feature",
        description:
          "Added a BLS Quick Guide format, plus guide links on Course Reports (Joint opens the topic, Normal & On the Spot open the guide).",
      },
    ],
  },
  {
    date: "Jul 31, 2026",
    changes: [
      {
        type: "feature",
        description:
          "The approved LOA BBCode now appends a copy-pasteable [url] snippet for the LOA/ROH spoiler in the personnel file.",
      },
    ],
  },
  {
    date: "Jul 30, 2026",
    changes: [
      {
        type: "feature",
        description:
          "URL query-param for tabs/selectors.",
      },
      {
        type: "feature",
        description: "Added the Director role to staff credentials and the email signature.",
      },
      {
        type: "feature",
        description: "Added a 404 not-found page.",
      },
    ],
  },
  {
    date: "Jul 28, 2026",
    changes: [
      {
        type: "feature",
        description: "Added the BLS formats route.",
      },
      {
        type: "change",
        description:
          "Split Air & Rescue into separate Pilot and Mountain Rescue divisions.",
      },
    ],
  },
];
