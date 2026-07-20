import { REDTemplateDefinition } from "./types";

export const deniedTemplate: REDTemplateDefinition = {
  value: "denied",
  label: "Interview Failed (Denied)",
  accent: "from-red-700/25 via-rose-800/15 to-transparent",
  border: "border-red-600/30",
  badge: "bg-red-700/20 text-red-100 ring-1 ring-red-600/40",
  titleTag: "[DENIED]",
  renderBody: ({
    applicant,
    reasons,
    medicName,
    medicRank,
    medicSignature,
    denialType,
    weeks,
  }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Rank, Recruitment Division";
    const denialTypeLabel = denialType || "OOC";
    const canReapplyOtherChar = denialType === "IC" ? "may not" : "may";
    const weeksNum = weeks || 2;

    return `[img]https://i.ibb.co/W1VmKfh/nxi-E8Ho.png[/img]
[divbox=white]
[right][color=black]Pillbox Hill Medical Center[/color] [/right]
[right][color=black]Elgin Avenue, Pillbox Hill[/color] [/right]
[right][color=black]Los Santos, San Andreas[/color] [/right]
[right][color=transparent].[/color] [/right]
[right][color=transparent].[/color] [/right]
[center][b][size=160][color=Firebrick]APPLICATION DENIED[/color][/size][/b]
[img]https://i.ibb.co/xKYgq6P0/7x0vy1x.png[/img][/center]
 
Dear ${applicant},
 
Thank you for applying to the Los Santos Emergency Medical Services. 
After reviewing your application, we regret to inform you that we will not be moving forward with your application. You have been [color=Firebrick][b]DENIED[/b][/color] for the following reason(s):


[list]
${
  reasons && reasons.length > 0
    ? reasons.filter(Boolean).map((r) => `[*] ${r}`).join("\n")
    : "[*] REASON\n[*] REASON"
}
[/list]

You may apply again after [color=firebrick][b]${weeksNum} weeks[/b][/color]. ((This is an [color=firebrick][b]${denialTypeLabel}[/b][/color] denial and you [color=firebrick][b]${canReapplyOtherChar}[/b][/color] apply on a different character before the denial timeframe is done.))

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
