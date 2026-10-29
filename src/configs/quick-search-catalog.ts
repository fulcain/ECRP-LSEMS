import { AR_PAPERWORK } from "@/app/(routes)/divisions/ar/components/paperwork-documents";
import { BLS_PAPERWORK } from "@/app/(routes)/divisions/bls/components/paperwork-documents";
import { RED_PAPERWORK } from "@/app/(routes)/divisions/red/components/paperwork-documents";
import { FTD_PAPERWORK_GROUPS } from "@/configs/ftd-paperwork-documents";
import { FTD_COMMAND_TABS } from "@/configs/ftd-command-tabs";
import { UPCOMING_COURSES } from "@/configs/bls-upcoming-courses";
import { ROUTES } from "@/configs/routes";
import {
  SUPERVISOR_SEARCH_TABS,
  supervisorSearchHref,
} from "@/configs/supervisor-search-tabs";

export type QuickSearchDestination = {
  label: string;
  href: string;
  route: string;
  group: string;
  keywords?: string;
  privileged?: boolean;
};

const divisionDocuments = (
  documents: readonly { value: string; label: string }[],
  route: string,
  group: string,
  param: "format" | "tab",
): QuickSearchDestination[] =>
  documents.map((document) => ({
    label: document.label,
    href: `${route}?${param}=${document.value}`,
    route,
    group,
  }));

export const QUICK_SEARCH_CATALOG: readonly QuickSearchDestination[] = [
  ...divisionDocuments(
    BLS_PAPERWORK.flatMap((group) => group.documents),
    ROUTES.divisions.bls,
    "BLS",
    "format",
  ),
  ...UPCOMING_COURSES.map((action) => ({
    label: `Upcoming Courses · ${action.label}`,
    href: `${ROUTES.divisions.bls}?format=${action.value}`,
    route: ROUTES.divisions.bls,
    group: "BLS",
  })),
  ...divisionDocuments(
    RED_PAPERWORK.flatMap((group) => group.documents),
    ROUTES.divisions.red,
    "RED",
    "format",
  ),
  ...divisionDocuments(
    AR_PAPERWORK.flatMap((group) => group.documents),
    ROUTES.divisions.ar,
    "A&R",
    "format",
  ),
  ...divisionDocuments(
    FTD_PAPERWORK_GROUPS.flatMap((group) => group.documents),
    ROUTES.divisions.ftd.paperwork,
    "FTD Paperwork",
    "tab",
  ),
  ...FTD_COMMAND_TABS.map((tab) => ({
    label: `FTD Command · ${tab.label}`,
    href: `${ROUTES.divisions.ftd.command}?tab=${tab.value}`,
    route: ROUTES.divisions.ftd.command,
    group: "FTD Command",
    ...(tab.value === "ftp" ? { privileged: true } : {}),
  })),
  {
    label: "Staff Settings",
    href: `${ROUTES.workspace.staff}?tab=settings`,
    route: ROUTES.workspace.staff,
    group: "Staff Page",
  },
  {
    label: "Discord Profile",
    href: `${ROUTES.workspace.staff}?tab=discord`,
    route: ROUTES.workspace.staff,
    group: "Staff Page",
  },
  {
    label: "LOA",
    href: `${ROUTES.operations.templates}?tab=loa`,
    route: ROUTES.operations.templates,
    group: "Templates",
  },
  {
    label: "Firearm Discharge",
    href: `${ROUTES.operations.templates}?tab=firearm-discharge`,
    route: ROUTES.operations.templates,
    group: "Templates",
  },
  ...SUPERVISOR_SEARCH_TABS.map((tab) => ({
    label: tab.label,
    href: supervisorSearchHref(tab.value),
    route: ROUTES.management.supervisor,
    group: "Supervisor",
    keywords: "Management Supervisor Tools",
  })),
  ...([
    { label: "Recruitment", value: "recruitment" },
    { label: "Reinstatement", value: "reinstatement" },
    { label: "EMT-P", value: "emt-p" },
  ] as const).map((tab) => ({
    label: `Contract Signing · ${tab.label}`,
    href: `${ROUTES.management.supervisor}?tab=contract&subTab=${tab.value}`,
    route: ROUTES.management.supervisor,
    group: "Supervisor",
    keywords: "Management Contract Signing",
  })),
];
