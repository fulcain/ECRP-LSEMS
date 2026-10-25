import { emtBEmailTemplate } from "./emails/emt-b";
import { emtIEmailTemplate } from "./emails/emt-i";
import { emtAEmailTemplate } from "./emails/emt-a";
import { masterEMTEmailTemplate } from "./emails/master-emt";
import { personnelFilePostDefs } from "./personnel-file-posts";
import { rankAdjustmentTemplate } from "./rank-adjustment";
import { divisionalPersonnelFileTemplate } from "./divisional-personnel-file";

export type {
  PromotionRank,
  PromotionEmailContext,
  PromotionEmailDefinition,
  PersonnelFilePostContext,
  PersonnelFilePostDefinition,
  RankAdjustmentContext,
  RankAdjustmentDefinition,
  DivisionalPersonnelFileContext,
  DivisionalPersonnelFileDefinition,
} from "./types";

export {
  rankInfo,
  allRanks,
  rankOrderLowToHigh,
  rankOrderHighToLow,
} from "./rank-info";

export const promotionEmailTemplates = [
  emtBEmailTemplate,
  emtIEmailTemplate,
  emtAEmailTemplate,
  masterEMTEmailTemplate,
];

export { personnelFilePostDefs, rankAdjustmentTemplate, divisionalPersonnelFileTemplate };
