import { promotionLadder } from "@/app/constants/general/ranks";
import type { PromotionRank } from "./types";

export type RankInfo = {
  label: string;
  shortLabel: string;
  emailImg: string;
  personnelImg: string;
  callsignPrefix?: string;
  description: string;
  border: string;
  badge: string;
};

/**
 * Everything about a promotion rank that *isn't* its identity: the artwork,
 * the callsign letter and the tailwind classes used to dress it up. The label,
 * the short label and the ladder order all come from
 * `app/constants/general/ranks.ts`, so this map only ever holds presentation.
 */
type RankPresentation = Omit<RankInfo, "label" | "shortLabel">;

// The same badge artwork is used by every rank but EMR.
const EMAIL_IMG = "https://i.ibb.co/4wZLh7Hj/C6b52lr.png";

const presentation = {
  emr: {
    emailImg: "",
    personnelImg: "",
    description: "Emergency Medical Responder",
    border: "border-slate-400/30",
    badge: "bg-slate-500/20 text-slate-100 ring-1 ring-slate-400/40",
  },
  "emt-b": {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/JwycCL0R/Gkqft-MR.png",
    callsignPrefix: "E",
    description: "Entry-level EMT certification",
    border: "border-emerald-300/30 dark:border-emerald-400/30",
    badge: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40",
  },
  "emt-i": {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/xKgJRkXY/t-SAH1l-A.png",
    callsignPrefix: "E",
    description: "Intermediate EMT qualification",
    border: "border-blue-300/30 dark:border-blue-400/30",
    badge: "bg-blue-100 dark:bg-blue-500/20 text-blue-100 ring-1 ring-blue-400/40",
  },
  "emt-a": {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/gLrjjWg8/Dquo0MQ.png",
    callsignPrefix: "E",
    description: "Advanced EMT with division eligibility",
    border: "border-purple-300/30 dark:border-purple-400/30",
    badge: "bg-purple-100 dark:bg-purple-500/20 text-purple-100 ring-1 ring-purple-400/40",
  },
  "master-emt": {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/8L8c8JJs/z3k86ji.png",
    callsignPrefix: "D",
    description: "Top EMT rank with DELTA callsign",
    border: "border-amber-300/30 dark:border-amber-400/30",
    badge: "bg-amber-100 dark:bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/40",
  },
  "emt-p": {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/8L8c8JJs/z3k86ji.png",
    callsignPrefix: "E",
    description: "Part-time EMT contract",
    border: "border-yellow-300/30 dark:border-yellow-400/30",
    badge: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-100 ring-1 ring-yellow-400/40",
  },
  "junior-paramedic": {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/8L8c8JJs/z3k86ji.png",
    callsignPrefix: "O",
    description: "Supervisor-in-training",
    border: "border-orange-300/30 dark:border-orange-400/30",
    badge: "bg-orange-100 dark:bg-orange-500/20 text-orange-100 ring-1 ring-orange-400/40",
  },
  paramedic: {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/ycVchNSX/y-JZHa-Kg.png",
    callsignPrefix: "C",
    description: "Full Supervisor rank",
    border: "border-cyan-300/30 dark:border-cyan-400/30",
    badge: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/40",
  },
  "senior-paramedic": {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/rKrkg2WS/Yra8DDl.png",
    callsignPrefix: "C",
    description: "Senior Supervisor rank",
    border: "border-teal-300/30 dark:border-teal-400/30",
    badge: "bg-teal-100 dark:bg-teal-500/20 text-teal-100 ring-1 ring-teal-400/40",
  },
  "lead-paramedic": {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/spQXxzc6/I9A66xq.png",
    callsignPrefix: "C",
    description: "Lead Supervisor rank",
    border: "border-sky-300/30 dark:border-sky-400/30",
    badge: "bg-sky-100 dark:bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40",
  },
  lieutenant: {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/qLfcBLdL/nz-CBN57.png",
    callsignPrefix: "B",
    description: "Command rank",
    border: "border-indigo-300/30 dark:border-indigo-400/30",
    badge: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-400/40",
  },
  captain: {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/Kp7gP9Kh/KVQAs-B8.png",
    callsignPrefix: "B",
    description: "Command rank",
    border: "border-violet-300/30 dark:border-violet-400/30",
    badge: "bg-violet-100 dark:bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/40",
  },
  commander: {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/Jj1KMcYB/d-QEQ620.png",
    callsignPrefix: "B",
    description: "Command rank",
    border: "border-fuchsia-300/30 dark:border-fuchsia-400/30",
    badge: "bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-100 ring-1 ring-fuchsia-400/40",
  },
  "deputy-chief": {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/1tR7dDsL/7tg-Puo5.png",
    callsignPrefix: "A",
    description: "High Command rank",
    border: "border-rose-300/30 dark:border-rose-400/30",
    badge: "bg-rose-100 dark:bg-rose-500/20 text-rose-100 ring-1 ring-rose-400/40",
  },
  "assistant-chief": {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/S8MPKhD/e-Pr6kg-C.png",
    callsignPrefix: "A",
    description: "High Command rank",
    border: "border-pink-300/30 dark:border-pink-400/30",
    badge: "bg-pink-100 dark:bg-pink-500/20 text-pink-100 ring-1 ring-pink-400/40",
  },
  chief: {
    emailImg: EMAIL_IMG,
    personnelImg: "https://i.ibb.co/RTX88nSv/o-XLXC5Z.png",
    callsignPrefix: "A",
    description: "Highest rank in LSEMS",
    border: "border-red-300/30 dark:border-red-400/30",
    badge: "bg-red-100 dark:bg-red-500/20 text-red-100 ring-1 ring-red-400/40",
  },
} satisfies Record<PromotionRank, RankPresentation>;

/** Rank presentation keyed by promotion rank, labelled from the registry. */
export const rankInfo = Object.fromEntries(
  promotionLadder.map(
    (rank) =>
      [
        rank.key,
        {
          label: rank.label,
          shortLabel: rank.shortLabel,
          ...presentation[rank.key],
        },
      ] as [PromotionRank, RankInfo],
  ),
) as Record<PromotionRank, RankInfo>;

/** Every rank on the promotion ladder, highest → lowest. */
export const rankOrderHighToLow: PromotionRank[] = promotionLadder.map(
  (rank) => rank.key,
);

/**
 * The promotion progression itself, lowest → highest: EMR sits below it and
 * the part-time EMT-P contract has no rung, so neither appears here.
 */
export const allRanks: PromotionRank[] = [...rankOrderHighToLow]
  .reverse()
  .filter((rank) => rank !== "emr" && rank !== "emt-p");

/** Low → high progression, including EMR below EMT-B. */
export const rankOrderLowToHigh: PromotionRank[] = ["emr", ...allRanks];
