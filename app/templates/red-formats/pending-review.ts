import { REDTemplateDefinition } from "./types";

export const pendingReviewTemplate: REDTemplateDefinition = {
  value: "pending-review",
  label: "Pending Review",
  accent: "from-amber-500/25 via-orange-500/15 to-transparent",
  border: "border-amber-400/30",
  badge: "bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/40",
  renderBody: ({ applicant }) => `[quote][b]Pending Review[/b][/quote]
Hello ${applicant},

[Replace this section with your Pending Review response.]

If anything else is needed, we will reach out again.`,
};
