import { LOATemplateDefinition } from "./types";

export const expiredLOATemplate: LOATemplateDefinition = {
  value: "expired",
  label: "LOA Expired",
  accent: "from-slate-500/25 via-gray-500/15 to-transparent",
  border: "border-slate-400/30",
  badge: "bg-slate-500/20 text-slate-100 ring-1 ring-slate-400/40",
  bannerImg: "https://i.ibb.co/4ZQ1dPv2/fc-Cd-BSU.png",
  divboxColor: "black",
  renderBody: ({
    personnelName,
    title,
    endDate,
    startWorkAt,
    medicName,
    medicSignature,
  }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const displayName = personnelName || "[i]NAME[/i]";

    return `[img]${expiredLOATemplate.bannerImg}[/img]

[divbox=${expiredLOATemplate.divboxColor}][center][b][size=160][color=white]LEAVE OF ABSENCE EXPIRED[/color][/size][/b][/center][/divbox]
[divbox=white]
Dear ${title} ${displayName},

Your LOA has expired, please resume your duties starting tomorrow on ${startWorkAt || endDate}.

Sincerely,

${signatureImg}
[size=130][b]${nameLine}[/b][/size]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
};
