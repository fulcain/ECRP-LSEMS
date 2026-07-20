export type REDTemplateContext = {
  applicant: string;
  reasons?: string[];
  medicName?: string;
  medicRank?: string;
  medicSignature?: string;
  denialType?: "IC" | "OOC";
  weeks?: number;
  employeeName?: string;
  interviewDate?: string;
  interviewTime?: string;
};

export type REDTemplateDefinition = {
  value: string;
  label: string;
  accent: string;
  border: string;
  badge: string;
  titleTag?: string;
  renderBody: (context: REDTemplateContext) => string;
};
