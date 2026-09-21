/**
 * The FTD workspace tabs, in bar order.
 *
 * Data only - no icons and no JSX, because two sides read this list: the
 * section layout (`app/(routes)/divisions/ftd/layout.tsx`, a server component)
 * leaves out the tabs a member may not open, and the tab bar renders the rest
 * on the client, where it resolves each tab's icon.
 *
 * A tab's `href` is the page behind it, so visibility is decided by the same
 * route rule the middleware enforces - a member is never shown a tab they
 * would be bounced out of.
 *
 * `title`/`description` are the page heading the section shell renders for
 * that tab, above the bar. They live here, next to the label, so the heading
 * and the tab it belongs to cannot drift apart - pages render content only.
 */

import { ROUTES } from "@/configs/routes";

export type FtdTabValue = "sessions" | "paperwork" | "command" | "fti";

export type FtdTabConfig = {
  value: FtdTabValue;
  label: string;
  href: string;
  /** The page heading shown above the bar while this tab is open. */
  title: string;
  description: string;
  /** Tailwind classes for the active pill. */
  accent: string;
};

export const FTD_TABS = [
  {
    value: "sessions",
    label: "Sessions",
    href: ROUTES.divisions.ftd.sessions,
    title: "FT Session dashboard",
    description:
      "Monitor session reports, employee progress, and monthly training activity from one workspace.",
    accent: "border-emerald-300/40 dark:border-emerald-400/40 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  },
  {
    value: "paperwork",
    label: "Paperwork",
    href: ROUTES.divisions.ftd.paperwork,
    title: "Paperwork",
    description: "Choose a paperwork format to begin.",
    accent: "border-sky-300/40 dark:border-sky-400/40 bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300",
  },
  {
    value: "command",
    label: "Command",
    href: ROUTES.divisions.ftd.command,
    title: "Command Page",
    description: "Manage EMRs, FTOs, and ready-to-send emails from one place.",
    accent: "border-indigo-300/40 dark:border-indigo-400/40 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
  },
  {
    value: "fti",
    label: "FTI",
    href: ROUTES.divisions.ftd.fti,
    title: "Field Training Instructor",
    description:
      "Phase notes, trainer info, and auto-generated FTO certification paperwork.",
    accent: "border-amber-300/40 dark:border-amber-400/40 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300",
  },
] as const satisfies readonly FtdTabConfig[];
