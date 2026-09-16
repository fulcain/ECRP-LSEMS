import { approvedLOATemplate } from "./approved";
import { deniedLOATemplate } from "./denied";
import { extendedLOATemplate } from "./extended";
import { expiredLOATemplate } from "./expired";
import { LOATemplateDefinition } from "./types";

export type { LOATemplateContext, LOATemplateDefinition } from "./types";

export const loaTemplates: LOATemplateDefinition[] = [
  approvedLOATemplate,
  deniedLOATemplate,
  extendedLOATemplate,
  expiredLOATemplate,
];
