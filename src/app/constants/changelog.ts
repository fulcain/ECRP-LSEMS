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
    date: "Sep 26, 2026",
    changes: [
      {
        type: "change",
        description:
          "Updated the Regular and Reinstatement training to the new Field Training Program: the guides, spoken notes and paperwork now match the latest templates, with TeamSpeak removed and the JTAC frequencies added.",
      },
      {
        type: "feature",
        description:
          "New under Management: Access Manager. Command+ Team and Developer can now decide, in the app, which ranks may open which tabs and pages, and the change is live for everyone within a few seconds, with no deploy.",
      },
      {
        type: "feature",
        description:
          "Add an extention so it makes it easier to fill in the data in the gov website with one click on the extention.",
      },
      {
        type: "feature",
        description:
          "Copy & Open buttons across the tools: the BLS, RED, FTD paperwork, ride-along, supervisor, email and LOA pages now copy the generated post, hand it to the extension, and open the GOV page it belongs to.",
      },
      {
        type: "feature",
        description:
          "Every time field gained a Copy Now button that fills in the current UTC time.",
      },
    ],
  },
  {
    date: "Sep 21, 2026",
    changes: [
      {
        type: "feature",
        description:
          "Division Email Templates gained signature options: two toggles that leave the 'Be well' sign-off out of the email body, and drop the recipient 'Dear' line together with the bottom signature bar - each on its own, and remembered with your compose session.",
      },
      {
        type: "feature",
        description:
          "Division Email Templates let you write your own closing message: type it and it replaces the default 'Be well,' - leave it empty to keep the default. Saved with your compose session like the other fields.",
      },
      {
        type: "feature",
        description:
          "Added a light theme. Switch between dark and light with the sun/moon toggle in the sidebar - your choice is remembered, and dark stays the default.",
      },
    ],
  },
  {
    date: "Sep 19, 2026",
    changes: [
      {
        type: "change",
        description: "The whole interface has been redesigned.",
      },
    ],
  },
  {
    date: "Sep 18, 2026",
    changes: [
      {
        type: "change",
        description:
          "The app logo has been changed to the LSEMS emblem.",
      },
    ],
  },
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
