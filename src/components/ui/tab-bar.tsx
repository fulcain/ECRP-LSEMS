"use client";

import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

/**
 * Every tab row in the app renders through this component so they stay
 * visually identical - accent pills with a hairline divider under the row.
 *
 * Two flavours are supported:
 *   • state tabs  - `onChange` switches panels in place (default)
 *   • route tabs  - a tab carrying `href` renders as a link; the caller
 *                   decides `active` (usually from the pathname)
 */

/**
 * A tab icon may be a rendered element (callers that already control the
 * markup) or a component such as a lucide icon, which the tab bar sizes to
 * match the active variant.
 */
export type TabIcon =
  | React.ReactNode
  | React.ComponentType<{ className?: string }>;

export interface Tab<T extends string> {
  value: T;
  label: string;
  icon?: TabIcon;
  /**
   * Tailwind classes for the active pill. Falls back to the standard blue
   * accent, so a tab set without its own palette still matches the rest.
   */
  accent?: string;
  /** When set, the tab renders as navigation instead of a button. */
  href?: string;
}

/** Standard accent used when a tab doesn't declare its own colours. */
const ACTIVE_FALLBACK = "border-primary/40 bg-primary/20 text-primary";

const INACTIVE =
  "border-border bg-surface text-muted-foreground hover:border-primary/30 hover:bg-surface-hover hover:text-foreground";

const SIZES = {
  /** Page-level tab rows. */
  md: {
    row: "gap-2",
    tab: "gap-2 rounded-xl px-5 py-3 text-sm font-semibold",
    icon: "h-4 w-4",
  },
  /** Compact toggles that live inside a card. */
  sm: {
    row: "gap-1.5",
    tab: "gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
    icon: "h-3.5 w-3.5",
  },
} as const;

type TabBarProps<T extends string> = {
  tabs: readonly Tab<T>[];
  active: T;
  onChange?: (value: T) => void;
  ariaLabel?: string;
  size?: keyof typeof SIZES;
  /** Hairline divider under the row - off for nested/compact tab rows. */
  divider?: boolean;
  className?: string;
};

function TabIconSlot({ icon, className }: { icon?: TabIcon; className: string }) {
  if (!icon) return null;
  if (React.isValidElement(icon)) return <>{icon}</>;
  const Icon = icon as React.ComponentType<{ className?: string }>;
  return <Icon className={className} />;
}

export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel = "Page sections",
  size = "md",
  divider = true,
  className,
}: TabBarProps<T>) {
  const variant = SIZES[size];
  const usesLinks = tabs.some((tab) => tab.href);

  const items = tabs.map(({ value, label, icon, accent, href }) => {
    const isActive = active === value;
    const classes = cn(
      // The focus ring is on the tab itself, not only the row: keyboard users
      // move between tabs, and a scaled active pill is the only visual cue.
      "flex cursor-pointer items-center border transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      variant.tab,
      isActive ? cn(accent ?? ACTIVE_FALLBACK, "shadow-sm") : INACTIVE,
    );

    if (href) {
      return (
        <Link
          key={value}
          href={href}
          aria-current={isActive ? "page" : undefined}
          className={classes}
        >
          <TabIconSlot icon={icon} className={variant.icon} />
          {label}
        </Link>
      );
    }

    return (
      <button
        key={value}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => onChange?.(value)}
        className={classes}
      >
        <TabIconSlot icon={icon} className={variant.icon} />
        {label}
      </button>
    );
  });

  const body = (
    <>
      {usesLinks ? (
        <div className={cn("flex flex-wrap", variant.row)}>{items}</div>
      ) : (
        <div
          role="tablist"
          aria-label={ariaLabel}
          className={cn("flex flex-wrap", variant.row)}
        >
          {items}
        </div>
      )}
      {divider && <div className="mt-4 h-px bg-border" />}
    </>
  );

  if (usesLinks) {
    return (
      <nav aria-label={ariaLabel} className={cn("mb-8", className)}>
        {body}
      </nav>
    );
  }

  return <div className={cn("mb-8", className)}>{body}</div>;
}
