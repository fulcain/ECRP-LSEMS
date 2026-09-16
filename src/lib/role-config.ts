/**
 * Access decisions, built on the role registry in `configs/roles.ts`:
 *   • `ROLES` is the one place a Discord role id or role name is declared - it
 *     feeds the route gates *and* the department ladder, divisions, directors
 *     and templates.
 *   • `DIVISIONS` declares each division's ranks and, when it has one, its
 *     route; `ROUTE_ACCESS` is derived from that, so a division page is gated
 *     on the ranks of the division it belongs to.
 *   • `LSEMS_RANKS` (`app/constants/general/ranks.ts`) orders the ladder.
 */

import {
  DIVISION_ENTRIES,
  ROUTE_ACCESS,
  ROLES,
  ADMIN_USER_IDS,
  divisionForRoute,
  type DivisionKey,
  type DivisionRoute,
  type RoleName,
  type RouteRoleRule,
} from "@/configs/roles";
import { LSEMS_RANKS, type LsemsRankName } from "@/app/constants/general/ranks";
import { ROUTES } from "@/configs/routes";

// Re-export the source types and helpers so callers can import everything from
// one place.
export type { RoleName, LsemsRankName, RouteRoleRule, DivisionKey, DivisionRoute };
export { divisionForRoute };

/**
 * Minimal shape a nav item must satisfy for `filterAccessibleLinks` to
 * reason about who can see it. Top-level items expose an optional
 * `href`; dropdown/grouped items expose `children` whose entries each
 * carry their own `href`.
 */
export type AccessCheckableLink = {
  href?: string;
  children?: readonly { href: string }[];
};

// ─── One-time config sanity check ──────────────────────────────────────
// Discord role and user snowflakes are 17–20 digits. A typo here would
// silently disable admin bypass or a route gate, so we warn at module load
// if anything in ROLES or ADMIN_USER_IDS doesn't look like a snowflake.
const SNOWFLAKE_PATTERN = /^\d{17,20}$/;

function warnIfNotSnowflake(label: string, id: string): void {
  if (!SNOWFLAKE_PATTERN.test(id)) {
    console.warn(
      `[role-config] ${label} = "${id}" doesn't look like a Discord snowflake (expected 17–20 digits).`,
    );
  }
}

for (const [alias, role] of Object.entries(ROLES)) {
  // `null` is the documented "the guild has no such role" value, not a typo.
  if (role.id) warnIfNotSnowflake(`ROLES.${alias}`, role.id);
}
for (const id of ADMIN_USER_IDS) {
  warnIfNotSnowflake("ADMIN_USER_IDS", id);
}

// A division page is gated on the division's own rank ids, so with none of them
// declared the gate can't recognise a member: only Command+ and the division's
// director can open it. Worth saying out loud, once at boot, rather than
// leaving a division to wonder why its own page refuses it. The fix is a
// registry entry - these ids are maintained by hand in `configs/roles.ts`.
for (const [key, division] of DIVISION_ENTRIES) {
  if (!division.route) continue;
  if (division.ranks.some((alias) => ROLES[alias].id)) continue;
  console.warn(
    `[role-config] The "${division.label}" (${key}) ranks have no Discord ids in ` +
      `configs/roles.ts, so ${division.route} opens to Command+ and its ` +
      "director only.",
  );
}

/**
 * Find the most specific route rule matching `pathname` by longest-prefix
 * match. Returns `undefined` if no rule applies - which is treated as
 * "open" downstream.
 *
 * The trailing `/` in the prefix check matters: it prevents keys like
 * `/divisions/ftd` from accidentally matching `/divisions/ftd-legacy`.
 */
export function matchRoleRule(pathname: string): RouteRoleRule | undefined {
  // Compare the path alone: nav items carry their tab in the query string
  // (`/management/supervisor?tab=loa`), and a rule that skipped those would let
  // the link past its own gate.
  const path = pathname.split("?")[0];
  let bestKey: string | null = null;
  for (const key of Object.keys(ROUTE_ACCESS)) {
    if (path === key || path.startsWith(`${key}/`)) {
      if (!bestKey || key.length > bestKey.length) bestKey = key;
    }
  }
  return bestKey ? ROUTE_ACCESS[bestKey] : undefined;
}

/**
 * Decide whether a user may access `pathname`, given the Discord guild role
 * snowflakes in their JWT.
 *
 *   1. Admins (in `ADMIN_USER_IDS`) always pass.
 *   2. If the route has no rule (or an empty rule), it's open.
 *   3. Otherwise, the user must hold at least one of the route's
 *      `requireAnyRole` aliases (resolved via `ROLES`). For a division page
 *      those are that division's own ranks plus `DEPARTMENT_ACCESS`.
 */
/**
 * Resolve a user's Discord role snowflakes down to their highest LSEMS
 * rank. Returns `null` if the user holds no rank-related role.
 *
 * `LSEMS_RANKS` is declared highest-first, so the first match wins: a
 * Chief of EMS who also holds Paramedic is ranked as Chief of EMS.
 */
