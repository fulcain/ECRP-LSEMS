"use client";

import { useEffect, useRef } from "react";
import { ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  splitHighlight,
  type QuickLinkEntry,
} from "../lib/quick-links-search";

type LinkRowProps = {
  entry: QuickLinkEntry;
  /** Division shown as context when the link appears outside its own section. */
  divisionLabel?: string;
  terms: string[];
  pinned: boolean;
  onTogglePin: (id: string) => void;
  onOpen: (id: string) => void;
  /** Keyboard-selected row, so Enter has a visible target. */
  active?: boolean;
};

/**
 * One link. The pin is a sibling of the anchor rather than nested inside it -
 * an interactive control inside a link is invalid markup and swallows the
 * click on some browsers.
 */
export function LinkRow({
  entry,
  divisionLabel,
  terms,
  pinned,
  onTogglePin,
  onOpen,
  active = false,
}: LinkRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  // Arrow keys move the selection past the edge of the viewport otherwise.
  useEffect(() => {
    if (active) rowRef.current?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const segments = splitHighlight(entry.name, terms);

  return (
    <div
      ref={rowRef}
      className={cn(
        "group/link flex items-center gap-1 rounded-xl border pr-1 transition-colors",
        active
          ? "border-primary/50 bg-primary/10"
          : "border-transparent hover:border-border hover:bg-surface-hover",
      )}
    >
      <a
        href={entry.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onOpen(entry.id)}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            active
              ? "translate-x-0.5 text-primary"
              : "text-muted-foreground group-hover/link:translate-x-0.5 group-hover/link:text-primary",
          )}
        />
        <span className="min-w-0 flex-1 truncate">
          {segments.map((segment, index) =>
            segment.match ? (
              <mark
                key={index}
                className="rounded bg-primary/25 px-0.5 text-foreground"
              >
                {segment.text}
              </mark>
            ) : (
              <span key={index}>{segment.text}</span>
            ),
          )}
        </span>
        {divisionLabel && (
          <span className="hidden shrink-0 rounded-md bg-surface-hover px-1.5 py-0.5 text-[11px] text-muted-foreground sm:inline">
            {divisionLabel}
          </span>
        )}
      </a>
      <button
        type="button"
        onClick={() => onTogglePin(entry.id)}
        aria-pressed={pinned}
        aria-label={
          pinned ? `Unpin ${entry.name}` : `Pin ${entry.name} to the top`
        }
        title={pinned ? "Unpin" : "Pin to the top"}
        className={cn(
          "shrink-0 cursor-pointer rounded-lg p-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          pinned
            ? "text-warning"
            : "text-muted-foreground opacity-0 hover:text-foreground focus-visible:opacity-100 group-hover/link:opacity-100",
        )}
      >
        <Star className={cn("h-4 w-4", pinned && "fill-current")} />
      </button>
    </div>
  );
}
