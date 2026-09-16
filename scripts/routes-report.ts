#!/usr/bin/env node
/**
 * Prints the route access model as the app actually enforces it.
 *
 * Every line is derived from `src/configs/roles.ts` - the same `ROUTE_ACCESS`,
 * `DIVISIONS` and registry the middleware reads - so this can't disagree with
 * the running app. The `@/` alias is resolved by the loader in
 * `scripts/lib/`, which is why this needs no build step. Run it after adding a
 * route or a division:
 *
 *   npm run routes:report
 */

import {
  COMMAND_ACCESS,
  DIVISION_ENTRIES,
  ROLES,
  ROUTE_ACCESS,
  divisionForRoute,
  type RoleName,
} from "@/configs/roles";

const commandPlus = new Set<RoleName>(COMMAND_ACCESS);

/** `Name` plus a marker when the registry has no snowflake for it. */
function roleName(alias: RoleName): string {
  return ROLES[alias].id ? ROLES[alias].name : `${ROLES[alias].name}*`;
}

function aliases(...names: readonly RoleName[]): string {
  return names.map(roleName).join(", ");
}

function withIds(names: readonly RoleName[]): string {
  const collected = names.filter((alias) => ROLES[alias].id).length;
  return `${collected}/${names.length} ids`;
}

type Rule = { path: string; roles: readonly RoleName[] };

const rules: Rule[] = Object.entries(ROUTE_ACCESS).map(([path, rule]) => ({
  path,
  roles: rule.requireAnyRole,
}));

const isShared = (rule: Rule) => rule.roles.includes("Employee");
const isSupervisor = (rule: Rule) => rule.roles.includes("Supervisor");
const rest = (rule: Rule) =>
  rule.roles.filter((alias) => alias !== "Employee" && alias !== "Supervisor");

const shared = rules.filter(isShared).sort((a, b) => a.path.localeCompare(b.path));
const supervisor = rules
  .filter(isSupervisor)
  .sort((a, b) => a.path.localeCompare(b.path));
const divisionRules = rules.filter((rule) => !isShared(rule) && !isSupervisor(rule));

const line = (text = "") => console.log(text);

line();
line("Route access model");
line("  source: src/configs/roles.ts (ROUTE_ACCESS, derived from DIVISIONS)");
line("  * = that role has no Discord id yet, so the gate cannot see it");
line();
line(`Command+ - opens every page below`);
line(`  ${aliases(...COMMAND_ACCESS)}`);
line(`  ${withIds(COMMAND_ACCESS)}`);

line();
line("Shared department pages - any LSEMS employee, or Command+");
for (const rule of shared) line(`  ${rule.path}`);
line(`  Employee + Command+ (${withIds(["Employee"])})`);

line();
line(
  "Division sections - the division's members and ranks, or Command+, or its director",
);
for (const rule of divisionRules) {
  const division = divisionForRoute(rule.path);
  const invited = rest(rule);
  const entry = division
    ? DIVISION_ENTRIES.find(([key]) => key === division.key)?.[1]
    : undefined;
  const ownRanks = entry?.ranks ?? [];
  const membership = entry?.membership;
  const extras = invited.filter(
    (alias) =>
      alias !== membership &&
      !ownRanks.includes(alias) &&
      !commandPlus.has(alias),
  );
  const heading = division ? division.label : "(no division declares this route)";

  line(`  ${rule.path}`);
  line(`      section  ${heading}`);
  line(
    `      members  ${
        membership
          ? `${roleName(membership)} - every member of the division`
          : "no membership role: leadership ranks only"
      }`,
  );
  line(
    `      ranks    ${ownRanks.length === 0 ? "none declared" : aliases(...ownRanks)}`,
  );
  line(
    `      also     Command+${
        extras.length > 0 ? `, or ${aliases(...extras)}` : ""
      }`,
  );
  line(`      coverage ${withIds(ownRanks)}`);
}

line();
line("Supervisor tools - the Supervisor role, or Command+");
for (const rule of supervisor) {
  // Everything in the rule that isn't Command+, i.e. the Supervisor role.
  const own = rule.roles.filter((alias) => !commandPlus.has(alias));
  line(`  ${rule.path}`);
  line(`      ${aliases(...own)} (${withIds(own)}), or Command+`);
}

const routelessDivisions = DIVISION_ENTRIES.filter(
  ([, division]) => !division.route,
);
line();
line("Declared without a page yet (rank lists only)");
line(`  ${routelessDivisions.map(([, d]) => `${d.label}${d.dormant ? " (dormant)" : ""}`).join(", ")}`);

const allNames = Object.keys(ROLES) as RoleName[];
const blanks = allNames.filter((alias) => !ROLES[alias].id);
line();
line(
  `Registry: ${allNames.length} roles, ${allNames.length - blanks.length} with an id, ${blanks.length} without`,
);
line("  a role with no id is inert - it identifies nobody, and the gate ignores it");
line();
