export type UpcomingCourseType = "new" | "reschedule" | "cancelled";

/** The three changes offered by the upcoming-courses builder. */
export const UPCOMING_COURSES = [
  {
    value: "new",
    label: "Add a class",
    hint: "Puts a new class on the upcoming-courses post.",
  },
  {
    value: "reschedule",
    label: "Reschedule a class",
    hint: "Moves a class that is already on the listing.",
  },
  {
    value: "cancelled",
    label: "Cancel a class",
    hint: "Strikes a class off the listing.",
  },
] as const satisfies readonly {
  value: UpcomingCourseType;
  label: string;
  hint: string;
}[];

/** The single upcoming-courses post and card that edits it. */
export const UPCOMING_COURSES_LISTING = {
  label: "Edit the listing",
  hint: "Add a class, move one, or strike one off - you pick which inside.",
} as const;
