import { REDTemplateDefinition } from "./types";

export const pendingEditTemplate: REDTemplateDefinition = {
  value: "pending-edit",
  label: "Pending Edit",
  accent: "from-sky-500/25 via-cyan-500/15 to-transparent",
  border: "border-sky-400/30",
  badge: "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40",
  renderBody: ({ applicant }) => `[quote][b]Pending Edit[/b][/quote]
Hello ${applicant},

[Replace this section with your Pending Edit response.]

Please make the requested updates and reply once finished.`,
};
