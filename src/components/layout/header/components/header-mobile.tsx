"use client";

import type { HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

type HeaderMobileProps = {
  headerLinks: HeaderLink[];
};

function linkMatches(
  linkHref: string | undefined,
  pathname: string,
): boolean {
  if (!linkHref) return false;
  const cleanHref = linkHref.split("#")[0].split("?")[0];
  return pathname === cleanHref || pathname.startsWith(cleanHref + "/");
}

export function HeaderMobile({ headerLinks }: HeaderMobileProps) {
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Toggle menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="border-l border-border/30 bg-surface/95 backdrop-blur-xl px-5 pb-6 [&>button[data-radix-collection-item]]:hidden"
        >
          <div className="flex items-center justify-between">
            <SheetHeader>
              <SheetTitle className="text-sm font-semibold">Navigation</SheetTitle>
            </SheetHeader>
            <SheetClose asChild>
              <X
                size={18}
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              />
            </SheetClose>
          </div>

          <Separator className="my-3 bg-border/30" />

          <nav className="flex flex-col gap-1">
            {headerLinks.map((item) =>
              item.children
                ? (
                    <div key={item.label}>
                      <p className="mb-1 px-2 text-[11px] font-medium text-muted-foreground">
                        {item.label}
                      </p>
                      <div className="flex flex-col gap-0.5 pl-2">
                        {item.children.map((child) => (
                          <SheetClose asChild key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                "cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-hover",
                                linkMatches(child.href, pathname)
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground",
                              )}
                            >
                              {child.label}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                      <Separator className="my-2 bg-border/20" />
                    </div>
                  )
                : (
                    <SheetClose asChild key={item.label}>
                      <Link
                        href={item.href!}
                        className={cn(
                          "cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-hover",
                          linkMatches(item.href, pathname)
                            ? "text-foreground font-medium"
                            : "text-muted-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ),
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}