"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import * as React from "react";

type HeaderLink = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

const headerLinks: HeaderLink[] = [
  {
    label: "Email Templates",
    children: [
      { label: "Division Templates", href: "/email-templates" },
      {
        label: "Communication Update Form",
        href: "/communication-update-form",
      },
    ],
  },
  { label: "Quick Links", href: "/quick-links" },
  { label: "Upcoming Course", href: "/upcoming-course" },
  { label: "Availability", href: "/availability" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-slate-800 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between bg-slate-800 px-6 py-4">
        <NavigationMenu viewport={false}>
          <NavigationMenuList className="flex gap-2">
            {headerLinks.map((item) =>
              item.children ? (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuTrigger
                    value={item.label}
                    className="cursor-pointer rounded-md bg-slate-800 px-3 py-2 text-white transition-colors duration-200 hover:bg-slate-700 focus:bg-slate-800 data-[state=open]:!bg-slate-700"
                  >
                    {item.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent
                    value={item.label}
                    className="rounded-md bg-slate-700 p-2 shadow-lg data-[state=open]:bg-slate-800"
                  >
                    <ul className="grid gap-2">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={child.href}
                              className="block rounded-md bg-slate-800 px-3 py-2 text-white transition-colors duration-200 hover:bg-slate-700 focus:bg-slate-700 focus:text-white active:bg-slate-700"
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
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href!}
                      className="rounded-md bg-slate-800 px-3 py-2 text-white transition-colors duration-200 hover:bg-slate-700 focus:bg-slate-700 focus:text-white active:bg-slate-700"
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
    </header>
  );
}
