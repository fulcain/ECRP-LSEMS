"use client";

import type { HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SidebarMobileProps = {
  headerLinks: HeaderLink[];
};

export function SidebarMobile({ headerLinks }: SidebarMobileProps) {
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="cursor-pointer fixed left-4 top-4 z-50 rounded-xl border-white/10 bg-slate-900/80 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:scale-105"
            aria-label="Toggle menu"
            variant="outline"
            size="icon"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-[280px] border-r border-white/10 bg-slate-950/98 px-5 pb-6 text-white backdrop-blur-xl [&>button[data-radix-collection-item]]:hidden"
        >
          <div className="flex items-center justify-between">
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold text-white">
                <span className="animate-shimmer-text">LSEMS</span>
              </SheetTitle>
            </SheetHeader>

            <SheetClose asChild>
              <X
                size={22}
                className="cursor-pointer text-white transition-all duration-300 hover:rotate-90 hover:text-slate-400"
              />
            </SheetClose>
          </div>

          <div className="my-4 h-px bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-transparent" />

          <nav className="mt-2 flex flex-col gap-1">
            {headerLinks.map((item, index) => {
              const isActive = item.href && pathname === item.href;
              return (
                <SheetClose asChild key={item.label}>
                  <Link
                    href={item.href || "#"}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 animate-fade-in-up",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white",
                    )}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-all duration-300",
                        isActive
                          ? "bg-blue-400 shadow-lg shadow-blue-400/50 scale-125"
                          : "bg-slate-600 group-hover:bg-slate-400 group-hover:scale-110",
                      )}
                    />
                    {item.label}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>

          {/* Decorative footer */}
          <div className="mt-8 flex justify-center">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
