"use client";

import type { HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import { ENTRY_ROUTE } from "@/configs/routes";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSidebar } from "../sidebar-context";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { DiscordContactIndicator } from "@/components/discord-contact-indicator";
import { UserMenu } from "@/components/layout/sidebar/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SidebarNav } from "./sidebar-nav";

type SidebarDesktopProps = {
  headerLinks: HeaderLink[];
  memberRank: string | null;
};

export function SidebarDesktop({ headerLinks, memberRank }: SidebarDesktopProps) {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:flex-col lg:border-r lg:border-sidebar-border/70 lg:bg-sidebar/90 lg:shadow-[18px_0_60px_-48px_color-mix(in_oklch,var(--primary)_45%,transparent)] lg:backdrop-blur-2xl",
        collapsed ? "lg:w-[76px]" : "lg:w-64",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col px-2.5 py-3">
        <div
          className={cn(
            "mb-3 flex items-center gap-2",
            // Stacked in the collapsed rail: 28px of emblem plus a 36px button
            // do not fit side by side in 76px.
            collapsed ? "flex-col justify-center gap-1" : "justify-between",
          )}
        >
          {/* The brand links to the entry route, which the middleware resolves
              per member - pointing it at one section would send everyone else
              to an access-denied page. */}
          {/* The brand stays visible when the sidebar is collapsed - it is the
              way home, and it was the one thing the collapsed rail dropped. */}
          <Link
            href={ENTRY_ROUTE}
            aria-label="LSEMS home"
            className={cn(
              "flex min-w-0 items-center gap-2.5 rounded-2xl border border-transparent px-1.5 py-2 transition-colors hover:border-border/70 hover:bg-surface-raised/80",
              collapsed && "justify-center",
            )}
          >
            {/* The same emblem as the favicon and every page header. */}
            <Image
              src="/General.png"
              alt=""
              width={28}
              height={28}
              className="h-8 w-8 shrink-0 rounded-xl bg-primary/10 p-1 object-contain ring-1 ring-primary/20"
            />
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold tracking-tight text-foreground">
                  LSEMS
                </span>
                <span className="block truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Operations
                </span>
              </span>
            )}
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={toggleCollapsed}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mb-2.5 h-px bg-gradient-to-r from-[#a43e38]/50 via-primary/30 to-transparent" />
        <SidebarNav links={headerLinks} collapsed={collapsed} />

        <div className={cn("mt-3 space-y-2.5 border-t border-border pt-3", collapsed && "flex flex-col items-center") }>
          <UserMenu collapsed={collapsed} rankLabel={memberRank} />
          <DiscordContactIndicator
            variant={collapsed ? "icon" : "pill"}
            label="Developed by @fulcain"
            prefix="Developed by"
          />
        </div>
      </div>
    </aside>
  );
}
