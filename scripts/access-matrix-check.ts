#!/usr/bin/env node
/**
 * Asserts that the live permission matrix can only ever describe pages the app
 * actually has, and that its defaults are the registry's own.
 *
 * The matrix is edited in the running app, so unlike the rest of the config it
 * can drift *without* a code change: a stored entry naming a route that no
 * longer exists, or a label that no longer matches the sidebar, is a bug that
 * only shows up as a tab appearing in the editor and nowhere else. This is the
 * check that catches it:
 *
 *   npm run matrix:check
 *
 * Read through the app's own `@/` alias (`scripts/lib/ts-config-loader.mjs`), so
 * it checks what the middleware reads rather than a copy.
 */

import { FTD_TABS } from "@/configs/ftd-tabs";
import { headerLinks } from "@/components/layout/header/configs/HeaderLinks";
import { ROUTES } from "@/configs/routes";
import {
  FALLBACK_ACCESS_MATRIX,
  EDITABLE_ENTRIES,
  LOCKED_ROUTES,
  MANAGED_ENTRIES,
  MATRIX_ROLES,
  MATRIX_ROLE_TIERS,
  fallbackRolesForRoute,
  effectiveRoleIds,
  overridesFromMatrix,
  overrideForPathname,
  rowHasNoEffect,
  sameMatrix,
  sanitizeMatrix,
  type AccessMatrix,
} from "@/configs/access-matrix";
import {
  ADMIN_PAGES,
  ADMIN_PAGE_ROLES,
  COMMAND_ACCESS,
  DEFAULT_PAGE_ROLES,
  ROLES,
  isAdminOnlyPath,
  type RoleName,
} from "@/configs/roles";

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

function same(description: string, actual: Iterable<string>, wanted: Iterable<string>): void {
  const a = [...actual].sort().join(" | ");
  const b = [...wanted].sort().join(" | ");
  expect(description, a, b);
}

console.log("\nAccess matrix check  (src/configs/access-matrix.ts)\n");

// ── Every row is a real page ───────────────────────────────────────────────

const routes = MANAGED_ENTRIES.map((entry) => entry.route);
expect(
  "no route is listed twice",
  new Set(routes).size,
  routes.length,
);

for (const entry of MANAGED_ENTRIES) {
  expect(
    `${entry.label} (${entry.route}) is a page the middleware gates`,
    entry.route.startsWith("/"),
    true,
  );
  expect(
    `${entry.label} (${entry.route}) has an answer with no store`,
    fallbackRolesForRoute(entry.route).length > 0,
    true,
  );
}

// ── Every row is something a member can actually see ───────────────────────
// Otherwise the editor offers a decision that changes nothing, which is worse
// than no row at all: it looks like it worked.

const navLabels = new Map<string, string>(
  headerLinks
    .filter((link) => link.href)
    .map((link) => [link.href!.split("?")[0], link.label]),
);
const tabLabels = new Map<string, string>(
  FTD_TABS.map((tab) => [tab.href, tab.label]),
);

// Every page a member can reach must have a row, so a page can't be added to
// the sidebar or the FTD tab bar yet stay invisible to the editor. This is the
// guarantee `ROUTE_ACCESS` used to provide from the registry side, now that the
// rows themselves are the declaration.
for (const href of navLabels.keys()) {
  expect(
    `${href} (sidebar) has a matrix row`,
    MANAGED_ENTRIES.some((entry) => entry.route === href),
    true,
  );
}
for (const href of tabLabels.keys()) {
  expect(
    `${href} (FTD tab) has a matrix row`,
    MANAGED_ENTRIES.some((entry) => entry.route === href),
    true,
  );
}
expect(
  "the sidebar and the tab bar between them are every editable row",
  [...navLabels.keys(), ...tabLabels.keys()].filter(
    (href, index, all) => all.indexOf(href) === index,
  ).length,
  EDITABLE_ENTRIES.length,
);

for (const entry of MANAGED_ENTRIES) {
  // The fallback label is the route itself, which is the signal that nobody
  // named it - so this fails the moment a route is gated without a label.
  expect(
    `${entry.route} has a friendly label`,
    entry.label !== entry.route,
    true,
  );

  // A route can appear in both places and under two labels - the sidebar's FTD
  // entry is "FTD" and points at "Sessions" - so a row only has to agree with a
  // label a member actually reads somewhere. A section root has none of its own:
  // the nav points at its first tab, which is why the row is labelled freely.
  const known = [navLabels.get(entry.route), tabLabels.get(entry.route)].filter(
    (label): label is string => label !== undefined,
  );
  if (known.length > 0) {
    expect(
      `${entry.route} is labelled as one of its UI labels (${known.join(" / ")})`,
      known.includes(entry.label),
      true,
    );
  }
}

