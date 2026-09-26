#!/usr/bin/env node
/**
 * Asserts the shape of the access decision, and prints it as a table.
 *
 * Access is the permission matrix - the `access-matrix` item of the Vercel Global
 * Config, edited in the app - and not a table in the repository any more, so what
 * this pins is the *shape* of that decision rather than a list of pages:
 *
 *   • a page with no stored row opens to every employee, never to nobody;
 *   • a stored row is the rule, but it can never take a page from HQ;
 *   • the permission editor is the one page no stored value may touch;
 *   • the sidebar and the gate answer the same question.
 *
 * Run it after touching `src/configs/roles.ts` or the merge in
 * `src/lib/role-config.ts`:
 *
 *   npm run routes:check
 *
 * Everything is read through the app's own `@/` alias
 * (`scripts/lib/ts-config-loader.mjs`), so this checks what the middleware
 * enforces. Ranks with no Discord id can't identify anyone, so this gives them
 * throwaway snowflakes in memory - nothing on disk is written, and a page can be
 * tested as if every rank had one.
 */

import { headerLinks } from "@/components/layout/header/configs/HeaderLinks";
import { ROUTES } from "@/configs/routes";
import { ADMIN_USER_IDS, ROLES, type RoleName } from "@/configs/roles";
import {
  EDITABLE_ENTRIES,
  LOCKED_ROUTES,
  MANAGED_ENTRIES,
  fallbackRolesForRoute,
  type AccessMatrix,
} from "@/configs/access-matrix";

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

// `DISCORD_ADMIN_IDS` is read once, when `configs/roles.ts` loads - which was
// before this script could set an env var. Adding an id to the same set is how
// the admin bypass gets exercised here; nothing on disk is written.
const ADMIN_ID = "990000000000009999";
(ADMIN_USER_IDS as Set<string>).add(ADMIN_ID);

/** The snowflakes a persona holds, from the registry. */
function member(...aliases: RoleName[]): string[] {
  return aliases.map((alias) => {
    const id = ROLES[alias].id;
    if (!id) throw new Error(`no id for ${alias}`);
    return id;
  });
}

/** An unauthenticated visitor: no roles, and no way to see the nav. */
const NOBODY: readonly string[] = [];

let checks = 0;
let failures = 0;

function expect(description: string, actual: unknown, wanted: unknown): void {
  checks += 1;
  if (actual === wanted) return;
  failures += 1;
  console.log(
    `FAIL  ${description}: got ${String(actual)}, wanted ${String(wanted)}`,
  );
}

const line = (text = "") => console.log(text);

line();
line("Access model  (the permission matrix, in the Global Config)");
line(`  no stored row   every employee  (${fallbackRolesForRoute(ROUTES.workspace.staff).join(", ")})`);
line("  never locked out   the Command ranks and CommandPlusTeam");
line(`  always in the code   ${[...LOCKED_ROUTES].join(", ")} - CommandPlusTeam only, never stored`);
line(
  `  pages   ${EDITABLE_ENTRIES.length} editable, ${MANAGED_ENTRIES.length - EDITABLE_ENTRIES.length} locked`,
);
line();

// ── No stored rows: every page is open to every employee ───────────────────

const editableRoutes = EDITABLE_ENTRIES.map((entry) => entry.route);

expect(
  "an employee opens every page when the store holds no rows",
  editableRoutes.filter((path) => !userHasAccess(path, member("Employee"))).length,
  0,
);
expect(
  "a member with no roles at all opens nothing",
  editableRoutes.filter((path) => userHasAccess(path, NOBODY)).length,
  0,
);
expect(
  "an unreadable store is the same answer as an empty one",
  userHasAccess(ROUTES.workspace.staff, member("Employee"), undefined, null),
  true,
);

// ── HQ, which no row can narrow away from a page ───────────────────────────

for (const alias of ["Command", "Lieutenant", "CommandPlusTeam"] as const) {
  expect(
    `${alias} opens every page with no rows stored`,
    editableRoutes.filter((path) => !userHasAccess(path, member(alias))).length,
    0,
  );
}

const everythingStored: AccessMatrix = Object.fromEntries(
  EDITABLE_ENTRIES.map((entry) => [entry.route, [] as RoleName[]]),
);
expect(
  "a row of nobody still leaves HQ every page",
  editableRoutes.filter(
    (path) => !userHasAccess(path, member("CommandPlusTeam"), undefined, everythingStored),
  ).length,
  0,
);
expect(
  "a row of nobody closes the page to everyone else",
  userHasAccess(ROUTES.workspace.staff, member("Employee"), undefined, everythingStored),
  false,
);
expect(
  "an admin id opens a page a row gives to nobody",
  userHasAccess(ROUTES.workspace.staff, NOBODY, ADMIN_ID, everythingStored),
  true,
);

// ── A stored row is the rule ───────────────────────────────────────────────

const sessionsRow: AccessMatrix = { [ROUTES.divisions.ftd.sessions]: ["FTO"] };

