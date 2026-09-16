/**
 * How Discord's answer merges into the Staff Page's saved values.
 *
 * Kept out of the component because it is a policy with two directions and a
 * real failure mode, and it is the difference between "the Sync button works"
 * and "the rank I deleted in Discord is still on my page":
 *
 *   • `"fill"`   the pass that runs by itself on every page load. It only adds
 *                what Discord reports, so a value the member typed themselves
 *                survives a read that can't see it - a rank whose role id
 *                isn't collected, a division the guild has no role for.
 *   • `"replace"` the Sync button: a deliberate "make this match Discord", so
 *                a rank or division the member has *lost* is cleared instead
 *                of left behind.
 *
 * Neither mode ever runs on a read that failed - the caller passes `"fill"`
 * when Discord answered nothing, because clearing on no answer would wipe a
 * member's own entries over a transient error.
 */

import type { DirectorRole } from "@/app/constants/general/directorRoles";
import { defaultDirectorRole } from "@/app/constants/general/directorRoles";
import type { MemberIdentity } from "@/lib/member-identity";

export type DiscordSyncMode = "fill" | "replace";

/** The department rank to save: Discord's, or cleared when it no longer is. */
export function syncedRank(
  saved: string,
  identity: MemberIdentity,
  mode: DiscordSyncMode,
): string {
  if (identity.rankLabel) return identity.rankLabel;
  return mode === "replace" ? "" : saved;
}

/** The director role to save: Discord's, or switched off when it is gone. */
export function syncedDirectorRole(
  saved: DirectorRole,
  identity: MemberIdentity,
  mode: DiscordSyncMode,
): DirectorRole {
  if (identity.directorTitle) {
    return { enabled: true, title: identity.directorTitle };
  }
  if (mode === "replace" && saved.enabled) return { ...defaultDirectorRole };
  return saved;
}

/**
 * The per-division ranks to save for `labels`.
 *
 * A rank Discord reports is written as-is. Where it reports none, the saved
 * value is cleared only if the member is not in that division at all - which
 * is the case a deleted role leaves behind. A division they *are* in keeps
 * whatever is saved, because a rank the registry has no id for is invisible
 * here and must not be mistaken for "no rank".
 */
export function syncedDivisionRanks(
  saved: Record<string, string>,
  identity: MemberIdentity,
  mode: DiscordSyncMode,
  labels: readonly string[],
): Record<string, string> {
  const memberOf = new Set(identity.divisionMembership);
  const next = { ...saved };

  for (const label of labels) {
    const rank = identity.divisionRanks[label];
    if (rank) {
      next[label] = rank;
    } else if (mode === "replace" && !memberOf.has(label)) {
      next[label] = "";
    }
  }

  return next;
}
