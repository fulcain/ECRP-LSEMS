const FTI_PROMOTION_EMAIL_BODY = `[mdheader2
title="{DATE}"
location="Field Training Division"
date=""
logo="https://i.vgy.me/gLgUWA.png"
department="One Team, One Mission, Saving Lives"
][/mdheader2]
[divbox4=eeeeee]

[center]This email is to inform you that you have been promoted to [b]Field Training Instructor[/b]! [/center]

Everything you'll need to know:
[list]
[*]Similar to training an EMR, training an FTO has all the information you'll require in their [url=https://gov.eclipse-rp.net/viewforum.php?f=1161]FTO Student Profile[/url].
[*]Make a [url=https://gov.eclipse-rp.net/viewforum.php?f=1388]FTO Session Report[/url] for your FTO at the end of the session.
[*]You may refer to the [url=https://gov.eclipse-rp.net/viewtopic.php?t=87381]FTD Handbook[/url] for the expectations of this new role.
[*]Additionally, you are also now responsible for marking Quizzes. You can find submitted quizzes and the guide for it linked below.
[list][*][url=https://gov.eclipse-rp.net/viewforum.php?f=3748][color=firebrick][b]Quiz Area[/color][/b][/url]
[*][url=https://gov.eclipse-rp.net/viewtopic.php?t=173488][b][color=firebrick][Quiz] Guidelines, Answer Sheet & Formats[/url][/b][/color][/list]
[/list]
Unlike becoming an FTO, there is no training for this role, however any questions, ideas or concerns can be brought up in the [url=https://gov.eclipse-rp.net/viewforum.php?f=2000]Instructor Area[/url]. [ooc]When creating or replying to a topic, you may also @Field Training Instructor within LSEMS Discord #notifications[/ooc]

Thank you for providing an exemplary service to the Field Training Division.

Be well,

[img]{SIGNATURE}[/img]
[i]{NAME}[/i]
[/divbox4]
[divbox=#8d1717][color=transparent]spacer[/color][/divbox]
[divbox4=eeeeee]
[mdsig name="{NAME}" role="{RANK} / {FTD_RANK}" img="{SIGNATURE}" height=38]
[/divbox4]`;

const FTI_PROMOTION_TEMPLATE = `[img]https://i.ibb.co/r2CX7wJD/Vnq2s-QA.png[/img]

[b]Title:[/b]
[code]FTD Rank Adjustment[/code]
[b]Code:[/b]
[spoil]
[code]
${FTI_PROMOTION_EMAIL_BODY}
[/code]
[/spoil]`;

/** Shared localStorage keys for signature fields so the Emails tab
 * shared bar and all email cards stay in sync. */
export const SHARED_FTD_RANK_KEY = "ftd-shared-ftd-rank";
export const SHARED_SIG_NAME_KEY = "ftd-shared-sig-name";
export const SHARED_SIG_RANK_KEY = "ftd-shared-sig-rank";
export const SHARED_SIGNATURE_KEY = "ftd-shared-signature";
export const SHARED_EMAIL_DATE_KEY = "ftd-shared-email-date";

/** The post title that goes in [code] tags - shown in the UI with its own copy button. */
export const FTI_PROMOTION_TITLE = "FTD Rank Adjustment";

export interface FtiPromotionValues {
  name: string;
  rank: string;
  ftdRank: string;
  signature: string;
  date: string;
}

function substitute(template: string, values: FtiPromotionValues): string {
  return template.replace(
    /\{DATE\}|\{NAME\}|\{RANK\}|\{FTD_RANK\}|\{SIGNATURE\}/g,
    (token) => {
      switch (token) {
        case "{DATE}":
          return values.date;
        case "{NAME}":
          return values.name;
        case "{RANK}":
          return values.rank;
        case "{FTD_RANK}":
          return values.ftdRank;
        case "{SIGNATURE}":
          return values.signature;
        default:
          return token;
      }
    },
  );
}

/** Full forum post BBCode (header image + title + email in code/spoil). */
export function generateFtiPromotionBBCode(values: FtiPromotionValues): string {
  return substitute(FTI_PROMOTION_TEMPLATE, values);
}

/** Just the email body BBCode (no header image, title, or code/spoil wrapper). */
export function generateFtiPromotionEmailBBCode(values: FtiPromotionValues): string {
  return substitute(FTI_PROMOTION_EMAIL_BODY, values);
}