/**
 * Date helpers for FT session dates.
 *
 * The app uses a date-picker (calendar popover). The sheet stores dates
 * in `M/D/YYYY` format (e.g. `7/24/2026`). These helpers bridge the gap.
 *
 * Exports:
 *   - `parseDate(raw)`       - parse a CSV / user-typed date string → `Date | null`
 *   - `formatDateForSheet(d)` - format a `Date` → `M/D/YYYY` (sheet storage)
 *   - `formatDisplayDate(d)`  - format a `Date` → `DD/MMM` (app display, e.g. `24/JUL`)
 */

const MONTH_ABBREVIATIONS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_MAP: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

/**
 * Try to parse a date string from the CSV (or user input) into a `Date` object.
 *
 * Supports the following formats (in order):
 *   1. `M/D/YYYY` or `M/D/YY` or `M/D`      (US-style)
 *   2. `DD/MMM/YYYY` or `DD/MMM`             (e.g. 24/JUL/2026)
 *   3. `YYYY-MM-DD`                           (ISO)
 *   4. `MMM DD, YYYY`                         (text - Jul 24, 2026)
 *   5. `DD-MMM-YYYY` or `DD-MMM`              (e.g. 24-JUL-2026)
 *   6. `DD.MM.YYYY`                           (European)
 *
 * Returns `null` for unparseable input.
 */
export function parseDate(raw: string): Date | null {
  const s = raw.trim();
  if (!s) return null;

  // ── 1. M/D/YYYY or M/D/YY or M/D ────────────────────────────────
  let m = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (m) {
    const month = parseInt(m[1], 10);
    const day = parseInt(m[2], 10);
    let year = m[3] ? parseInt(m[3], 10) : new Date().getFullYear();
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const d = new Date(year, month - 1, day);
      if (d.getMonth() === month - 1) return d;
    }
  }

  // ── 2. DD/MMM/YYYY or DD/MMM  (also DD-MMM-YYYY, DD-MMM) ──────
  m = s.match(/^(\d{1,2})[\/-](\w{3})(?:[\/-](\d{2,4}))?$/i);
  if (m) {
    const day = parseInt(m[1], 10);
    const monthStr = m[2].toUpperCase();
    const month = MONTH_MAP[monthStr];
    if (month !== undefined && day >= 1 && day <= 31) {
      let year = m[3] ? parseInt(m[3], 10) : new Date().getFullYear();
      if (year < 100) year += 2000;
      const d = new Date(year, month, day);
      if (d.getMonth() === month) return d;
    }
  }

  // ── 3. YYYY-MM-DD (ISO) ────────────────────────────────────────
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    const day = parseInt(m[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const d = new Date(year, month - 1, day);
      if (d.getMonth() === month - 1) return d;
    }
  }

  // ── 4. MMM DD, YYYY or MMMM DD, YYYY (text) ──────────────────
  m = s.match(/^(\w{3,9})\s+(\d{1,2}),?\s*(\d{4})?$/i);
  if (m) {
    const monthStr = m[1].toUpperCase().slice(0, 3);
    const month = MONTH_MAP[monthStr];
    const day = parseInt(m[2], 10);
    let year = m[3] ? parseInt(m[3], 10) : new Date().getFullYear();
    if (year < 100) year += 2000;
    if (month !== undefined && day >= 1 && day <= 31) {
      const d = new Date(year, month, day);
      if (d.getMonth() === month) return d;
    }
  }

  // ── 5. DD.MM.YYYY (European) ──────────────────────────────────
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    const year = parseInt(m[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const d = new Date(year, month - 1, day);
      if (d.getMonth() === month - 1) return d;
    }
  }

  return null;
}

/**
 * Format a `Date` object for sheet storage: `M/D/YYYY`
 * (e.g. July 24 2026 → `"7/24/2026"`).
 */
export function formatDateForSheet(date: Date): string {
  const month = date.getMonth() + 1;  // 1-based
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Format a `Date` object for app display: `DD/MMM` (e.g. `24/JUL`).
 */
export function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTH_ABBREVIATIONS[date.getMonth()];
  return `${day}/${month}`;
}

/**
 * Normalise a user-typed date string to `DD/MMM` format.
 * Falls back to the raw input if unparseable.
 *
 * @deprecated Use the date-picker + `formatDateForSheet` / `formatDisplayDate` instead.
 */
export function normalizeDate(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return raw;
  const parsed = parseDate(trimmed);
  if (!parsed) return raw;
  return formatDisplayDate(parsed);
}

/**
 * Format a `Date` object to `DD/MMM` for the sheet.
 *
 * @deprecated Use `formatDateForSheet` instead for new code.
 */
export function formatDateToSheet(date: Date): string {
  return formatDisplayDate(date);
}
