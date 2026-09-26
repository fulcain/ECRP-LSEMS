#!/usr/bin/env node
/**
 * Prints the live access model: who each page opens to, as the app enforces it.
 *
 * The rules are not in the repository any more - they are the `access-matrix`
 * item of the Vercel Global Config, edited in the app - so this reads the store
 * and prints what it actually holds, filling in the fallback for the pages
 * nobody has ruled on. Run it after changing the matrix, or when a member asks
 * why a page refused them:
 *
 *   npm run routes:report
 *
 * Rows come from `src/configs/access-matrix.ts` and the merge from
 * `src/configs/roles.ts`, both through the `@/` alias
 * (`scripts/lib/ts-config-loader.mjs`), so this cannot disagree with the running
 * app. Set `GLOBAL_CONFIG` to read a store; with none configured every page
 * stands at its fallback.
 */

import {
  EDITABLE_ENTRIES,
  LOCKED_ROUTES,
  effectiveRoleIds,
  fallbackRolesForRoute,
  MANAGED_ENTRIES,
  rowHasNoEffect,
  type AccessMatrix,
} from "@/configs/access-matrix";
import {
  ADMIN_PAGES,
  ADMIN_USER_IDS,
  COMMAND_ACCESS,
  DEFAULT_PAGE_ROLES,
  DIVISION_ENTRIES,
  EVERY_PAGE_ROLES,
  ROLES,
  type RoleName,
} from "@/configs/roles";
import { isMatrixStoreConfigured, readAccessMatrixDetailed } from "@/lib/access-matrix-store";

const read = await readAccessMatrixDetailed();
const stored: AccessMatrix = read.ok ? (read.matrix ?? {}) : {};
const store = isMatrixStoreConfigured()
  ? read.ok
    ? `connected - ${Object.keys(stored).length} row(s) stored`
    : `UNREADABLE (${read.reason}) - every page is at its fallback`
  : "not configured - every page is at its fallback";

/** `Name`, with `*` when the registry has no snowflake for it. */
function roleName(alias: RoleName): string {
  return ROLES[alias].id ? ROLES[alias].name : `${ROLES[alias].name}*`;
}

function aliases(names: readonly RoleName[]): string {
  return names.length === 0 ? "(nobody)" : names.map(roleName).join(", ");
}

const line = (text = "") => console.log(text);

line();
line("Live access model");
line("  source: the `access-matrix` item in the Vercel Global Config");
line(`  store : ${store}`);
line("  * = that role has no Discord id, so the gate cannot see it");
line();

line(`No row for a page -> ${aliases(DEFAULT_PAGE_ROLES)}`);
line("  (a page nobody has ruled on is open to every employee, never closed)");
line();
line("Every managed page also opens to - a row cannot take this away:");
line(`  ${aliases(EVERY_PAGE_ROLES)}`);
line();
line("Locked in the code, and never stored - the permission editor itself:");
for (const path of ADMIN_PAGES) {
  line(`  ${path}  ->  ${aliases(["CommandPlusTeam"])}`);
}
line(`  plus ${ADMIN_USER_IDS.size} DISCORD_ADMIN_IDS entr(ies), which bypass every rule`);
line();

line("Pages, and who each one opens to today");
for (const entry of MANAGED_ENTRIES) {
  const rows = stored[entry.route];
  const locked = LOCKED_ROUTES.has(entry.route);
  const roles = locked
    ? (["CommandPlusTeam"] as RoleName[])
    : (rows ?? fallbackRolesForRoute(entry.route));
  const ids = effectiveRoleIds(entry.route, roles).length;

  line(`  ${entry.label}  (${entry.route})`);
  line(`      ${aliases(roles)}`);
  line(
    `      ${ids} Discord id${ids === 1 ? "" : "s"} can open it${
      locked
        ? "  [locked in the code]"
        : rows
          ? rowHasNoEffect(entry.route, roles)
            ? "  [stored, but no different from the fallback]"
            : "  [stored]"
          : "  [no row: the fallback]"
    }`,
  );
}

line();
line("Division pages, and the ranks/roles that identify their members");
for (const [, division] of DIVISION_ENTRIES) {
  if (!division.route) continue;
  const withIds = division.ranks.filter((alias) => ROLES[alias].id).length;
  line(`  ${division.label}  (${division.route})`);
  line(
    `      ranks    ${
        division.ranks.length === 0
          ? "none declared"
          : `${aliases(division.ranks)}  (${withIds}/${division.ranks.length} with an id)`
      }`,
  );
  line(
    `      members  ${
        division.membership
          ? roleName(division.membership)
          : "no membership role: a rank is the only way to be recognised"
      }`,
  );
  line(`      directors ${aliases(division.directors ?? [])}`);
}

const allAliases = Object.keys(ROLES) as RoleName[];
const blanks = allAliases.filter((alias) => !ROLES[alias].id);
line();
line(
  `Registry: ${allAliases.length} roles, ${allAliases.length - blanks.length} with an id, ${blanks.length} without`,
);
line("  a role with no id is inert - it identifies nobody, and the gate ignores it");
line(`  Command+ is ${COMMAND_ACCESS.length} of them; ${EDITABLE_ENTRIES.length} pages are editable`);
line();
