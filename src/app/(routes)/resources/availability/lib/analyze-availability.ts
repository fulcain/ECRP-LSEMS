import {
  convertRangeStringToUTC,
  weekdays,
  type AvailabilityInput,
  type Weekday,
} from "@/app/helpers/timeUtils";

/** Matches a single 24h time, the same shape `convertRangeStringToUTC` rewrites. */
const TIME_PATTERN = /([01]\d|2[0-3]):([0-5]\d)/g;

export type DayState = "blank" | "set" | "unreadable";

export type DayAnalysis = {
  /** What the member typed, trimmed. */
  raw: string;
  /** The line's value inside the brackets in the copyable block. */
  utc: string;
  state: DayState;
};

export function analyzeDay(
  day: Weekday,
  value: string,
  timezone: string,
): DayAnalysis {
  const raw = (value ?? "").trim();

  if (!raw) {
    return { raw, utc: "", state: "blank" };
  }

  return {
    raw,
    // Same conversion the tool has always applied, so the copied block stays
    // byte-identical to what members and rosters already expect.
    utc: convertRangeStringToUTC(day, raw, timezone),
    // Text with no readable time in it would otherwise copy through untouched
    // and look like a valid entry in the generated block.
    state: raw.match(TIME_PATTERN)?.length ? "set" : "unreadable",
  };
}

export type WeekAnalysis = {
  days: Record<Weekday, DayAnalysis>;
  daysSet: number;
  unreadableDays: Weekday[];
  hasAnything: boolean;
};

export function analyzeWeek(
  availability: AvailabilityInput,
  timezone: string,
): WeekAnalysis {
  const days = weekdays.reduce(
    (acc, day) => {
      acc[day] = analyzeDay(day, availability[day] ?? "", timezone);
      return acc;
    },
    {} as Record<Weekday, DayAnalysis>,
  );

  const all = weekdays.map((day) => days[day]);

  return {
    days,
    daysSet: all.filter((day) => day.state === "set").length,
    unreadableDays: weekdays.filter((day) => days[day].state === "unreadable"),
    hasAnything: all.some((day) => day.raw.length > 0),
  };
}

/**
 * The copyable block. Kept exactly as the original tool produced it - the
 * header line, a blank line, then one `Day: [hours]` line per weekday, with
 * empty brackets for a day with no availability.
 */
export function buildUtcBlock(
  availability: AvailabilityInput,
  timezone: string,
): string {
  const lines = ["AVAILABILITY TIME [ooc]UTC[/ooc]:", ""];

  weekdays.forEach((day) => {
    const analysis = analyzeDay(day, availability[day] ?? "", timezone);
    lines.push(`${day}: [${analysis.utc}]`);
  });

  return lines.join("\n");
}
