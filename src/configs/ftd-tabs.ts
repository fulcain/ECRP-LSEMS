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
 */

import { ROUTES } from "@/configs/routes";

export type FtdTabValue = "sessions" | "paperwork" | "command" | "fti";

export type FtdTabConfig = {
  value: FtdTabValue;
  label: string;
  href: string;
  /** Tailwind classes for the active pill. */
  accent: string;
};

export const FTD_TABS = [
  {
    value: "sessions",
    label: "Sessions",
    href: ROUTES.divisions.ftd.sessions,
    accent: "border-emerald-400/40 bg-emerald-500/20 text-emerald-300",
  },
  {
    value: "paperwork",
    label: "Paperwork",
    href: ROUTES.divisions.ftd.paperwork,
    accent: "border-sky-400/40 bg-sky-500/20 text-sky-300",
  },
  {
    value: "command",
    label: "Command",
    href: ROUTES.divisions.ftd.command,
    accent: "border-indigo-400/40 bg-indigo-500/20 text-indigo-300",
  },
  {
    value: "fti",
    label: "FTI",
    href: ROUTES.divisions.ftd.fti,
    accent: "border-amber-400/40 bg-amber-500/20 text-amber-300",
  },
] as const satisfies readonly FtdTabConfig[];
