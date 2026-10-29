import { ROUTES } from "@/configs/routes";

/** Addressable tabs inside Supervisor Tools, available to app-wide search. */
export const SUPERVISOR_SEARCH_TABS = [
  { label: "LOA Processing", value: "loa" },
  { label: "Meetings", value: "meetings" },
  { label: "Contract Signing", value: "contract" },
  { label: "Promotions", value: "promotions" },
  { label: "Resignations", value: "resignations" },
] as const;

export function supervisorSearchHref(value: (typeof SUPERVISOR_SEARCH_TABS)[number]["value"]): string {
  return `${ROUTES.management.supervisor}?tab=${value}`;
}
