import { LOATemplateDefinition } from "./types";

export const deniedLOATemplate: LOATemplateDefinition = {
  value: "denied",
  label: "LOA Denied",
  accent: "from-red-500/25 via-rose-500/15 to-transparent",
  border: "border-red-400/30",
  badge: "bg-red-500/20 text-red-100 ring-1 ring-red-400/40",
  bannerImg: "https://i.ibb.co/Hf4PmVjY/y-S0uc-UE.png",
  divboxColor: "darkred",
  renderBody: ({
    personnelName,
    title,
    medicName,
    medicRank,
    medicSignature,
    denialReasons,
  }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Operational Rank";
    const displayName = personnelName || "[i]NAME[/i]";
    const reasons =
      denialReasons && denialReasons.length > 0
        ? denialReasons.map((r) => `[*] ${r}`).join("\n")
        : "[*] Reason 1\n[*] Reason 2";

    return `[img]${deniedLOATemplate.bannerImg}[/img]

[divbox=${deniedLOATemplate.divboxColor}][center][b][size=160][color=white]LEAVE OF ABSENCE DENIED[/color][/size][/b][/center][/divbox]
[divbox=white]
Dear ${title} ${displayName},

We regret to inform you that your request for leave of absence has been denied due to the following reasons:

[list=]
${reasons}
[/list]

Sincerely,

${signatureImg}
[size=130][b]${nameLine}[/b][/size]
[size=110][b]${rankLine}[/b][/size]
[i][b]Los Santos Emergency Medical Services[/b][/i]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
};
