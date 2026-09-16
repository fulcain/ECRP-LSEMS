/**
 * The LSEMS rank ladder, in one place.
 *
 * A ladder rung is only what makes it a *rung*: its alias, its promotion key
 * and its short label. Its snowflake and its display name come from the
 * registry in `src/configs/roles.ts`, so a rank's id and the text people read
 * are declared once for the whole app.
 *
 * Declaration order is the hierarchy: HIGHEST first. `getHighestRank` walks it
 * top-down, and rank dropdowns render it as-is, so reordering this array
 * reorders the whole app at once.
 */

import { ROLES } from "@/configs/roles";

type LadderRank = {
  /** Registry alias in `src/configs/roles.ts`. */
  alias: string;
  /** Promotion-ladder key (`emt-b`). Omitted for ranks outside the ladder. */
  key?: string;
  /** Compact form shown on badges and used when parsing pasted rank text. */
  shortLabel: string;
};

const LADDER = [
  { alias: "ChiefOfEMS", key: "chief", shortLabel: "Chief" },
  { alias: "AssistantChiefOfEMS", key: "assistant-chief", shortLabel: "Assistant Chief" },
  { alias: "DeputyChiefOfEMS", key: "deputy-chief", shortLabel: "Deputy Chief" },
  // A position people hold, not a rung - so it carries no promotion key.
  { alias: "Consultant", shortLabel: "Consultant" },
  { alias: "Commander", key: "commander", shortLabel: "Commander" },
  { alias: "Captain", key: "captain", shortLabel: "Captain" },
  { alias: "Lieutenant", key: "lieutenant", shortLabel: "Lieutenant" },
  { alias: "LeadParamedic", key: "lead-paramedic", shortLabel: "Lead Paramedic" },
  { alias: "SeniorParamedic", key: "senior-paramedic", shortLabel: "Senior Paramedic" },
  { alias: "Paramedic", key: "paramedic", shortLabel: "Paramedic" },
  { alias: "JuniorParamedic", key: "junior-paramedic", shortLabel: "Junior Paramedic" },
  { alias: "MasterEMT", key: "master-emt", shortLabel: "Master" },
  { alias: "EMTP", key: "emt-p", shortLabel: "EMT-P" },
  { alias: "EMTAdvanced", key: "emt-a", shortLabel: "EMT-A" },
  { alias: "EMTIntermediate", key: "emt-i", shortLabel: "EMT-I" },
  { alias: "EMTBasic", key: "emt-b", shortLabel: "EMT-B" },
  { alias: "EMRTrainee", key: "emr", shortLabel: "EMR" },
] as const satisfies readonly LadderRank[];

/** Union of rank aliases, e.g. `"Paramedic"`. */
export type LsemsRankName = (typeof LADDER)[number]["alias"];

type PromotionRankEntry = Extract<(typeof LADDER)[number], { key: string }>;

/** Union of promotion-ladder keys, e.g. `"emt-b"`. */
export type PromotionRank = PromotionRankEntry["key"];

/** A resolved rung: what the app reads, with the registry's id and label. */
export type DepartmentRank = {
  alias: LsemsRankName;
  key?: PromotionRank;
  label: string;
  shortLabel: string;
  id: string | null;
};

export type LsemsRankEntry = DepartmentRank;

const resolve = (rank: (typeof LADDER)[number]): DepartmentRank => ({
  ...rank,
  label: ROLES[rank.alias].name,
  id: ROLES[rank.alias].id,
});

/** Every rank, highest first, with its display label and snowflake. */
export const LSEMS_RANKS: readonly DepartmentRank[] = LADDER.map(resolve);

const isPromotionRank = (rank: DepartmentRank): rank is DepartmentRank & { key: PromotionRank } =>
  rank.key !== undefined;

/** Ranks on the promotion ladder, highest first. */
export const promotionLadder = LSEMS_RANKS.filter(isPromotionRank);

/**
 * Friendly labels keyed by alias, in hierarchy order. Derived from the
 * registry, so editing a name in `src/configs/roles.ts` is the only edit
 * ever needed.
 */
export const RANK_LABELS = Object.fromEntries(
  LSEMS_RANKS.map((rank) => [rank.alias, rank.label]),
) as Record<LsemsRankName, string>;

/** Rank labels, highest first - directly usable as dropdown options. */
export const rankOptions: readonly string[] = LSEMS_RANKS.map(
  (rank) => rank.label,
);

/** Friendly label for a rank alias - the paperwork dropdown and signature text. */
export function rankLabel(alias: LsemsRankName): string {
  return RANK_LABELS[alias];
}
