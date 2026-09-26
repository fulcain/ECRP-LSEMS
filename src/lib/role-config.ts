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
  ADMIN_PAGE_ROLES,
  DEFAULT_PAGE_ROLES,
  EVERY_PAGE_ROLES,
  ROLES,
  ADMIN_USER_IDS,
  divisionForRoute,
  isAdminOnlyPath,
  type DivisionKey,
  type DivisionRoute,
  type RoleName,
} from "@/configs/roles";
import { overrideForPathname, type AccessMatrix } from "@/configs/access-matrix";
import { LSEMS_RANKS, type LsemsRankName } from "@/app/constants/general/ranks";
import { ROUTES } from "@/configs/routes";

// Re-export the source types and helpers so callers can import everything from
// one place.
export type {
  RoleName,
  LsemsRankName,
  DivisionKey,
  DivisionRoute,
  AccessMatrix,
};
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
// Discord role and user snowflakes are 17-20 digits. A typo here would
// silently disable admin bypass or a route gate, so we warn at module load
// if anything in ROLES or ADMIN_USER_IDS doesn't look like a snowflake.
const SNOWFLAKE_PATTERN = /^\d{17,20}$/;

function warnIfNotSnowflake(label: string, id: string): void {
  if (!SNOWFLAKE_PATTERN.test(id)) {
    console.warn(
      `[role-config] ${label} = "${id}" doesn't look like a Discord snowflake (expected 17-20 digits).`,
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

/**
 * Decide whether a user may access `pathname`, given the Discord guild role
 * snowflakes in their JWT.
 *
 *   1. Admins (in `ADMIN_USER_IDS`) always pass.
 *   2. The permission matrix decides. A stored row is the rule; a page with no
 *      row opens to `DEFAULT_PAGE_ROLES` (every employee), never to a rule in
 *      the repository - so a missing row is a wide default, not a closed door.
 *   3. `EVERY_PAGE_ROLES` is merged back in on every managed page, so a row can
 *      narrow access but never lock HQ out of the app. The Access Manager is the
 *      exception: it is gated on `ADMIN_PAGE_ROLES` in the code and ignores a
 *      stored row entirely.
 *   4. A rule whose role ids are all blank denies (fail closed). An explicit
 *      empty row lands here too, which is the intended reading of "nobody".
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
  overrides?: AccessMatrix | null,
): boolean {
  if (discordId && ADMIN_USER_IDS.has(discordId)) {
    return true;
  }

  // The CommandPlusTeam tools are decided here and nowhere else. `sanitizeMatrix`
  // already refuses to store an entry for them, and this refuses to honour one
  // even if it exists: the gate must not depend on the store having been
  // sanitized. So for these paths the code's own rule is the only rule.
  const adminOnly = isAdminOnlyPath(pathname);

  // A stored row *is* the rule - that is what "these ranks and no others"
  // means. Without one the page opens to every employee, which is the same
  // answer an unreadable store gives: a matrix problem must never be what
  // closes a page.
  const stored = adminOnly ? undefined : overrideForPathname(pathname, overrides);
  const allowed: readonly RoleName[] = adminOnly
    ? ADMIN_PAGE_ROLES
    : (stored ?? DEFAULT_PAGE_ROLES);

  // Command+ keeps every page, so editing a row can only ever decide who *else*
  // gets in and can never lock HQ out of a page - and "Command+" is both the
  // Command ranks and the team that runs this matrix, neither of which should be
  // able to lock itself out of the app by its own edit. The CommandPlusTeam
  // tools are the one exception, being deliberately closed to the Command ranks.
  const commandPlus = adminOnly ? [] : EVERY_PAGE_ROLES;

  // Resolve the friendly aliases to snowflakes, then intersect, dropping the
  // entries that have no id at all.
  const requiredIds = new Set<string>();
  for (const alias of [...allowed, ...commandPlus]) {
    const id = ROLES[alias].id;
    if (id) requiredIds.add(id);
  }
  // Fail closed: a gated rule with no collected ids must not open the route.
  // An override saved with every role removed lands here too, which is the
  // intended reading of "nobody".
  if (requiredIds.size === 0) return false;

  for (const id of userRoleIds) {
    if (requiredIds.has(id)) return true;
  }
  return false;
}

/**
 * Whether the member may edit the permission matrix: `CommandPlusTeam`, or a
 * developer id in `DISCORD_ADMIN_IDS`.
 *
 * This is the same rule `ROUTE_ACCESS` enforces on the manager page, read
 * forwards - the page gate and the API route must not be able to disagree about
 * who may save.
 */
export function canManageAccess(
  userRoleIds: readonly string[],
  discordId?: string,
): boolean {
  if (discordId && ADMIN_USER_IDS.has(discordId)) return true;
  const id = ROLES.CommandPlusTeam.id;
  return Boolean(id) && userRoleIds.includes(id);
}

/**
 * Where a signed-in member belongs when they land on the app's entry point:
 * the first of these their own roles open. A division member lands in their
 * section, an employee on the Staff Page, and a supervisor who holds nothing
 * else on the supervisor tools - so a promotion, a transfer or a new division
 * never dumps someone on an access-denied page after signing in.
 *
 * The access manager is on the list because it is now possible to *narrow* FTD
 * through the permission matrix: a member whose FTD access has been closed off
 * still has to land somewhere they can open, and CommandPlusTeam always opens
 * this one.
 */
const LANDING_ORDER: readonly string[] = [
  ROUTES.divisions.ftd.sessions,
  ROUTES.divisions.red,
  ROUTES.divisions.bls,
  ROUTES.workspace.staff,
  ROUTES.management.supervisor,
  ROUTES.management.access,
];

export function landingRouteFor(
  userRoleIds: readonly string[],
  discordId?: string,
  overrides?: AccessMatrix | null,
): string {
  // A page the matrix actually grants beats one that is merely open by
  // fallback. Without this pass the order above would land the whole department
  // in the FTD section the moment the store holds no row for it, since every
  // employee can open it by default.
  const granted = LANDING_ORDER.find(
    (path) =>
      overrideForPathname(path, overrides) !== undefined &&
      userHasAccess(path, userRoleIds, discordId, overrides),
  );
  if (granted) return granted;

  // Nothing is granted, so the member belongs on the page the whole department
  // shares rather than in the first section that happens to be open.
  return (
    [ROUTES.workspace.staff, ...LANDING_ORDER].find((path) =>
      userHasAccess(path, userRoleIds, discordId, overrides),
    ) ?? ROUTES.workspace.staff
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
 * permitted to open. Reuses `userHasAccess`, so the sidebar and the gate can
 * never disagree about a page - the nav is the matrix, read for rendering.
 *
 *   • Items without children are kept iff the caller passes
 *     `userHasAccess(item.href)`.
 *   • Items with children have their non-accessible children stripped;
 *     the parent is then KEPT iff at least one child remains, so we
 *     never render an empty dropdown.
 *   • `userRoleIds === null` means "unauthenticated"/"could not
 *     verify session token". Every page here needs a role, so nothing is
 *     shown - which is what keeps gated links off `/login` and
 *     `/unauthorized`.
 */
export function filterAccessibleLinks<T extends AccessCheckableLink>(
  items: readonly T[],
  userRoleIds: readonly string[] | null,
  discordId?: string,
  overrides?: AccessMatrix | null,
): T[] {
  const isAuthed = userRoleIds !== null;

  const canSee = (href: string): boolean =>
    isAuthed && userRoleIds
      ? userHasAccess(href, userRoleIds, discordId, overrides)
      : false;

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
