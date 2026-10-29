"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  isHeaderLinkActive,
  type HeaderLink,
} from "@/components/layout/header/configs/HeaderLinks";
import { SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/configs/routes";
import { cn } from "@/lib/utils";
import { useSidebar } from "../sidebar-context";

function searchText(item: HeaderLink): string {
  return `${item.label} ${item.group} ${item.href ?? ""}`.toLowerCase();
}

type SidebarNavProps = {
  links: readonly HeaderLink[];
  /** The 76px rail hides labels and section names. */
  collapsed?: boolean;
  /** The mobile sheet closes itself once a destination is chosen. */
  closeOnNavigate?: boolean;
};

/**
 * The navigation links the server decided this member can open, with a local
 * filter for quickly narrowing that list.
 *
 * One component serves the desktop rail and the mobile sheet, so both navigation
 * views stay consistent while app-wide search lives in the shell header.
 */
export function SidebarNav({
  links,
  collapsed = false,
  closeOnNavigate = false,
}: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleCollapsed } = useSidebar();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
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

  useEffect(() => setActiveIndex(0), [query]);
  useEffect(() => setQuery(""), [pathname]);
  useEffect(() => {
    if (!collapsed && focusOnExpand) {
      searchRef.current?.focus();
      setFocusOnExpand(false);
    }
  }, [collapsed, focusOnExpand]);

  const openActive = () => {
    const item = visible[activeIndex];
    if (item?.href) router.push(item.href);
  };

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
            maxLength={100}
            data-sidebar-search
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuery("");
                searchRef.current?.blur();
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((value) => Math.min(value + 1, visible.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((value) => Math.max(value - 1, 0));
              } else if (event.key === "Enter") {
                event.preventDefault();
                openActive();
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
        {query && (
          <p role="status" className="px-3 pb-1 text-[11px] text-muted-foreground">
            {visible.length === 1 ? "1 page found" : `${visible.length} pages found`}
          </p>
        )}

        {visible.length === 0 && (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-muted-foreground">
              {links.length === 0
                ? "No pages are set up for your account yet."
                : `No page matches "${query.trim()}".`}
            </p>
            {links.length > 0 && quickLinksHref && (
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
          const isHighlighted = terms.length > 0 && index === activeIndex;
          const link = (
            <Link
              href={item.href || "#"}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-2xl border border-transparent px-2.5 py-2 text-sm transition-[background-color,border-color,color] duration-200",
                closeOnNavigate && "min-h-11",
                collapsed && "justify-center px-2",
                isActive
                  ? "nav-link-active bg-primary/10 text-primary"
                  : "text-muted-foreground hover:border-border/70 hover:bg-surface-raised/70 hover:text-foreground",
                isHighlighted &&
                  "border-border/70 bg-surface-raised/70 text-foreground",
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
              {!collapsed && item.children && item.children.length > 0 && (
                <div className="ml-6 mt-0.5 space-y-0.5 border-l border-border/60 pl-2">
                  {item.children.map((child) => {
                    const childLink = (
                      <Link
                        key={child.href}
                        href={child.href}
                        title={child.description}
                        aria-current={
                          pathname === child.href.split("?")[0]
                            ? "page"
                            : undefined
                        }
                        className="block truncate rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                      >
                        {child.label}
                      </Link>
                    );
                    return closeOnNavigate ? (
                      <SheetClose key={child.href} asChild>
                        {childLink}
                      </SheetClose>
                    ) : (
                      childLink
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
