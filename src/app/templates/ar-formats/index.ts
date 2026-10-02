import { arCertificationTemplate } from "./certification";
import { arCertificateTemplate } from "./certificate";
import { arIrregularityTemplate } from "./irregularity";
import { mrCertificationTemplate } from "./mr-certification";
import { mrCertificateTemplate } from "./mr-certificate";
import { mrIrregularityTemplate } from "./mr-irregularity";

export {
  arCertificationTemplate,
  arCertificateTemplate,
  arIrregularityTemplate,
  mrCertificationTemplate,
  mrCertificateTemplate,
  mrIrregularityTemplate,
};

export type {
  ARCertificationContext,
  ARCertificateContext,
  ARIrregularityContext,
  MRCertificationContext,
  MRCertificateContext,
} from "./types";

export const arTemplates = [
  arCertificationTemplate,
  arCertificateTemplate,
  arIrregularityTemplate,
  mrCertificationTemplate,
  mrCertificateTemplate,
  mrIrregularityTemplate,
] as const;
