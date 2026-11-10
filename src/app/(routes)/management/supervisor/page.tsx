"use client";

import { usePathname } from "next/navigation";
import { useTabParam } from "@/app/hooks/useTabParam";
import { ROUTES } from "@/configs/routes";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SupervisorTabs } from "./components/SupervisorTabs";
import { ContractSigningProcessor } from "./components/ContractSigningProcessor";
import { LOAProcessor } from "./components/LOAProcessor";
import { MeetingAgendaProcessor } from "./components/MeetingAgendaProcessor";
import { PromotionProcessor } from "./components/PromotionProcessor";
import { ResignationProcessor } from "./components/ResignationProcessor";
import { EmployeeDirectory } from "./components/EmployeeDirectory";

export default function SupervisorPage() {
  const pathname = usePathname();
  const [requestedTab] = useTabParam(
    "supervisor-tab",
    ["loa", "meetings", "contract", "promotions", "resignations", "employees"] as const,
    "loa",
  );
  const activeTab = pathname === ROUTES.management.supervisorStp ? "stp" : requestedTab;

  return (
    <PageContainer>
      <PageHeader
        title="Supervisor Tools"
        subtitle="Manage LOA processing, meeting agendas, contract signings, promotions, resignations, and supervisor tasks"
      />
      {/* Tab Selector + Content, at the same width as the heading above them */}
      <div className="w-full">
        <SupervisorTabs active={activeTab} />

        {/* Tab Content */}
        {activeTab === "loa" && <LOAProcessor />}
        {activeTab === "meetings" && <MeetingAgendaProcessor />}
        {activeTab === "contract" && <ContractSigningProcessor />}
        {activeTab === "promotions" && <PromotionProcessor />}
        {activeTab === "resignations" && <ResignationProcessor />}
        {activeTab === "employees" && <EmployeeDirectory />}
      </div>
    </PageContainer>
  );
}
