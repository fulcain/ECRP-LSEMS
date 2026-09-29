import {
  BadgeCheck,
  CalendarCheck,
  FileSignature,
  Handshake,
  HelpCircle,
  Hourglass,
  Inbox,
  MessageSquare,
  MessageSquareQuote,
  MessagesSquare,
  PauseCircle,
  PencilLine,
  Scale,
  Send,
  UserMinus,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { DISCUSSION_BOARDS } from "@/app/constants/divisions/discussion-boards";
import { redTemplates } from "@/app/templates/red-formats";
import type {
  PickerDocument,
  PickerGroup,
} from "@/components/division/document-picker";

/**
 * The RED paperwork, grouped by where the applicant is in the process rather
 * than by the order the documents are numbered: a recruiter opens this page
 * knowing the applicant's stage, not the form's number.
 *
 * A format's name is read from the template that renders it, so only the
 * plain-language hint lives here. Adding a RED format is one entry in the group
 * it belongs to; `npm run extension:check` asserts every declared template is
 * offered here, so a new one cannot go missing from the picker.
 */
export type REDBoardKey = "redDiscussionBoard";

const RED_BOARD_KEYS: readonly REDBoardKey[] = ["redDiscussionBoard"];

/** Narrow a picker value to the board, so the composer takes it without a cast. */
export function isREDBoardKey(value: REDWorkItem): value is REDBoardKey {
  return (RED_BOARD_KEYS as readonly string[]).includes(value);
}

/** Whether a `?format=` link names a document this picker offers. */
export function isREDDocument(value: string): value is REDWorkItem {
  return RED_PAPERWORK.some((group) =>
    group.documents.some((doc) => doc.value === value),
  );
}

export type REDWorkItem =
  | "pending-review"
  | "pending-edit"
  | "pending-employer-feedback"
  | "withdrawn"
  | "pending-interview"
  | "interview-scheduled"
  | "denied"
  | "pending-decision"
  | "pending-contract"
  | "accepted"
  | "discord-invite"
  | "reinstatement-received"
  | "reinstatement-on-hold"
  | "reinstatement-offer"
  | "reinstatement-contract"
  | "reinstatement-accepted"
  | "reinstatement-denied"
  | "feedback-request"
  | "frd-feedback-request"
  | REDBoardKey;

/** The half of the picker that is a template rather than the board. */
type REDFormatValue = Exclude<REDWorkItem, REDBoardKey>;

function formatDocument(
  value: REDFormatValue,
  hint: string,
  icon: LucideIcon,
  /** Only where the template's own label carries a note the card should not:
   *  the card names the stage, and the note stays in the builder. */
  title?: string,
): PickerDocument<REDWorkItem> {
  const template = redTemplates.find((entry) => entry.value === value);
  // A card whose title went missing would be a blank button, so it fails
  // loudly rather than rendering one.
  if (!template) throw new Error(`No RED template is declared for "${value}".`);
  return { value, label: title ?? template.label.trim(), hint, icon };
}

export const RED_PAPERWORK: readonly PickerGroup<REDWorkItem>[] = [
  {
    label: "New applications",
    hint: "Where their application sits right now.",
    documents: [
      formatDocument(
        "pending-review",
        "A new application is in - acknowledge it and say what happens next.",
        Inbox,
      ),
      formatDocument(
        "pending-edit",
        "They have to fix something before you can carry on.",
        PencilLine,
      ),
      formatDocument(
        "pending-employer-feedback",
        "You are waiting on their employer to reply.",
        Hourglass,
      ),
      formatDocument(
        "withdrawn",
        "The applicant pulled out.",
        UserMinus,
      ),
    ],
  },
  {
    label: "Interviews",
    hint: "From booking the interview to its result.",
    documents: [
      formatDocument(
        "pending-interview",
        "A spot needs booking - remind them to join Discord.",
        HelpCircle,
        "Pending Interview",
      ),
      formatDocument(
        "interview-scheduled",
        "The interview is booked - send them the time.",
        CalendarCheck,
      ),
      formatDocument(
        "denied",
        "They did not pass the interview.",
        XCircle,
      ),
    ],
  },
  {
    label: "Decision & onboarding",
    hint: "After the interview.",
    documents: [
      formatDocument(
        "pending-decision",
        "The interview is done and the outcome is being decided.",
        Scale,
      ),
      formatDocument(
        "pending-contract",
        "They accepted - the employment contract is with them.",
        FileSignature,
      ),
      formatDocument(
        "accepted",
        "All done - the application is processed.",
        BadgeCheck,
      ),
      formatDocument(
        "discord-invite",
        "Send them the Discord invite code.",
        Send,
        "Discord Invite",
      ),
    ],
  },
  {
    label: "Reinstatement",
    hint: "For someone who served before and wants to come back.",
    documents: [
      formatDocument(
        "reinstatement-received",
        "We have their reinstatement request.",
        Inbox,
      ),
      formatDocument(
        "reinstatement-on-hold",
        "Their reinstatement has to wait.",
        PauseCircle,
      ),
      formatDocument(
        "reinstatement-offer",
        "Offer them their rank and hours back.",
        Handshake,
      ),
      formatDocument(
        "reinstatement-contract",
        "The contract that comes with the offer.",
        FileSignature,
      ),
      formatDocument(
        "reinstatement-accepted",
        "Approved - welcome them back.",
        BadgeCheck,
      ),
      formatDocument(
        "reinstatement-denied",
        "The reinstatement is turned down.",
        XCircle,
      ),
    ],
  },
  {
    label: "Feedback",
    hint: "Asking someone else for their read on an employee or applicant.",
    documents: [
      formatDocument(
        "feedback-request",
        "Ask an employee how their RED course went.",
        MessageSquareQuote,
      ),
      formatDocument(
        "frd-feedback-request",
        "Ask FRD for feedback on an applicant.",
        MessageSquare,
      ),
    ],
  },
  {
    label: "Post on the board",
    hint: "Nothing to attach - just a topic written in the RED house style.",
    documents: [
      {
        value: "redDiscussionBoard",
        label: DISCUSSION_BOARDS.redDiscussionBoard.label,
        hint: DISCUSSION_BOARDS.redDiscussionBoard.description,
        icon: MessagesSquare,
      },
    ],
  },
];
