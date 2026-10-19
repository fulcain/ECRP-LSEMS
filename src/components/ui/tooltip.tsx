"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TooltipProps = {
  /** The text the tooltip shows. The trigger must still carry its own name
   *  (`aria-label`) - this is a visual aid, not an accessible name. */
  label: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
  children: React.ReactNode;
};

const SIDE_CLASSES = {
  top: "bottom-full left-1/2 mb-1.5 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-1.5 -translate-x-1/2",
} as const;

/**
 * A CSS-only tooltip for icon-only controls.
 *
 * The app previously relied on `title=` attributes, which never appear on
 * touch and take a second to show on hover. This shows on hover and keyboard
 * focus, uses the theme's own foreground/background tokens, and adds no
 * dependency: the accessible name stays on the trigger, so no ARIA coupling
 * is needed here.
 */
export function Tooltip({
  label,
  side = "top",
  className,
  children,
}: TooltipProps) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground shadow-md group-hover/tooltip:block group-focus-within/tooltip:block",
          SIDE_CLASSES[side],
        )}
      >
        {label}
      </span>
    </span>
  );
}
