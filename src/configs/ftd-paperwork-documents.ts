import { FileText, MessagesSquare, RefreshCcw, UserRound } from "lucide-react";
import type { PickerGroup } from "@/components/division/document-picker";

export type FormType =
  | "normal"
  | "reinstatement"
  | "civilianRideAlong"
  | "ftdDiscussionBoard";

/** The FTD Paperwork picker and app search share this document list. */
export const FTD_PAPERWORK_GROUPS: readonly PickerGroup<FormType>[] = [
  {
    label: "Write a session",
    hint: "An EMR you trained or reviewed - the session details are saved under the form.",
    documents: [
      {
        value: "normal",
        label: "Normal FT Paperwork",
        hint: "Field training phases for a new EMR.",
        icon: FileText,
      },
      {
        value: "reinstatement",
        label: "Reinstatement Paperwork",
        hint: "Phases for a previous Employee coming back.",
        icon: RefreshCcw,
      },
      {
        value: "civilianRideAlong",
        label: "Civilian Ride-Along",
        hint: "Accept, deny, hold or expire a request - or post the report.",
        icon: UserRound,
      },
    ],
  },
  {
    label: "Post on the board",
    hint: "FTD discussion topic - open a thread on the FTD board.",
    documents: [
      {
        value: "ftdDiscussionBoard",
        label: "Discussion Board",
        hint: "Open a topic in the FTD discussion board.",
        icon: MessagesSquare,
      },
    ],
  },
];
