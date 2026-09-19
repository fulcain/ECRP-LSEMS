"use client";

import { DiscordProfileCard } from "@/app/components/staff/DiscordProfileCard";
import { StaffSettingsCard } from "@/app/components/staff/StaffSettingsCard";
import { useTabParam } from "@/app/hooks/useTabParam";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { TabBar, type Tab } from "@/components/ui/tab-bar";
import { IdCard, SlidersHorizontal } from "lucide-react";

type StaffTab = "settings" | "discord";

const tabs: Tab<StaffTab>[] = [
  {
    value: "settings",
    label: "Staff Settings",
    icon: <SlidersHorizontal className="h-4 w-4" />,
  },
  {
    value: "discord",
    label: "Discord Profile",
    icon: <IdCard className="h-4 w-4" />,
    accent: "border-indigo-400/40 bg-indigo-500/20 text-indigo-300",
  },
];

const tabValues = tabs.map((tab) => tab.value);

export default function StaffPage() {
  const [activeTab, setActiveTab] = useTabParam(
    "staff-tab",
    tabValues,
    "settings",
  );

  return (
    <PageContainer>
      <PageHeader
        title="Staff Page"
        subtitle="Save your name, signature and ranks once, and check what Discord says about you."
      />
      <TabBar
        tabs={tabs}
        active={activeTab}
        onChange={setActiveTab}
        ariaLabel="Staff page sections"
      />
      {activeTab === "discord" ? <DiscordProfileCard /> : <StaffSettingsCard />}
    </PageContainer>
  );
}
