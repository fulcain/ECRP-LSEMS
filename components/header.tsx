"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

export function Header() {
  const headerLinks = [
    { href: "/email-templates", label: "Email Templates" },
    { href: "/quick-links", label: "Quick Links" },
    { href: "/upcoming-course", label: "Upcoming Course" },
    { href: "/availability", label: "Availability" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-800 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between bg-slate-800 px-6 py-4">
        <NavigationMenu>
          <NavigationMenuList className="flex gap-4">
            {headerLinks.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className="rounded-md px-3 py-2 text-white transition-colors duration-200 hover:bg-slate-700  focus:bg-slate-600 focus:text-white active:bg-slate-600 active:text-white"
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