export function getHighestRank(
  userRoleIds: readonly string[],
): LsemsRankName | null {
  const held = new Set(userRoleIds);
  for (const rank of LSEMS_RANKS) {
    if (rank.id && held.has(rank.id)) return rank.alias;
  }
  return null;
}

export function userHasAccess(
  pathname: string,
  userRoleIds: readonly string[],
  discordId?: string,
): boolean {
  if (discordId && ADMIN_USER_IDS.has(discordId)) {
    return true;
  }

  const rule = matchRoleRule(pathname);
  if (!rule || rule.requireAnyRole.length === 0) return true;

  // Resolve the friendly aliases to snowflakes, then intersect, dropping the
  // entries that have no id at all.
  const requiredIds = new Set<string>();
  for (const alias of rule.requireAnyRole) {
    const id = ROLES[alias].id;
    if (id) requiredIds.add(id);
  }
  // Fail closed: a gated rule with no collected ids must not open the route.
  if (requiredIds.size === 0) return false;

  for (const id of userRoleIds) {
    if (requiredIds.has(id)) return true;
  }
  return false;
}

/**
 * Where a signed-in member belongs when they land on the app's entry point:
 * the first of these their own roles open. A division member lands in their
 * section, an employee on the Staff Page, and a supervisor who holds nothing
 * else on the supervisor tools - so a promotion, a transfer or a new division
 * never dumps someone on an access-denied page after signing in.
 */
const LANDING_ORDER: readonly string[] = [
  ROUTES.divisions.ftd.sessions,
  ROUTES.divisions.red,
  ROUTES.divisions.bls,
  ROUTES.workspace.staff,
  ROUTES.management.supervisor,
];

export function landingRouteFor(
  userRoleIds: readonly string[],
  discordId?: string,
): string {
  return (
    LANDING_ORDER.find((path) => userHasAccess(path, userRoleIds, discordId)) ??
    ROUTES.workspace.staff
  );
}

/**
 * Decide whether `userRoleIds` is allowed to edit FT session rows.
 *
 * Mirrors the same triple (FTHead / FTAssHead / Command) the
 * FTD Command page already gates on, so editing a session has the
 * same access bar as opening that page. Admins (in
 * `ADMIN_USER_IDS`) short-circuit to `true` to match the rest of
 * `userHasAccess`'s behavior.
 *
 * Used by:
 *   - the `/api/update-session` route (server-side guard)
 *   - the FT Sessions page (server-rendered flag passed to <AllDataTable>)
 */
export function hasSessionEditAccess(
  userRoleIds: readonly string[],
  discordId?: string,
): boolean {
  if (discordId && ADMIN_USER_IDS.has(discordId)) {
    return true;
  }
  const requiredIds = new Set<string>();
  for (const alias of ["FTHead", "FTAssHead", "Command"] as const) {
    const id = ROLES[alias].id;
    if (id) requiredIds.add(id);
  }
  for (const id of userRoleIds) {
    if (requiredIds.has(id)) return true;
  }
  return false;
}

/**
 * Filter a list of nav-style links down to only those the caller is
 * permitted to open. Reuses `userHasAccess` so route rules stay as the
 * single source of truth - adding a new gated route in
 * `configs/roles.ts` automatically updates the header with no extra
 * wiring.
 *
 *   • Items without children are kept iff the caller passes
 *     `userHasAccess(item.href)`.
 *   • Items with children have their non-accessible children stripped;
 *     the parent is then KEPT iff at least one child remains, so we
 *     never render an empty dropdown.
 *   • `userRoleIds === null` means "unauthenticated"/"could not
 *     verify session token". In that case we cannot identify an admin,
 *     so we restrict to purely *open* routes (paths with no entry in
 *     `ROUTE_ACCESS`) - keeping gated links off `/login` and
 *     `/unauthorized`.
 */
export function filterAccessibleLinks<T extends AccessCheckableLink>(
  items: readonly T[],
  userRoleIds: readonly string[] | null,
  discordId?: string,
): T[] {
  const isAuthed = userRoleIds !== null;

  const canSee = (href: string): boolean =>
    isAuthed && userRoleIds
      ? userHasAccess(href, userRoleIds, discordId)
      : matchRoleRule(href) === undefined;

  return items.flatMap<T>((item) => {
    if (item.children) {
      const visibleChildren = item.children.filter((c) => canSee(c.href));
      if (visibleChildren.length === 0) return [];
      // Cast is safe: we are slicing the children subset of T and
      // re-spreading the rest. Runtime shape is preserved.
      return [{ ...item, children: visibleChildren } as T];
    }
    // Defensive: an item lacking both `href` and `children` would
    // crash `HeaderDesktop`/`HeaderMobile` (they read `item.href!`).
    // Drop it rather than leak it through to the renderer.
    if (!item.href) return [];
    return canSee(item.href) ? [item] : [];
  });
}
