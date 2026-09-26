/**
 * The live permission matrix: which ranks may open which tabs and pages.
 *
 * **This is the only place that says who may open what.** `configs/roles.ts`
 * declares roles and divisions; the access rules are here, stored in the Vercel
 * Global Config under `ACCESS_MATRIX_KEY`, and edited in the app. A page with no
 * stored row opens to `DEFAULT_PAGE_ROLES` (every employee) rather than to a rule
 * in the repository, so `configs/roles.ts` never has to be edited to change
 * access - and can never disagree with what the editor shows.
 *
 * Both halves are **derived, never hand-listed**:
 *   • the rows are the routes in `ROUTE_META` - a new page appears in the editor
 *     the moment it is named there, and `npm run matrix:check` fails if a page
 *     in the sidebar or the FTD tab bar has no row;
 *   • the ranks are every alias in the registry - a ladder rung, a division's
 *     rank or membership role, or one of the guild roles nothing gates on. A
 *     rank the app can name is a rank the matrix can grant.
 *
 * This module is deliberately free of React and of anything heavy: the
 * middleware imports it to resolve the stored rows, so it is bundled into the
 * Edge function.
 *
 * Two rules hold the design together:
 *   • an entry is keyed by the route the middleware actually gates, so the
 *     matrix can never describe a page that doesn't exist;
 *   • `locked` entries are never writable, so the manager page can't be edited
 *     away by the very people using it.
 */

import { ROUTES } from "@/configs/routes";
import {
  ADMIN_PAGES,
  ADMIN_PAGE_ROLES,
  COMMAND_ACCESS,
  DEFAULT_PAGE_ROLES,
  DIVISION_ENTRIES,
  EVERY_PAGE_ROLES,
  ROLES,
  isAdminOnlyPath,
  type RoleName,
} from "@/configs/roles";
import { LSEMS_RANKS } from "@/app/constants/general/ranks";

/** The section an entry lives in, in the order the editor lists them. */
export type AccessMatrixGroup =
  | "FTD"
  | "Workspace"
  | "Divisions"
  | "Operations"
  | "Resources"
  | "Management"
  | "System"
  | "Other";

export type ManagedEntry = {
  /** The route the middleware gates. */
  route: string;
  /** What the editor calls it - matched against the sidebar's own label. */
  label: string;
  group: AccessMatrixGroup;
  /** Never editable in the app (the manager page itself). */
  locked?: boolean;
};

/**
 * The friendly name and section for each gated route.
 *
 * A label lives here rather than being read off `HeaderLinks`, because that
 * module pulls in the nav icons and this one has to stay importable from the
 * Edge middleware. `npm run matrix:check` is what keeps the two honest: it fails
 * if a gated route has no label here, and if a label disagrees with the sidebar
 * or the tab bar.
 */
const ROUTE_META: Record<string, { label: string; group: AccessMatrixGroup }> = {
  [ROUTES.divisions.ftd.base]: { label: "FTD section", group: "FTD" },
  [ROUTES.divisions.ftd.sessions]: { label: "Sessions", group: "FTD" },
  [ROUTES.divisions.ftd.paperwork]: { label: "Paperwork", group: "FTD" },
  [ROUTES.divisions.ftd.command]: { label: "Command", group: "FTD" },
  [ROUTES.divisions.ftd.fti]: { label: "FTI", group: "FTD" },

  [ROUTES.workspace.staff]: { label: "Staff Page", group: "Workspace" },

  [ROUTES.divisions.red]: { label: "RED", group: "Divisions" },
  [ROUTES.divisions.bls]: { label: "BLS", group: "Divisions" },

  [ROUTES.operations.divisionTemplates]: {
    label: "Division Templates",
    group: "Operations",
  },
  [ROUTES.operations.templates]: { label: "Templates", group: "Operations" },

  [ROUTES.resources.quickLinks]: { label: "Quick Links", group: "Resources" },
  [ROUTES.resources.availability]: {
    label: "Availability",
    group: "Resources",
  },
  [ROUTES.resources.browserExtension]: {
    label: "Browser Extension",
    group: "Resources",
  },

  [ROUTES.management.supervisor]: { label: "Supervisor", group: "Management" },
  [ROUTES.management.access]: {
    label: "Access Manager",
    group: "Management",
  },

  [ROUTES.system.changelog]: { label: "Change Log", group: "System" },
};

/**
 * Every route the editor offers: one row per entry in `ROUTE_META`.
 *
 * Being named in `ROUTE_META` is what makes a route managed, so a page with no
 * entry has no row and no gate beyond the fallback. `npm run matrix:check` is
 * what keeps the list complete - it fails when a page in the sidebar or the FTD
 * tab bar is missing here - and each FTD tab has a row of its own even though it
 * would inherit one: an entry on the **section** covers every FTD page that has
 * no row, and an entry on a **tab** narrows just that tab.
 */
const MANAGED_ROUTES: readonly string[] = Object.keys(ROUTE_META);

