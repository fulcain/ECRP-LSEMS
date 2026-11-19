import { ROUTES } from "@/configs/routes";
import {
  GENERATED_DIVISIONS,
  GENERATED_PAPERWORK_PAGES,
} from "@/configs/generated/divisions";
import type { Division } from "@/configs/roles";
import { isPaperworkMakerAvailable } from "@/lib/paperwork/availability";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  ClipboardList,
  Clock3,
  FileText,
  GraduationCap,
  Link2,
  Megaphone,
  MessageSquare,
  Plane,
  Wand2,
  Puzzle,
  Shield,
  ShieldCheck,
  Settings2,
  UserCog,
  UsersRound,
} from "lucide-react";

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
    | "System"
    | "Development";
  /**
   * Extra route prefixes that should keep this item highlighted as the
   * active nav item. Used by section entries that own several routes - the
   * FTD entry points at its Sessions page but stays lit for every page
   * beneath `/divisions/ftd`.
   */
  match?: readonly string[];
  children?: readonly { label: string; href: string; description?: string; icon?: LucideIcon }[];
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
  {
    label: "A&R",
    href: ROUTES.divisions.ar,
    icon: Plane,
    group: "Divisions",
  },
  { label: "BLS", href: ROUTES.divisions.bls, icon: Activity, group: "Divisions" },
  {
    label: "FTD",
    href: ROUTES.divisions.ftd.sessions,
    icon: GraduationCap,
    group: "Divisions",
    // Stays lit for the whole workspace, not just the Sessions page.
    match: [ROUTES.divisions.ftd.base],
  },
  // Divisions the Paperwork Maker generated: one entry each, read from the same
  // file that gives the division its page, so adding one is a run of the maker
  // and no edit here.
  ...Object.values(GENERATED_DIVISIONS as Record<string, Division>).flatMap(
    (division) =>
      division.route
        ? [
            {
              label: division.label,
              href: division.route,
              icon: FileText,
              group: "Divisions" as const,
              match: [division.route],
            },
          ]
        : [],
  ),
  // Paperwork generated for a division the app already has: its own entry, so
  // the division's hand-written page stays where it is. It is named the division
  // is named, not "<division> Paperwork" - the sidebar lists pages by the thing
  // they are, not by the file the maker happened to write.
  ...Object.values(
    GENERATED_PAPERWORK_PAGES as Record<
      string,
      { label: string; route: string }
    >,
  ).flatMap((entry) =>
    entry.route
      ? [
          {
            label: entry.label,
            href: entry.route,
            icon: FileText,
            group: "Divisions" as const,
            match: [entry.route],
          },
        ]
      : [],
  ),
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
    label: "Browser Extension",
    href: ROUTES.resources.browserExtension,
    icon: Puzzle,
    group: "Resources",
  },
  {
    // Open to every employee (see `DEFAULT_PAGE_ROLES`), so a group change is
    // never waiting on one rank being online.
    label: "User Groups",
    href: ROUTES.resources.userGroups,
    icon: UserCog,
    group: "Resources",
  },
  {
    // Restricted to Employee and Legal Faction Management.
    label: "App Bugs and Features",
    href: ROUTES.resources.report,
    icon: MessageSquare,
    group: "Resources",
  },
  {
    label: "Supervisor",
    href: `${ROUTES.management.supervisor}?tab=loa`,
    icon: ClipboardList,
    group: "Management",
  },
  {
    // Command tools are decided in the code, so the sidebar is filtered with
    // the same list the route gate enforces and nobody else ever sees this.
    label: "Command",
    href: ROUTES.management.command,
    icon: Megaphone,
    group: "Management",
  },
  {
    // Rendered only for CommandPlusTeam: the sidebar is filtered with the same
    // rule the route gate enforces, and `/management/access` opens to no one
    // else. Every other member never sees this entry.
    label: "Access Manager",
    href: ROUTES.management.access,
    icon: ShieldCheck,
    group: "Management",
  },
  {
    label: "Change Log",
    href: ROUTES.system.changelog,
    icon: BookOpen,
    group: "System",
    children: [
      {
        label: "Report Form",
        href: ROUTES.resources.report,
        description: "Send bugs and feature ideas to the developer.",
        icon: MessageSquare,
      },
    ],
  },
  // A development server is the only place it exists at all, and the page and
  // its API refuse everyone but a DISCORD_ADMIN_IDS developer. The entry is
  // added here rather than in the sidebar filter so the nav never advertises a
  // tool a deployment cannot run.
  ...(isPaperworkMakerAvailable()
    ? [
        {
          label: "Paperwork Maker",
          href: ROUTES.development.paperworkMaker,
          icon: Wand2,
          group: "Development" as const,
        },
      ]
    : []),
];
