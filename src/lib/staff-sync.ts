/**
 * How Discord's answer merges into the Staff Page's saved values.
 *
 * Kept out of the component because it is a policy with a real failure mode:
 * an always-overwrite fill would rewrite what the member picked themselves on
 * every page load, and a fill that never writes anything would leave stale
 * ranks behind after a promotion.
 *
 * The department rank and director role always follow Discord when it reports
 * them - those are single values the app resolves from the ladder, so a manual
 * override would be overwritten by the next read anyway.
 *
 * The division ranks are the member's editable picks, so they go through a
 * three-way merge (`autoFilledDivisionRanks`): Discord's answer lands only
 * where the saved value is still what the previous pass wrote.
 *
 * No mode ever runs on a read that failed - when Discord answers nothing,
 * nothing is written, because clearing on no answer would wipe a member's own
 * entries over a transient error.
 */

import type { DirectorRole } from "@/app/constants/general/directorRoles";
import type { MemberIdentity } from "@/lib/member-identity";

/** The department rank to save: Discord's, or whatever is already saved. */
export function syncedRank(
  saved: string,
  identity: MemberIdentity,
): string {
  if (identity.rankLabel) return identity.rankLabel;
  return saved;
}

/** The director role to save: Discord's, or whatever is already saved. */
export function syncedDirectorRole(
  saved: DirectorRole,
  identity: MemberIdentity,
): DirectorRole {
  if (identity.directorTitle) {
    return { enabled: true, title: identity.directorTitle };
  }
  return saved;
}

export type AutoFilledDivisionRanks = {
  ranks: Record<string, string>;
  /** What this pass wrote, so the next one can tell a manual edit apart. */
  lastSynced: Record<string, string>;
};

/**
 * The division ranks the automatic pass should leave saved.
 *
 * A plain "Discord wins" fill would rewrite the dropdown on every page load,
 * so a rank the member picked themselves never survived the next visit. This
 * three-way merge keeps the automatic selection and the manual choice:
 * Discord's answer lands only when the saved value is still exactly what the
 * previous pass wrote - anything else is a manual pick and wins.
 *
 * A `lastSynced` of `null` (first run, no record yet) adopts the saved values
 * as the baseline, so ranks earlier always-overwrite fills wrote keep
 * updating instead of freezing as if they were typed by hand.
 */
export function autoFilledDivisionRanks(
  saved: Record<string, string>,
  lastSynced: Record<string, string> | null,
  identity: MemberIdentity,
  labels: readonly string[],
): AutoFilledDivisionRanks {
  const ranks = { ...saved };
  const baseline = lastSynced ?? { ...saved };
  const nextSynced = { ...baseline };

  for (const label of labels) {
    const discordRank = identity.divisionRanks[label];
    // Nothing Discord can name here - the fill pass never clears.
    if (!discordRank) continue;

    const last = baseline[label] ?? null;
    const current = ranks[label] ?? "";

    if (last === null) {
      // Never synced: seed an empty dropdown, but leave a value we did not
      // write alone - it is the member's own pick.
      if (current === "") {
        ranks[label] = discordRank;
        nextSynced[label] = discordRank;
      }
      continue;
    }

    // Untouched since the last sync, so Discord is the fresher answer. A
    // difference means the member edited it and their pick stands.
    if (current === last) {
      ranks[label] = discordRank;
      nextSynced[label] = discordRank;
    }
  }

  return { ranks, lastSynced: nextSynced };
}
