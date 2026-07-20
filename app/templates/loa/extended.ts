import { LOATemplateDefinition } from "./types";

export const extendedLOATemplate: LOATemplateDefinition = {
  value: "extended",
  label: "LOA Extended",
  accent: "from-orange-500/25 via-amber-500/15 to-transparent",
  border: "border-orange-400/30",
  badge: "bg-orange-500/20 text-orange-100 ring-1 ring-orange-400/40",
  bannerImg: "https://i.imgur.com/FQc3DVG.png",
  divboxColor: "darkorange",
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

    return `[img]${extendedLOATemplate.bannerImg}[/img]

[divbox=${extendedLOATemplate.divboxColor}][center][b][size=160][color=white]LEAVE OF ABSENCE EXTENDED[/color][/size][/b][/center][/divbox]
[divbox=white]
Dear ${title} ${displayName},

We are pleased to inform you that your request for an extension on your leave of absence has been approved for the duration of [b]${numberOfDays}[/b] day(s), from ${startDate} to ${endDate}.


Sincerely,

${signatureImg}
[size=130][b]${nameLine}[/b][/size]
[size=110][b]${rankLine}[/b][/size]
[i][b]Los Santos Emergency Medical Services[/b][/i]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
};
