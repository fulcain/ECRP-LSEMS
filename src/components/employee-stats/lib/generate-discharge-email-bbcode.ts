const DISCHARGE_EMAIL_BODY = `[mdheader2
title="{MDH_DATE}"
location="Los Santos Emergency Medical Services"
date=""
logo="https://i.vgy.me/gLgUWA.png"
department="One Team, One Mission, Saving Lives"
][/mdheader2]
[divbox4=eeeeee]

Dear {SALUTATION} {NAME},

It is with regret that I inform that you as of today, {DISCHARGE_DATE}, your employment with the [b][i]Los Santos Emergency Medical Services[/i][/b] has been terminated, effective immediately.

The reason behind this decision for official purposes is [b]{REASON}[/b]. Any final hours or shifts you completed will be paid out at the end of this working week.

Please note this is a not a decision we came to lightly during internal discussions, and we thank you for the work that you have done up to this point.

All the best in your future employment.

[img]{SIGNATURE}[/img]
[i]{SIG_NAME}[/i]
[/divbox4]
[divbox=#8d1717][color=transparent]spacer[/color][/divbox]
[divbox4=eeeeee]
[mdsig name="{SIG_NAME}" role="{SIG_RANK}" img="{SIGNATURE}" height=38]
[/divbox4]`;

/** The post title shown in the UI with its own copy button. */
export const DISCHARGE_EMAIL_TITLE = "Discharge Email";

export interface DischargeEmailValues {
  name: string;
  mdhDate: string;
  dischargeDate: string;
  reason: string;
  salutation: string;
  sigName: string;
  sigRank: string;
  signature: string;
}

export function generateDischargeEmailBBCode(values: DischargeEmailValues): string {
  return DISCHARGE_EMAIL_BODY.replace(
    /\{NAME\}|\{MDH_DATE\}|\{DISCHARGE_DATE\}|\{REASON\}|\{SALUTATION\}|\{SIG_NAME\}|\{SIG_RANK\}|\{SIGNATURE\}/g,
    (token) => {
      switch (token) {
        case "{NAME}":
          return values.name;
        case "{MDH_DATE}":
          return values.mdhDate;
        case "{DISCHARGE_DATE}":
          return values.dischargeDate;
        case "{REASON}":
          return values.reason;
        case "{SALUTATION}":
          return values.salutation;
        case "{SIG_NAME}":
          return values.sigName;
        case "{SIG_RANK}":
          return values.sigRank;
        case "{SIGNATURE}":
          return values.signature;
        default:
          return token;
      }
    },
  );
}