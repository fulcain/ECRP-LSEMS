import { REDTemplateDefinition } from "./types";

export const pendingInterviewTemplate: REDTemplateDefinition = {
  value: "pending-interview",
  label: "Pending Interview",
  accent: "from-violet-500/25 via-fuchsia-500/15 to-transparent",
  border: "border-violet-400/30",
  badge: "bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/40",
  renderBody: ({ applicant }) => `[quote][b]Pending Interview[/b][/quote]
Hello ${applicant},

[Replace this section with your Pending Interview response.]

Watch the desk for the next update regarding your interview.`,
};
