"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import type { TabIcon } from "@/components/ui/tab-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * "What are you writing?" - the one step that comes before every builder in a
 * division workspace.
 *
 * A dropdown of format names asks a member to already know which document they
 * want; a grid of cards whose subtitle says *when* to use each one does not.
 * The heading of each group is the question a person actually asks themselves
 * ("is this a new application, or are they already through?"), which is why the
 * groups are the division's own workflow stages rather than its file names.
 *
 * Nothing is picked for the member: a page they open shows the cards and
 * nothing else, and the builder appears only once they have said what they are
 * writing. After that the grid folds down to a one-line summary - the form
 * belongs under the reader's eyes, not below five rows of choices they have
 * already answered - and "Change" folds it back, clearing the choice so the
 * form is not left standing under a list that is asking about a different one.
 *
 * Every picker carries a search box above the cards: RED alone offers eighteen
 * documents, and a member who knows they want "Pending Interview" should not
 * have to read six group headings to find it.
 */

export type PickerDocument<T extends string> = {
  /** The value the builder behind this card understands. */
  value: T;
  /** The card's title. Usually the document's own label. */
  label: string;
  /** One plain line: when to pick this. */
  hint: string;
  icon: TabIcon;
};

export type PickerGroup<T extends string> = {
  /** The question this group answers, e.g. "New applications". */
  label: string;
  /** Optional line under the heading. */
  hint?: string;
  documents: readonly PickerDocument<T>[];
};

type DocumentPickerProps<T extends string> = {
  groups: readonly PickerGroup<T>[];
  /** The document being written, or `null` while the member has not picked. */
  value: T | null;
  /**
   * Called with the picked document, or `null` when the member clears the
   * choice - which is what the page reads to decide whether to show a builder.
   */
  onChange: (value: T | null) => void;
  /** Question above the first group. */
  legend?: string;
  className?: string;
};

export function DocumentPicker<T extends string>({
  groups,
  value,
  onChange,
  legend = "What are you writing?",
  className,
}: DocumentPickerProps<T>) {
  const [query, setQuery] = useState("");
  // "Change" reopens the grid. A page that clears its own choice (BLS, RED)
  // opens it by that alone; one that keeps the document it has needs this too,
  // or pressing Change would look like it did nothing.
  const [reopened, setReopened] = useState(false);

  const documents = useMemo(
    () => groups.flatMap((group) => group.documents),
    [groups],
  );
  const selected = value
    ? documents.find((doc) => doc.value === value)
    : undefined;

  // Search reads the card the way a member does: its title, the line saying
  // when to use it, the group's own heading - and the builder's key, so the
  // abbreviations the templates are named after ("ots", "frd") still find it.
  const term = query.trim().toLowerCase();
  const visibleGroups = useMemo(() => {
    if (!term) return groups;
    return groups
      .map((group) => ({
        ...group,
        documents: group.documents.filter((doc) =>
          [doc.label, doc.hint, doc.value, group.label].some((text) =>
            text.toLowerCase().includes(term),
          ),
        ),
      }))
      .filter((group) => group.documents.length > 0);
  }, [groups, term]);
  const matchCount = visibleGroups.reduce(
    (total, group) => total + group.documents.length,
    0,
  );

  if (selected && !reopened) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3",
          className,
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          <IconSlot icon={selected.icon} />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Writing
          </span>
          <span className="block text-sm font-semibold text-foreground">
            {selected.label}
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            setReopened(true);
            onChange(null);
          }}
          className="ml-auto flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Change
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow text-muted-foreground">{legend}</p>
        <div className="w-full sm:w-72">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && query) {
                  event.preventDefault();
                  setQuery("");
                }
              }}
              aria-label="Search formats"
              placeholder="Search formats..."
              className="h-10 pr-10 pl-9"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {/* Screen readers get the count too, so a filtered list is not a
              silent change to the page. */}
          {term && (
            <p role="status" className="mt-1 text-xs text-muted-foreground">
              {matchCount} of {documents.length} formats
            </p>
          )}
        </div>
      </div>

      {term && visibleGroups.length === 0 && (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            Nothing matches “{query.trim()}”
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try part of the name, or clear the search to see everything.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuery("")}
            className="mt-3"
          >
            Clear search
          </Button>
        </div>
      )}

      {visibleGroups.map((group) => (
        <section key={group.label} className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {group.label}
            </h2>
            {group.hint && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {group.hint}
              </p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.documents.map((doc) => {
              const active = doc.value === value;
              return (
                <button
                  key={doc.value}
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => {
                    setReopened(false);
                    onChange(doc.value);
                    // Leaving the term behind would hide the other formats from
                    // the member the next time the grid unfolds.
                    setQuery("");
                  }}
                  className={cn(
                    "group flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-all",
                    "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
                    active
                      ? "border-primary/70 bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-muted/40",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                      active
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    <IconSlot icon={doc.icon} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        active ? "text-primary" : "text-foreground",
                      )}
                    >
                      {doc.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {doc.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function IconSlot({ icon }: { icon: TabIcon }) {
  // A picker card may hand us either markup or a component (lucide icons are
  // forwardRef objects, so they are not functions and cannot be rendered in
  // place of an element).
  if (React.isValidElement(icon)) return <>{icon}</>;
  const Icon = icon as React.ComponentType<{ className?: string }>;
  return <Icon className="h-4 w-4" />;
}
