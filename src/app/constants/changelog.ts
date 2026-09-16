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
          "The role-id tooling is gone: `src/configs/roles.ts` is maintained by hand, and the check that matters now runs in the app - every page load re-reads your Discord roles and resolves them against that registry, so a wrong or stale id shows up immediately.",
      },
      {
        type: "change",
        description:
          "`id: null` in the registry now means \"the guild has no such role\" rather than \"not collected yet\". Such an entry is inert: it identifies nobody, and a gate whose ids are all blank denies rather than opening.",
      },
      {
        type: "feature",
        description:
          "Your Discord roles are now re-read on every page load, so a rank added or removed in Discord shows up on the next reload - sidebar and page access included - instead of at the next sign-in.",
      },
      {
        type: "change",
        description:
          "The Staff Page re-applies what Discord says on every load, so a promotion lands in your saved rank, director role and division ranks without pressing anything. Anything Discord cannot see is left exactly as you set it, and the Sync from Discord button re-reads on the spot.",
      },
      {
        type: "change",
        description:
          "Discord reads are spaced out - one per page load at most, none within seconds of the last - and a refresh that Discord refuses keeps your cached session rather than signing you out.",
      },
      {
        type: "change",
        description:
          "Access is now one readable table: Employee opens the six shared pages (Staff Page, Division Templates, Templates, Quick Links, Availability, Change Log), a division's ranks open that whole division section, Command+ opens every page, the Supervisor role opens the supervisor tools and nothing else, and a director opens the divisions their role covers.",
      },
      {
        type: "change",
        description:
          "Holding two of those sees the union - an employee who is also in FTD gets the department pages and the FTD workspace, with no extra rank required for it.",
      },
      {
        type: "feature",
        description:
          "Ranks and signatures are entered once, on the Staff Page: the paperwork forms prefill their rank and signature from it, and the shared signature bar above the FTD email tools fills its name, rank, FTD rank and signature from it, with a From Staff Page button to re-read after a change.",
      },
      {
        type: "feature",
        description:
          "The Staff Page gained a Discord Profile tab: your account (avatar, handle, user id), the rank, director title and division ranks the app resolved from your roles, and which of your Discord roles it recognised.",
      },
      {
        type: "feature",
        description:
          "`npm run routes:report` prints the route tree and who each page opens to, read from the config itself, so the access model can be checked without reading the code.",
      },
      {
        type: "change",
        description:
          "The sidebar is more compact, with smaller padding and denser link rows, so more of the navigation fits without scrolling.",
      },
      {
        type: "change",
        description:
          "Paperwork session details now survive a reload: the trainer, date, times and signature already filled in are restored when you come back to the page.",
      },
      {
        type: "change",
        description:
          "The sidebar's brand now links to the app's entry point instead of FT Sessions, so it no longer drops members of other sections on an access-denied page.",
      },
      {
        type: "change",
        description:
          "Every page now lives under its sidebar section - `/divisions/ftd/ft-session` and the rest - and the FTD tabs are real links between those routes, with the tab bar rendered once for the whole section.",
      },
      {
        type: "change",
        description:
          "Older flat links such as `/paperwork` and `/ft-session` permanently redirect to their new addresses, so existing bookmarks keep working.",
      },
      {
        type: "feature",
        description:
          "Every Discord role id now lives in one registry, so a rank's display name and role id can't drift apart between divisions, directors and access rules.",
      },
      {
        type: "feature",
        description:
          "The Staff Page now detects your rank, your division ranks and any director role from your Discord roles and fills in the blanks for you, with a Sync from Discord button to re-check after a promotion.",
      },
      {
        type: "feature",
        description:
          "A division's page is now gated on that division's own Discord ranks, so `/divisions/bls` is for BLS members and `/divisions/red` for RED, while department leadership (the Chief ranks, Command, the Consultant position and the directors) can open any of them.",
      },
      {
        type: "feature",
        description:
          "Divisions are declared once, in `DIVISIONS` in `src/configs/roles.ts`: the entry gives the division its rank list, its `route` gates that page, and its order drives the division selector, Quick Links and the Staff Page - so adding a division there is all it takes.",
      },
      {
        type: "change",
        description:
          "The Employee role is now in the registry, as the base membership role every LSEMS employee holds rather than a promotion rung.",
      },
      {
        type: "feature",
        description:
          "Belonging to a division now counts like holding a rank in it: each division declares the membership role its members hold, so a BLS or RED member with no rank of their own can open their division's page and sees it in the sidebar. The Staff Page and Discord Profile list those divisions too, marked as membership rather than a rank.",
      },
      {
        type: "change",
        description:
          "Sync from Discord now clears a rank, division rank or director role that has been removed in Discord, instead of leaving the last known value behind forever. The automatic fill on page load still only adds, so a value Discord cannot see is never mistaken for no value.",
      },
      {
        type: "change",
        description:
          "Re-reading your roles now re-renders the page, so the sidebar and the division tabs - which are decided by the server - reflect a section you just gained or lost immediately, rather than after a sign-out. The button also always asks Discord instead of sometimes answering from cache, and reports whether it could: a sign-in older than this feature says so and offers to sign you in again instead of doing nothing.",
      },
      {
        type: "change",
        description:
          "The detected-roles panel no longer disappears when Discord stops reporting a rank, so the Sync button and the result of pressing it stay visible when a role is removed.",
      },
      {
        type: "change",
        description:
          "Quick Links lists every division the app declares (Fire Safety, Lifeguard and Internal Affairs included), because the page and the division selector read one list instead of two.",
      },
      {
        type: "change",
        description:
          "An access-denied page now names the division it belongs to, and a division whose roles have no ids says so at boot instead of passing silently.",
      },
      {
        type: "change",
        description:
          "A division page is open to that division's ranks, to Command+, and to the director that covers it - a director's coverage is written once, on the division, and read back by both the gate and the director's signature.",
      },
      {
        type: "feature",
        description:
          "The FTD workspace is the members-only division: its pages need an FTD rank or department leadership, and `/` now sends each member to the first page their roles open - FT Sessions for a trainer, the Staff Page for everyone else - instead of landing everyone on FTD.",
      },
      {
        type: "change",
        description:
          "The sidebar now lists only the pages a member may open, and shows no navigation at all when signed out, because the server filters it with the same rules the routes use.",
      },
      {
        type: "change",
        description:
          "Nav links that carry a tab in the query string, such as the Supervisor entry, are now gated on their path like any other route instead of slipping past their rule.",
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
