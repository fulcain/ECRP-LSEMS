"use client";

import type { HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "../sidebar-context";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { DiscordContactIndicator } from "@/components/discord-contact-indicator";

type SidebarDesktopProps = {
  headerLinks: HeaderLink[];
};

function getLinkPath(href?: string) {
  return href?.split("?")[0];
}

export function SidebarDesktop({ headerLinks }: SidebarDesktopProps) {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:flex-col lg:border-r lg:border-slate-800/80 lg:bg-slate-950/95 lg:backdrop-blur-xl",
        collapsed ? "lg:w-[76px]" : "lg:w-64",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
        <div className={cn("mb-5 flex items-center gap-2", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <Link href="/" className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-sm font-bold text-blue-300 ring-1 ring-blue-400/20">
                L
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">LSEMS</span>
                <span className="block truncate text-[10px] uppercase tracking-[0.18em] text-slate-500">Operations</span>
              </span>
            </Link>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <div className="mb-4 h-px bg-slate-800/80" />
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto" aria-label="Primary navigation">
          {headerLinks.map((item) => {
            const Icon = item.icon;
            const isActive = getLinkPath(item.href) === pathname;
            return (
              <Link
                key={item.label}
                href={item.href || "#"}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-blue-500/12 text-blue-200 ring-1 ring-inset ring-blue-400/20"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-300" : "text-slate-500 group-hover:text-slate-300")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={cn("mt-4 border-t border-slate-800/80 pt-4", collapsed && "flex justify-center") }>
          <DiscordContactIndicator handle="@fulcain" variant={collapsed ? "icon" : "pill"} />
        </div>
      </div>
    </aside>
  );
}
