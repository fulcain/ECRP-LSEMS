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
