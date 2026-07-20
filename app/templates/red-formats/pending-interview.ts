import { REDTemplateDefinition } from "./types";

export const pendingInterviewTemplate: REDTemplateDefinition = {
  value: "pending-interview",
  label: " Pending Interview ((Reminder to send the Discord Invitation))",
  accent: "from-emerald-500/25 via-teal-500/15 to-transparent",
  border: "border-emerald-400/30",
  badge: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40",
  titleTag: "[Pending Interview]",
  renderBody: ({ applicant, medicName, medicRank, medicSignature }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Rank, Recruitment Division";

    return `[img]https://i.ibb.co/ymX6fdGK/yvwnkuk.png[/img]
[divbox=white]
[right][color=black]Pillbox Hill Medical Center[/color] [/right]
[right][color=black]Elgin Avenue, Pillbox Hill[/color] [/right]
[right][color=black]Los Santos, San Andreas[/color] [/right]
[right][color=transparent].[/color] [/right]
[right][color=transparent].[/color] [/right]
[center][b][size=160][color=Seagreen]PENDING INTERVIEW[/color][/size][/b]
[img]https://i.ibb.co/xKYgq6P0/7x0vy1x.png[/img][/center]
 
Dear ${applicant},
 
We are pleased to inform you that after a careful review of your application you have [color=Seagreen][b]PASSED[/b][/color] the first stage of our recruitment process. The next step will consist of a formal interview with a member of the Recruitment and Employment Division.

Please leave your availability as a response to this topic and we will contact you with your scheduled interview time. You may utilize [url=https://pastebin.com/raw/gAL7u3pY]this format[/url] for optimal scheduling.

[ooc] Once your application has received the status of [i]Pending Interview[/i], you will be sent the invitation link for the Official LSEMS Discord here on the government website. You can find it by looking at the top right corner and pressing [i]Private Messages[/i]. [/ooc]


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