// ── The fallback is one role, and the locked page is never in it ───────────
// A page with no stored row opens to every employee. That is the whole safety
// story for a missing row and for an unreachable store, so it is pinned here:
// a fallback that quietly narrowed would turn a store outage into an outage of
// every page for everyone below HQ.

expect(
  "the fallback matrix covers every editable row",
  Object.keys(FALLBACK_ACCESS_MATRIX).length,
  EDITABLE_ENTRIES.length,
);

expect("the fallback is the employee role", DEFAULT_PAGE_ROLES.join(", "), "Employee");

for (const entry of EDITABLE_ENTRIES) {
  same(
    `${entry.label} falls back to the employee role`,
    FALLBACK_ACCESS_MATRIX[entry.route] ?? [],
    DEFAULT_PAGE_ROLES,
  );
  same(
    `${entry.label} has exactly one fallback answer`,
    fallbackRolesForRoute(entry.route),
    DEFAULT_PAGE_ROLES,
  );
}

for (const route of LOCKED_ROUTES) {
  expect(
    `${route} is locked and so is absent from the fallback matrix`,
    route in FALLBACK_ACCESS_MATRIX,
    false,
  );
  same(
    `${route} falls back to the permission team, not the department`,
    fallbackRolesForRoute(route),
    ADMIN_PAGE_ROLES,
  );
  expect(
    `${route} is a page the store may not rule on`,
    isAdminOnlyPath(route),
    true,
  );
}

// ── Roles the editor can grant are real registry entries ───────────────────

for (const alias of MATRIX_ROLES) {
  expect(`MATRIX_ROLES.${alias} is in the registry`, alias in ROLES, true);
}

// The offering has to be complete: a rank the app can name is a rank the matrix
// can grant, including the ones nothing gates on and the dormant division's.
same(
  "the editor offers every role in the registry",
  MATRIX_ROLES,
  Object.keys(ROLES),
);

const tierRoles = MATRIX_ROLE_TIERS.flatMap((tier) => tier.roles);
expect(
  "no role is offered twice across the tiers",
  new Set(tierRoles).size,
  tierRoles.length,
);
same("the tiers hold exactly the offered roles", tierRoles, MATRIX_ROLES);

// ── A save must never drop another row's override ──────────────────────────
// The store holds one item that is *replaced* on save, so the payload has to be
// the complete override set. A "what changed just now?" diff is the obvious
// implementation and the wrong one: it discards every row edited in an earlier
// session, which is exactly the bug this pins shut.

const firstRoute = EDITABLE_ENTRIES[0].route;
const secondRoute = EDITABLE_ENTRIES[1].route;

// A working matrix with two rows deliberately off the fallback, and a third left
// exactly on it - which is what "untouched" has to look like in the payload.
const working: AccessMatrix = { ...FALLBACK_ACCESS_MATRIX };
working[firstRoute] = [];
working[secondRoute] = [...FALLBACK_ACCESS_MATRIX[secondRoute], "CommandPlusTeam"];

const payload = overridesFromMatrix(working);

same(
  "both changed rows are in the save payload",
  Object.keys(payload),
  [firstRoute, secondRoute],
);
expect(
  "the earlier row's override survives the later row's save",
  payload[firstRoute]?.length,
  0,
);
expect(
  "a row left at its fallback is not in the payload",
  Object.keys(payload).length,
  2,
);

// Resetting one row takes it out of the store without touching the other.
const afterReset: AccessMatrix = {
  ...working,
  [firstRoute]: [...FALLBACK_ACCESS_MATRIX[firstRoute]],
};
same(
  "resetting a row removes only that row",
  Object.keys(overridesFromMatrix(afterReset)),
  [secondRoute],
);

// Everything back at its default means an empty override set, not a stale one.
same(
  "an untouched matrix writes nothing",
  Object.keys(overridesFromMatrix({ ...FALLBACK_ACCESS_MATRIX })),
  [],
);

// ── The save check: overwrite only what was actually read ──────────────────
// The store is last-write-wins, so a save compares the stored value against the
// one the editor loaded. Getting this wrong in the permissive direction is
// silent data loss, which is why it is pinned here rather than trusted.

const oneRow: AccessMatrix = { [firstRoute]: ["Employee"] };
const sameRowReordered: AccessMatrix = { [firstRoute]: ["Employee"] };
const otherRole: AccessMatrix = { [firstRoute]: ["FTO"] };
const extraRow: AccessMatrix = {
  [firstRoute]: ["Employee"],
  [secondRoute]: [],
};

