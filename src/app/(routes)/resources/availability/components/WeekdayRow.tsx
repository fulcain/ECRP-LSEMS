"use client";

import { TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { DayAnalysis } from "../lib/analyze-availability";
import type { Weekday } from "@/app/helpers/timeUtils";

type WeekdayRowProps = {
  day: Weekday;
  analysis: DayAnalysis;
  onChange: (value: string) => void;
};

/**
 * One day of the week on the availability page.
 *
 * The UTC conversion used to happen only after pressing Generate, which meant
 * a typo was invisible until the block was already copied. Here the converted
 * range sits under the field as it is typed, and an entry with no readable
 * time says so instead of copying through as-is.
 */
export function WeekdayRow({ day, analysis, onChange }: WeekdayRowProps) {
  const isUnreadable = analysis.state === "unreadable";
  const isSet = analysis.state === "set";

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2 rounded-xl border px-4 py-3 transition-colors sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start sm:gap-4",
        isUnreadable
          ? "border-warning/40 bg-warning/5"
          : isSet
            ? "border-primary/30 bg-surface-raised"
            : "border-border bg-surface-raised/40",
      )}
    >
      <Label
        htmlFor={`availability-${day}`}
        className="eyebrow text-muted-foreground sm:pt-1.5"
      >
        {day}
      </Label>

      <div className="min-w-0">
        <Input
          id={`availability-${day}`}
          value={analysis.raw}
          onChange={(event) => onChange(event.target.value)}
          placeholder="08:00 - 12:00 and 14:00 - 22:00"
          aria-invalid={isUnreadable || undefined}
          aria-describedby={`availability-${day}-utc`}
        />
        <p
          id={`availability-${day}-utc`}
          className={cn(
            "mt-1.5 text-xs",
            isUnreadable ? "text-warning" : "text-muted-foreground",
          )}
        >
          {isUnreadable ? (
            <span className="inline-flex items-center gap-1.5">
              <TriangleAlert className="h-3.5 w-3.5" />
              No time found here - write it as HH:MM, for example 08:00 - 12:00.
            </span>
          ) : isSet ? (
            <>
              UTC: <span className="font-medium text-foreground">{analysis.utc}</span>
            </>
          ) : (
            "Left blank, this day posts as empty."
          )}
        </p>
      </div>
    </div>
  );
}
