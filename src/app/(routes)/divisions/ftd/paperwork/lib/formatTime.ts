/**
 * Time helpers for the field training session.
 *
 * The session card uses a free-text input where the user types times in 24-hour
 * `HH:MM` form (e.g. "14:30"). These helpers normalise that input and format it
 * for the two destinations that consume it:
 *
 *  - The Google Sheet, which expects 12-hour `h:mm:ss AM/PM` (`formatTime12h`).
 *  - The generated paperwork BBCode, which now uses the 24-hour `HH:MM` form
 *    the user typed (`formatTime24h`).
 *
 * Inputs that can't be parsed (empty, "asap", etc.) fall through as "" so
 * downstream code keeps working without throwing.
 */

/**
 * Parse a `HH:MM` (or loose `H:MM`, `HHMM`) string into minutes since midnight.
 * Returns `null` for empty or unparseable input.
 */
export function parseTimeToMinutes(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.trim();
  if (!cleaned) return null;

  // Accept "HH:MM", "H:MM", or "HHMM"
  const m = cleaned.match(/^(\d{1,2})[:.]?(\d{0,2})$/);
  if (!m) return null;

  const hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return hour * 60 + minute;
}

/**
 * Format a parsed time (minutes since midnight) as 24-hour `HH:MM`,
 * zero-padded. Returns "" for null/invalid.
 */
export function formatTime24h(raw: string): string {
  const total = parseTimeToMinutes(raw);
  if (total === null) return "";
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Format a parsed time (minutes since midnight) as 12-hour `h:mm:ss AM/PM`,
 * which is what the Google Sheet expects. Returns "" for null/invalid.
 */
export function formatTime12h(raw: string): string {
  const total = parseTimeToMinutes(raw);
  if (total === null) return "";
  let hour = Math.floor(total / 60);
  const minute = total % 60;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")}:00 ${ampm}`;
}
