"use client";

import { getCurrentUTCTime } from "@/app/helpers/timeUtils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The time counterpart of the date fields' "Today" button. Time inputs across
 * the tools are typed by hand, and every one of them is UTC, so this fills the
 * field with the current UTC time - never the browser's local time.
 */
export function NowTimeButton({
  onFill,
  className,
}: {
  onFill: (time: string) => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      onClick={() => onFill(getCurrentUTCTime())}
      title="Fills in the current time (UTC)"
      className={cn("shrink-0 text-xs", className)}
    >
      Copy Now
    </Button>
  );
}
