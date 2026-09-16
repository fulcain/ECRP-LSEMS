import type React from "react";

export type ContractTab = "recruitment" | "reinstatement" | "emt-p";

export type MetadataKey =
  | "dateHired"
  | "phone"
  | "employeeNumber"
  | "employeeProfileLink"
  | "personnelFileLink"
  | "badgeNumber"
  | "personnelFileNumber";

export type ExternalLink = {
  label: string;
  url?: string;
  description: string;
  internal?: { href: string; label: string };
  copyText?: string;
  /** Copy/button stays disabled until all of these metadata fields are filled. */
  requiresMetadata?: MetadataKey[];
  /** Copy/button stays disabled until the applicant name is filled in. */
  requiresName?: boolean;
};

export type ContractStep = {
  id: string;
  title: string;
  description: string;
  oocBadge?: string;
  actions: ExternalLink[];
};

export type OOCStep = {
  id: string;
  label: string;
};

export type ContractWorkflow = {
  value: ContractTab;
  shortLabel: string;
  label: string;
  description: string;
  accent: string;
  border: string;
  badge: string;
  icon: React.ReactNode;
  steps: ContractStep[];
  quickLinks: ExternalLink[];
  oocList: OOCStep[];
};
