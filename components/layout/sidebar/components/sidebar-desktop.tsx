"use client";

import type { HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "../sidebar-context";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

type SidebarDesktopProps = {
  headerLinks: HeaderLink[];
};

export function SidebarDesktop({ headerLinks }: SidebarDesktopProps) {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ease-in-out",
        collapsed ? "lg:w-[72px]" : "lg:w-64",
      )}
    >
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5" />
      
      {/* Subtle right border glow */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-6">
        {/* Brand + Toggle */}
        <div className="mb-6 flex items-center gap-2">
          {!collapsed && (
            <Link
              href="/"
              className="group flex items-center gap-3 px-2 flex-1 min-w-0"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-white/10 transition-all duration-300 group-hover:ring-white/20 group-hover:scale-105">
                <span className="text-lg font-bold text-white">L</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white transition-colors group-hover:text-blue-200 truncate">
                  LSEMS
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 transition-colors group-hover:text-slate-400 truncate">
                  EMS Tools
                </p>
              </div>
            </Link>
          )}

          {/* Collapse toggle button */}
          <button
            onClick={toggleCollapsed}
            className={cn(
              "shrink-0 rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-white/10 hover:text-white",
              collapsed && "mx-auto mb-2",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Divider */}
        {!collapsed && <div className="mb-6 h-px bg-white/5" />}

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {headerLinks.map((item, index) => {
            const isActive = item.href && pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href || "#"}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 animate-fade-in-up",
                  collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                  isActive
                    ? "bg-white/10 text-white ring-1 ring-white/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active indicator */}
                <span
                  className={cn(
                    "shrink-0 h-1.5 w-1.5 rounded-full transition-all duration-300",
                    isActive
                      ? "bg-blue-400 shadow-lg shadow-blue-400/50 scale-125"
                      : "bg-slate-600 group-hover:bg-slate-400 group-hover:scale-110",
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom decorative element */}
        <div className="mt-auto pt-6">
          <div className="h-px bg-white/5" />
          <div className="mt-4 flex justify-center">
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20" />
          </div>
        </div>
      </div>
    </aside>
  );
}
