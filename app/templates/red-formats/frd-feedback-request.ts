import { REDTemplateDefinition } from "./types";

export const frdFeedbackRequestTemplate: REDTemplateDefinition = {
  value: "frd-feedback-request",
  label: "FRD Feedback Request",
  accent: "from-violet-500/25 via-purple-500/15 to-transparent",
  border: "border-violet-400/30",
  badge: "bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/40",
  renderBody: ({
    employeeName,
    medicName,
    medicRank,
    medicSignature,
  }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Rank, Recruitment Division";
    const applicant = employeeName?.trim() || "Firstname Lastname";

    return `[img]https://i.ibb.co/7xQvQQQR/HNP4ks-W.png[/img]
[divbox=white]
[img]https://i.ibb.co/v6VwdjB6/9u-Gi-Pq-F.png[/img][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]Los Santos Emergency Medical Services[/size][/b]
[i]Reformee Feedback Request[/i]
[/right][/aligntable]
[hr][/hr]
Good Day,

I am reaching out to you today as a representative from the LSEMS Recruitment and Employment Division. One of our Applicants, [b]${applicant}[/b], has indicated that they have undergone the SADOC's Felon Reformation Program, and we would like to request your feedback on them, along with access to their FRD File.

[ooc]We are requesting both IC and OOC feedback.[/ooc]

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
