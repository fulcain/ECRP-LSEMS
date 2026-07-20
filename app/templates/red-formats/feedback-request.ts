import { REDTemplateDefinition } from "./types";

export const feedbackRequestTemplate: REDTemplateDefinition = {
  value: "feedback-request",
  label: "Feedback Request",
  accent: "from-blue-500/25 via-indigo-500/15 to-transparent",
  border: "border-blue-400/30",
  badge: "bg-blue-500/20 text-blue-100 ring-1 ring-blue-400/40",
  renderBody: ({
    applicant,
    medicName,
    medicRank,
    medicSignature,
  }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Rank, Recruitment Division";
    const empName = applicant?.trim() || "Fname Lname";

    return `[img]https://i.ibb.co/7xQvQQQR/HNP4ks-W.png[/img]
[divbox=white]
[img]https://i.ibb.co/v6VwdjB6/9u-Gi-Pq-F.png[/img][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]Los Santos Emergency Medical Services[/size][/b]
[i]Employee Feedback Request[/i]
[/right][/aligntable]
[hr][/hr]
Good Day,

I am reaching out to you today as a representative from the LSEMS Recruitment and Employment Division. One of your current/past employees, [b]${empName}[/b], has applied to be a part of the Los Santos Emergency Medical Services. 

I hereby request access to their file, most importantly, their disciplinary action history and activity within the department. I also wish to have a brief statement from their direct supervisor, if possible, along with the other requested information. If you have any other additional information to share about the requested employees, do not hesitate to share them.

[ooc]We are also asking that you provide any OOC notes you might have on the employee as we are also looking into their OOC Behavior and RP standards[/ooc]

[hr][/hr]
Kind regards,

${signatureImg}
${nameLine}
${rankLine}
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
};
