const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export type AvailabilityInput = Record<string, string>;

export function parseTimeRange(timeRange: string): [string, string] | null {
  if (!timeRange) return null;
  const parts = timeRange.split("-");
  if (parts.length !== 2) return null; 

  const isValid = (t: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t.trim());
  if (!isValid(parts[0]) || !isValid(parts[1])) return null;

  return [parts[0].trim(), parts[1].trim()];
}

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
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return (asUTC - date.getTime()) / (60 * 1000);
}

export function convertLocalToUTCDate(
  day: string,
  time: string,
  timezone: string,
): Date | null {
  if (!time) return null;

  const now = new Date();
  const todayDayNum = now.getDay();

  const dayToNumMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const targetDayNum = dayToNumMap[day];
  let diff = targetDayNum - todayDayNum;
  if (diff < 0) diff += 7;

  const [hour, minute] = time.split(":").map(Number);

  const localDate = new Date(now);
  localDate.setDate(now.getDate() + diff);
  localDate.setHours(hour, minute, 0, 0);

  const tzOffsetMinutes = -getTimezoneOffsetMinutes(localDate, timezone);

  return new Date(localDate.getTime() + tzOffsetMinutes * 60 * 1000);
}

export function formatUTC(date: Date): string {
  const h = date.getUTCHours();
  const m = date.getUTCMinutes();
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function convertRangeStringToUTC(
  day: string,
  input: string,
  timezone: string,
): string {
  const parts = input.split(/(\s+and\s+|\s*and\s*|\s*,\s*|\s+or\s+|\s*or\s*)/i);

  return parts
    .map((part) => {
      const range = parseTimeRange(part.trim());
      if (range) {
        const [startLocal, endLocal] = range;
        const startUTCDate = convertLocalToUTCDate(day, startLocal, timezone);
        const endUTCDate = convertLocalToUTCDate(day, endLocal, timezone);

        if (!startUTCDate || !endUTCDate) return part;

        return `${formatUTC(startUTCDate)} – ${formatUTC(endUTCDate)}`;
      }
      return part;
    })
    .join("");
}

export { weekdays };
