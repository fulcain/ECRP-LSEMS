export const GOV_PRESCRIPTION_POST_URL =
  "https://gov.eclipse-rp.net/posting.php?mode=post&f=2710";

const PRESCRIPTION_PROFILE_BANNER =
  "https://i.postimg.cc/g0yW1V4g/Prescription.png";
const METHADONE_BANNER = "https://i.ibb.co/Q7jYr1bq/image.png";
const DENIED_BANNER = "https://i.postimg.cc/xj4CTL0y/Denied-Prescription.png";

const withPlaceholder = (value: string, placeholder: string): string =>
  value.trim() || placeholder;

export type PrescriptionProfileContext = {
  name: string;
  phoneNumber: string;
};

/** `Fname Lname | Phone number` - what the profile thread is titled. */
export const generatePrescriptionProfileTitle = ({
  name,
  phoneNumber,
}: PrescriptionProfileContext): string => {
  const person = withPlaceholder(name, "Fname Lname");
  const phone = withPlaceholder(phoneNumber, "Phone number");
  return `${person} | ${phone}`;
};

export const generatePrescriptionProfileBody = ({
  name,
  phoneNumber,
}: PrescriptionProfileContext): string => {
  const person = withPlaceholder(name, "here");
  const phone = withPlaceholder(phoneNumber, "here");

  return `[img]${PRESCRIPTION_PROFILE_BANNER}[/img]

[lsemssubtitle]GENERAL INFORMATION[/lsemssubtitle]
[divbox=white]
[b]Name:[/b] [i]${person}[/i]
[b]Phone Number:[/b] [i]${phone}[/i]
[b]Name Change:[/b] [i]If changed[/i]
[b]Number Change:[/b] [i]If changed[/i]
[b]Methadone Prohibited[/b]: [i]Yes/No[/i]
[/divbox]
[lsemssubtitle]Prescription Details[/lsemssubtitle]
[divbox=white]
[spoiler=Methadone Prescription:]
[url=] Issuing Date | Amount | Issuing Employee[/url][/spoiler]
[spoiler=Mask Prescription:]
[url=]Issuing Date | Issuing Employee[/url][/spoiler]
[spoiler=Glasses Prescription:]
[url=]Issuing Date | Issuing Employee[/url][/spoiler]
[/divbox]

[lsemssubtitle]Methadone Prescription[/lsemssubtitle]
[divbox=white]
As an employee of the LSEMS, you are permitted to prescribe Methadone to patients who are actively addicted to any substance confirmed by a drug test. 
Information about drug tests and Methadone can be found in the department manual: 
[b][color=DARKRED]READ THE MANUAL BEFORE PRESCRIBING[/color][/b]
[list][url=https://gov.eclipse-rp.net/viewtopic.php?t=106075#8]7.8 - DRUG TEST[/url] 
[*][url=https://gov.eclipse-rp.net/viewtopic.php?t=106075#9]7.9 - METHADONE[/url]
[/list]
Remember that you should verify that the patient has not been issued methadone in the past 7 days. If they have, inform them that they cannot be issued another prescription before that time frame expires. You may use the 'for health reasons' excuse.

[spoiler=Methadone Preview]
[img]${METHADONE_BANNER}[/img]

[lsemssubtitle]GENERAL INFORMATION[/lsemssubtitle]
[divbox=white]
[b]Issuing Employee:[/b] [i]here[/i]
[b]Employee Rank:[/b] [i]here[/i]
[b]Date:[/b] DD/MMM/YYYY
[b]Time:[/b] 00:00 AM/PM
[/divbox]
[lsemssubtitle]ENCOUNTER DETAILS[/lsemssubtitle]
[divbox=white]
[b]Patient's name:[/b] [i]here[/i]
[b]Patient's phone number:[/b] [i]here[/i]
[b]Drugs found upon testing:[/b] [i]here[/i]
[b]Prescription issued because: [Optional][/b] [i]here[/i]
[b]Amount issued*: [/b]
[b]Has the patient been educated on methadone usage and the potential dangers of misuse?[/b] Yes/No

[i][size=85]*one box/pack of methadone contains 10 (ten) pills[/size][/i]
[/divbox]

[lsemssubtitle]LIABILITY WAIVER[/lsemssubtitle]
[divbox=#ffffde]
I, [i]FullRank Fname Lname[/i], hereby declare that I have filled out the above form and have issued the prescribed medication without falsifying any & all documentation and/or drug tests.
[/divbox]
[LSEMSfooter][/LSEMSfooter][/spoiler]
[spoiler=Methadone Format][code][img]${METHADONE_BANNER}[/img]

[lsemssubtitle]GENERAL INFORMATION[/lsemssubtitle]
[divbox=white]
[b]Issuing Employee:[/b] [i]here[/i]
[b]Employee Rank:[/b] [i]here[/i]
[b]Date:[/b] DD/MMM/YYYY
[b]Time:[/b] 00:00 AM/PM
[/divbox]
[lsemssubtitle]ENCOUNTER DETAILS[/lsemssubtitle]
[divbox=white]
[b]Patient's name:[/b] [i]here[/i]
[b]Patient's phone number:[/b] [i]here[/i]
[b]Drugs found upon testing:[/b] [i]here[/i]
[b]Prescription issued because: [Optional][/b] [i]here[/i]
[b]Amount issued*: [/b]
[b]Has the patient been educated on methadone usage and the potential dangers of misuse?[/b] Yes/No

[i][size=85]*one box/pack of methadone contains 10 (ten) pills[/size][/i]
[/divbox]

[lsemssubtitle]LIABILITY WAIVER[/lsemssubtitle]
[divbox=#ffffde]
I, [i]FullRank Fname Lname[/i], hereby declare that I have filled out the above form and have issued the prescribed medication without falsifying any & all documentation and/or drug tests.
[/divbox]
[LSEMSfooter][/LSEMSfooter][/code][/spoiler]

[spoiler=Methadone Denied]
[img]${DENIED_BANNER}[/img]

[lsemssubtitle]GENERAL INFORMATION[/lsemssubtitle]
[divbox=white]
[b]Patient's name:[/b] [i]here[/i]
[b]Reason:[/b] [i]here[/i]

[b]Methadone Ban:[/b] [i]Yes/no[/i]
[/divbox]
[LSEMSfooter][/LSEMSfooter][/spoiler]

[spoiler=Methadone Denied Format][code]
[img]${DENIED_BANNER}[/img]

[lsemssubtitle]GENERAL INFORMATION[/lsemssubtitle]
[divbox=white]
[b]Patient's name:[/b] [i]here[/i]
[b]Reason:[/b] [i]here[/i]

[b]Methadone Ban:[/b] [i]Yes/no[/i]
[/divbox]
[LSEMSfooter][/LSEMSfooter][/code][/spoiler]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
};

export const METHADONE_DEFAULT_REASON =
  "Patient wanted to get rid of their addiction";

export type MethadonePrescriptionContext = {
  issuingEmployee: string;
  employeeRank: string;
  date: string;
  time: string;
  patientName: string;
  patientPhoneNumber: string;
  drugsFound: string;
  reason: string;
  amount: string;
  educated: boolean;
};

export const generateMethadoneBody = ({
  issuingEmployee,
  employeeRank,
  date,
  time,
  patientName,
  patientPhoneNumber,
  drugsFound,
  reason,
  amount,
  educated,
}: MethadonePrescriptionContext): string => {
  const employee = withPlaceholder(issuingEmployee, "here");
  const rank = withPlaceholder(employeeRank, "here");
  const issuedAt = withPlaceholder(date, "DD/MMM/YYYY");
  const issuedTime = withPlaceholder(time, "00:00 AM/PM");
  const patient = withPlaceholder(patientName, "here");
  const phone = withPlaceholder(patientPhoneNumber, "here");
  const drugs = withPlaceholder(drugsFound, "here");
  const because = withPlaceholder(reason, METHADONE_DEFAULT_REASON);
  const boxes = withPlaceholder(amount, "1 box");

  return `[img]${METHADONE_BANNER}[/img]

[lsemssubtitle]GENERAL INFORMATION[/lsemssubtitle]
[divbox=white]
[b]Issuing Employee:[/b] [i]${employee}[/i]
[b]Employee Rank:[/b] [i]${rank}[/i]
[b]Date:[/b] ${issuedAt}
[b]Time:[/b] ${issuedTime}
[/divbox]
[lsemssubtitle]ENCOUNTER DETAILS[/lsemssubtitle]
[divbox=white]
[b]Patient's name:[/b] [i]${patient}[/i]
[b]Patient's phone number:[/b] [i]${phone}[/i]
[b]Drugs found upon testing:[/b] [i]${drugs}[/i]
[b]Prescription issued because: [Optional][/b] [i]${because}[/i]
[b]Amount issued*: [/b] ${boxes}
[b]Has the patient been educated on methadone usage and the potential dangers of misuse?[/b] ${educated ? "Yes" : "No"}

[i][size=85]*one box/pack of methadone contains 10 (ten) pills[/size][/i]
[/divbox]

[lsemssubtitle]LIABILITY WAIVER[/lsemssubtitle]
[divbox=#ffffde]
I, [i]${rank} ${employee}[/i], hereby declare that I have filled out the above form and have issued the prescribed medication without falsifying any & all documentation and/or drug tests.
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
};

export type MethadoneProfileEntryContext = {
  postUrl: string;
  date: string;
  amount: string;
  issuingEmployee: string;
};

/**
 * The line that goes in the patient's file under `Methadone Prescription:`.
 * Just the linked entry: the file already has the spoiler it belongs in.
 */
export const generateMethadoneProfileEntry = ({
  postUrl,
  date,
  amount,
  issuingEmployee,
}: MethadoneProfileEntryContext): string => {
  const link = withPlaceholder(postUrl, "");
  const issuedAt = withPlaceholder(date, "DD/MMM/YYYY");
  const boxes = withPlaceholder(amount, "1 box");
  const employee = withPlaceholder(issuingEmployee, "Fname Lname");

  return `[url=${link}] ${issuedAt} | ${boxes} | ${employee}[/url]`;
};

export type MethadoneDeniedContext = {
  patientName: string;
  reason: string;
  banned: boolean;
};

export const generateMethadoneDeniedBody = ({
  patientName,
  reason,
  banned,
}: MethadoneDeniedContext): string => {
  const patient = withPlaceholder(patientName, "here");
  const denialReason = withPlaceholder(reason, "here");

  return `[img]${DENIED_BANNER}[/img]

[lsemssubtitle]GENERAL INFORMATION[/lsemssubtitle]
[divbox=white]
[b]Patient's name:[/b] [i]${patient}[/i]
[b]Reason:[/b] [i]${denialReason}[/i]

[b]Methadone Ban:[/b] [i]${banned ? "Yes" : "No"}[/i]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
};
