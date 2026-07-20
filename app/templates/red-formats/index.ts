import { acceptedTemplate } from "./accepted";
import { deniedTemplate } from "./denied";
import { discordInviteTemplate } from "./discord-invite";
import { feedbackRequestTemplate } from "./feedback-request";
import { frdFeedbackRequestTemplate } from "./frd-feedback-request";
import { interviewScheduledTemplate } from "./interview-scheduled";
import { pendingContractTemplate } from "./pending-contract";
import { pendingDecisionTemplate } from "./pending-decision";
import { pendingEditTemplate } from "./pending-edit";
import { pendingEmployerFeedbackTemplate } from "./pending-employer-feedback";
import { pendingInterviewTemplate } from "./pending-interview";
import { pendingReviewTemplate } from "./pending-review";
import { withdrawnTemplate } from "./withdrawn";

export { type REDTemplateDefinition } from "./types";

export const redTemplates = [
  pendingReviewTemplate,         // 8.1 - Application Received
  pendingEditTemplate,           // 8.2 - Application On Hold
  deniedTemplate,                // 8.3 - Application Denied
  withdrawnTemplate,             // 8.4 - Application Withdrawn
  pendingInterviewTemplate,      // 8.5 - Pending Interview
  interviewScheduledTemplate,    // 8.6 - Interview Scheduled
  pendingDecisionTemplate,       // 8.7 - Pending Decision
  pendingContractTemplate,       // 8.9 - Pending Employment Contract
  acceptedTemplate,              // 8.10 - Application Processed
  feedbackRequestTemplate,       // 8.11 - Employee Feedback Request
  frdFeedbackRequestTemplate,    // 8.12 - FRD Feedback Request
  pendingEmployerFeedbackTemplate, // 8.13 - Pending Employer Feedback
  discordInviteTemplate,         // 8.15 - Discord Invite
] as const;
