import { acceptedTemplate } from "./accepted";
import { pendingEditTemplate } from "./pending-edit";
import { pendingInterviewTemplate } from "./pending-interview";
import { pendingReviewTemplate } from "./pending-review";

export { type REDTemplateDefinition } from "./types";

export const redTemplates = [
  pendingReviewTemplate,
  pendingEditTemplate,
  pendingInterviewTemplate,
  acceptedTemplate,
] as const;
