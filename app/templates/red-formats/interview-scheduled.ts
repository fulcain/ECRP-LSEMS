import { REDTemplateDefinition } from "./types";

export const interviewScheduledTemplate: REDTemplateDefinition = {
  value: "interview-scheduled",
  label: "Interview Scheduled",
  accent: "from-teal-500/25 via-cyan-500/15 to-transparent",
  border: "border-teal-400/30",
  badge: "bg-teal-500/20 text-teal-100 ring-1 ring-teal-400/40",
  titleTag: "[Interview Scheduled]",
  renderBody: ({
    applicant,
    medicName,
    medicRank,
    medicSignature,
    interviewDate,
    interviewTime,
  }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Rank, Recruitment Division";
    const date = interviewDate?.trim() || "*date*";
    const time = interviewTime?.trim() || "*time*";

    return `[img]https://i.ibb.co/qMpHz5W4/x-Ig-Db2-F.png[/img]
[divbox=white]
[right][color=black]Pillbox Hill Medical Center[/color] [/right]
[right][color=black]Elgin Avenue, Pillbox Hill[/color] [/right]
[right][color=black]Los Santos, San Andreas[/color] [/right]
[right][color=transparent].[/color] [/right]
[right][color=transparent].[/color] [/right]
[center][b][size=160][color=Seagreen]INTERVIEW SCHEDULED[/color][/size][/b]
[img]https://i.ibb.co/xKYgq6P0/7x0vy1x.png[/img][/center]
 
Dear ${applicant},
 
After checking our available time slots and considering the time convenient for you, we have decided to book your interview on the following schedule below:

[b][u]Interview Schedule[/u][/b]
${date} | ${time} ((UTC)) at Pillbox Hill Medical Center, Elgin Avenue

Please wait in the main lobby of Upper Pillbox for a representative to collect you. You are expected to wear a formal outfit suitable for an interview and present yourself with a government-issued ID.

Note that you are welcome to show up for an interview before the scheduled date, but we cannot guarantee that a member of RED will be available to conduct it outside of the scheduled time.

Should the schedule be inconvenient for you, you may ask for a reschedule by replying to this topic. Failure to do so will be considered an automatic agreement to the scheduled date.
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
