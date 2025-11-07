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

type HeaderMobileProps = {
  headerLinks: HeaderLink[];
};

export function HeaderMobile({ headerLinks }: HeaderMobileProps) {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="cursor-pointer text-white transition-colors hover:text-slate-300"
            aria-label="Toggle menu"
            variant="outline"
            size="icon"
          >
            <Menu className="h-7 w-7" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="border-l border-slate-700 bg-slate-800 px-6 pb-6 text-white [&>button[data-radix-collection-item]]:hidden"
        >
          <div className="flex items-center justify-between">
            <SheetHeader>
              <SheetTitle className="text-lg text-white">Navigation</SheetTitle>
            </SheetHeader>

            <SheetClose asChild>
              <X
                size={22}
                className="cursor-pointer text-white transition-colors hover:text-slate-400"
              />
            </SheetClose>
          </div>

          <Separator className="my-4 bg-slate-600" />

          <nav className="mt-2 flex flex-col gap-3">
            {headerLinks.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <p className="mb-2 font-semibold text-slate-200">
                    {item.label}
                  </p>
                  <div className="flex flex-col gap-1 pl-3">
                    {item.children.map((child) => (
                      <SheetClose asChild key={child.href}>
                        <Link
                          href={child.href}
                          className="block rounded-md px-3 py-1.5 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                        >
                          {child.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                  <Separator className="my-3 bg-slate-700" />
                </div>
              ) : (
                <SheetClose asChild key={item.label}>
                  <Link
                    href={item.href!}
                    className="rounded-md px-3 py-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
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
