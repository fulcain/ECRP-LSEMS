export type PromotionRank =
  | "emt-b"
  | "emt-i"
  | "emt-a"
  | "master-emt"
  | "junior-paramedic"
  | "paramedic"
  | "senior-paramedic"
  | "lead-paramedic"
  | "lieutenant"
  | "captain"
  | "commander"
  | "deputy-chief"
  | "assistant-chief"
  | "chief";

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
