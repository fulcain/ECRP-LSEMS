import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { hasSessionEditAccess } from "@/lib/role-config";

import { EmployeeStatsTable } from "@/components/employee-stats/employee-stats-table";
import { AllDataTable } from "@/components/all-data-table/all-data-table";
import { MonthlySessionStatsTable } from "@/components/session-stats/monthly-session-stats-table";
import { PageContainer } from "@/components/ui/page-container";

export default async function FtSessionPage() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? await verifySessionToken(token) : null;

  const canEditFT = payload
    ? hasSessionEditAccess(payload.roles, payload.discordId)
    : false;

  return (
    <PageContainer className="space-y-12">
      <header className="mb-2 flex flex-col items-start gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">LSEMS Operations · FTD</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">FT Session dashboard</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">Monitor session reports, employee progress, and monthly training activity from one workspace.</p>
      </header>

      <AllDataTable canEditFT={canEditFT} />
      <EmployeeStatsTable />
      <MonthlySessionStatsTable />
    </PageContainer>
  );
}
