export type BLSTemplateContext = {
  applicant: string;
  reasons?: string[];
  medicName?: string;
  medicRank?: string;
  medicSignature?: string;
  cooldownDays?: number;
  reapplyDate?: string;
  courseDate?: string;
  courseTime?: string;
};

export type BLSTemplateDefinition = {
  value: string;
  label: string;
  accent: string;
  border: string;
  badge: string;
  titleTag?: string;
  renderBody: (context: BLSTemplateContext) => string;
};