/**
 * Everything CommandPlusTeam may retune, derived above.
 *
 * A route with no label in `ROUTE_META` still gets a row - falling back to the
 * path - so a newly gated route is never silently missing from the editor. The
 * check script fails on that fallback, which is the prompt to name it.
 */
export const MANAGED_ENTRIES: readonly ManagedEntry[] = MANAGED_ROUTES.map(
  (route) => {
    const meta = ROUTE_META[route];
    return {
      route,
      label: meta?.label ?? route,
      group: meta?.group ?? "Other",
      locked: ADMIN_PAGES.includes(route),
    };
  },
);

/** Routes the in-app editor may never change. */
export const LOCKED_ROUTES: ReadonlySet<string> = new Set(
  MANAGED_ENTRIES.filter((entry) => entry.locked).map((entry) => entry.route),
);

/** Routes the in-app editor may change, i.e. every entry that isn't locked. */
export const EDITABLE_ENTRIES: readonly ManagedEntry[] = MANAGED_ENTRIES.filter(
  (entry) => !entry.locked,
);

/**
 * A stored matrix: route -> the aliases allowed to open it.
 *
 * An entry that is absent opens to the fallback. An entry that is present
 * *replaces* that outright - that is what "these ranks and no others" means, and
 * why widening a row means adding the ranks back rather than resetting it: a row
 * only ever says what it says. Every alias is in the picker, so `Employee` is
 * one click away if that is what a page should open to again.
 */
export type AccessMatrix = Record<string, RoleName[]>;

/**
 * The aliases that open `route` when the store holds no row for it.
 *
 * Every managed page falls back to `DEFAULT_PAGE_ROLES`, and the Access Manager
 * - the one entry a stored row may never touch - to `ADMIN_PAGE_ROLES`.
 */
export function fallbackRolesForRoute(route: string): RoleName[] {
  return [
    ...(isAdminOnlyPath(route) ? ADMIN_PAGE_ROLES : DEFAULT_PAGE_ROLES),
  ];
}

/** The matrix as it stands with an empty store: every row at its fallback. */
export const FALLBACK_ACCESS_MATRIX: AccessMatrix = Object.fromEntries(
  EDITABLE_ENTRIES.map((entry) => [entry.route, fallbackRolesForRoute(entry.route)]),
);

/** The Global Config item that holds the stored matrix. */
export const ACCESS_MATRIX_KEY = "access-matrix";

