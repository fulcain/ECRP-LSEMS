import * as React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────
   Page composition primitives.

   These exist because the app used to answer "what does a page look like?"
   with one decorative box - a `rounded-[2rem]` panel with a radial gradient
   and a grid overlay - repeated in ten files. That made a directory, a form,
   a timeline and a document builder all render as the same rectangle, and it
   hardcoded its own dark palette on top of the theme.

   There is no single page template instead. A page picks the blocks that fit
   its task (a `Toolbar` for filtering, `StatTile`s for a summary, `PageSection`s
   for the body) and they all read the same tokens, radii and spacing, so the
   parts stay consistent even when the composition differs.
   ───────────────────────────────────────────────────────────────────────── */

/** The base surface. Every panel in the app sits on one of these. */
export function Surface({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="surface"
      className={cn(
        "rounded-2xl border border-border bg-surface",
        className,
      )}
      {...props}
    />
  );
}

type PageSectionProps = {
  /** Section heading. Omit only when the section is a single obvious block. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned controls for this section (a count, a button, a filter). */
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
};

/**
 * A titled block of page content. This is what replaces the old "one big
 * panel per page": a page stacks as many sections as its task needs, and each
 * one is scannable on its own.
 */
export function PageSection({
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
}: PageSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface",
        className,
      )}
    >
      {(title || description || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="meta mt-1">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="flex shrink-0 items-center gap-2">{action}</div>
          )}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** A row of search, filters and actions above a list or a grid. */
export function Toolbar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    />
  );
}

type EmptyStateProps = {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  /** `error` announces itself to assistive tech; `empty` is a quiet status. */
  tone?: "empty" | "error";
  className?: string;
};

/**
 * The state shown when there is nothing to show. Every list, table and search
 * result renders one of these rather than a bare line of grey text, so "no
 * links found" and "we could not load this" never look the same.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "empty",
  className,
}: EmptyStateProps) {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center",
        isError
          ? "border-destructive/40 bg-destructive/5"
          : "border-border bg-surface/40",
        className,
      )}
    >
      {Icon && (
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full",
            isError
              ? "bg-destructive/15 text-destructive"
              : "bg-surface-hover text-muted-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div className="space-y-1">
        <p
          className={cn(
            "text-sm font-semibold",
            isError ? "text-destructive" : "text-foreground",
          )}
        >
          {title}
        </p>
        {description && (
          <p className="meta mx-auto max-w-sm">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

type StatTileProps = {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  /** Semantic colour for the value - never the only signal, the label carries it. */
  tone?: "default" | "success" | "warning" | "destructive";
  className?: string;
};

const STAT_TONE: Record<NonNullable<StatTileProps["tone"]>, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

/**
 * One number with its label. Summary rows use these so a member can read the
 * state of a page at a glance instead of parsing a form.
 */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-raised px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <p className="eyebrow text-muted-foreground">
          {label}
        </p>
      </div>
      <p
        className={cn(
          "mt-1.5 text-lg font-semibold tabular-nums leading-tight",
          STAT_TONE[tone],
        )}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
