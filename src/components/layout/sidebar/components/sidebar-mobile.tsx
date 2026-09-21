"use client";

import { isHeaderLinkActive, type HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { DiscordContactIndicator } from "@/components/discord-contact-indicator";
import { UserMenu } from "@/components/layout/sidebar/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";
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
          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1" aria-label="Primary navigation">
            {headerLinks.map((item, index) => {
              const Icon = item.icon;
              const isActive = isHeaderLinkActive(item, pathname);
              const showGroup = index === 0 || item.group !== headerLinks[index - 1].group;
              return <div key={item.label} className={showGroup ? "pt-3 first:pt-0" : undefined}>
                {showGroup && <p className="eyebrow mb-1.5 px-3 text-muted-foreground">{item.group}</p>}
                <SheetClose asChild><Link href={item.href || "#"} aria-current={isActive ? "page" : undefined} className={cn("flex min-h-11 items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors", isActive ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground")}>
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />{item.label}
                </Link></SheetClose>
              </div>;
            })}
          </nav>
          <div className="mt-3 shrink-0 space-y-2.5 border-t border-border pt-3"><UserMenu /><DiscordContactIndicator /></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
