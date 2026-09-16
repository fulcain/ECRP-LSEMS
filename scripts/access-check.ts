#!/usr/bin/env node
/**
 * Asserts the route access model, and prints it as a table.
 *
 * The rules live in `src/configs/roles.ts` and this reads them through the
 * app's own `@/` alias (`scripts/lib/ts-config-loader.mjs`), so it checks what
 * the middleware actually enforces. Run it after touching a division, a rank
 * list or an access list:
 *
 *   npm run routes:check
 *
 * Ranks with no Discord id can't identify anyone, so this gives them throwaway
 * snowflakes in memory - nothing on disk is written, and a division's gate can
 * be tested as if every rank had one.
 */

import { headerLinks } from "@/components/layout/header/configs/HeaderLinks";
import { ROUTES } from "@/configs/routes";
import { ROLES, type RoleName } from "@/configs/roles";

// Importing role-config logs one warning per division whose ranks have no ids.
// This run hands those ranks throwaway ids, so that warning would contradict
// the table below - silence it and keep the boot behaviour where it belongs,
// in the app.
const bootWarnings = console.warn;
console.warn = () => {};
const { filterAccessibleLinks, landingRouteFor, userHasAccess } = await import(
  "@/lib/role-config"
);
console.warn = bootWarnings;

const SYNTHETIC_PREFIX = "9900000000000000"; // 16 digits + a 3-digit index

for (const [index, alias] of (Object.keys(ROLES) as RoleName[]).entries()) {
  if (ROLES[alias].id) continue;
  (ROLES[alias] as { id: string | null }).id = `${SYNTHETIC_PREFIX}${String(
    index,
  ).padStart(3, "0")}`;
}

/** The snowflakes a persona holds, from the registry. */
function member(...aliases: RoleName[]): string[] {
  return aliases.map((alias) => {
    const id = ROLES[alias].id;
    if (!id) throw new Error(`no id for ${alias}`);
    return id;
  });
}

interface Section {
  name: string;
  paths: readonly string[];
}

const SHARED_PATHS = [
  ROUTES.workspace.staff,
  ROUTES.operations.divisionTemplates,
  ROUTES.operations.templates,
  ROUTES.resources.quickLinks,
  ROUTES.resources.availability,
  ROUTES.system.changelog,
] as const;

const sections: Section[] = [
  { name: "shared", paths: SHARED_PATHS },
  { name: "RED", paths: [ROUTES.divisions.red] },
  { name: "BLS", paths: [ROUTES.divisions.bls] },
  {
    name: "FTD",
    paths: [
      ROUTES.divisions.ftd.sessions,
      ROUTES.divisions.ftd.paperwork,
      ROUTES.divisions.ftd.command,
      ROUTES.divisions.ftd.fti,
    ],
  },
  { name: "supervisor", paths: [ROUTES.management.supervisor] },
];

interface Persona {
  name: string;
  roles: string[];
  /** "yes" = every page in the section, "-" = none of them. */
  expected: Record<string, string>;
  landsOn: string;
}

const employeeOnly: Record<string, string> = {
  shared: "yes",
  RED: "-",
  BLS: "-",
  FTD: "-",
  supervisor: "-",
};

