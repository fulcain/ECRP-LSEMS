import { REDTemplateDefinition } from "./types";

export const pendingEditTemplate: REDTemplateDefinition = {
  value: "pending-edit",
  label: "Application On Hold (Pending Edit)",
  accent: "from-sky-500/25 via-cyan-500/15 to-transparent",
  border: "border-sky-400/30",
  badge: "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40",
  titleTag: "[Pending Edit]",
  renderBody: ({ applicant, reasons, medicName, medicRank, medicSignature }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Rank, Recruitment Division";

    return `[img]https://i.ibb.co/mrN6MdMy/m-Je9I1A.png[/img]
[divbox=white]
[right][color=black]Pillbox Hill Medical Center[/color] [/right]
[right][color=black]Elgin Avenue, Pillbox Hill[/color] [/right]
[right][color=black]Los Santos, San Andreas[/color] [/right]
[right][color=transparent].[/color] [/right]
[right][color=transparent].[/color] [/right]
[center][b][size=160][color=Coral]APPLICATION ON-HOLD[/color][/size][/b]
[img]https://i.ibb.co/xKYgq6P0/7x0vy1x.png[/img][/center]
 
Dear ${applicant},
 
We would first like to thank you for your interest in becoming a part of the Los Santos Emergency Medical Services. However, we have some concerns regarding your application. As such, your application has been placed [color=Coral][b]ON-HOLD[/b] [/color]until these issues are resolved.


[list]
${
  reasons && reasons.length > 0
    ? reasons.filter(Boolean).map((r) => `[*] ${r}`).join("\n")
    : "[*] REASON\n[*] REASON\n[*] REASON"
}
[/list]

You have 2 days to correct your application. When ALL of the above issues have been resolved, reply to this thread to notify us.


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
