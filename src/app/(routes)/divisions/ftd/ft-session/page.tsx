import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { hasSessionEditAccess } from "@/lib/role-config";

import { EmployeeStatsTable } from "@/components/employee-stats/employee-stats-table";
import { AllDataTable } from "@/components/all-data-table/all-data-table";
import { MonthlySessionStatsTable } from "@/components/session-stats/monthly-session-stats-table";

/** Content only: the FTD section layout owns the container and the heading. */
export default async function FtSessionPage() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? await verifySessionToken(token) : null;

  const canEditFT = payload
    ? hasSessionEditAccess(payload.roles, payload.discordId)
    : false;

  return (
    <div className="space-y-12">
      <AllDataTable canEditFT={canEditFT} />
      <EmployeeStatsTable />
      <MonthlySessionStatsTable />
    </div>
  );
}
