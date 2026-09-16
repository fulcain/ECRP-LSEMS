"use client";

import { useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { BodyAndMainTitle } from "@/components/layout/main-and-title";
import { TabBar, type Tab } from "@/components/ui/tab-bar";
import { LOATemplate } from "./components/LOATemplate";

type TemplatesTab = "loa";

const templatesTabs: Tab<TemplatesTab>[] = [
  {
    value: "loa",
    label: "LOA",
    icon: <FileText className="h-4 w-4" />,
    accent: "border-emerald-400/40 bg-emerald-500/20 text-emerald-300",
  },
];

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useLocalStorage<TemplatesTab>(
    "templates-tab",
    "loa",
  );

  // Sync initial tab from URL query param (takes priority over localStorage)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("tab") as TemplatesTab | null;
    if (fromUrl && templatesTabs.some((t) => t.value === fromUrl)) {
      setActiveTab(fromUrl);
    }
  }, [setActiveTab]);

  // Sync URL when tab changes (skip initial mount)
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
      title="Templates"
      description="Generate ready-to-post templates for the government website."
    >
      <div className="mx-auto w-full max-w-5xl">
        <TabBar
          tabs={templatesTabs}
          active={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "loa" && <LOATemplate />}
      </div>
    </BodyAndMainTitle>
  );
}