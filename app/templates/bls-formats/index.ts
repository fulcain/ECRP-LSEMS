import { acceptedTemplate } from "./accepted";
import { deniedTemplate } from "./denied";
import { expiredTemplate } from "./expired";
import { onHoldTemplate } from "./on-hold";
import { upcomingClassTemplate } from "./upcoming-class";

export { type BLSTemplateDefinition } from "./types";

export const blsTemplates = [
  acceptedTemplate, // Application accepted
  deniedTemplate, // Application denied
  expiredTemplate, // Application expired
  onHoldTemplate, // Application on hold
  upcomingClassTemplate, // Upcoming class notification
] as const;
