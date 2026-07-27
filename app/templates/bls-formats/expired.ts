import { BLSTemplateDefinition } from "./types";

export const expiredTemplate: BLSTemplateDefinition = {
  value: "expired",
  label: "Expired",
  accent: "from-orange-500/25 via-amber-500/15 to-transparent",
  border: "border-orange-400/30",
  badge:
    "bg-orange-500/20 text-orange-100 ring-1 ring-orange-400/40",
  titleTag: "[EXPIRED] BLS Training",
  renderBody: ({ applicant, medicName, medicRank, medicSignature }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]FNAME LNAME[/i]";
    const rankLine = medicRank || "RANK | BLS RANK";

    return `[img]https://i.postimg.cc/635jM7ZD/BLS-Expired-Application.png[/img]
[LSEMSsubtitle]Application Status[/LSEMSsubtitle]
[divbox=white]
Dear [i]${applicant}[/i],

Your Basic Life Support application request with the Los Santos Emergency Medical Services has [size=100][color=orange][b][u]EXPIRED[/u][/b][/color][/size] and is no longer valid. Thank you for showing interest in our BLS Course. If you wish to take a class, please reapply. Applications are valid for [u]30 days[/u].

Our BLS Classes are scheduled based on instructors' availability. All scheduled classes can be found on the [url=https://gov.eclipse-rp.net/viewtopic.php?f=578&t=18125]Upcoming Course Dates[/url] page and are normally announced a week prior to them occurring. However, they can be announced at any time, so it is worth checking often!

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
