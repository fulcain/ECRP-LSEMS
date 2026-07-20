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

type HeaderMobileProps = {
  headerLinks: HeaderLink[];
};

export function HeaderMobile({ headerLinks }: HeaderMobileProps) {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="cursor-pointer rounded-lg border-white/10 bg-white/5 text-white transition-all duration-300 hover:bg-white/10 hover:scale-105"
            aria-label="Toggle menu"
            variant="outline"
            size="icon"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-[280px] border-l border-white/10 bg-slate-900/98 px-6 pb-6 text-white backdrop-blur-xl [&>button[data-radix-collection-item]]:hidden"
        >
          <div className="flex items-center justify-between">
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold text-white">
                <span className="animate-shimmer-text">Navigation</span>
              </SheetTitle>
            </SheetHeader>

            <SheetClose asChild>
              <X
                size={22}
                className="cursor-pointer text-white transition-all duration-300 hover:rotate-90 hover:text-slate-400"
              />
            </SheetClose>
          </div>

          <div className="my-4 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <nav className="mt-2 flex flex-col gap-1">
            {headerLinks.map((item, index) =>
              item.children ? (
                <div key={item.label} className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </p>
                  <div className="flex flex-col gap-0.5 pl-2">
                    {item.children.map((child) => (
                      <SheetClose asChild key={child.href}>
                        <Link
                          href={child.href}
                          className="mobile-nav-item group flex items-center rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-all duration-300 hover:bg-white/5 hover:text-white"
                        >
                          <span className="mr-2 h-1 w-1 rounded-full bg-blue-400 opacity-0 transition-all group-hover:opacity-100 group-hover:scale-150" />
                          {child.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                  <div className="my-3 h-px bg-white/5" />
                </div>
              ) : (
                <SheetClose asChild key={item.label}>
                  <Link
                    href={item.href!}
                    className="mobile-nav-item group animate-fade-in-up flex items-center rounded-lg px-3 py-3 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/5 hover:text-white"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <span className="mr-3 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 transition-all group-hover:opacity-100 group-hover:scale-125" />
                    {item.label}
                  </Link>
                </SheetClose>
              ),
            )}
          </nav>

          {/* Decorative footer element */}
          <div className="mt-8 flex justify-center">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
