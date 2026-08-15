import type { ResignationRemarksContext } from "./types";

export const resignationRemarksTemplate = {
  renderBody: ({
    dischargeType,
    justification,
    signature,
    medicName,
    medicRank,
  }: ResignationRemarksContext) => {
    const typeLine =
      dischargeType === "Dishonorable"
        ? "[] Honorable Discharge\n[✓] Dishonorable Discharge"
        : "[✓] Honorable Discharge\n[] Dishonorable Discharge";
    const sigImg = signature ? `[img]${signature}[/img]` : "[img]SIGNATURE[/img]";
    const name = medicName || "NAME";
    const rank = medicRank || "RANK";

    return `[lsemssubtitle]RESIGNATION REMARKS[/lsemssubtitle]
[divbox=white]
[b]Please put a check ( ✓ ) mark on the type of discharge issued[/b]
${typeLine}
[b]Discharge Justification:[/b] ${justification || ""}

Processed by:

${sigImg}
${name}
${rank}
[b]Los Santos Emergency Medical Services[/b]


Signed & approved by:

[img]https://i.ibb.co/PzQwpqqB/Wtlufke.png[/img]
[i]CeeCee Rhodes[/i]
[b]Chief of LSEMS[/b]
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
};
