"use client";

import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { BodyAndMainTitle } from "@/components/layout/main-and-title";
import { ContractSigningProcessor } from "./components/ContractSigningProcessor";
import { LOAProcessor } from "./components/LOAProcessor";
import { MeetingAgendaProcessor } from "./components/MeetingAgendaProcessor";
import { PromotionProcessor } from "./components/PromotionProcessor";
import {
  Award,
  CalendarClock,
  FileSignature,
  FileText,
} from "lucide-react";
import React from "react";

type SupervisorTab = "loa" | "meetings" | "contract" | "promotions";

const tabs: {
  value: SupervisorTab;
  label: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
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
];

export default function SupervisorPage() {
  const [activeTab, setActiveTab] = useLocalStorage<SupervisorTab>(
    "supervisor-tab",
    "loa"
  );

  return (
    <BodyAndMainTitle
      title="Supervisor Tools"
      description="Manage LOA processing, meeting agendas, contract signings, promotions, and supervisor tasks"
    >
      {/* Tab Selector */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
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

      {/* Tab Content */}
      {activeTab === "loa" && <LOAProcessor />}
      {activeTab === "meetings" && <MeetingAgendaProcessor />}
      {activeTab === "contract" && <ContractSigningProcessor />}
      {activeTab === "promotions" && <PromotionProcessor />}
    </BodyAndMainTitle>
  );
}
