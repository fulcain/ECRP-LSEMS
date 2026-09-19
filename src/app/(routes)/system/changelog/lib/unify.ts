import {
  changeLog as lsemsChangeLog,
  type ChangeItem,
  type ChangeType,
} from "@/app/constants/changelog";
import { changeLog as ftdChangeLog } from "@/app/constants/ftd-changelog";

export type ChangeLogEntry = {
  date: string;
  title?: string;
  changes: ChangeItem[];
};

/** The FTD log used its own vocabulary; the page shows one set of categories. */
export type UnifiedChange = ChangeLogEntry;

const formerFtdChanges: UnifiedChange[] = ftdChangeLog.map((day) => ({
  date: new Date(day.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  changes: day.entries.map((entry) => ({
    type: entry.type === "added" ? "feature" : "change",
    description: entry.description,
  })),
}));

/** Newest first. An unparseable date sorts last rather than throwing the list. */
export const unifiedChangeLog: UnifiedChange[] = [
  ...lsemsChangeLog,
  ...formerFtdChanges,
].sort((a, b) => {
  const aDate = Date.parse(a.date);
  const bDate = Date.parse(b.date);
  return (Number.isNaN(bDate) ? 0 : bDate) - (Number.isNaN(aDate) ? 0 : aDate);
});

export const CHANGE_CATEGORIES: {
  value: ChangeType | "all";
  label: string;
}[] = [
  { value: "all", label: "Everything" },
  { value: "feature", label: "Features" },
  { value: "change", label: "Changes" },
];

export function countByCategory(
  log: UnifiedChange[],
  category: ChangeType | "all",
): number {
  if (category === "all") {
    return log.reduce((sum, entry) => sum + entry.changes.length, 0);
  }
  return log.reduce(
    (sum, entry) =>
      sum + entry.changes.filter((item) => item.type === category).length,
    0,
  );
}

/**
 * Narrows each entry to the chosen category and drops the dates that end up
 * with nothing in them - an empty heading in a history reads as a gap.
 */
export function filterByCategory(
  log: UnifiedChange[],
  category: ChangeType | "all",
): UnifiedChange[] {
  if (category === "all") return log;

  return log
    .map((entry) => ({
      ...entry,
      changes: entry.changes.filter((item) => item.type === category),
    }))
    .filter((entry) => entry.changes.length > 0);
}

/** Entries grouped by calendar year, so a long history stays scannable. */
export function groupByYear(
  log: UnifiedChange[],
): { year: string; entries: UnifiedChange[] }[] {
  const groups: { year: string; entries: UnifiedChange[] }[] = [];

  for (const entry of log) {
    const parsed = Date.parse(entry.date);
    const year = Number.isNaN(parsed) ? "Earlier" : String(new Date(parsed).getFullYear());
    const last = groups[groups.length - 1];
    if (last && last.year === year) last.entries.push(entry);
    else groups.push({ year, entries: [entry] });
  }

  return groups;
}
