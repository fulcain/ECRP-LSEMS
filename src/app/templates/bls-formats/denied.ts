import { BLSTemplateDefinition } from "./types";

export const deniedTemplate: BLSTemplateDefinition = {
  value: "denied",
  label: "Denied",
  accent: "from-red-700/25 via-rose-800/15 to-transparent",
  border: "border-red-600/30",
  badge: "bg-red-700/20 text-red-100 ring-1 ring-red-600/40",
  titleTag: "[DENIED] BLS Training",
  renderBody: ({
    applicant,
    medicName,
    medicRank,
    medicSignature,
    cooldownDays,
    reapplyDate,
  }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]FNAME LNAME[/i]";
    const rankLine = medicRank || "RANK | BLS RANK";
    const days = (cooldownDays ?? 0) > 0 ? cooldownDays : "X";
    const date = reapplyDate?.trim() || "Month Date";

    return `[img]https://i.postimg.cc/QNYPnqfM/BLS-Denied-Application.png[/img]
[LSEMSsubtitle]Application Status[/LSEMSsubtitle]
[divbox=white]
Dear [i]${applicant}[/i],

We regret to inform you that your BLS course application has been [color=red][b][u]DENIED[/u][/b][/color], due to disqualifying charges.

You may reapply in [b]${days} Days[/b] on [b]${date}[/b]. [color=gray][/color]

[hr][/hr]

Thank you for showing an interest in our course,

${signatureImg}
${nameLine}
${rankLine}
[b][i]Los Santos Emergency Medical Services[/i][/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
};
