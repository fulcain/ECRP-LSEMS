"use client";

import type { HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { DiscordContactIndicator } from "@/components/discord-contact-indicator";
import { UserMenu } from "@/components/layout/sidebar/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";
import { SidebarNav } from "./sidebar-nav";

type SidebarMobileProps = { headerLinks: HeaderLink[] };

export function SidebarMobile({ headerLinks }: SidebarMobileProps) {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="fixed left-3 top-3 z-50 h-10 w-10 rounded-xl border-border bg-background/90 p-0 text-foreground shadow-lg backdrop-blur-md hover:bg-surface-hover" aria-label="Open navigation menu" variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex h-dvh w-[min(88vw,320px)] flex-col border-r border-border bg-sidebar px-4 pb-4 text-sidebar-foreground [&>button[data-radix-collection-item]]:hidden">
          <div className="flex shrink-0 items-center justify-between">
            <SheetHeader className="px-2"><SheetTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground"><Image src="/General.png" alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" />LSEMS</SheetTitle></SheetHeader>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <SheetClose asChild><button type="button" aria-label="Close navigation menu" className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground"><X className="h-5 w-5" /></button></SheetClose>
            </div>
          </div>
          <div className="my-3 h-px shrink-0 bg-border" />
          <SidebarNav links={headerLinks} closeOnNavigate />
          <div className="mt-3 shrink-0 space-y-2.5 border-t border-border pt-3"><UserMenu /><DiscordContactIndicator /></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
