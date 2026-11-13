"use client";

import { Crosshair, FileText, Pill } from "lucide-react";
import { useTabParam } from "@/app/hooks/useTabParam";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { TabBar, type Tab } from "@/components/ui/tab-bar";
import { LOATemplate } from "./components/LOATemplate";
import { FirearmDischargeTemplate } from "./components/FirearmDischargeTemplate";
import { PrescriptionsTab } from "./components/prescriptions/PrescriptionsTab";

type TemplatesTab = "loa" | "firearm-discharge" | "prescriptions";

const templatesTabs: Tab<TemplatesTab>[] = [
  {
    value: "loa",
    label: "LOA",
    icon: <FileText className="h-4 w-4" />,
    accent: "border-emerald-300/40 dark:border-emerald-400/40 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  },
  {
    value: "firearm-discharge",
    label: "Firearm Discharge",
    icon: <Crosshair className="h-4 w-4" />,
    accent: "border-red-300/40 dark:border-red-400/40 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
  },
  {
    value: "prescriptions",
    label: "Prescriptions",
    icon: <Pill className="h-4 w-4" />,
    accent: "border-violet-300/40 dark:border-violet-400/40 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300",
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
        {activeTab === "firearm-discharge" && <FirearmDischargeTemplate />}
        {activeTab === "prescriptions" && <PrescriptionsTab />}
      </div>
    </PageContainer>
  );
}