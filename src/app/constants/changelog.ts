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
        type: "feature",
        description:
          "New under Management: Access Manager. CommandPlusTeam - and the developer ids in DISCORD_ADMIN_IDS - can now decide, in the app, which ranks may open which tabs and pages, and the change is live for everyone within a few seconds, with no deploy. It covers the four FTD tabs and every sidebar page, a rank with no Discord id is flagged because granting it would do nothing, and the Access Manager itself is locked so the page that decides access cannot be edited away by the people using it.",
      },
      {
        type: "change",
        description:
          "Nothing changes until someone edits a row: the rules in configs/roles.ts stay the default, only what you change is stored, and with no store connected the app behaves exactly as before while the editor says so.",
      },
      {
        type: "change",
        description:
          "A row now tells you when it decides nothing. A stored row that adds or drops only ranks the gate cannot see - no Discord id - or ranks that keep every page anyway is marked no effect, so a change that changes nothing no longer looks like a change.",
      },
      {
        type: "change",
        description:
          "Access now lives in one place. The per-route rules are gone from configs/roles.ts - the permission matrix decides every page, and a page with no row is open to every employee rather than following a rule in the code, so the same page can no longer be described two ways. Command+ keeps every page, the Access Manager stays locked in the code, and the divisions, ranks and directors are untouched: they are what the Staff Page, the templates and the paperwork read.",
      },
      {
        type: "change",
        description:
          "CommandPlusTeam now keeps every page, like the Command ranks do. The role that administers the permission matrix could previously be locked out of the app by a row - it reached the FTD section only because it happens to be an FTD rank, and was refused the Staff Page, Change Log, Templates and Quick Links. An edit can narrow a page, but never against the people deciding it.",
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
