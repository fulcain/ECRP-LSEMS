import { arCertificationTemplate } from "./certification";
import { arCertificateTemplate } from "./certificate";

export { arCertificationTemplate, arCertificateTemplate };

export type {
  ARCertificationContext,
  ARCertificateContext,
} from "./types";

export const arTemplates = [
  arCertificationTemplate,
  arCertificateTemplate,
] as const;
