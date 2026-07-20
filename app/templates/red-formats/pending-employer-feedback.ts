import { REDTemplateDefinition } from "./types";

export const pendingEmployerFeedbackTemplate: REDTemplateDefinition = {
  value: "pending-employer-feedback",
  label: "Application On Hold - Pending Employer Feedback",
  accent: "from-sky-500/25 via-cyan-500/15 to-transparent",
  border: "border-sky-400/30",
  badge: "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40",
  titleTag: "[Pending Feedback]",
  renderBody: ({ applicant, medicName, medicRank, medicSignature }) => {
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
 
We would first like to thank you for your interest in becoming a part of the Los Santos Emergency Medical Services. We have reached out to your past employer to receive feedback and once this step has been completed you will hear back from us shortly.

Please be patient whilst we have reached out to your previous employer as this timeframe is dependent on how fast we receive a response.

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
