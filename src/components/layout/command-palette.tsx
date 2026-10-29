"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import { cn } from "@/lib/utils";

type PaletteItem = {
  label: string;
  href: string;
  group: string;
  icon: HeaderLink["icon"];
  keywords?: string;
};

export type SearchDestination = {
  label: string;
  href: string;
  group: string;
  keywords?: string;
};

/**
 * The sidebar, flattened into one searchable list. Child entries are only
 * included when their href was in the allowed set the shell was handed, so the
 * palette can never offer a page the member may not open.
 */
function flatten(links: readonly HeaderLink[]): PaletteItem[] {
  const allowed = new Set(links.map((item) => item.href).filter(Boolean));
  const seen = new Set<string>();
  const items: PaletteItem[] = [];

  for (const link of links) {
    if (link.href && !seen.has(link.href)) {
      seen.add(link.href);
      items.push({
        label: link.label,
        href: link.href,
        group: link.group,
        icon: link.icon,
      });
    }
    for (const child of link.children ?? []) {
      if (!allowed.has(child.href) || seen.has(child.href)) continue;
      seen.add(child.href);
      items.push({
        label: child.label,
        href: child.href,
        group: link.group,
        icon: child.icon ?? link.icon,
      });
    }
  }

  return items;
}

/**
 * Ctrl/Cmd+K opens every server-approved page and addressable tab for this
 * member, including destinations that are not separate sidebar links.
 */
export function CommandPalette({
  links,
  destinations,
}: {
  links: readonly HeaderLink[];
  destinations: readonly SearchDestination[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const items: PaletteItem[] = [];
    const seen = new Set<string>();
    for (const destination of destinations) {
      if (seen.has(destination.href)) continue;
      seen.add(destination.href);
      items.push({ ...destination, icon: Search });
    }
    for (const item of flatten(links)) {
      if (seen.has(item.href)) continue;
      seen.add(item.href);
      items.push(item);
    }
    return items;
  }, [destinations, links]);
  const terms = useMemo(
    () => query.toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );
  const results = useMemo(
    () =>
      terms.length === 0
        ? items
        : items.filter((item) => {
            const text =
              `${item.label} ${item.group} ${item.href} ${item.keywords ?? ""}`.toLowerCase();
            return terms.every((term) => text.includes(term));
          }),
    [items, terms],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (
          event.target instanceof Element &&
          event.target.closest("[data-sidebar-search]")
        ) {
          return;
        }
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const openPalette = () => setOpen(true);
    window.addEventListener("open-command-palette", openPalette);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", openPalette);
    };
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [query, open]);

  // Keep the highlighted row inside the visible part of the list.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const choose = (item: PaletteItem | undefined) => {
    if (!item) return;
    setOpen(false);
    setQuery("");
    router.push(item.href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search every page your account can open.
        </DialogDescription>
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setIndex((value) => Math.min(value + 1, results.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setIndex((value) => Math.max(value - 1, 0));
              } else if (event.key === "Enter") {
                event.preventDefault();
                choose(results[index]);
              }
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={
              results[index] ? `command-palette-option-${index}` : undefined
            }
            placeholder="Where do you want to go?"
            aria-label="Search pages"
            className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded border border-border bg-surface-raised px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
            Esc
          </kbd>
        </div>
        <div
          ref={listRef}
          id="command-palette-list"
          role="listbox"
          aria-label="Pages"
          className="max-h-80 overflow-y-auto p-2"
        >
          {results.length === 0 ? (
            <p
              role="status"
              className="px-3 py-8 text-center text-sm text-muted-foreground"
            >
              {`No page matches "${query.trim()}".`}
            </p>
          ) : (
            results.map((item, itemIndex) => {
              const Icon = item.icon;
              const active = itemIndex === index;
              return (
                <button
                  key={item.href}
                  id={`command-palette-option-${itemIndex}`}
                  data-index={itemIndex}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseMove={() => setIndex(itemIndex)}
                  onClick={() => choose(item)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    active
                      ? "bg-primary/10"
                      : "hover:bg-surface-hover",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                      active
                        ? "bg-primary/15 text-primary"
                        : "bg-surface-hover text-muted-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {item.href}
                    </span>
                  </span>
                  {active && (
                    <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                </button>
              );
            })
          )}
        </div>
        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span className="ml-auto hidden sm:block">Ctrl K</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
