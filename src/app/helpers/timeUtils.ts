export const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type Weekday = (typeof weekdays)[number];

// More specific typing here: availability keyed by weekdays
export type AvailabilityInput = Record<Weekday, string>;

/**
 * Parses a time range string like "08:00 - 12:00"
 * Returns tuple [start, end] or null if invalid
 */
export function parseTimeRange(timeRange: string): [string, string] | null {
  if (!timeRange) return null;
  const parts = timeRange.split("-");
  if (parts.length !== 2) return null;

  const isValid = (t: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t.trim());
  if (!isValid(parts[0]) || !isValid(parts[1])) return null;

  return [parts[0].trim(), parts[1].trim()];
}

/**
 * Returns the offset in minutes between target timezone and runtime timezone for given date/time
 */
export function getTimezoneOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    hour12: false,
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  parts.forEach(({ type, value }) => {
    map[type] = value;
  });

  // Construct a date interpreted as if in the target timezone's local time
  const tzDate = new Date(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );

  // Difference in minutes between target timezone time and local runtime timezone time
  return (tzDate.getTime() - date.getTime()) / (60 * 1000);
}

export function convertLocalToUTCDate(
  day: Weekday,
  time: string,
  timezone: string,
): Date | null {
  if (!time) return null;

  // Map weekday names to day numbers (Sunday=0)
  const dayToNumMap: Record<Weekday | "Sunday", number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const targetDayNum = dayToNumMap[day];

  const now = new Date();
  const todayDayNum = now.getDay();

  // Calculate difference in days to get next occurrence of target day
  let diff = targetDayNum - todayDayNum;
  if (diff < 0) diff += 7;

  // Construct a Date object for that upcoming day at 00:00 local runtime timezone
  const targetDateLocal = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + diff,
  );

  // Extract hour and minute from "HH:mm"
  const [hour, minute] = time.split(":").map(Number);

  const localDate = new Date(
    targetDateLocal.getFullYear(),
    targetDateLocal.getMonth(),
    targetDateLocal.getDate(),
    hour,
    minute,
    0,
    0,
  );

  const offsetMinutes = getTimezoneOffsetMinutes(localDate, timezone);

  const utcTimestamp = localDate.getTime() - offsetMinutes * 60 * 1000;

  return new Date(utcTimestamp);
}

/**
 * Format a Date object as zero-padded HH:mm in UTC
 */
export function formatUTC(date: Date): string {
  const h = date.getUTCHours();
  const m = date.getUTCMinutes();
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Convert all times (HH:mm) in the input string from the given timezone to UTC,
 * preserving all other text and delimiters as-is.
 */
export function convertRangeStringToUTC(
  day: Weekday,
  input: string,
  timezone: string,
): string {
  const timeRegex = /([01]\d|2[0-3]):([0-5]\d)/g;

  return input.replace(timeRegex, (match) => {
    const utcDate = convertLocalToUTCDate(day, match, timezone);
    if (!utcDate) return match;
    return formatUTC(utcDate);
  });
}

/**
 * Returns the current date and time in UTC as "HH:mm"
 */
export function getCurrentUTCTime(): string {
  const now = new Date();
  const hours = now.getUTCHours().toString().padStart(2, "0");
  const minutes = now.getUTCMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}
