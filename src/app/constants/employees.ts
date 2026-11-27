export type EmployeeGroup =
  | "Command+"
  | "Consultants"
  | "Supervisory Staff"
  | "Master EMTs"
  | "EMTs"
  | "EMRs"
  | "Applicants";

export type EmployeeRecord = {
  name: string;
  group: EmployeeGroup;
  govProfileUrl: string;
  personnelFileUrl: string;
};

export const EMPLOYEE_ROSTER_KEY = "employee-roster";

export const EMPLOYEE_GROUPS: readonly EmployeeGroup[] = [
  "Command+",
  "Consultants",
  "Supervisory Staff",
  "Master EMTs",
  "EMTs",
  "EMRs",
  "Applicants",
];

function normalizeEmployeeSearchText(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

export function employeeMatchesSearch(
  employee: EmployeeRecord,
  search: string,
): boolean {
  const queryParts = search
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .map(normalizeEmployeeSearchText)
    .filter(Boolean);
  if (queryParts.length === 0) return true;

  const searchTerms = [normalizeEmployeeSearchText(employee.name)].filter(Boolean);

  return queryParts.every((part) => searchTerms.some((term) => term.includes(part)));
}

export function findEmployeeByName(
  name: string,
  employees: readonly EmployeeRecord[],
): EmployeeRecord | undefined {
  const normalized = name.trim().toLowerCase();
  return employees.find((employee) => employee.name.toLowerCase() === normalized);
}
