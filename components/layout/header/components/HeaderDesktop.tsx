"use client";

import type { HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import React from "react";

type HeaderDesktopProps = {
  headerLinks: HeaderLink[];
};

export function HeaderDesktop({ headerLinks }: HeaderDesktopProps) {
  return (
    <div className="hidden md:flex">
      <NavigationMenu viewport={false}>
        <NavigationMenuList className="flex gap-2">
          {headerLinks.map((item) =>
            item.children ? (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuTrigger
                  value={item.label}
                  className="cursor-pointer rounded-md bg-slate-800 px-3 py-2 text-white transition-colors hover:bg-slate-700 data-[state=open]:!bg-slate-700"
                >
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  value={item.label}
                  className="rounded-md bg-slate-700 p-2 shadow-lg"
                >
                  <ul className="grid gap-2">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={child.href}
                            className="block rounded-md px-3 py-2 text-white transition-colors hover:bg-slate-600"
                          >
                            {child.label}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href!}
                    className="rounded-md px-3 py-2 text-white transition-colors hover:bg-slate-700"
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ),
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
