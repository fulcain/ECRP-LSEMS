import type { REDTemplateDefinition, REDTemplateContext } from "./types";

const address = `[right][color=black]Pillbox Hill Medical Center[/color] [/right]
[right][color=black]Elgin Avenue, Pillbox Hill[/color] [/right]
[right][color=black]Los Santos, San Andreas[/color] [/right]
[right][color=transparent].[/color] [/right]
[right][color=transparent].[/color] [/right]`;

function signature({ medicName, medicRank, medicSignature }: REDTemplateContext): string {
  const signatureImg = medicSignature
    ? `[img]${medicSignature}[/img]`
    : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
  return `${signatureImg}
${medicName || "[i]Your Name[/i]"}
${medicRank || "Rank"}
[b]Los Santos Emergency Medical Services[/b]`;
}

function renderReinstatement({
  banner,
  status,
  color,
  body,
  context,
}: {
  banner: string;
  status: string;
  color: string;
  body: string;
  context: REDTemplateContext;
}): string {
  return `[img]${banner}[/img]
[divbox=white]
${address}
[center][b][size=160][color=${color}]${status}[/color][/size][/b]
[img]https://i.ibb.co/hJf6jJzZ/7x0vy1x.png[/img][/center]
 
${body}
 
[hr][/hr]
Sincerely,
 
${signature(context)}
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
}

function renderReasons(reasons?: string[]): string {
  const items = reasons?.filter(Boolean).map((reason) => `[*] ${reason}`).join("\n");
  return items || "[*] REASON";
}

export const reinstatementOnHoldTemplate: REDTemplateDefinition = {
  value: "reinstatement-on-hold",
  label: "Reinstatement On-Hold",
  accent: "from-orange-500/25 via-amber-500/15 to-transparent",
  border: "border-orange-400/30",
  badge: "bg-orange-500/20 text-orange-100 ring-1 ring-orange-400/40",
  titleTag: "[ON-HOLD] Reinstatement",
  renderBody: (context) =>
    renderReinstatement({
      banner: "https://i.ibb.co/SwRYyHph/t99Kigs.png",
      status: "ON-HOLD",
      color: "Coral",
      context,
      body: `Dear ${context.applicant},
 
We would first like to thank you for your interest in reinstating into the Los Santos Emergency Medical Services. However, we have some concerns regarding your reinstatement application. As such, your reinstatement application has been placed [color=Coral][b]ON-HOLD[/b] [/color]until these issues are resolved.

[list]
${renderReasons(context.reasons)}
[/list] 
You have 2 days to correct your reinstatement application. When ALL of the above issues have been resolved, reply to this thread to notify us.

We look forward to hearing from you again soon.`,
    }),
};

export const reinstatementReceivedTemplate: REDTemplateDefinition = {
  value: "reinstatement-received",
  label: "Reinstatement Received",
  accent: "from-emerald-500/25 via-green-500/15 to-transparent",
  border: "border-emerald-400/30",
  badge: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40",
  titleTag: "[RECEIVED] Reinstatement",
  renderBody: (context) =>
    renderReinstatement({
      banner: "https://i.ibb.co/whQ37Rnf/f-Xst1f-H.png",
      status: "REINSTATEMENT RECEIVED",
      color: "Forestgreen",
      context,
      body: `Dear ${context.applicant},

We have [color=Forestgreen][b]received[/b][/color] your reinstatement application. We will review your application, evaluate your qualifications, and perform the appropriate background checks.

After this, we will get back to you with an answer.`,
    }),
};

export const reinstatementOfferTemplate: REDTemplateDefinition = {
  value: "reinstatement-offer",
  label: "Offer Of Employment",
  accent: "from-rose-500/25 via-orange-500/15 to-transparent",
  border: "border-rose-400/30",
  badge: "bg-rose-500/20 text-rose-100 ring-1 ring-rose-400/40",
  titleTag: "[OFFER OF EMPLOYMENT] Reinstatement",
  renderBody: (context) =>
    renderReinstatement({
      banner: "https://i.ibb.co/wNRPqW7p/T6c-Do05.png",
      status: "OFFER OF EMPLOYMENT",
      color: "Darksalmon",
      context,
      body: `Dear ${context.applicant},
 
We are pleased to offer you employment in the position of [b]${context.employmentRank?.trim() || "Decided Rank"}[/b] in the Los Santos Emergency Medical Services. 

[b]Terms of Reinstatement Employment[/b]

[list]
[*]You must go through the Los Santos Emergency Medical Services Manual and sign the Employment Contract before going on duty.
[*]You must successfully complete reinstatement training
[*]Do the minimum required hours per pay cycle (2.5 hours/ week)
[/list] 
Please confirm your acceptance of this offer within 1 Week (7 days) by replying to this thread. Please let us know if you have any questions before accepting the offer.

We look forward to seeing you again soon.`,
    }),
};

export const reinstatementContractTemplate: REDTemplateDefinition = {
  value: "reinstatement-contract",
  label: "Offer Of Employment Contract",
  accent: "from-rose-500/25 via-orange-500/15 to-transparent",
  border: "border-rose-400/30",
  badge: "bg-rose-500/20 text-rose-100 ring-1 ring-rose-400/40",
  titleTag: "[EMPLOYMENT CONTRACT] Reinstatement",
  renderBody: (context) =>
    renderReinstatement({
      banner: "https://i.ibb.co/pr9bZWFD/rcif-Zu-Q.png",
      status: "OFFER OF EMPLOYMENT CONTRACT",
      color: "Darksalmon",
      context,
      body: `Dear ${context.applicant},
 
We are pleased to receive your acceptance of our offer of employment. At your earliest convenience, please make your way to the Pillbox Medical Center to read through and sign our personalized employment contract and receive your badge.

(( You will be sent the LSEMS Discord Invite via the gov site email shortly. Join the server, and rename yourself to your IC name. Contact someone ICly to sign your contract. ))

We look forward to seeing you again soon.

Please note: You will have a maximum of four (4) weeks to accept and sign this contract. After 4 weeks, you will need to reapply should the contract not be completed.`,
    }),
};

export const reinstatementAcceptedTemplate: REDTemplateDefinition = {
  value: "reinstatement-accepted",
  label: "Reinstatement Accepted",
  accent: "from-emerald-500/25 via-green-500/15 to-transparent",
  border: "border-emerald-400/30",
  badge: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40",
  titleTag: "[ACCEPTED] Reinstatement",
  renderBody: (context) =>
    renderReinstatement({
      banner: "https://i.ibb.co/C3t6hphS/y5f-Ps5V.png",
      status: "REINSTATEMENT ACCEPTED",
      color: "Forestgreen",
      context,
      body: `Dear ${context.applicant},
 
We are pleased to inform you that, with the signing of your employment contract, you will be reinstated as an [b]EMR[/b] until you complete and pass your training. Make sure to give our [url=https://gov.eclipse-rp.net/viewforum.php?f=804]handbook[/url] a full review. We are looking forward to working with you again!`,
    }),
};

export const reinstatementDeniedTemplate: REDTemplateDefinition = {
  value: "reinstatement-denied",
  label: "Reinstatement Denied",
  accent: "from-red-500/25 via-rose-500/15 to-transparent",
  border: "border-red-400/30",
  badge: "bg-red-500/20 text-red-100 ring-1 ring-red-400/40",
  titleTag: "[DENIED] Reinstatement",
  renderBody: (context) =>
    renderReinstatement({
      banner: "https://i.ibb.co/VWJcnHNy/t49u-JPW.png",
      status: "REINSTATEMENT DENIED",
      color: "Firebrick",
      context,
      body: `Dear ${context.applicant},
 
We regret to inform you that we will not be moving forward with your application for reinstatement for the reason(s) listed below. 
 
[list]
${renderReasons(context.reasons)}
[/list]

We'd like to wish you a lot of luck with your future endeavors.`,
    }),
};
