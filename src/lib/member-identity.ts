/**
 * What a member's Discord roles say about them.
 *
 * The app already knows the role snowflakes a signed-in member holds - they
 * ride in the session JWT (`guilds.members.read` returns them at login and on
 * every silent refresh). This turns that list into the things the UI asks
 * people to type by hand: their rank, the divisions they belong to, and
 * whether they hold a director role.
 *
 * Everything is resolved through the role registry (`@/configs/roles.ts`) via
 * the divisions and ladders, so a rank with no id simply doesn't appear here -
 * nothing is guessed.
 */

import { divisions } from "@/app/constants/divisions";
import { directors } from "@/app/constants/general/directorRoles";
import { rankLabel, type LsemsRankName } from "@/app/constants/general/ranks";
import { ROLES, type RoleName } from "@/configs/roles";
import { getHighestRank } from "@/lib/role-config";

export type MemberIdentity = {
  /** Highest department rank the member holds, if any. */
  rankAlias: LsemsRankName | null;
  /** The rank's display label, ready for the rank dropdown. */
  rankLabel: string | null;
  /**
   * Division label -> the rank the member holds in it, e.g.
   * `{ "Basic Life Support": "BLS Instructor" }`. Divisions whose ranks have
   * no id yet are never included.
   */
  divisionRanks: Record<string, string>;
  /**
   * Labels of every live division the member belongs to, in `DIVISIONS` order
   * - through a rank, through its membership role, or both. A division whose
   * membership role is declared puts *all* of its people here, which its rank
   * list alone cannot: that only names leadership.
   *
   * Kept apart from `divisionRanks` because the two answer different
   * questions. `divisionRanks` is the member's *standing* in a division,
   * which is what a generated document's rank line wants; this is simply which
   * divisions they are in, where a rank is not required to belong.
   */
  divisionMembership: string[];
  /** Director title the member holds, if any. */
  directorTitle: string | null;
};

export const emptyMemberIdentity: MemberIdentity = {
  rankAlias: null,
  rankLabel: null,
  divisionRanks: {},
  divisionMembership: [],
  directorTitle: null,
};

/** True when the resolution found anything worth showing. */
export function hasIdentity(identity: MemberIdentity): boolean {
  return (
    identity.rankLabel !== null ||
    identity.directorTitle !== null ||
    identity.divisionMembership.length > 0
  );
}

/** A Discord role the member holds that the registry knows about. */
export type HeldRole = {
  alias: RoleName;
  /** The role's display name, as declared in the registry. */
  name: string;
  /**
   * Whether the role belongs to a division - one of its ranks or its
   * membership role - rather than to the department ladder. The profile lists
   * the two apart, which is how a member sees which divisions they are in
   * without a separate divisions card.
   */
  isDivision: boolean;
};

/**
 * Every snowflake a live division claims: its ranks and its membership role.
 *
 * Built from `divisions` rather than a second hand-written list, so a rank
 * added to a division is classified as divisional with no edit here.
 */
const DIVISION_ROLE_IDS: ReadonlySet<string> = new Set(
  divisions.flatMap(({ data }) => [
    ...data.ranks.flatMap((rank) => (rank.id ? [rank.id] : [])),
    ...(data.membership?.id ? [data.membership.id] : []),
  ]),
);

/**
 * The reverse of `resolveMemberIdentity`: every role the member holds that the
 * app can name - a rank or division rank, but also access-only roles such as
 * Employee, Command or Supervisor.
 *
 * Entries whose id is still `null` can't match anyone and are not listed, and
 * neither are the member's roles the registry has never heard of: this answers
 * "what does the app know about me", not "what is in my role list".
 */
export function heldRoles(roleIds: readonly string[]): HeldRole[] {
  if (roleIds.length === 0) return [];

  const held = new Set(roleIds);
  const found: HeldRole[] = [];

  for (const alias of Object.keys(ROLES) as RoleName[]) {
    const { id, name } = ROLES[alias];
    if (id && held.has(id))
      found.push({ alias, name, isDivision: DIVISION_ROLE_IDS.has(id) });
  }

  return found;
}

export function resolveMemberIdentity(
  roleIds: readonly string[],
): MemberIdentity {
  if (roleIds.length === 0)
    return { ...emptyMemberIdentity, divisionRanks: {}, divisionMembership: [] };

  const held = new Set(roleIds);
  const rankAlias = getHighestRank(roleIds);

  const divisionRanks: Record<string, string> = {};
  const divisionMembership: string[] = [];

  for (const { label, data } of divisions) {
    // Ranks are ordered highest first, so the first hit is the member's rank
    // in that division.
    const match = data.ranks.find(
      (rank) => rank.id !== null && held.has(rank.id),
    );
    if (match) divisionRanks[label] = match.name;

    // Belonging is not the same as holding a rank: a division's membership
    // role is held by everyone in it, so this is what recognises an ordinary
    // member. It is the same role the division's route gate accepts.
    const membership = data.membership;
    if (
      match ||
      (membership && membership.id !== null && held.has(membership.id))
    ) {
      divisionMembership.push(label);
    }
  }

  const director = directors.find(
    (entry) => entry.id !== null && held.has(entry.id),
  );

  return {
    rankAlias,
    rankLabel: rankAlias ? rankLabel(rankAlias) : null,
    divisionRanks,
    divisionMembership,
    directorTitle: director?.title ?? null,
  };
}
