"use client";

import { useTabParam } from "@/app/hooks/useTabParam";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { TabBar, type Tab } from "@/components/ui/tab-bar";
import { ContractSigningProcessor } from "./components/ContractSigningProcessor";
import { LOAProcessor } from "./components/LOAProcessor";
import { MeetingAgendaProcessor } from "./components/MeetingAgendaProcessor";
import { PromotionProcessor } from "./components/PromotionProcessor";
import { ResignationProcessor } from "./components/ResignationProcessor";
import {
  Award,
  CalendarClock,
  FileSignature,
  FileText,
  LogOut,
} from "lucide-react";

type SupervisorTab =
  | "loa"
  | "meetings"
  | "contract"
  | "promotions"
  | "resignations";

const tabs: Tab<SupervisorTab>[] = [
  {
    value: "loa",
    label: "LOA Processing",
    icon: <FileText className="h-4 w-4" />,
    accent: "border-emerald-400/40 bg-emerald-500/20 text-emerald-300",
  },
  {
    value: "meetings",
    label: "Meetings",
    icon: <CalendarClock className="h-4 w-4" />,
    accent: "border-indigo-400/40 bg-indigo-500/20 text-indigo-300",
  },
  {
    value: "contract",
    label: "Contract Signing",
    icon: <FileSignature className="h-4 w-4" />,
    accent: "border-sky-400/40 bg-sky-500/20 text-sky-300",
  },
  {
    value: "promotions",
    label: "Promotions",
    icon: <Award className="h-4 w-4" />,
    accent: "border-amber-400/40 bg-amber-500/20 text-amber-300",
  },
  {
    value: "resignations",
    label: "Resignations",
    icon: <LogOut className="h-4 w-4" />,
    accent: "border-rose-400/40 bg-rose-500/20 text-rose-300",
  },
];

const tabValues = tabs.map((tab) => tab.value);

export default function SupervisorPage() {
  const [activeTab, setActiveTab] = useTabParam(
    "supervisor-tab",
    tabValues,
    "loa",
  );

  return (
    <PageContainer>
      <PageHeader
        title="Supervisor Tools"
        subtitle="Manage LOA processing, meeting agendas, contract signings, promotions, resignations, and supervisor tasks"
      />
      {/* Tab Selector + Content, at the same width as the heading above them */}
      <div className="w-full">
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === "loa" && <LOAProcessor />}
        {activeTab === "meetings" && <MeetingAgendaProcessor />}
        {activeTab === "contract" && <ContractSigningProcessor />}
        {activeTab === "promotions" && <PromotionProcessor />}
        {activeTab === "resignations" && <ResignationProcessor />}
      </div>
    </PageContainer>
  );
}
