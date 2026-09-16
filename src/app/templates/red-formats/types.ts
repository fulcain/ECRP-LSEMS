export type REDTemplateContext = {
  applicant: string;
  reasons?: string[];
  medicName?: string;
  medicRank?: string;
  medicSignature?: string;
  denialType?: "IC" | "OOC";
  applyOtherChar?: "may" | "may not";
  weeks?: number;
  employeeName?: string;
  employmentRank?: string;
  /** Activity tier selected for the reinstatement offer (e.g. "EMT-P"). */
  offerTier?: string;
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
