import { LOATemplateDefinition } from "./types";

export const approvedLOATemplate: LOATemplateDefinition = {
  value: "approved",
  label: "LOA Approved",
  accent: "from-emerald-500/25 via-green-500/15 to-transparent",
  border: "border-emerald-400/30",
  badge: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40",
  bannerImg: "https://i.ibb.co/m53M3G0g/0me-M9T1.png",
  divboxColor: "darkgreen",
  renderBody: ({
    personnelName,
    title,
    startDate,
    endDate,
    numberOfDays,
    medicName,
    medicRank,
    medicSignature,
  }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Operational Rank";
    const displayName = personnelName || "[i]NAME[/i]";

    return `[img]${approvedLOATemplate.bannerImg}[/img]

[divbox=${approvedLOATemplate.divboxColor}][center][b][size=160][color=white]LEAVE OF ABSENCE APPROVED[/color][/size][/b][/center][/divbox]
[divbox=white]
Dear ${title} ${displayName},

We are pleased to inform you that your request for leave of absence has been approved for the duration of [b]${numberOfDays}[/b] day(s), from ${startDate} to ${endDate}.


Sincerely,

${signatureImg}
[size=130][b]${nameLine}[/b][/size]
[size=110][b]${rankLine}[/b][/size]
[i][b]Los Santos Emergency Medical Services[/b][/i]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
};
