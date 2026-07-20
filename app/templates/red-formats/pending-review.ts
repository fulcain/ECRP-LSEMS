import { REDTemplateDefinition } from "./types";

export const pendingReviewTemplate: REDTemplateDefinition = {
  value: "pending-review",
  label: "Application Received (Pending Review)",
  accent: "from-emerald-500/25 via-green-500/15 to-transparent",
  border: "border-emerald-400/30",
  badge: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40",
  titleTag: "[Pending Review]",
  renderBody: ({ applicant, medicName, medicRank, medicSignature }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Rank, Recruitment Division";

    return `[img]https://i.ibb.co/ddCcBXV/SBZNl34.png[/img]
[divbox=white]
[right][color=black]Pillbox Hill Medical Center[/color] [/right]
[right][color=black]Elgin Avenue, Pillbox Hill[/color] [/right]
[right][color=black]Los Santos, San Andreas[/color] [/right]
[right][color=transparent].[/color] [/right]
[right][color=transparent].[/color] [/right]
[center][b][size=160][color=Forestgreen]APPLICATION RECEIVED[/color][/size][/b]
[img]https://i.ibb.co/xKYgq6P0/7x0vy1x.png[/img][/center]

 
Dear ${applicant},

The Recruitment and Employment Division of the Los Santos Emergency Medical Services has [color=Forestgreen][b]RECEIVED[/b][/color] your application. We will review your application, evaluate your qualifications, and perform the appropriate background checks. 

A member of RED will update the application status as soon as the initial review is completed.  

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