expect(
  "a stored row opens the page to the rank it names",
  userHasAccess(ROUTES.divisions.ftd.sessions, member("FTO"), undefined, sessionsRow),
  true,
);
expect(
  "a stored row closes the page to everyone else",
  userHasAccess(ROUTES.divisions.ftd.sessions, member("Employee"), undefined, sessionsRow),
  false,
);
expect(
  "a stored row reaches pages beneath its route",
  userHasAccess(`${ROUTES.divisions.ftd.sessions}/detail`, member("FTO"), undefined, sessionsRow),
  true,
);
expect(
  "a stored row leaves the section around it alone",
  userHasAccess(ROUTES.divisions.ftd.paperwork, member("Employee"), undefined, sessionsRow),
  true,
);
expect(
  "a stored row on a tab does not change its section",
  userHasAccess(ROUTES.divisions.ftd.base, member("Employee"), undefined, sessionsRow),
  true,
);
expect(
  "an empty row closes the page to everyone but HQ",
  userHasAccess(ROUTES.workspace.staff, member("Employee"), undefined, {
    [ROUTES.workspace.staff]: [],
  }),
  false,
);
expect(
  "a query string does not defeat a row",
  userHasAccess(
    `${ROUTES.management.supervisor}?tab=loa`,
    member("Supervisor"),
    undefined,
    { [ROUTES.management.supervisor]: ["Supervisor"] },
  ),
  true,
);

// ── The permission editor, decided in the code and nowhere else ────────────

const [adminRoute] = [...LOCKED_ROUTES];
expect("there is exactly one locked page", LOCKED_ROUTES.size, 1);
expect("the locked page is the access manager", adminRoute, ROUTES.management.access);
for (const alias of ["Employee", "Command", "Lieutenant", "Consultant", "HighCommand"] as const) {
  expect(
    `${alias} cannot open the access manager`,
    userHasAccess(adminRoute, member(alias)),
    false,
  );
}
expect(
  "CommandPlusTeam opens the access manager",
  userHasAccess(adminRoute, member("CommandPlusTeam")),
  true,
);
expect(
  "a stored row cannot open the access manager to a Command rank",
  userHasAccess(adminRoute, member("Command"), undefined, {
    [adminRoute]: ["Command"],
  }),
  false,
);
expect(
  "a stored row cannot close the access manager to CommandPlusTeam",
  userHasAccess(adminRoute, member("CommandPlusTeam"), undefined, {
    [adminRoute]: [],
  }),
  true,
);
expect(
  "an admin id opens the access manager",
  userHasAccess(adminRoute, NOBODY, ADMIN_ID),
  true,
);

// ── Landing ────────────────────────────────────────────────────────────────

const ftdRow: AccessMatrix = {
  [ROUTES.divisions.ftd.base]: ["FTO"],
  [ROUTES.divisions.ftd.sessions]: ["FTO"],
  [ROUTES.workspace.staff]: ["Employee"],
};
expect(
  "with no rows, a member lands on the page the department shares",
  landingRouteFor(member("Employee")),
  ROUTES.workspace.staff,
);
expect(
  "an FTD rank lands in the FTD section when the matrix grants it",
  landingRouteFor(member("Employee", "FTO"), undefined, ftdRow),
  ROUTES.divisions.ftd.sessions,
);
expect(
  "a RED member lands in RED when the matrix grants it",
  landingRouteFor(member("REDDivision", "Employee"), undefined, {
    [ROUTES.divisions.red]: ["REDDivision"],
    [ROUTES.workspace.staff]: ["Employee"],
  }),
  ROUTES.divisions.red,
);
// The pass that prefers a grant is what makes the RED case above land in RED
// rather than in the FTD section, which is open to every employee by fallback.
expect(
  "a section row covers the tabs beneath it",
  landingRouteFor(member("FTO"), undefined, ftdRow),
  ROUTES.divisions.ftd.sessions,
);
expect(
  "CommandPlusTeam lands somewhere it can open",
  userHasAccess(landingRouteFor(member("CommandPlusTeam")), member("CommandPlusTeam")),
  true,
);

// ── The sidebar is the same decision, read for rendering ───────────────────

const navLabels = (roles: readonly string[] | null): string =>
  filterAccessibleLinks(headerLinks, roles, undefined)
    .map((link) => link.label)
    .join(", ");

const allLabels = headerLinks.map((link) => link.label);
expect(
  "with no rows, an employee's sidebar is every item but the access manager",
  navLabels(member("Employee")),
  allLabels.filter((label) => label !== "Access Manager").join(", "),
);
expect(
  "an employee is never offered the access manager",
  navLabels(member("Employee")).includes("Access Manager"),
  false,
);
expect(
  "CommandPlusTeam is offered everything",
  navLabels(member("CommandPlusTeam")),
  allLabels.join(", "),
);
expect("a signed-out visitor is offered nothing", navLabels(null), "");

const redRow: AccessMatrix = { [ROUTES.divisions.red]: ["REDDivision"] };
const redHref = ROUTES.divisions.red;
expect(
  "a narrowed section is not rendered for a rank it excludes",
  filterAccessibleLinks(headerLinks, member("Employee"), undefined, redRow)
    .some((link) => (link.href ?? "").startsWith(redHref)),
  false,
);
expect(
  "a narrowed section is rendered for the rank the row names",
  filterAccessibleLinks(headerLinks, member("REDDivision"), undefined, redRow)
    .some((link) => (link.href ?? "").startsWith(redHref)),
  true,
);
expect(
  "the FTD tab bar honours a tab's own row",
  userHasAccess(
    ROUTES.divisions.ftd.command,
    member("FTI"),
    undefined,
    { [ROUTES.divisions.ftd.command]: ["FTHead"] },
  ),
  false,
);

// ── No stored row is invented from nothing ─────────────────────────────────

expect(
  "the fallback is the same for every editable page",
  new Set(editableRoutes.map((path) => fallbackRolesForRoute(path).join("|"))).size,
  1,
);
expect(
  "the fallback names a role the guild can actually match",
  fallbackRolesForRoute(ROUTES.workspace.staff).every(
    (alias) => ROLES[alias].id !== null,
  ),
  true,
);

line(`${checks - failures}/${checks} checks passed`);
line();
if (failures > 0) process.exitCode = 1;
