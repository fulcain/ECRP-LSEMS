import employeeSeed from "@/lib/employee-roster-seed.json";
import {
  EMPLOYEE_ROSTER_KEY,
  type EmployeeRecord,
} from "@/app/constants/employees";
import { parseEmployeeRoster } from "@/lib/employee-records";
import {
  isGlobalConfigWritable,
  readGlobalConfigItem,
  writeGlobalConfigItem,
} from "@/lib/global-config-store";

// Used only to create the Vercel item the first time an authorized editor opens the directory.
const EMPLOYEE_ROSTER_SEED = employeeSeed as EmployeeRecord[];

export function employeeRosterFallback(): EmployeeRecord[] {
  return [...EMPLOYEE_ROSTER_SEED];
}

export type EmployeeRosterRead =
  | { ok: true; employees: EmployeeRecord[]; storedInConfig: boolean }
  | { ok: false; error: string };

/** Read the live roster, optionally copying the old code list into a new config item. */
export async function readEmployeeRoster(options?: {
  initializeIfMissing?: boolean;
}): Promise<EmployeeRosterRead> {
  const read = await readGlobalConfigItem(EMPLOYEE_ROSTER_KEY, {
    consistentRead: true,
  });
  if (!read.ok) {
    return {
      ok: false,
      error:
        read.reason === "not-configured"
          ? "Roster storage is unavailable."
          : "The employee roster could not be loaded.",
    };
  }

  if (read.value === null) {
    const seed = parseEmployeeRoster(EMPLOYEE_ROSTER_SEED);
    if (!seed) {
      return { ok: false, error: "The employee roster migration data is invalid." };
    }
    if (!options?.initializeIfMissing || !isGlobalConfigWritable()) {
      return { ok: true, employees: seed, storedInConfig: false };
    }

    const write = await writeGlobalConfigItem(EMPLOYEE_ROSTER_KEY, seed);
    if (!write.ok) {
      return {
        ok: false,
        error: "The employee roster could not be initialized.",
      };
    }
    return { ok: true, employees: seed, storedInConfig: true };
  }

  const employees = parseEmployeeRoster(read.value);
  return employees
    ? { ok: true, employees, storedInConfig: true }
    : { ok: false, error: "The employee roster data is invalid." };
}

export async function writeEmployeeRoster(
  employees: readonly EmployeeRecord[],
) {
  const parsed = parseEmployeeRoster(employees);
  if (!parsed) {
    return {
      ok: false as const,
      reason: "invalid-roster" as const,
      detail: "The employee roster is invalid.",
    };
  }
  const result = await writeGlobalConfigItem(EMPLOYEE_ROSTER_KEY, parsed);
  return result.ok
    ? result
    : {
        ok: false as const,
        reason: result.reason,
        detail: "The employee roster could not be saved.",
      };
}
