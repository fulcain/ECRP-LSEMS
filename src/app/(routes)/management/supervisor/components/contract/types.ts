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
  /**
   * The post title handed to the browser extension alongside `copyText`. Use it
   * when a step posts a body and a title at once (a profile thread, a rank
   * adjustment); without it a body is copied as a body and a bare line as a
   * title.
   */
  postTitle?: string;
  /** Copy/button stays disabled until all of these metadata fields are filled. */
  requiresMetadata?: MetadataKey[];
  /** Copy/button stays disabled until the applicant name is filled in. */
  requiresName?: boolean;
  /**
   * Fill only the canonical `{{applicantName}}` token and leave the legacy
   * spellings (`Fname Lname` and friends) standing. The FTP profiles are the
   * one copy that wants this: their name comes once, in the Student (or
   * Reinstatee) Information line, and every other touch of the name in them is
   * the form's own blank - the Personnel File Post's `Fname Lname`, the
   * ride-along signature - which the trainer fills, not the hire.
   */
  canonicalNameOnly?: boolean;
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
