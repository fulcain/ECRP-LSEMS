// Derived from the rank registry so a new rank is added in exactly one place.
import type { PromotionRank } from "@/app/constants/general/ranks";

export type { PromotionRank };

export type PromotionEmailContext = {
  personnelName: string;
  title: "Mr." | "Ms.";
  medicName: string;
  medicRank: string;
  medicSignature: string;
};

export type PromotionEmailDefinition = {
  value: PromotionRank;
  label: string;
  rankLabel: string;
  accent: string;
  border: string;
  badge: string;
  renderBody: (context: PromotionEmailContext) => string;
};

export type PersonnelFilePostContext = {
  personnelName: string;
  date: string;
  promotedByName: string;
  promotedByRank: string;
};

export type PersonnelFilePostDefinition = {
  rank: PromotionRank;
  label: string;
  renderBody: (context: PersonnelFilePostContext) => string;
};

export type RankAdjustmentContext = {
  personnelName: string;
  previousRank: string;
  newRank: string;
  date: string;
  signature: string;
  medicName: string;
  medicRank: string;
};

export type RankAdjustmentDefinition = {
  renderBody: (context: RankAdjustmentContext) => string;
};
