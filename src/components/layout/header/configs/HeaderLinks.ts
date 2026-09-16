import { ROUTES } from "@/configs/routes";
import type { LucideIcon } from "lucide-react";
import { Activity, BookOpen, Clock3, FileText, Link2, Settings2, Shield, UsersRound, ClipboardList, LayoutDashboard } from "lucide-react";

export type HeaderLink = {
  label: string;
  href?: string;
  icon: LucideIcon;
  group:
    | "Workspace"
    | "Divisions"
    | "Operations"
    | "Resources"
    | "Management"
    | "System";
  /**
   * Extra route prefixes that should keep this item highlighted as the
   * active nav item. Used by section entries that own several routes - the
   * FTD entry points at its Sessions page but stays lit for every page
   * beneath `/divisions/ftd`.
   */
  match?: readonly string[];
};

/**
 * Whether a nav item should render as active for `pathname`. Matches the
 * item's own href (query string ignored) plus any `match` prefixes so a
 * multi-route workspace keeps its sidebar entry highlighted.
 */
export function isHeaderLinkActive(item: HeaderLink, pathname: string): boolean {
  const target = item.href?.split("?")[0];
  if (target && pathname === target) return true;
  return (item.match ?? []).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Sidebar navigation, in render order - the sidebar prints a section
 * heading whenever an item's `group` differs from the one before it.
 */
export const headerLinks: HeaderLink[] = [
  {
    label: "Staff Page",
    href: ROUTES.workspace.staff,
    icon: Settings2,
    group: "Workspace",
  },
  { label: "RED", href: ROUTES.divisions.red, icon: Shield, group: "Divisions" },
  { label: "BLS", href: ROUTES.divisions.bls, icon: Activity, group: "Divisions" },
  {
    label: "FTD",
    href: ROUTES.divisions.ftd.sessions,
    icon: LayoutDashboard,
    group: "Divisions",
    // Stays lit for the whole workspace, not just the Sessions page.
    match: [ROUTES.divisions.ftd.base],
  },
  {
    label: "Division Templates",
    href: ROUTES.operations.divisionTemplates,
    icon: UsersRound,
    group: "Operations",
  },
  {
    label: "Templates",
    href: ROUTES.operations.templates,
    icon: FileText,
    group: "Operations",
  },
  {
    label: "Quick Links",
    href: ROUTES.resources.quickLinks,
    icon: Link2,
    group: "Resources",
  },
  {
    label: "Availability",
    href: ROUTES.resources.availability,
    icon: Clock3,
    group: "Resources",
  },
  {
    label: "Supervisor",
    href: `${ROUTES.management.supervisor}?tab=loa`,
    icon: ClipboardList,
    group: "Management",
  },
  {
    label: "Change Log",
    href: ROUTES.system.changelog,
    icon: BookOpen,
    group: "System",
  },
];