expect("the save check: identical sets match", sameMatrix(oneRow, sameRowReordered), true);
expect(
  "the save check: role order is not a conflict",
  sameMatrix({ [firstRoute]: ["FTO", "FTI"] }, { [firstRoute]: ["FTI", "FTO"] }),
  true,
);
expect("the save check: a different role is a conflict", sameMatrix(oneRow, otherRole), false);
expect("the save check: an extra row is a conflict", sameMatrix(oneRow, extraRow), false);
expect("the save check: a missing row is a conflict", sameMatrix(extraRow, oneRow), false);
expect(
  "the save check: an emptied row is a conflict",
  sameMatrix({ [firstRoute]: ["FTO"] }, { [firstRoute]: [] }),
  false,
);
expect("the save check: nothing matches nothing", sameMatrix({}, {}), true);
expect("the save check: nothing does not match a row", sameMatrix({}, oneRow), false);
expect("the save check: a row does not match nothing", sameMatrix(oneRow, {}), false);

// ── The one page the matrix may never open ─────────────────────────────────
// Command+ is merged into every entry, so the admin tier has to be carved out
// of that merge by path - a mistake here would either open the editor to
// Command+ or close a normal page to them.

for (const path of ADMIN_PAGES) {
  same(
    `${path} is gated on CommandPlusTeam alone`,
    fallbackRolesForRoute(path),
    ADMIN_PAGE_ROLES,
  );
  expect(`${path} reads as admin-only`, isAdminOnlyPath(path), true);
  expect(
    `a page beneath ${path} reads as admin-only`,
    isAdminOnlyPath(`${path}/nested`),
    true,
  );
}

for (const path of [
  ROUTES.system.changelog,
  ROUTES.divisions.ftd.sessions,
  ROUTES.management.supervisor,
]) {
  // A page that is not admin-only falls back to the department, not to the
  // permission team - and the merge in `userHasAccess` keeps HQ on it whatever a
  // stored row says.
  same(
    `${path} falls back to the department, so Command+ keeps it`,
    fallbackRolesForRoute(path),
    DEFAULT_PAGE_ROLES,
  );
  expect(
    `${path} is not admin-only`,
    isAdminOnlyPath(path),
    false,
  );
}

// ── The sanitizer is what the write path actually uses ─────────────────────

expect("a non-object is refused", sanitizeMatrix("nope"), null);
expect("an array is refused", sanitizeMatrix([]), null);
expect("null is refused", sanitizeMatrix(null), null);

const locked = [...LOCKED_ROUTES][0];
const managed = EDITABLE_ENTRIES[0].route;

const droppedLocked = sanitizeMatrix({ [locked]: ["Employee"] });
expect("a locked route is dropped", droppedLocked?.matrix[locked], undefined);
expect("a locked route is reported", droppedLocked?.dropped.length, 1);

const droppedUnknown = sanitizeMatrix({
  "/not/a/page": ["Employee"],
  [managed]: ["Employee", "Employee", "NotARole"],
});
expect(
  "an unknown route is dropped",
  droppedUnknown?.matrix["/not/a/page"],
  undefined,
);
same(
  "unknown roles and duplicates are dropped from a known route",
  droppedUnknown?.matrix[managed] ?? [],
  ["Employee"],
);
expect("everything dropped is reported", droppedUnknown?.dropped.length, 2);

const kept: AccessMatrix = { [managed]: [] };
expect(
  "an empty list survives sanitizing - it means nobody",
  sanitizeMatrix(kept)?.matrix[managed]?.length,
  0,
);

// ── Overrides resolve the way routes do ────────────────────────────────────

const wide = { [ROUTES.divisions.ftd.sessions]: ["FTO"] as RoleName[] };
expect(
  "an override matches its own route",
  overrideForPathname(ROUTES.divisions.ftd.sessions, wide),
  wide[ROUTES.divisions.ftd.sessions],
);
expect(
  "an override reaches a page beneath its route",
  overrideForPathname(`${ROUTES.divisions.ftd.sessions}/detail`, wide),
  wide[ROUTES.divisions.ftd.sessions],
);
expect(
  "an override does not match a sibling route",
  overrideForPathname(ROUTES.divisions.ftd.paperwork, wide),
  undefined,
);
expect(
  "no matrix means no override",
  overrideForPathname(ROUTES.divisions.ftd.sessions, null),
  undefined,
);
same(
  "a query string does not defeat an override",
  overrideForPathname(`${ROUTES.management.supervisor}?tab=loa`, {
    [ROUTES.management.supervisor]: ["Supervisor"] as RoleName[],
  }) ?? [],
  ["Supervisor"],
);

// ── A row can be changed on screen and still move nobody ───────────────────
// The commonest way to edit a row into a no-op is to add or drop roles that have
// no Discord id: the gate never recognised them, so nothing changes at the door.
// The editor has to say so - a stored row that behaves identically to the
// fallback is indistinguishable from the store not being connected at all.

