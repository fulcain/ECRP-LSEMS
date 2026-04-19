export type REDTemplateContext = {
  applicant: string;
};

export type REDTemplateDefinition = {
  value: string;
  label: string;
  accent: string;
  border: string;
  badge: string;
  renderBody: (context: REDTemplateContext) => string;
};
