export const FTD_COMMAND_TABS = [
  { value: "emrs", label: "EMRs" },
  { value: "ftos", label: "FTOs" },
  { value: "emails", label: "Emails & Boards" },
  { value: "ftp", label: "FTP" },
  { value: "profiles", label: "Update Profiles" },
] as const;

export type FtdCommandTab = (typeof FTD_COMMAND_TABS)[number]["value"];
