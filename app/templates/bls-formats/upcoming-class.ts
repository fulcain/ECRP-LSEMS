import { BLSTemplateDefinition } from "./types";

const MONTH_TO_INDEX: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** English ordinal suffix for a positive day-of-month (1st, 2nd, 3rd, 4th, …). */
function ordinalDay(day: number): string {
  const lastTwo = day % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

type ParsedCourseDateTime = {
  weekday: string;
  day: number;
  monthName: string;
  year: number;
  hours: number;
  minutes: number;
};

/**
 * Parse DD/MMM/YYYY + HH:MM (or HH.MM) inputs.
 * Returns null when either field is missing or unparseable, so the caller
 * can fall back to the static example placeholder.
 */
function parseCourseDateTime(
  rawDate: string | undefined,
  rawTime: string | undefined,
): ParsedCourseDateTime | null {
  if (!rawDate || !rawTime) return null;

  const dateParts = rawDate.trim().split("/");
  if (dateParts.length !== 3) return null;
  const [dayStr, monRaw, yearStr] = dateParts;
  const monthIdx = MONTH_TO_INDEX[monRaw.toUpperCase()];
  const day = parseInt(dayStr, 10);
  const year = parseInt(yearStr, 10);
  if (
    !Number.isFinite(monthIdx) ||
    !Number.isFinite(day) ||
    !Number.isFinite(year)
  ) {
    return null;
  }

  const timeParts = rawTime.trim().split(/[:.]/);
  if (timeParts.length !== 2) return null;
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  // Use UTC to avoid host-timezone drift. JS Date.UTC uses 0-indexed months.
  const utc = new Date(Date.UTC(year, monthIdx, day, hours, minutes));
  if (Number.isNaN(utc.getTime())) return null;

  // Read components back from the parsed Date so over-/under-flow inputs
  // (e.g. 32/01/2026) become a valid date rather than a malformed string.
  return {
    weekday: WEEKDAY_NAMES[utc.getUTCDay()],
    day: utc.getUTCDate(),
    monthName: MONTH_NAMES[utc.getUTCMonth()],
    year: utc.getUTCFullYear(),
    hours: utc.getUTCHours(),
    minutes: utc.getUTCMinutes(),
  };
}

/** "{Weekday}, {Ordinal} {Month} {Year} @ {HH:MM} ((UTC))" — derived from inputs. */
function formatDateLine(p: ParsedCourseDateTime): string {
  const hh = String(p.hours).padStart(2, "0");
  const mm = String(p.minutes).padStart(2, "0");
  return `${p.weekday}, ${ordinalDay(p.day)} ${p.monthName} ${p.year} @ ${hh}:${mm} ((UTC))`;
}

/** `https://www.inyourowntime.zone/YYYY-MM-DD_HH.MM_UTC.png` */
function buildTzImageUrl(p: ParsedCourseDateTime): string {
  const hh = String(p.hours).padStart(2, "0");
  const mm = String(p.minutes).padStart(2, "0");
  const day = String(p.day).padStart(2, "0");
  const monthNumber = (MONTH_NAMES.indexOf(p.monthName) + 1).toString().padStart(2, "0");
  return `https://www.inyourowntime.zone/${p.year}-${monthNumber}-${day}_${hh}.${mm}_UTC.png`;
}

export const upcomingClassTemplate: BLSTemplateDefinition = {
  value: "upcoming-class",
  label: "Notification of Upcoming Class",
  accent: "from-blue-500/25 via-indigo-500/15 to-transparent",
  border: "border-blue-400/30",
  badge: "bg-blue-500/20 text-blue-100 ring-1 ring-blue-400/40",
  renderBody: ({
    medicName,
    medicRank,
    medicSignature,
    courseDate,
    courseTime,
  }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "FirstName LastName";
    const rankLine = medicRank || "EMS Rank | BLS Rank";

    const parsed = parseCourseDateTime(courseDate, courseTime);
    const dateHeader = courseDate?.trim() || "DD/MMM/YYYY";
    // With valid course date + time, emit the derived headline + tz-image URL.
    // With missing/invalid input, emit empty strings so the textarea shows
    // "[b][/b] / [img][/img]" — a clear visual cue that the user must type
    // a valid course date and time. The course date/time inputs default to
    // "01/FEB/2026" / "12:00" in page.tsx, so on first load the user always
    // sees derivation in action.
    const dateLine = parsed ? formatDateLine(parsed) : "";
    const tzImage = parsed ? buildTzImageUrl(parsed) : "";

    return `[LSEMSfooter][/LSEMSfooter][divbox=white]
[fimg=150,150]https://i.imgur.com/Cdzl6Gz.png[/fimg][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]LSEMS Basic Life Support Division[/size][/b]
[size=120]Upcoming BLS Course[/size]
[size=95]${dateHeader}[/size][/font][/right][/aligntable]

[hr]

[b]Greetings[/b],

You are receiving this email to notify you of an upcoming BLS course that is slated for a time that you marked in your application for availability.

The course will be:
[b]${dateLine}[/b]
[img]${tzImage}[/img]

All courses are held at the Pillbox Medical Center. Please wait inside the reception area of [u]Upper Pillbox[/u] around [u]10 minutes[/u] prior to the scheduled start of the class, and a BLS instructor will collect you from there. Please do not bring any weapons to the class.

Payment is required on the day at the beginning of the course. Cash is the preferred form of payment. Wire transfers are also possible for a small fee. If you are unable to pay at the start of the course, you will be rejected from the class and will need to attend the next available course date.


[divbox=white]
Full Price: $20,000.
Discount: $10,000 for JB, DCC, Bayview, Bennys & Weazel personnel.
Free: SADOC (CO1+), LSPD, Reapplicants, LSSD & LSEMS
[/divbox]


Please note that the Pillbox Medical Center is a [u]non-smoking facility[/u]. Smoking is only permitted off hospital premises.

If you are unable to make this class, be sure to check back to where we post our [url=https://gov.eclipse-rp.net/viewtopic.php?t=18125]Upcoming Course Dates[/url] to hopefully catch a future one.

[hr]
[b]Kind regards,[/b]

${signatureImg}
[i]${nameLine}[/i]
${rankLine}
[b]Los Santos Emergency Medical Services[/b]

[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
};
