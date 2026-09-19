"use client";

import { useMemo, useState } from "react";
import { CalendarDays, History, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/surface";
import { cn } from "@/lib/utils";
import type { ChangeItem, ChangeType } from "@/app/constants/changelog";
import {
  CHANGE_CATEGORIES,
  countByCategory,
  filterByCategory,
  groupByYear,
  type UnifiedChange,
} from "../lib/unify";

const CATEGORY_META: Record<
  ChangeType,
  { label: string; chip: string; icon: React.ReactNode }
> = {
  feature: {
    label: "Feature",
    chip: "border-success/30 bg-success/10 text-success",
    icon: <Sparkles className="h-3 w-3" />,
  },
  change: {
    label: "Change",
    chip: "border-info/30 bg-info/10 text-info",
    icon: <Zap className="h-3 w-3" />,
  },
};

function ChangeItemRow({ item }: { item: ChangeItem }) {
  const meta = CATEGORY_META[item.type] ?? CATEGORY_META.change;
  return (
    <li className="flex min-w-0 items-start gap-3">
      <span
        className={cn(
          "mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
          meta.chip,
        )}
      >
        {meta.icon}
        {meta.label}
      </span>
      <p className="min-w-0 text-sm leading-relaxed text-muted-foreground">
        {item.description}
      </p>
    </li>
  );
}

type ChangeLogTimelineProps = {
  log: UnifiedChange[];
};

/**
 * The change log's job is to answer "what changed lately" and "when did this
 * land". So it stays a timeline - that part was right - but the entries sit on
 * the theme rather than on a hardcoded glass panel, the categories can be
 * filtered, and the history is split by year instead of being one endless
 * column.
 */
export function ChangeLogTimeline({ log }: ChangeLogTimelineProps) {
  const [category, setCategory] = useState<ChangeType | "all">("all");

  const filtered = useMemo(() => filterByCategory(log, category), [log, category]);
  const groups = useMemo(() => groupByYear(filtered), [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {CHANGE_CATEGORIES.map((option) => {
          const count = countByCategory(log, option.value);
          const isActive = category === option.value;
          return (
            <Button
              key={option.value}
              size="sm"
              variant={isActive ? "default" : "outline"}
              aria-pressed={isActive}
              onClick={() => setCategory(option.value)}
            >
              {option.label}
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[11px] tabular-nums",
                  isActive ? "bg-primary-foreground/15" : "bg-surface-hover",
                )}
              >
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nothing in this category yet"
          description="Switch back to Everything to see the full history."
          action={
            <Button variant="outline" onClick={() => setCategory("all")}>
              Show everything
            </Button>
          }
        />
      ) : (
        groups.map((group) => (
          <section key={group.year} className="space-y-3">
            <h2 className="eyebrow text-muted-foreground">
              {group.year}
            </h2>
            <ol className="relative space-y-3 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-border">
              {group.entries.map((entry, index) => (
                <li
                  key={`${entry.date}-${index}`}
                  className="relative pl-10 sm:pl-12"
                >
                  <span className="absolute left-[7px] top-4 flex h-4 w-4 items-center justify-center">
                    <span className="h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                  </span>
                  <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/30 sm:p-5">
                    <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {entry.date}
                    </p>
                    {entry.title && (
                      <h3 className="mb-3 text-base font-semibold text-foreground">
                        {entry.title}
                      </h3>
                    )}
                    <ul className="space-y-2.5">
                      {entry.changes.map((item, itemIndex) => (
                        <ChangeItemRow key={itemIndex} item={item} />
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}