const personas: Persona[] = [
  { name: "Employee", roles: member("Employee"), expected: employeeOnly, landsOn: ROUTES.workspace.staff },
  {
    name: "Employee + FTO",
    roles: member("Employee", "FTO"),
    expected: { ...employeeOnly, FTD: "yes" },
    landsOn: ROUTES.divisions.ftd.sessions,
  },
  {
    name: "RED rank",
    roles: member("ApplicationHandler"),
    expected: { ...employeeOnly, shared: "-", RED: "yes" },
    landsOn: ROUTES.divisions.red,
  },
  {
    name: "BLS rank",
    roles: member("BLSInstructor"),
    expected: { ...employeeOnly, shared: "-", BLS: "yes" },
    landsOn: ROUTES.divisions.bls,
  },
  // A division's rank list only names its leadership, so these two are the
  // case that a rank-only model gets wrong: an ordinary member holds the
  // division's membership role and nothing else.
  {
    name: "RED member (no rank)",
    roles: member("REDDivision"),
    expected: { ...employeeOnly, shared: "-", RED: "yes" },
    landsOn: ROUTES.divisions.red,
  },
  {
    name: "BLS member (no rank)",
    roles: member("BLSDivision"),
    expected: { ...employeeOnly, shared: "-", BLS: "yes" },
    landsOn: ROUTES.divisions.bls,
  },
  {
    name: "Employee + RED member",
    roles: member("Employee", "REDDivision"),
    expected: { ...employeeOnly, RED: "yes" },
    landsOn: ROUTES.divisions.red,
  },
  {
    name: `${"Command+"}`,
    roles: member("Lieutenant"),
    expected: {
      shared: "yes",
      RED: "yes",
      BLS: "yes",
      FTD: "yes",
      supervisor: "yes",
    },
    landsOn: ROUTES.divisions.ftd.sessions,
  },
  {
    name: "Supervisor role",
    roles: member("Supervisor"),
    expected: {
      shared: "-",
      RED: "-",
      BLS: "-",
      FTD: "-",
      supervisor: "yes",
    },
    landsOn: ROUTES.management.supervisor,
  },
  {
    name: "Director of Operations",
    roles: member("DirectorOfOperations"),
    expected: { ...employeeOnly, shared: "-", FTD: "yes" },
    landsOn: ROUTES.divisions.ftd.sessions,
  },
  {
    name: "Director of Administration",
    roles: member("DirectorOfAdministration"),
    expected: { ...employeeOnly, shared: "-", RED: "yes", BLS: "yes" },
    landsOn: ROUTES.divisions.red,
  },
];

/** "yes" when every page opens, "-" when none do, "mixed" otherwise. */
function accessTo(section: Section, roles: readonly string[]): string {
  const open = section.paths.filter((path) => userHasAccess(path, roles)).length;
  if (open === 0) return "-";
  if (open === section.paths.length) return "yes";
  return `mixed (${open}/${section.paths.length})`;
}

let checks = 0;
let failures = 0;

function expect(description: string, actual: unknown, wanted: unknown): void {
  checks += 1;
  if (actual === wanted) return;
  failures += 1;
  console.log(`FAIL  ${description}: got ${String(actual)}, wanted ${String(wanted)}`);
}

const columnWidth = 28;
const header = ["persona".padEnd(columnWidth), ...sections.map((s) => s.name.padEnd(11))].join("");

console.log("\nRoute access check  (the rules live in src/configs/roles.ts)\n");
console.log("Ranks with no collected Discord id get throwaway ids for this run.\n");
console.log(header);
for (const persona of personas) {
  const cells = sections.map((section) =>
    accessTo(section, persona.roles).padEnd(11),
  );
  console.log([persona.name.padEnd(columnWidth), ...cells].join(""));

  for (const section of sections) {
    expect(
      `${persona.name} -> ${section.name}`,
      accessTo(section, persona.roles),
      persona.expected[section.name],
    );
  }
  expect(
    `${persona.name} lands on the right page`,
    landingRouteFor(persona.roles),
    persona.landsOn,
  );
}

// A gate whose rank ids are all blank must deny rather than open. FTD is the
// division with no membership role, so it is the one to check it on.
expect(
  "an unknown member is refused a gated page",
  userHasAccess(ROUTES.divisions.ftd.sessions, []),
  false,
);

// Membership must not leak across divisions: RED's role opens RED and nothing
// else, even though both are "in a division".
expect(
  "RED membership does not open BLS",
  userHasAccess(ROUTES.divisions.bls, member("REDDivision")),
  false,
);
expect(
  "RED membership does not open FTD",
  userHasAccess(ROUTES.divisions.ftd.sessions, member("REDDivision")),
  false,
);

/** Sidebar labels are the same decision, so check the nav the server sends. */
function navLabels(roles: readonly string[] | null): string {
  return filterAccessibleLinks(headerLinks, roles)
    .map((link) => link.label)
    .join(", ");
}

expect(
  "employee sidebar",
  navLabels(member("Employee")),
  "Staff Page, Division Templates, Templates, Quick Links, Availability, Change Log",
);
expect(
  "trainer sidebar",
  navLabels(member("Employee", "FTO")),
  "Staff Page, FTD, Division Templates, Templates, Quick Links, Availability, Change Log",
);
expect(
  "RED member sidebar names the division",
  navLabels(member("REDDivision")),
  "RED",
);
expect("supervisor sidebar", navLabels(member("Supervisor")), "Supervisor");
expect("signed-out sidebar", navLabels(null), "");

console.log(`\n${checks - failures}/${checks} checks passed`);
if (failures > 0) process.exitCode = 1;
