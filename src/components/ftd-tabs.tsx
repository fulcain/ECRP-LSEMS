"use client";

import { FTD_TABS, type FtdTabConfig, type FtdTabValue } from "@/configs/ftd-tabs";
import { BarChart3, Command, FileText, GraduationCap } from "lucide-react";
import { usePathname } from "next/navigation";
import { TabBar, type Tab } from "@/components/ui/tab-bar";

/** Icons are elements, so they are paired up here rather than in the config. */
const ICONS: Record<FtdTabValue, typeof BarChart3> = {
  sessions: BarChart3,
  paperwork: FileText,
  command: Command,
  fti: GraduationCap,
};

/**
 * Resolve the active tab from the pathname, so the bar lights up on sub-routes
 * too. Only the tabs that were rendered are considered - a page is never open
 * to someone who lacks the tab that leads to it.
 */
function activeTabFor(
  pathname: string,
  tabs: readonly FtdTabConfig[],
): FtdTabValue {
  const match = tabs.find((tab) =>
    pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  );
  return (match ?? tabs[0]).value;
}

type FtdTabsProps = {
  /**
   * The tabs this member may open. Decided by the section layout, which knows
   * the session; the bar itself never assumes access.
   */
  available: readonly FtdTabValue[];
};

export function FtdTabs({ available }: FtdTabsProps) {
  const pathname = usePathname();
  const visible = FTD_TABS.filter((tab) => available.includes(tab.value));
  if (visible.length === 0) return null;

  const tabs: Tab<FtdTabValue>[] = visible.map((tab) => ({
    ...tab,
    icon: ICONS[tab.value],
  }));

  return (
    <TabBar
      tabs={tabs}
      active={activeTabFor(pathname, visible)}
      ariaLabel="FTD workspace"
    />
  );
}
