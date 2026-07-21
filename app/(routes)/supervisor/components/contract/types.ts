import type React from "react";

export type ContractTab = "recruitment" | "reinstatement" | "emt-p";

export type ExternalLink = {
  label: string;
  url?: string;
  description: string;
  internal?: { href: string; label: string };
  copyText?: string;
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
