import { REDTemplateDefinition } from "./types";

export const withdrawnTemplate: REDTemplateDefinition = {
  value: "withdrawn",
  label: "Application Withdrawn",
  accent: "from-slate-600/25 via-zinc-700/15 to-transparent",
  border: "border-slate-500/30",
  badge: "bg-slate-600/20 text-slate-100 ring-1 ring-slate-500/40",
  titleTag: "[Withdrawn]",
  renderBody: ({ applicant, medicName, medicRank, medicSignature }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Rank, RED Rank";

    return `[img]https://i.ibb.co/7d2V0mF6/y-CCu-Alh.png[/img]
[divbox=white]
[right][color=black]Pillbox Hill Medical Center[/color] [/right]
[right][color=black]Elgin Avenue, Pillbox Hill[/color] [/right]
[right][color=black]Los Santos, San Andreas[/color] [/right]
[right][color=transparent].[/color] [/right]
[right][color=transparent].[/color] [/right]
[center][b][size=160][color=Firebrick]APPLICATION WITHDRAWN[/color][/size][/b]
[img]https://i.ibb.co/xKYgq6P0/7x0vy1x.png[/img][/center]
 
Dear ${applicant},
 
We appreciate your interest in joining the Los Santos Emergency Medical Services. 
Unfortunately, you have informed us that you would not like to move forward in the application process. For that reason, your application has been [b][color=firebrick]WITHDRAWN[/color][/b].

You may reapply immediately.

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
