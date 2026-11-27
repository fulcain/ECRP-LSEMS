import { EMPLOYEE_GROUPS, type EmployeeRecord } from "@/app/constants/employees";
import { validateName, validateUrl } from "@/lib/validation";

export type EmployeeRecordResult =
  | { ok: true; value: EmployeeRecord }
  | { ok: false; error: string };

export function parseEmployeeRecord(value: unknown): EmployeeRecordResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "Enter an employee record." };
  }

  const record = value as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const group = record.group;
  const govProfileUrl = typeof record.govProfileUrl === "string" ? record.govProfileUrl.trim() : "";
  const personnelFileUrl = typeof record.personnelFileUrl === "string" ? record.personnelFileUrl.trim() : "";

  const nameResult = validateName(name, "Name");
  if (!nameResult.ok) return nameResult;
  if (typeof group !== "string" || !EMPLOYEE_GROUPS.includes(group as (typeof EMPLOYEE_GROUPS)[number])) {
    return { ok: false, error: "Choose a valid employee group." };
  }
  const profileResult = validateUrl(govProfileUrl, "GOV profile link", { required: false });
  if (!profileResult.ok) return profileResult;
  const personnelResult = validateUrl(personnelFileUrl, "Personnel file link", { required: false });
  if (!personnelResult.ok) return personnelResult;

  return {
    ok: true,
    value: { name, group: group as EmployeeRecord["group"], govProfileUrl, personnelFileUrl },
  };
}

export function parseEmployeeRoster(value: unknown): EmployeeRecord[] | null {
  if (!Array.isArray(value)) return null;
  const employees: EmployeeRecord[] = [];
  const names = new Set<string>();

  for (const entry of value) {
    const parsed = parseEmployeeRecord(entry);
    if (!parsed.ok) return null;
    const key = parsed.value.name.toLocaleLowerCase("en-US");
    if (names.has(key)) return null;
    names.add(key);
    employees.push(parsed.value);
  }

  return employees;
}

