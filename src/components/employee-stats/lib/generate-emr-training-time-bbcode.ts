const TRAINING_TIME_EMAIL_BODY = `[mdheader2
title="{DATE}"
location="Field Training Division"
date=""
logo="https://i.vgy.me/gLgUWA.png"
department="One Team, One Mission, Saving Lives"
][/mdheader2]
[divbox4=eeeeee]

Greetings EMR {EMR_NAME},

During your interview and in your introduction email, you were informed that you have up to 4 weeks to complete your training with 1 week of LOA, making for a total of 5 weeks.

You currently have [b]{DAYS_LEFT} days left[/b] before your training time limit is reached. If you are unable to complete your training in this time due to any reason, please post a [url=https://gov.eclipse-rp.net/viewforum.php?f=613][color=firebrick]Leave of Absence (LOA)[/color][/url].

If you are having difficulties finding an FTO to do your training, please make use of the [url=https://gov.eclipse-rp.net/viewforum.php?f=1926][color=firebrick]Student Area[/color][/url].

Please note that if you fail to finish your training by this time and do not have an approved LOA, you will be terminated for not completing your training within the designated timeframe.

Be well,

[img]{SIGNATURE}[/img]
[i]{SIG_NAME}[/i]
[/divbox4]
[divbox=#8d1717][color=transparent]spacer[/color][/divbox]
[divbox4=eeeeee]
[mdsig name="{SIG_NAME}" role="{SIG_RANK} / {FTD_RANK}" img="{SIGNATURE}" height=38]
[/divbox4]`;

const TRAINING_TIME_PROFILE_TEMPLATE = `[lsemssubtitle]Training Time[/lsemssubtitle]
[divbox=white]
EMR has been sent the [i]Training Time Reminder[/i] Email.
[b]{DAYS_LEFT} days[/b] remaining to complete training.
[/divbox]`;

/** The PM title shown in the UI with its own copy button. */
export const TRAINING_REMINDER_TITLE = "Training Reminder";

export interface EmrTrainingTimeValues {
  emrName: string;
  daysLeft: string;
  sigName: string;
  sigRank: string;
  ftdRank: string;
  signature: string;
  date: string;
}

function substitute(template: string, values: EmrTrainingTimeValues): string {
  return template.replace(
    /\{DATE\}|\{EMR_NAME\}|\{DAYS_LEFT\}|\{SIG_NAME\}|\{SIG_RANK\}|\{FTD_RANK\}|\{SIGNATURE\}/g,
    (token) => {
      switch (token) {
        case "{DATE}":
          return values.date;
        case "{EMR_NAME}":
          return values.emrName;
        case "{DAYS_LEFT}":
          return values.daysLeft;
        case "{SIG_NAME}":
          return values.sigName;
        case "{SIG_RANK}":
          return values.sigRank;
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

/** The email body BBCode (mdheader2 + divbox4 + mdsig). */
export function generateEmrTrainingTimeEmailBBCode(
  values: EmrTrainingTimeValues,
): string {
  return substitute(TRAINING_TIME_EMAIL_BODY, values);
}

/** The profile post BBCode to copy-paste into an EMR's student profile. */
export function generateEmrTrainingTimeProfileBBCode(
  values: EmrTrainingTimeValues,
): string {
  return substitute(TRAINING_TIME_PROFILE_TEMPLATE, values);
}