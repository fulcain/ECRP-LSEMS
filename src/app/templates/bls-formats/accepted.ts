import { BLSTemplateDefinition } from "./types";

export const acceptedTemplate: BLSTemplateDefinition = {
  value: "accepted",
  label: "Accepted",
  accent: "from-emerald-500/25 via-green-500/15 to-transparent",
  border: "border-emerald-400/30",
  badge:
    "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40",
  titleTag: "[ACCEPTED] BLS Training",
  renderBody: ({ applicant, medicName, medicRank, medicSignature }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]FNAME LNAME[/i]";
    const rankLine = medicRank || "RANK | BLS RANK";

    return `[img]https://i.postimg.cc/VkC3tbBY/BLS-Accepted-Application.png[/img]
[LSEMSsubtitle]Application Status[/LSEMSsubtitle]
[divbox=white]
Dear [i]${applicant}[/i],

Your application to attend BLS training has been [b][u][color=green]ACCEPTED[/color][/u][/b]. Our BLS Classes are scheduled based on instructors' availability. All scheduled classes can be found on the [url=https://gov.eclipse-rp.net/viewtopic.php?f=578&t=18125]Upcoming Course Dates[/url] page and are normally announced a week prior to them occurring. However, they can be announced at any time, so it is worth checking often!

All courses are held at the Pillbox Medical Center. Please wait inside the reception area of [u]Upper Pillbox[/u] around [u]10 minutes[/u] prior to the scheduled start of the class, and a BLS instructor will collect you from there. Please do not bring any weapons to the class.

Payment is required on the day at the beginning of the course. Cash is the preferred form of payment. Wire transfers are also possible for a small fee. If you are unable to pay at the start of the course, you will be rejected from the class and will need to attend the next available course date.


[divbox=white]
Full Price: $20,000.
Discount: $10,000 for JB, DCC, Bayview, Bennys & Weazel personnel.
Free: SADOC (CO1+), LSPD, Reapplicants, LSSD & LSEMS
[/divbox]


Please note that the Pillbox Medical Center is a [u]non-smoking facility[/u]. Smoking is only permitted off hospital premises.

[hr][/hr]

Kind regards,

${signatureImg}
${nameLine}
${rankLine}
[b][i]Los Santos Emergency Medical Services[/i][/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
};
