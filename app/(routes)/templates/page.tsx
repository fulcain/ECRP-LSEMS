"use client";

import React, { useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { BodyAndMainTitle } from "@/components/layout/main-and-title";
import { LOATemplate } from "./components/LOATemplate";

type TemplatesTab = "loa";

const templatesTabs: {
  value: TemplatesTab;
  label: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
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
  }, []);

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
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {templatesTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.value
                    ? `${tab.accent} scale-[1.03] shadow-lg`
                    : "border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
        </div>

        {activeTab === "loa" && <LOATemplate />}
      </div>
    </BodyAndMainTitle>
  );
}