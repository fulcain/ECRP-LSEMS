export type LOARequestContext = {
  rank: string;
  firstName: string;
  lastName: string;
  startDate: string;
  endDate: string;
  icReason: string;
  oocReason: string;
};

export const LOA_REQUEST_BANNER =
  "https://i.ibb.co/SXpmG8VP/dy2Qpp-U.png";

export const GOV_LOA_POST_URL =
  "https://gov.eclipse-rp.net/posting.php?mode=post&f=613";

const joinName = (firstName: string, lastName: string): string =>
  `${firstName} ${lastName}`.trim().replace(/\s+/g, " ");

const withPlaceholder = (value: string, placeholder: string): string =>
  value.trim() || placeholder;

/** RANK Firstname Lastname | [DD/MMM/YYYY] to [DD/MMM/YYYY] */
export const generateLOATitle = ({
  rank,
  firstName,
  lastName,
  startDate,
  endDate,
}: LOARequestContext): string => {
  const name = joinName(firstName, lastName);
  const rankLine = withPlaceholder(rank, "RANK");
  return `${rankLine} ${name} | [${withPlaceholder(startDate, "DD/MMM/YYYY")}] to [${withPlaceholder(endDate, "DD/MMM/YYYY")}]`.replace(
    /\s+/g,
    " ",
  );
};

export const generateLOARequestBody = ({
  rank,
  firstName,
  lastName,
  startDate,
  endDate,
  icReason,
  oocReason,
}: LOARequestContext): string => {
  const name = joinName(firstName, lastName) || "First Last";
  const rankLine = withPlaceholder(rank, "Rank");
  const start = withPlaceholder(startDate, "DD/MMM/YYYY");
  const end = withPlaceholder(endDate, "DD/MMM/YYYY");
  const ic = withPlaceholder(icReason, "Reason Here");
  const ooc = oocReason.trim();

  const reasonLine = ooc
    ? `${ic} [ooc]${ooc}[/ooc]`
    : `${ic}`;

  return `[img]${LOA_REQUEST_BANNER}[/img]
[divbox=white][b]Employee Name:[/b] ${name}
[b]Rank:[/b] ${rankLine}
[b]Leave of Absence beginning date:[/b] ${start}
[b]Leave of Absence return date:[/b] ${end}
[b]Reason:[/b] ${reasonLine}

[/divbox][LSEMSfooter][/LSEMSfooter]`;
};