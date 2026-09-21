"use client";

import { FileText } from "lucide-react";
import { useTabParam } from "@/app/hooks/useTabParam";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { TabBar, type Tab } from "@/components/ui/tab-bar";
import { LOATemplate } from "./components/LOATemplate";

type TemplatesTab = "loa";

const templatesTabs: Tab<TemplatesTab>[] = [
  {
    value: "loa",
    label: "LOA",
    icon: <FileText className="h-4 w-4" />,
    accent: "border-emerald-300/40 dark:border-emerald-400/40 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  },
];

const tabValues = templatesTabs.map((tab) => tab.value);

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useTabParam(
    "templates-tab",
    tabValues,
    "loa",
  );

  return (
    <PageContainer>
      <PageHeader
        title="Templates"
        subtitle="Generate ready-to-post templates for the government website."
      />
      {/* At the same width as the heading above it */}
      <div className="w-full">
        <TabBar
          tabs={templatesTabs}
          active={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "loa" && <LOATemplate />}
      </div>
    </PageContainer>
  );
}