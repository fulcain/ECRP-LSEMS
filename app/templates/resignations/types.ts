export type DischargeType = "Honorable" | "Dishonorable";

export type PersonnelFileDischargeContext = {
  date: string;
  dischargeType: DischargeType;
  dischargedBy: string;
  paperworkLink: string;
};

export type DischargeNoticeContext = {
  employeeRank: string;
  employeeName: string;
  date: string;
  dischargeType: DischargeType;
  reason: string;
  processedByName: string;
  processedByRank: string;
};

export type ResignationRemarksContext = {
  dischargeType: DischargeType;
  justification: string;
  signature: string;
  medicName: string;
  medicRank: string;
};

export type RevokeAccessContext = {
  employeeName: string;
};

export type PlayerLogContext = {
  date: string;
  employeeName: string;
  reason: string;
  rpLink?: string;
};
