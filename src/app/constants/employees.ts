export type EmployeeGroup =
  | "Command+"
  | "Consultants"
  | "Supervisory Staff"
  | "Master EMTs"
  | "EMTs"
  | "EMRs"
  | "Applicants";

export type EmployeeRecord = {
  callsign: string;
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

const CALLSIGN_PREFIX_ALIASES: Readonly<Record<string, string>> = {
  ALPHA: "A",
  BRAVO: "B",
  CHARLIE: "C",
  DELTA: "D",
  ECHO: "E",
  OSCAR: "O",
  ZULU: "Z",
  A: "ALPHA",
  B: "BRAVO",
  C: "CHARLIE",
  D: "DELTA",
  E: "ECHO",
  O: "OSCAR",
  Z: "ZULU",
};

function normalizeEmployeeSearchText(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

function callsignSearchTerms(callsign: string): string[] {
  const trimmed = callsign.trim().toUpperCase();
  const match = /^([A-Z]+)(.*)$/.exec(trimmed);
  if (!match) return [callsign];

  const [, prefix, suffix] = match;
  const alias = CALLSIGN_PREFIX_ALIASES[prefix];
  return alias ? [callsign, `${alias}${suffix}`] : [callsign];
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

  const searchTerms = [employee.name, ...callsignSearchTerms(employee.callsign)]
    .map(normalizeEmployeeSearchText)
    .filter(Boolean);

  return queryParts.every((part) => searchTerms.some((term) => term.includes(part)));
}

export function findEmployeeByName(
  name: string,
  employees: readonly EmployeeRecord[],
): EmployeeRecord | undefined {
  const normalized = name.trim().toLowerCase();
  return employees.find((employee) => employee.name.toLowerCase() === normalized);
}
