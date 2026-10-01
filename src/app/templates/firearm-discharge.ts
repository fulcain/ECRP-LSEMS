export type FirearmDischargeContext = {
  employeeName: string;
  rank: string;
  date: string;
  time: string;
  details: string;
  footageUrl: string;
  proofUrl: string;
  signature: string;
};

export const FIREARM_DISCHARGE_BANNER =
  "https://i.ibb.co/8D4sCPZR/rgb-Megc.png";

const withPlaceholder = (value: string, placeholder: string): string =>
  value.trim() || placeholder;

export const generateFirearmDischargeBody = ({
  employeeName,
  rank,
  date,
  time,
  details,
  footageUrl,
  proofUrl,
  signature,
}: FirearmDischargeContext): string => {
  const name = withPlaceholder(employeeName, "Fname Lname");
  const rankLine = withPlaceholder(rank, "Fullrank");
  const dateLine = withPlaceholder(date, "DD/MMM/YYYY");
  const timeLine = withPlaceholder(time, "00:00 am/pm");
  const detailLines = withPlaceholder(details, "Details of the situation");
  const footageLine = footageUrl.trim()
    ? `[url=${footageUrl.trim()}]Relevant footage[/url]`
    : "None";
  const proofLine = proofUrl.trim()
    ? `[url=${proofUrl.trim()}]Proof of RP[/url]`
    : "PUT THE LINK HERE";
  const signatureImg = signature.trim()
    ? `[img]${signature.trim()}[/img]`
    : "Signature here";

  return `[img]${FIREARM_DISCHARGE_BANNER}[/img]
[divbox=white]
[b]Employee Name:[/b] ${name}
[b]Employee Rank:[/b] ${rankLine}
[b]Date:[/b] ${dateLine}
[b]Time:[/b] ${timeLine} (( UTC ))
[b]Details of the situation:[/b]
${detailLines}
[b]Relevant footage if applicable:[/b] ${footageLine}
(( [b]Proof of RP if applicable:[/b] [url=${proofUrl.trim() || "PUT THE LINK HERE"}]${proofLine}[/url] ))

${signatureImg}
${rankLine}
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
};
