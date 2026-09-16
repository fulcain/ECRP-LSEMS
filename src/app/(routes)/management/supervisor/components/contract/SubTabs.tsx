"use client";

import { TabBar, type Tab } from "@/components/ui/tab-bar";
import type { ContractTab } from "./types";
import { workflows } from "./workflows";

type SubTabsProps = {
  activeTab: ContractTab;
  onChange: (tab: ContractTab) => void;
};

const SUB_TABS: Tab<ContractTab>[] = workflows.map((wf) => ({
  value: wf.value,
  label: wf.shortLabel,
  icon: wf.icon,
  accent: wf.accent,
}));

export function SubTabs({ activeTab, onChange }: SubTabsProps) {
  return (
    <TabBar
      tabs={SUB_TABS}
      active={activeTab}
      onChange={onChange}
      ariaLabel="Contract workflows"
      size="sm"
      divider={false}
      className="mb-0"
    />
  );
}
