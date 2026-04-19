import { REDTemplateDefinition } from "./types";

export const acceptedTemplate: REDTemplateDefinition = {
  value: "accepted",
  label: "Accepted",
  accent: "from-emerald-500/25 via-green-500/15 to-transparent",
  border: "border-emerald-400/30",
  badge: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40",
  renderBody: ({ applicant }) => `[quote][b]Accepted[/b][/quote]
Hello ${applicant},

[Replace this section with your Accepted response.]

Welcome aboard, and keep an eye on the next steps from RED.`,
};
