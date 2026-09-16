/**
 * Hand-maintained change log entries consolidated into the LSEMS application.
 *
 * To add a new entry, append a `{ ... }` object to the appropriate day's
 * `entries` array, or create a new `ChangeLogDay` for a new date.
 * The page renders the days in array order, so place the most recent
 * day at the top of the array.
 *
 * Each entry has a `type` that determines its badge color:
 *
 *   • `added`   - green   (a new feature or piece of content)
 *   • `changed` - amber   (an existing feature was updated)
 *   • `fixed`   - sky     (a bug was fixed)
 *   • `removed` - rose    (something was removed)
 */
export type ChangeLogEntryType = "added" | "changed" | "fixed" | "removed";

export type ChangeLogEntry = {
  type: ChangeLogEntryType;
  description: string;
};

export type ChangeLogDay = {
  /** ISO date for this batch of changes, e.g. "2026-07-13". */
  date: string;
  entries: ChangeLogEntry[];
};

/**
 * Add new days to the **top** of this array.
 * The page renders them in reverse chronological order.
 */
export const changeLog: ChangeLogDay[] = [
  {
    date: "2026-09-05",
    entries: [
      {
        type: "changed",
        description:
          "Updated Phase 3 and Reinstatement Phase 1 phase notes & scripts - Phase 3 now covers seatbelt safety and train tracks, and Reinstatement Phase 1 has the new scene management for seatbelts and train tracks.",
      },
      {
        type: "changed",
        description:
          "Updated Phase 3 driving capabilities, scene management, and JTAC sections in both the phase notes and spoken scripts.",
      },
      {
        type: "changed",
        description:
          "Updated Phase 3 Hospitals and Fire Stations section - new Betsy vehicle locations (Sandy Fire Station, Fire Station 7, Central, Mount Zonah, Boat Dock) with updated blip images.",
      },
    ],
  },
  {
    date: "2026-08-25",
    entries: [
      {
        type: "changed",
        description:
          "Deeper dark theme with richer blacks and amber accent - background, cards, and surfaces all got a refined color palette. Header is now a smooth glass blur effect with rounded pill-style nav links.",
      },
      {
        type: "changed",
        description:
          "Cards now have a subtle gradient top-border accent and softer rounded corners. Buttons got a hover glow effect and new gradient variant. Tables have better hover states and cleaner borders.",
      },
      {
        type: "fixed",
        description:
          "Header nav link active-state bug (FT Sessions always lit up) is now properly fixed with parenthesized ternary logic.",
      },
      {
        type: "added",
        description:
          "Custom scrollbar styling for dark mode - thinner, more subtle, matches the aesthetic.",
      },
    ],
  },
  {
    date: "2026-08-24",
    entries: [
      {
        type: "changed",
        description:
          "Complete UI redesign - minimal, modern look applied across every page. New design system with refined colors, surfaces, typography, glass-morphism header, and smooth animations.",
      },
      {
        type: "fixed",
        description:
          "All tables now scroll horizontally on mobile instead of overflowing off-screen.",
      },
      {
        type: "fixed",
        description:
          "FT Sessions link in the header no longer appears active on every page.",
      },
      {
        type: "fixed",
        description:
          "Several section headings had hardcoded white text - now follows the app theme properly.",
      },
      {
        type: "added",
        description:
          "Current EMRs table now shows total, normal, and reinstated EMR counts as summary chips.",
      },
      {
        type: "added",
        description:
          "Field Training Instructor page added - phase notes, trainer info, and auto-generated certification paperwork, divisional file for FTO certifications. Accessible to FT Head, Ass Head, Command+ and FTIs.",
      },
      {
        type: "changed",
        description:
          "All copy buttons on the Command page and FTI page are now always available - empty fields keep their placeholder text so you can copy now and fill in the blanks later.",
      },
    ],
  },
  {
    date: "2026-08-23",
    entries: [
      {
        type: "added",
        description:
          "Command page is now split into tabs - EMRs, FTOs, and Emails.",
      },
      {
        type: "added",
        description:
          "Command page - Emails tab added with three email generators: FTI Promotion Email, EMR Training Time Reminder, and EMR Discharge Email.",
      },
    ],
  },
   {
    date: "2026-08-17",
    entries: [
      {
        type: "added",
        description:
          "Added scripts to each phase. Some of them are still in the Guide view.",
      },
    ],
  },
  {
    date: "2026-07-28",
    entries: [
      {
        type: "added",
        description:
          "Paperwork page tabs are now reflected in the URL (?tab=normal, ?tab=reinstatement, ?tab=civilianRideAlong) so users can bookmark or share direct links to a specific paperwork format.",
      },
      {
        type: "changed",
        description:
          "Paperwork link in the header now points to /paperwork?tab=normal for a consistent, shareable URL on arrival.",
      },
    ],
  },
  {
    date: "2026-07-27",
    entries: [
      {
        type: "changed",
        description:
          "Start Date in Create/Edit EMR forms in FT Command page now auto-fills Training Reminder Date (+21 days) and 4 Weeks (+28 days) automatically.",
      },
      {
        type: "changed",
        description:
          "Updated Phase 1 (Normal & Reinstatement) panic/backup system notes - panics/backups now appear in PD/SD dispatch with disregard instructions.",
      },
      {
        type: "changed",
        description:
          "Updated Phase 2 (Normal & Reinstatement) Breathalyser section with consent/Failure to Comply details, 0.08% BAC threshold per SAPC, and safe ride/PD-SD escalation guidelines.",
      },
      {
        type: "changed",
        description:
          "Next Phase Title now includes the selected EMR name and square brackets (e.g. [Pending Phase 1] (John Doe)) for one-click copy-pasting.",
      },
      {
        type: "added",
        description:
          "Added inline EMR selector to the Next Phase Title card so EMR can be changed without scrolling to Session Details.",
      },
      {
        type: "fixed",
        description:
          "Signature field now persists across all paperwork types (Normal FT, Reinstatement, Civilian Ride-Along) - stored in shared session context instead of per-form.",
      },
      {
        type: "fixed",
        description:
          "OOC content in phase notes no longer renders centered - complex blocks like stabilize/heal/CPR instructions now display left-aligned.",
      },
    ],
  },
       {
    date: "2026-07-25",
    entries:[
            {
        type:"fixed",
        description:"Session details and EMR Table not being edited properly."
      },
    ]
   },
     {
    date: "2026-07-15",
    entries:[
            {
        type:"changed",
        description:"Changed imgur links to imgbb."
      },
    ]
   },
   {
    date: "2026-07-14",
    entries:[
            {
        type:"added",
        description:"Added a new section in the Command page to Add, Edit, Remove and Reinstate FTOs."
      },
      {
        type:"added",
        description:"Added Civilian Ride-Along Formats to the paperwork page."
      },
            {
        type:"changed",
        description:"Change the 'Phase Paperwork' page to 'Paperwork' and change the way the type of paperwork was chosen."
      },
            {
         type:"added",
        description:"Added a feature so the rank of the user is selected automaticly."
      },
    ]
   },
  {
    date: "2026-07-13",
    entries: [
      {
        type: "added",
        description: "Added a dedicated Change Log page.",
      },
      {
        type: "added",
        description: "Added Discord authentication.",
      },
      {
        type: "added",
        description:
          "Added a copy button next to commands to make them easier to copy in the phase paperwork page.",
      },
      {
        type: "added",
        description:
          "Added an FTO Trainee creation feature to the Command page.",
      },
      {
        type: "added",
        description:
          "Added the ability for FT Command and MD Command+ to edit and delete Field Training Sessions directly from the table.",
      },
    ],
  },
  {
    date: "2026-07-11",
    entries: [
      {
        type: "added",
        description: "Added a Next Session title generator.",
      },
      {
        type: "added",
        description:
          "Added phase notes to each phase to make training easier.",
      },
    ],
  },
  {
    date: "2026-07-04",
    entries: [
      {
        type: "changed",
        description:
          "Moved the Field Training Session section to the Phase Paperwork page.",
      },
    ],
  },
];