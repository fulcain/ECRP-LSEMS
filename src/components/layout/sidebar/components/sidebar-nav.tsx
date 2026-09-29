"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  isHeaderLinkActive,
  type HeaderLink,
} from "@/components/layout/header/configs/HeaderLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetClose } from "@/components/ui/sheet";
import { ROUTES } from "@/configs/routes";
import { cn } from "@/lib/utils";
import { useSidebar } from "../sidebar-context";

/** Everything a nav item answers to: its label, its section and its route. */
function searchText(item: HeaderLink): string {
  return `${item.label} ${item.group} ${item.href ?? ""}`.toLowerCase();
}

type SidebarNavProps = {
  links: readonly HeaderLink[];
  /** The 76px rail hides the labels, so it hides the search with them. */
  collapsed?: boolean;
  /** The mobile sheet closes itself once a destination is chosen. */
  closeOnNavigate?: boolean;
};

/**
 * The navigation list, with the search that filters it.
 *
 * One component for both shells: the desktop rail and the mobile sheet used to
 * render this same list with their own markup, and a search written into both
 * would have to be kept in step by hand.
 *
 * The search only ever filters what it was handed, and the caller hands over the
 * hrefs the server already allowed - so it can neither reveal a page nor hide
 * one: typing "access" on a member without the Access Manager shows nothing.
 */
export function SidebarNav({
  links,
  collapsed = false,
  closeOnNavigate = false,
}: SidebarNavProps) {
  const pathname = usePathname();
  const { toggleCollapsed } = useSidebar();
  const [query, setQuery] = useState("");
  const [focusOnExpand, setFocusOnExpand] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const terms = useMemo(
    () => query.toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );

  const visible = useMemo(
    () =>
      terms.length === 0
        ? links
        : links.filter((item) => {
            const text = searchText(item);
            return terms.every((term) => text.includes(term));
          }),
    [links, terms],
  );

  // A destination was reached, so the next look at the nav shows all of it
  // again rather than the filter from last time.
  useEffect(() => {
    setQuery("");
  }, [pathname]);

  // The rail has no room for the field, so its icon expands it first.
  useEffect(() => {
    if (!collapsed && focusOnExpand) {
      searchRef.current?.focus();
      setFocusOnExpand(false);
    }
  }, [collapsed, focusOnExpand]);

  // The directory is the search that covers a division's documents, so a query
  // the nav cannot answer is offered it - but only to a member who can open it.
  const quickLinksHref = links.find(
    (item) => item.href?.split("?")[0] === ROUTES.resources.quickLinks,
  )?.href;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {collapsed ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setFocusOnExpand(true);
            toggleCollapsed();
          }}
          className="mx-auto mb-1 h-9 w-9 text-muted-foreground"
          aria-label="Search pages"
          title="Search pages"
        >
          <Search className="h-4 w-4" />
        </Button>
      ) : (
        <div className="relative mb-2 px-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuery("");
                searchRef.current?.blur();
              }
            }}
            placeholder="Search pages"
            aria-label="Search pages in the navigation"
            className="h-9 bg-surface-raised pl-8 pr-8 text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <nav
        aria-label="Primary navigation"
        className={cn(
          "min-h-0 flex-1 space-y-1 overflow-y-auto",
          closeOnNavigate && "overscroll-contain pr-1",
        )}
      >
        {visible.length === 0 && (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-muted-foreground">
              {`No page matches "${query.trim()}".`}
            </p>
            {quickLinksHref && (
              <Link
                href={quickLinksHref}
                className="mt-1.5 inline-block text-xs text-primary underline-offset-2 hover:underline"
              >
                Search division links instead
              </Link>
            )}
          </div>
        )}

        {visible.map((item, index) => {
          const Icon = item.icon;
          const isActive = isHeaderLinkActive(item, pathname);
          const showGroup =
            index === 0 || item.group !== visible[index - 1].group;
          const link = (
            <Link
              href={item.href || "#"}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors",
                closeOnNavigate && "min-h-11",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );

          return (
            <div
              key={item.label}
              className={showGroup ? "pt-3 first:pt-0" : undefined}
            >
              {showGroup && !collapsed && (
                <p className="eyebrow mb-1.5 px-3 text-muted-foreground">
                  {item.group}
                </p>
              )}
              {closeOnNavigate ? (
                <SheetClose asChild>{link}</SheetClose>
              ) : (
                link
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
