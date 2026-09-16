import { BLSTemplateDefinition } from "./types";

export const onHoldTemplate: BLSTemplateDefinition = {
  value: "on-hold",
  label: "On Hold",
  accent: "from-amber-500/25 via-yellow-500/15 to-transparent",
  border: "border-amber-400/30",
  badge:
    "bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/40",
  titleTag: "[ON HOLD] BLS Training",
  renderBody: ({ applicant, reasons, medicName, medicRank, medicSignature }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]FNAME LNAME[/i]";
    const rankLine = medicRank || "RANK | BLS RANK";

    return `[img]https://i.postimg.cc/ryHn9wp6/BLS-Application-On-Hold.png[/img]
[LSEMSsubtitle]Application Status[/LSEMSsubtitle]
[divbox=white]
Dear [i]${applicant}[/i],

Thank you for showing interest in our BLS course - unfortunately, your application has been put [color=orange][b][u]ON HOLD[/u][/b][/color] for the following reason(s):

[list]
${
  reasons && reasons.length > 0
    ? reasons.filter(Boolean).map((r) => `[*] ${r}`).join("\n")
    : "[*] REASON HERE"
}
[/list]

Once the issue(s) above have been resolved, please respond to this thread to notify us.

[hr][/hr]

Thank you for your interest in our course,

${signatureImg}
${nameLine}
${rankLine}
[b][i]Los Santos Emergency Medical Services[/i][/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
};