/** Aliases resolved to snowflakes, blank ids dropped, deduped. */
function roleIds(roles: readonly RoleName[]): string[] {
  const ids: string[] = [];
  for (const alias of roles) {
    const id = ROLES[alias]?.id;
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/**
 * The Discord ids that can actually open `route` for a given role list.
 *
 * This is the same arithmetic the gate does - resolve aliases to snowflakes,
 * drop the ones with no id, add the ranks that keep every page - which is what
 * makes "does this row change anything?" answerable in the editor. A list of
 * twelve aliases can be a gate for three people, and a *dropped* role with no id
 * changes nothing at all.
 */
export function effectiveRoleIds(
  route: string,
  roles: readonly RoleName[],
): string[] {
  const merged = isAdminOnlyPath(route)
    ? roles
    : [...roles, ...EVERY_PAGE_ROLES];
  return roleIds(merged).sort();
}

/**
 * Whether a role list opens `route` to exactly the people the fallback does.
 *
 * Such a row is a no-op in practice, and there are two ways to arrive at one:
 * every role it dropped has no Discord id (so the gate never recognised it), or
 * they were roles that keep every non-admin page whatever a row says - the
 * Command ranks and `CommandPlusTeam`.
 * The editor says so out loud - a row that is stored and behaves identically is
 * otherwise indistinguishable from the store not being connected.
 */
export function rowHasNoEffect(
  route: string,
  roles: readonly RoleName[],
): boolean {
  const a = effectiveRoleIds(route, roles);
  const b = effectiveRoleIds(route, fallbackRolesForRoute(route));
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/**
 * Two role lists as sets - order carries no meaning for access.
 *
 * Shared by the editor and the payload builder so "has this row changed?"
 * cannot be answered one way on screen and another way on save.
 */
export function sameRoleSet(
  a: readonly RoleName[],
  b: readonly RoleName[],
): boolean {
  if (a.length !== b.length) return false;
  const seen = new Set(a);
  return b.every((alias) => seen.has(alias));
}

/**
 * Two override sets as one answer: same routes, same roles on each.
 *
 * Used for the save check - "is what I am about to overwrite still the thing I
 * read?" - so it has to compare values, not object identity.
 */
export function sameMatrix(a: AccessMatrix, b: AccessMatrix): boolean {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every(
    (route) => route in b && sameRoleSet(a[route] ?? [], b[route] ?? []),
  );
}

/**
 * The **whole** override set for a working matrix: every row that differs from
 * the registry default, and nothing else.
 *
 * This is the only thing that may be written to the store, and it must be all
 * of it. The item is replaced on save, so sending just the rows touched in this
 * session - which is what a "what changed?" diff gives you - silently discards
 * every override made in an earlier one. Sending the complete set is also
 * idempotent, and it drops a row automatically once it is reset to its default,
 * which is what keeps the store from pinning rules nobody meant to pin.
 */
export function overridesFromMatrix(matrix: AccessMatrix): AccessMatrix {
  const overrides: AccessMatrix = {};
  for (const entry of EDITABLE_ENTRIES) {
    const roles = matrix[entry.route] ?? [];
    if (!sameRoleSet(roles, FALLBACK_ACCESS_MATRIX[entry.route] ?? [])) {
      overrides[entry.route] = roles;
    }
  }
  return overrides;
}

/** A group of roles the editor renders as one column section. */
export type RoleTier = {
  label: string;
  roles: RoleName[];
};

/**
 * The roles the editor offers, in tiers, deduped in first-seen order.
 *
 * Derived rather than hand-listed: the Command tier is `COMMAND_ACCESS` plus
 * the two roles the registry names but deliberately keeps out of it, the
 * department ladder is the promotion ladder, and each live division contributes
 * its ranks, its membership role and its directors.
 *
 * The last tier is what makes the offering complete: every alias left over -
 * the roles nothing gates on, the dormant division's ranks, the guild's own
 * labels - so any rank the app can name is a rank the matrix can grant. A
 * `null` id is shown in the editor as "no id", because granting it does nothing.
 */
export const MATRIX_ROLE_TIERS: readonly RoleTier[] = (() => {
  const seen = new Set<RoleName>();
  const tier = (label: string, roles: readonly RoleName[]): RoleTier => {
    const fresh = roles.filter((alias) => {
      if (seen.has(alias)) return false;
      seen.add(alias);
      return true;
    });
    return { label, roles: fresh };
  };

  const tiers: RoleTier[] = [
    tier("Access roles", [
      "CommandPlusTeam",
      "HighCommand",
      ...COMMAND_ACCESS,
      "Supervisor",
      "Employee",
    ]),
    tier(
      "Department ranks",
      LSEMS_RANKS.map((rank) => rank.alias as RoleName),
    ),
  ];

  for (const [, division] of DIVISION_ENTRIES) {
    if (division.dormant) continue;
    const membership = division.membership ? [division.membership] : [];
    tiers.push(
      tier(division.label, [
        ...division.ranks,
        ...membership,
        ...(division.directors ?? []),
      ]),
    );
  }

  // Everything the registry names that no tier above claimed.
  tiers.push(tier("Other guild roles", Object.keys(ROLES) as RoleName[]));

  return tiers.filter((t) => t.roles.length > 0);
})();

/** Every alias that can be granted a page, in tier order. */
export const MATRIX_ROLES: readonly RoleName[] = MATRIX_ROLE_TIERS.flatMap(
  (tierEntry) => tierEntry.roles,
);

export function isManagedRoute(route: string): boolean {
  return MANAGED_ENTRIES.some((entry) => entry.route === route);
}

/**
 * Read an untrusted value (a request body, or whatever is in the store) as a
 * matrix. Returns `null` when the shape is unusable, and otherwise the
 * sanitized matrix plus the reasons anything was dropped - a stored entry
 * naming a route or a role this build no longer knows is discarded rather than
 * silently opening or closing a page.
 */
export function sanitizeMatrix(
  input: unknown,
): { matrix: AccessMatrix; dropped: string[] } | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const matrix: AccessMatrix = {};
  const dropped: string[] = [];

  for (const [route, value] of Object.entries(input as Record<string, unknown>)) {
    if (LOCKED_ROUTES.has(route)) {
      dropped.push(`${route} (locked)`);
      continue;
    }
    if (!isManagedRoute(route)) {
      dropped.push(`${route} (not a managed route)`);
      continue;
    }
    if (!Array.isArray(value)) {
      dropped.push(`${route} (not a list)`);
      continue;
    }

    const roles: RoleName[] = [];
    for (const alias of value) {
      if (typeof alias !== "string" || !(alias in ROLES)) {
        dropped.push(`${route}: ${String(alias)} (unknown role)`);
        continue;
      }
      if (!roles.includes(alias as RoleName)) roles.push(alias as RoleName);
    }
    matrix[route] = roles;
  }

  return { matrix, dropped };
}

/** The route whose override governs `pathname`, by the same longest-prefix rule. */
export function overrideForPathname(
  pathname: string,
  matrix: AccessMatrix | null | undefined,
): RoleName[] | undefined {
  if (!matrix) return undefined;

  const path = pathname.split("?")[0];
  let bestKey: string | null = null;
  for (const key of Object.keys(matrix)) {
    if (path === key || path.startsWith(`${key}/`)) {
      if (!bestKey || key.length > bestKey.length) bestKey = key;
    }
  }
  return bestKey ? matrix[bestKey] : undefined;
}
