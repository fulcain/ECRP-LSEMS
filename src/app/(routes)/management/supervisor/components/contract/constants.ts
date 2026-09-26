export const DASHBOARD_URL = "https://ecrplsems.com/";

/**
 * One Staff Roster line: badge, file number, rank, name. The rank differs by
 * hire (EMR for a recruit or reinstatee, EMT-P for a contract switch), so it is
 * the one part the caller supplies; the placeholders are filled by the
 * Applicant Info card at copy time.
 */
export const staffRosterEntry = (rank: string) =>
  `[b]X[/b] - [url={{employeeProfileLink}}]#{{personnelFileNumber}}[/url] - [b]${rank}[/b] - [url={{personnelFileLink}}]{{applicantName}}[/url]`;

