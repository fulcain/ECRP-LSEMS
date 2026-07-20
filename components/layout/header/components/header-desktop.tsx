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
        <NavigationMenuList className="flex gap-1">
          {headerLinks.map((item, index) =>
            item.children ? (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuTrigger
                  value={item.label}
                  className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=open]:!bg-white/10 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  value={item.label}
                  className="rounded-xl border border-white/10 bg-slate-800/95 p-2 shadow-2xl backdrop-blur-xl"
                >
                  <ul className="grid gap-1">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={child.href}
                            className="group flex items-center rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
                          >
                            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
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
                    className="nav-item-hover inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-slate-200 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
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
