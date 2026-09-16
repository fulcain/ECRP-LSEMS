export type LOATemplateContext = {
  personnelName: string;
  title: "Mr." | "Ms.";
  startDate: string;
  endDate: string;
  numberOfDays: number;
  medicName: string;
  medicRank: string;
  medicSignature: string;
  denialReasons?: string[];
  startWorkAt?: string;
  extendedStartDate?: string;
  extendedEndDate?: string;
  extendedNumberOfDays?: number;
  loaType?: "LOA" | "ROH";
  loaLink?: string;
};

export type LOATemplateDefinition = {
  value: string;
  label: string;
  accent: string;
  border: string;
  badge: string;
  bannerImg: string;
  divboxColor: string;
  renderBody: (context: LOATemplateContext) => string;
};
