"use client";

import type { HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { DiscordContactIndicator } from "@/components/discord-contact-indicator";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SidebarMobileProps = {
  headerLinks: HeaderLink[];
};

function getLinkPath(href?: string) {
  return href?.split("?")[0];
}

export function SidebarMobile({ headerLinks }: SidebarMobileProps) {
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="fixed left-4 top-4 z-50 h-10 w-10 rounded-xl border-slate-700/80 bg-slate-950/90 p-0 text-white shadow-lg shadow-slate-950/30 backdrop-blur-md hover:bg-slate-900"
            aria-label="Open navigation menu"
            variant="outline"
            size="icon"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[290px] border-r border-slate-800 bg-slate-950 px-4 pb-6 text-white [&>button[data-radix-collection-item]]:hidden">
          <div className="flex items-center justify-between">
            <SheetHeader className="px-2">
              <SheetTitle className="text-base font-semibold text-white">LSEMS</SheetTitle>
            </SheetHeader>
            <SheetClose asChild>
              <button type="button" aria-label="Close navigation menu" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </SheetClose>
          </div>

          <div className="my-4 h-px bg-slate-800" />
          <nav className="space-y-1" aria-label="Primary navigation">
            {headerLinks.map((item) => {
              const Icon = item.icon;
              const isActive = getLinkPath(item.href) === pathname;
              return (
                <SheetClose asChild key={item.label}>
                  <Link
                    href={item.href || "#"}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors",
                      isActive
                        ? "bg-blue-500/12 text-blue-200 ring-1 ring-inset ring-blue-400/20"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100",
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-blue-300" : "text-slate-500")} />
                    {item.label}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-slate-800 pt-4">
            <DiscordContactIndicator handle="@fulcain" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
