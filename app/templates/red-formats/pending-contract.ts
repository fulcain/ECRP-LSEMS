import { REDTemplateDefinition } from "./types";

export const pendingContractTemplate: REDTemplateDefinition = {
  value: "pending-contract",
  label: "Pending Employment Contract",
  accent: "from-rose-500/25 via-pink-500/15 to-transparent",
  border: "border-rose-400/30",
  badge: "bg-rose-500/20 text-rose-100 ring-1 ring-rose-400/40",
  titleTag: "[Pending Contract]",
  renderBody: ({ applicant, medicName, medicRank, medicSignature }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Rank, Recruitment Division";

    return `[img]https://i.ibb.co/fVpLhtTB/Tt-AE3wk.png[/img]
[divbox=white]
[right][color=black]Pillbox Hill Medical Center[/color] [/right]
[right][color=black]Elgin Avenue, Pillbox Hill[/color] [/right]
[right][color=black]Los Santos, San Andreas[/color] [/right]
[right][color=transparent].[/color] [/right]
[right][color=transparent].[/color] [/right]
[center][b][size=160][color=Darksalmon]PENDING EMPLOYMENT CONTRACT[/color][/size][/b]
[img]https://i.ibb.co/xKYgq6P0/7x0vy1x.png[/img][/center]
 
Dear ${applicant},
 
We are pleased to inform you that you have [color=Seagreen][b]PASSED[/b][/color] your interview and we will be moving you forward in our recruitment process. 

At your earliest convenience, please make your way to Pillbox Medical Center to review and sign the employment contract with a member of the recruitment division. Upon signing the contract, you will be given your EMR badge and uniform.

We look forward to seeing you again soon.

Please note: You will have a maximum of four (4) weeks to accept and sign this contract. After 4 weeks, you will need to reapply should the contract not be completed.

[hr][/hr]
Sincerely,
 
${signatureImg}
${nameLine}
${rankLine}
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
};