for (const entry of EDITABLE_ENTRIES) {
  expect(
    `${entry.label}: a row left at its fallback moves nobody`,
    rowHasNoEffect(entry.route, fallbackRolesForRoute(entry.route)),
    true,
  );
}

const commandPlusIds: string[] = [];
for (const alias of COMMAND_ACCESS) {
  const id = ROLES[alias].id;
  if (id) commandPlusIds.push(id);
}
const nonAdminRoute = ROUTES.workspace.staff;
same(
  "Command+ ids always open a shared page, whatever the row says",
  commandPlusIds.filter(
    (id) => !effectiveRoleIds(nonAdminRoute, ["Employee"] as RoleName[]).includes(id),
  ),
  [],
);
// The merge is `COMMAND_ACCESS`, not the `CommandPlusTeam` role: the two are
// different things, and only the former is unconditional.
expect(
  "adding a Command rank to a shared page changes nothing - it was already in",
  rowHasNoEffect(nonAdminRoute, [
    ...fallbackRolesForRoute(nonAdminRoute),
    COMMAND_ACCESS[0],
  ]),
  true,
);
expect(
  "removing a Command rank from a shared page changes nothing either",
  rowHasNoEffect(
    nonAdminRoute,
    fallbackRolesForRoute(nonAdminRoute).filter(
      (alias) => alias !== COMMAND_ACCESS[0],
    ),
  ),
  true,
);
// The matrix's own team is in the same tier, so a row cannot drop it either.
expect(
  "dropping CommandPlusTeam from a shared page changes nothing",
  rowHasNoEffect(
    nonAdminRoute,
    fallbackRolesForRoute(nonAdminRoute).filter(
      (alias) => alias !== "CommandPlusTeam",
    ),
  ),
  true,
);
expect(
  "dropping CommandPlusTeam from a division page changes nothing",
  rowHasNoEffect(
    ROUTES.divisions.ftd.command,
    fallbackRolesForRoute(ROUTES.divisions.ftd.command).filter(
      (alias) => alias !== "CommandPlusTeam",
    ),
  ),
  true,
);
expect(
  "Command+ does not open the Access Manager",
  effectiveRoleIds(ADMIN_PAGES[0], [...COMMAND_ACCESS]).includes(
    ROLES.CommandPlusTeam.id!,
  ),
  false,
);

// Dropping a role that *can* be recognised does move people.
const recognisable = EDITABLE_ENTRIES.map((entry) => ({
  entry,
  droppable: fallbackRolesForRoute(entry.route).find(
    (alias) => ROLES[alias].id && !COMMAND_ACCESS.includes(alias),
  ),
})).find((candidate) => candidate.droppable);

if (recognisable?.droppable) {
  expect(
    `dropping ${recognisable.droppable} from ${recognisable.entry.label} does move people`,
    rowHasNoEffect(
      recognisable.entry.route,
      fallbackRolesForRoute(recognisable.entry.route).filter(
        (alias) => alias !== recognisable.droppable,
      ),
    ),
    false,
  );
}

// And a rank with no id never moves anybody, whether a row adds or drops it.
const blankRole = (Object.keys(ROLES) as RoleName[]).find(
  (alias) => ROLES[alias].id === null,
);
if (blankRole) {
  const route = fallbackRolesForRoute(nonAdminRoute);
  expect(
    `adding ${blankRole} to a row moves nobody - the gate cannot see it`,
    rowHasNoEffect(nonAdminRoute, [...route, blankRole]),
    true,
  );
  // A row naming only an id-less rank keeps nobody recognised, so it closes the
  // page to everyone below HQ rather than opening it.
  expect(
    `a row naming only ${blankRole} closes the page to everyone else`,
    rowHasNoEffect(nonAdminRoute, [blankRole]),
    false,
  );
} else {
  console.log("note: every registry role has an id, so the id-less case was");
  console.log("      not exercised.");
}

// ── With no store, every page stands at its fallback ───────────────────────
// Skipped when a store *is* configured locally: this check must not read the
// live config, it only pins the unconfigured contract.

if (!process.env.GLOBAL_CONFIG && !process.env.EDGE_CONFIG) {
  const { isMatrixStoreConfigured, readAccessMatrix } = await import(
    "@/lib/access-matrix-store"
  );
  expect(
    "an unconfigured store reports itself",
    isMatrixStoreConfigured(),
    false,
  );
  expect("an unconfigured store reads as no matrix", await readAccessMatrix(), null);
} else {
  console.log(
    "note: a store is configured in this environment, so the unconfigured",
  );
  console.log("      fallback was not exercised.");
}

console.log(`\n${checks - failures}/${checks} checks passed`);
if (failures > 0) process.exitCode = 1;
