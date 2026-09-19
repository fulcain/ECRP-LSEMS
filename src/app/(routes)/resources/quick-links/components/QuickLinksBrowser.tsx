"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock, CornerDownLeft, Search, Star, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { EmptyState, PageSection } from "@/components/ui/surface";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { LinkRow } from "./LinkRow";
import {
  linkById,
  searchQuickLinks,
  termsOf,
  type QuickLinkDivision,
} from "../lib/quick-links-search";

const PINNED_KEY = "quick-links:pinned";
const RECENT_KEY = "quick-links:recent";
/** Enough to cover a shift's worth of hopping between documents. */
const RECENT_LIMIT = 8;

type QuickLinksBrowserProps = {
  divisions: QuickLinkDivision[];
};

/**
 * The Quick Links directory.
 *
 * Built around the fact that this page is used at speed: someone mid-shift
 * wants one document and wants it now. So there is a single search (the old
 * page had one per division as well), the result is a flat ranked list rather
 * than an accordion to expand, `/` and Cmd/Ctrl+K focus the field from
 * anywhere, arrow keys and Enter work without the mouse, and the links a
 * member actually uses are pinned or remembered instead of hunted for again.
 */
export function QuickLinksBrowser({ divisions }: QuickLinksBrowserProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [pinned, setPinned] = useLocalStorage<string[]>(PINNED_KEY, []);
  const [recent, setRecent] = useLocalStorage<string[]>(RECENT_KEY, []);
  const searchRef = useRef<HTMLInputElement>(null);

  const byId = useMemo(() => linkById(divisions), [divisions]);
  const terms = useMemo(() => termsOf(query), [query]);
  const { hits } = useMemo(
    () => searchQuickLinks(divisions, query),
    [divisions, query],
  );

  const resolve = useCallback(
    (ids: string[]) =>
      ids
        .map((id) => byId.get(id))
        .filter(
          (
            hit,
          ): hit is { division: QuickLinkDivision; entry: QuickLinkDivision["links"][number] } =>
            Boolean(hit),
        ),
    [byId],
  );

  const pinnedLinks = useMemo(() => resolve(pinned), [pinned, resolve]);
  const recentLinks = useMemo(
    () => resolve(recent).filter((link) => !pinned.includes(link.entry.id)),
    [recent, resolve, pinned],
  );

  // A new query starts at the top of its own results.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const togglePin = useCallback(
    (id: string) => {
      setPinned((previous) =>
        previous.includes(id)
          ? previous.filter((value) => value !== id)
          : [id, ...previous],
      );
    },
    [setPinned],
  );

  const recordOpen = useCallback(
    (id: string) => {
      setRecent((previous) =>
        [id, ...previous.filter((value) => value !== id)].slice(0, RECENT_LIMIT),
      );
    },
    [setRecent],
  );

  const openHit = useCallback(
    (index: number) => {
      const hit = hits[index];
      if (!hit) return;
      recordOpen(hit.entry.id);
      window.open(hit.entry.url, "_blank", "noopener,noreferrer");
    },
    [hits, recordOpen],
  );

  // Jumping to search from anywhere is the point of the page being fast.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, hits.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      openHit(activeIndex);
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (query) setQuery("");
      else searchRef.current?.blur();
    }
  };

  const isSearching = query.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          aria-label="Search every division and link"
          aria-controls="quick-links-results"
          placeholder="Search links, divisions or an acronym..."
          className="h-11 pl-9 pr-24 text-base md:text-sm"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <kbd className="hidden rounded-md border border-border bg-surface-hover px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
            /
          </kbd>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {isSearching
          ? `${hits.length} ${hits.length === 1 ? "link" : "links"} found`
          : ""}
      </p>

      {isSearching ? (
        <div id="quick-links-results">
          {hits.length === 0 ? (
            <EmptyState
              icon={Search}
              title={`No link matches "${query.trim()}"`}
              description="Try a shorter word, or an acronym such as BLS or FTD."
              action={
                <Button variant="outline" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <PageSection
              title={`${hits.length} ${hits.length === 1 ? "result" : "results"}`}
              description={
                <>
                  Arrow keys to move, <CornerDownLeft className="inline h-3 w-3" /> to
                  open.
                </>
              }
              bodyClassName="p-2"
            >
              <ul className="space-y-0.5">
                {hits.map((hit, index) => (
                  <li key={hit.entry.id}>
                    <LinkRow
                      entry={hit.entry}
                      divisionLabel={hit.division.label}
                      terms={terms}
                      pinned={pinned.includes(hit.entry.id)}
                      onTogglePin={togglePin}
                      onOpen={recordOpen}
                      active={index === activeIndex}
                    />
                  </li>
                ))}
              </ul>
            </PageSection>
          )}
        </div>
      ) : (
        <>
          {pinnedLinks.length > 0 && (
            <PageSection
              title="Pinned"
              description="Kept on this device."
              action={
                <Star className="h-4 w-4 fill-current text-warning" />
              }
              bodyClassName="p-2"
            >
              <ul className="space-y-0.5">
                {pinnedLinks.map((link) => (
                  <li key={link.entry.id}>
                    <LinkRow
                      entry={link.entry}
                      divisionLabel={link.division.label}
                      terms={[]}
                      pinned
                      onTogglePin={togglePin}
                      onOpen={recordOpen}
                    />
                  </li>
                ))}
              </ul>
            </PageSection>
          )}

          {recentLinks.length > 0 && (
            <PageSection
              title="Recently opened"
              description="The last few links, newest first."
              action={<Clock className="h-4 w-4 text-muted-foreground" />}
              bodyClassName="p-2"
            >
              <ul className="space-y-0.5">
                {recentLinks.map((link) => (
                  <li key={link.entry.id}>
                    <LinkRow
                      entry={link.entry}
                      divisionLabel={link.division.label}
                      terms={[]}
                      pinned={false}
                      onTogglePin={togglePin}
                      onOpen={recordOpen}
                    />
                  </li>
                ))}
              </ul>
            </PageSection>
          )}

          <PageSection
            title="All divisions"
            description="Open a division to see everything in it."
            bodyClassName="p-0"
          >
            <Accordion type="multiple" className="w-full">
              {divisions.map((division) => (
                <AccordionItem
                  key={division.label}
                  value={division.label}
                  className="border-b border-border last:border-b-0"
                >
                  <AccordionTrigger className="px-5 py-3.5 text-sm font-medium text-foreground hover:no-underline">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={division.image}
                          alt=""
                          className="h-5 w-5 object-contain"
                        />
                      </span>
                      <span className="truncate">{division.label}</span>
                      <span className="shrink-0 rounded-md bg-surface-hover px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        {division.links.length}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-3 pt-0">
                    <ul className="space-y-0.5">
                      {division.links.map((entry) => (
                        <li key={entry.id}>
                          <LinkRow
                            entry={entry}
                            terms={[]}
                            pinned={pinned.includes(entry.id)}
                            onTogglePin={togglePin}
                            onOpen={recordOpen}
                          />
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </PageSection>
        </>
      )}
    </div>
  );
}
