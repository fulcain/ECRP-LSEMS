import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  GraduationCap,
  Handshake,
  MessagesSquare,
  PauseCircle,
  Pencil,
  ShieldCheck,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";

import {
  UPCOMING_COURSES,
  UPCOMING_COURSES_LISTING,
  type UpcomingCourseType,
} from "./UpcomingCourseProcessor";

import { DISCUSSION_BOARDS } from "@/app/constants/divisions/discussion-boards";
import { blsTemplates } from "@/app/templates/bls-formats";
import {
  COURSE_REPORTS,
  type CourseReportType,
} from "@/app/templates/bls-formats/course-report";
import type {
  PickerDocument,
  PickerGroup,
} from "@/components/division/document-picker";

/**
 * Everything the BLS Paperwork tab can write, as the member decides it: the
 * reply to an application, the report after a course has run, or a post on one
 * of the boards.
 *
 * Only the plain-language hint and the icon live here - a format's name is read
 * from the template that renders it, so a template cannot be renamed in one
 * place and left stale in the other. Adding a BLS format means adding one entry
 * to a group below; `npm run extension:check` asserts every declared template
 * is offered here, so a new one cannot go missing from the picker.
 */
export type BLSBoardKey =
  | "blsDiscussionBoard"
  | "blsSeniorInstructorBoard";

const BLS_BOARD_KEYS: readonly BLSBoardKey[] = [
  "blsDiscussionBoard",
  "blsSeniorInstructorBoard",
];

/** Narrow a picker value to a board, so the composer takes it without a cast. */
export function isBLSBoardKey(value: BLSWorkItem): value is BLSBoardKey {
  return (BLS_BOARD_KEYS as readonly string[]).includes(value);
}

/** Whether a `?format=` link names a document this picker offers. */
export function isBLSDocument(value: string): value is BLSWorkItem {
  return BLS_PAPERWORK.some((group) =>
    group.documents.some((doc) => doc.value === value),
  );
}

/** The one card the upcoming-courses listing gets: its change is the builder's dropdown. */
export const BLS_LISTING = "course-listing";

export type BLSWorkItem =
  | "accepted"
  | "denied"
  | "expired"
  | "on-hold"
  | "upcoming-class"
  | "quick-guide"
  | BLSBoardKey
  | CourseReportType
  | typeof BLS_LISTING;

/** Whether a value names one of the three course reports. */
export function isBLSCourseReport(value: string): value is CourseReportType {
  return COURSE_REPORTS.some((report) => report.value === value);
}

/**
 * Whether a value names one of the upcoming-courses changes. The picker no
 * longer offers them one by one, so this reads a retired `?type=` link.
 */
export function isUpcomingCourseType(
  value: string,
): value is UpcomingCourseType {
  return UPCOMING_COURSES.some((action) => action.value === value);
}

/**
 * The half of the picker that is a template rather than something a builder of
 * its own writes (a board, a course report, a change to the listing).
 */
type BLSFormatValue = Exclude<
  BLSWorkItem,
  BLSBoardKey | CourseReportType | typeof BLS_LISTING
>;

function formatDocument(
  value: BLSFormatValue,
  hint: string,
  icon: LucideIcon,
): PickerDocument<BLSWorkItem> {
  const template = blsTemplates.find((entry) => entry.value === value);
  // A card whose title went missing would be a blank button, so it fails
  // loudly rather than rendering one.
  if (!template) throw new Error(`No BLS template is declared for "${value}".`);
  return { value, label: template.label, hint, icon };
}

/**
 * A course report is written by the report module rather than a template, so
 * its name is read from `COURSE_REPORTS` - the same list the report itself is
 * built from.
 */
function courseReportDocument(
  value: CourseReportType,
  hint: string,
  icon: LucideIcon,
): PickerDocument<BLSWorkItem> {
  const report = COURSE_REPORTS.find((entry) => entry.value === value);
  if (!report)
    throw new Error(`No BLS course report is declared for "${value}".`);
  return { value, label: report.label, hint, icon };
}

export const BLS_PAPERWORK: readonly PickerGroup<BLSWorkItem>[] = [
  {
    label: "Course applications",
    hint: "Someone applied for a course - this is the answer that goes on their application.",
    documents: [
      formatDocument(
        "accepted",
        "They passed - tell them a course can be booked.",
        CheckCircle2,
      ),
      formatDocument(
        "denied",
        "The application is refused.",
        XCircle,
      ),
      formatDocument(
        "on-hold",
        "You need something from them before deciding.",
        PauseCircle,
      ),
      formatDocument(
        "expired",
        "They never got back to us in time.",
        Clock,
      ),
    ],
  },
  {
    label: "Course details",
    hint: "What goes on GOV for the class itself.",
    documents: [
      formatDocument(
        "upcoming-class",
        "Announce a class date, time and location.",
        CalendarClock,
      ),
      formatDocument(
        "quick-guide",
        "The reference post staff point new members at.",
        BookOpen,
      ),
    ],
  },
  {
    label: "Upcoming course listing",
    hint: "The one post that lists the classes coming up - what goes on it, and what comes off.",
    documents: [
      {
        value: BLS_LISTING,
        label: UPCOMING_COURSES_LISTING.label,
        hint: UPCOMING_COURSES_LISTING.hint,
        icon: Pencil,
      },
    ],
  },
  {
    label: "Course reports",
    hint: "The class has run - this is the report that goes on GOV afterwards.",
    documents: [
      courseReportDocument(
        "joint",
        "A course run together with another department.",
        Handshake,
      ),
      courseReportDocument(
        "normal",
        "A normal BLS course, run by us alone.",
        GraduationCap,
      ),
      courseReportDocument(
        "ots",
        "A class taught on the spot, with no application behind it.",
        Zap,
      ),
    ],
  },
  {
    label: "Post on the boards",
    hint: "No applicant and no class - just a topic written in the BLS house style.",
    documents: [
      {
        value: "blsDiscussionBoard",
        label: DISCUSSION_BOARDS.blsDiscussionBoard.label,
        hint: DISCUSSION_BOARDS.blsDiscussionBoard.description,
        icon: MessagesSquare,
      },
      {
        value: "blsSeniorInstructorBoard",
        label: DISCUSSION_BOARDS.blsSeniorInstructorBoard.label,
        hint: DISCUSSION_BOARDS.blsSeniorInstructorBoard.description,
        icon: ShieldCheck,
      },
    ],
  },
];
