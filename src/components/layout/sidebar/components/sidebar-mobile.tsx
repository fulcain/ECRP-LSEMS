"use client";

import { isHeaderLinkActive, type HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { DiscordContactIndicator } from "@/components/discord-contact-indicator";
import { UserMenu } from "@/components/layout/sidebar/user-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SidebarMobileProps = { headerLinks: HeaderLink[] };

export function SidebarMobile({ headerLinks }: SidebarMobileProps) {
  const pathname = usePathname();
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="fixed left-3 top-3 z-50 h-10 w-10 rounded-xl border-slate-700/80 bg-slate-950/90 p-0 text-white shadow-lg backdrop-blur-md hover:bg-slate-900" aria-label="Open navigation menu" variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex h-dvh w-[min(88vw,320px)] flex-col border-r border-slate-800 bg-slate-950 px-4 pb-4 text-white [&>button[data-radix-collection-item]]:hidden">
          <div className="flex shrink-0 items-center justify-between">
            <SheetHeader className="px-2"><SheetTitle className="text-base font-semibold text-white">LSEMS</SheetTitle></SheetHeader>
            <SheetClose asChild><button type="button" aria-label="Close navigation menu" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button></SheetClose>
          </div>
          <div className="my-3 h-px shrink-0 bg-slate-800" />
          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1" aria-label="Primary navigation">
            {headerLinks.map((item, index) => {
              const Icon = item.icon;
              const isActive = isHeaderLinkActive(item, pathname);
              const showGroup = index === 0 || item.group !== headerLinks[index - 1].group;
              return <div key={item.label} className={showGroup ? "pt-2 first:pt-0" : undefined}>
                {showGroup && <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.group}</p>}
                <SheetClose asChild><Link href={item.href || "#"} aria-current={isActive ? "page" : undefined} className={cn("flex min-h-11 items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors", isActive ? "bg-blue-500/12 text-blue-200 ring-1 ring-inset ring-blue-400/20" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100")}>
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-300" : "text-slate-500")} />{item.label}
                </Link></SheetClose>
              </div>;
            })}
          </nav>
          <div className="mt-3 shrink-0 space-y-2.5 border-t border-slate-800 pt-3"><UserMenu /><DiscordContactIndicator /></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
