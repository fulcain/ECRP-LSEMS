import type { TableDataType } from "@/lib/types";

/**
 * The Employee Stats tab, where the roster, its session counts and the
 * ribbons live. The reinstatement check is done here rather than in the
 * FT Sessions form, because the form only knows its own reports.
 */
export const EMPLOYEE_STATS_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1EFJafOVWOXrB9maVqJcbYK02ISEKxaftBWPoHpnzJSY/edit?gid=997699980#gid=997699980";

function parseSessionCount(raw: unknown): number {
  if (raw == null || raw === "") return 0;
  const value = Number(String(raw).replace(/[,\s]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

/**
 * Column B is kept by hand. It carries the sessions that predate the FT
 * Sessions form, which is why it can be lower than the roster's total.
 */
export function manualSessionCount(row: TableDataType): number {
  return parseSessionCount(row["_1"]);
}

/**
 * Column C is `B + COUNTIF(FT Sessions)` - the count every ribbon and
 * report should read. Falls back to the manual column for a row whose
 * formula has not landed in the published CSV yet.
 */
export function totalSessionCount(row: TableDataType): number {
  const raw = row["_2"];
  if (raw == null || raw === "") return manualSessionCount(row);
  return parseSessionCount(raw);
}

/** The sessions the FT Sessions form actually reported. */
export function reportedSessionCount(row: TableDataType): number {
  return Math.max(0, totalSessionCount(row) - manualSessionCount(row));
}
