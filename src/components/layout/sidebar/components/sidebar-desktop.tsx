"use client";

import { isHeaderLinkActive, type HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import { ENTRY_ROUTE } from "@/configs/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "../sidebar-context";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { DiscordContactIndicator } from "@/components/discord-contact-indicator";
import { UserMenu } from "@/components/layout/sidebar/user-menu";

type SidebarDesktopProps = {
  headerLinks: HeaderLink[];
};

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
      <div className="flex min-h-0 flex-1 flex-col px-2.5 py-3">
        <div className={cn("mb-3 flex items-center gap-2", collapsed ? "justify-center" : "justify-between")}>
          {/* The brand links to the entry route, which the middleware resolves
              per member - pointing it at one section would send everyone else
              to an access-denied page. */}
          {!collapsed && (
            <Link href={ENTRY_ROUTE} className="flex min-w-0 items-center gap-2.5 rounded-xl px-1.5 py-1.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-sm font-bold text-blue-300 ring-1 ring-blue-400/20">
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

        <div className="mb-2.5 h-px bg-slate-800/80" />
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto" aria-label="Primary navigation">
          {headerLinks.map((item, index) => {
            const Icon = item.icon;
            const isActive = isHeaderLinkActive(item, pathname);
            const showGroup = index === 0 || item.group !== headerLinks[index - 1].group;
            return (
              <div key={item.label} className={showGroup ? "pt-2 first:pt-0" : undefined}>
                {showGroup && !collapsed && <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.group}</p>}
                <Link
                href={item.href || "#"}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm transition-colors",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-blue-500/12 text-blue-200 ring-1 ring-inset ring-blue-400/20"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100",
                )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-300" : "text-slate-500 group-hover:text-slate-300")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className={cn("mt-3 space-y-2.5 border-t border-slate-800/80 pt-3", collapsed && "flex flex-col items-center") }>
          {!collapsed && <UserMenu />}
          <DiscordContactIndicator variant={collapsed ? "icon" : "pill"} />
        </div>
      </div>
    </aside>
  );
}
