"use client";

import { headerLinks } from "@/components/layout/header/configs/HeaderLinks";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SidebarDesktop } from "./components/sidebar-desktop";
import { SidebarMobile } from "./components/sidebar-mobile";
import { SidebarProvider } from "./sidebar-context";
import { ContentWrapper } from "./content-wrapper";
import { CommandPalette } from "../command-palette";
import React from "react";
import type { SearchDestination } from "../command-palette";
import { Search } from "lucide-react";

/**
 * The shell around every page.
 *
 * `allowedHrefs` is what the signed-in member may open, decided on the server
 * with the same rules the route gate enforces. It arrives as hrefs rather than
 * whole nav items because the item icons are components, which cannot cross
 * into a client component - so the access decision is the server's and this
 * only renders the subset it was handed.
 *
 * A signed-out visitor gets no navigation at all: the login, access-denied and
 * 404 pages render on their own instead of inside an empty navigation shell.
 */
export function SidebarLayout({
  allowedHrefs,
  searchItems,
  signedIn,
  initialCollapsed = false,
  children,
}: {
  allowedHrefs: readonly string[];
  searchItems: readonly SearchDestination[];
  signedIn: boolean;
  initialCollapsed?: boolean;
  children: React.ReactNode;
}) {
  if (!signedIn) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen outline-none"
      >
        {children}
        {/* The one shell control worth keeping signed out - the pages are
            otherwise free of navigation. */}
        <div className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50">
          <ThemeToggle />
        </div>
      </main>
    );
  }

  const allowed = new Set(allowedHrefs);
  const links = headerLinks
    .filter((item) => item.href && allowed.has(item.href))
    .map((item) => ({
      ...item,
      // A child the member cannot open is not rendered - the rule the server
      // filter holds for top-level entries holds for these too.
      children: item.children?.filter((child) => allowed.has(child.href)),
    }));

  return (
    <SidebarProvider initialCollapsed={initialCollapsed}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>
      <SidebarDesktop headerLinks={links} />
      <SidebarMobile headerLinks={links} />
      <CommandPalette links={links} destinations={searchItems} />
      <ContentWrapper>
        <header className="sticky top-0 z-40 flex h-14 items-center justify-end border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-surface-raised/80 px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-surface-hover hover:text-foreground"
            aria-label="Search pages"
          >
            <Search className="h-4 w-4" />
            <span>Search pages</span>
            <kbd className="ml-2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
              Ctrl K
            </kbd>
          </button>
        </header>
        {children}
      </ContentWrapper>
    </SidebarProvider>
  );
}
