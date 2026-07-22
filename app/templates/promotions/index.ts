import { emtBEmailTemplate } from "./emails/emt-b";
import { emtIEmailTemplate } from "./emails/emt-i";
import { emtAEmailTemplate } from "./emails/emt-a";
import { masterEMTEmailTemplate } from "./emails/master-emt";
import { personnelFilePostDefs } from "./personnel-file-posts";
import { rankAdjustmentTemplate } from "./rank-adjustment";

export type {
  PromotionRank,
  PromotionEmailContext,
  PromotionEmailDefinition,
  PersonnelFilePostContext,
  PersonnelFilePostDefinition,
  RankAdjustmentContext,
  RankAdjustmentDefinition,
} from "./types";

export { rankInfo, allRanks } from "./rank-info";

export const promotionEmailTemplates = [
  emtBEmailTemplate,
  emtIEmailTemplate,
  emtAEmailTemplate,
  masterEMTEmailTemplate,
];

export { personnelFilePostDefs, rankAdjustmentTemplate };
