import { REDTemplateDefinition } from "./types";

export const acceptedTemplate: REDTemplateDefinition = {
  value: "accepted",
  label: "Application Processed (Accepted)",
  accent: "from-emerald-500/25 via-green-500/15 to-transparent",
  border: "border-emerald-400/30",
  badge: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40",
  titleTag: "[ACCEPTED]",
  renderBody: ({ applicant, medicName, medicRank, medicSignature }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Rank, Recruitment Division";

    return `[img]https://i.ibb.co/238K858F/HUIBiac.png[/img]
[divbox=white]
[right][color=black]Pillbox Hill Medical Center[/color] [/right]
[right][color=black]Elgin Avenue, Pillbox Hill[/color] [/right]
[right][color=black]Los Santos, San Andreas[/color] [/right]
[right][color=transparent].[/color] [/right]
[right][color=transparent].[/color] [/right]
[center][b][size=160][color=Seagreen]APPLICATION ACCEPTED[/color][/size][/b]
[img]https://i.ibb.co/xKYgq6P0/7x0vy1x.png[/img][/center]
 
Dear ${applicant},
 
We are glad to inform you that upon passing our screening process and signing the employment contract, your application has been [color=Seagreen][b]ACCEPTED[/b][/color] and you are now an [b]Emergency Medical Responder[/b] with the Los Santos Emergency Medical Services.


We look forward to seeing you on duty soon. Congratulations!


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
