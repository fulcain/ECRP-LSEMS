"use client";

import { DiscordProfileCard } from "@/app/components/staff/DiscordProfileCard";
import { StaffSettingsCard } from "@/app/components/staff/StaffSettingsCard";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { BodyAndMainTitle } from "@/components/layout/main-and-title";
import { TabBar, type Tab } from "@/components/ui/tab-bar";
import { IdCard, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef } from "react";

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

export default function StaffPage() {
  const [activeTab, setActiveTab] = useLocalStorage<StaffTab>(
    "staff-tab",
    "settings",
  );

  // The URL query wins over localStorage on first render, so a shared link
  // such as ?tab=discord opens that tab.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("tab") as StaffTab | null;
    if (fromUrl && tabs.some((tab) => tab.value === fromUrl)) {
      setActiveTab(fromUrl);
    }
  }, [setActiveTab]);

  // Keep the URL in step with the active tab (skipping the first render).
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("tab", activeTab);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }, [activeTab]);

  return (
    <BodyAndMainTitle
      title="Staff Page"
      description="Save your name, signature and ranks once, and check what Discord says about you."
    >
      <TabBar
        tabs={tabs}
        active={activeTab}
        onChange={setActiveTab}
        ariaLabel="Staff page sections"
      />
      {activeTab === "discord" ? <DiscordProfileCard /> : <StaffSettingsCard />}
    </BodyAndMainTitle>
  );
}
