import { REDTemplateDefinition } from "./types";

export const pendingDecisionTemplate: REDTemplateDefinition = {
  value: "pending-decision",
  label: "Pending Decision",
  accent: "from-orange-500/25 via-amber-500/15 to-transparent",
  border: "border-orange-400/30",
  badge: "bg-orange-500/20 text-orange-100 ring-1 ring-orange-400/40",
  titleTag: "[Pending Decision]",
  renderBody: ({ applicant, medicName, medicRank, medicSignature }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Rank, Recruitment Division";

    return `[img]https://i.ibb.co/Qv0tBKD6/6w-KFjwv.png[/img]
[divbox=white]
[right][color=black]Pillbox Hill Medical Center[/color] [/right]
[right][color=black]Elgin Avenue, Pillbox Hill[/color] [/right]
[right][color=black]Los Santos, San Andreas[/color] [/right]
[right][color=transparent].[/color] [/right]
[right][color=transparent].[/color] [/right]
[center][b][size=160][color=coral]PENDING DECISION[/color][/size][/b]
[img]https://i.ibb.co/xKYgq6P0/7x0vy1x.png[/img][/center]
 
Dear ${applicant},
 
We appreciate your interest in joining the LSEMS. Please allow us up to 48 hours to decide on the result of your interview. You will find our decision as a response to this topic along with instructions on what to do next.

Thank you for your patience.

[hr][/hr]
Sincerely,
 
${signatureImg}
${nameLine}
${rankLine}
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
};
