"use client";

import type { HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type HeaderDesktopProps = {
  headerLinks: HeaderLink[];
};

export function HeaderDesktop({ headerLinks }: HeaderDesktopProps) {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex">
      <NavigationMenu viewport={false}>
        <NavigationMenuList className="flex gap-1">
          {headerLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.href?.split("?")[0] === pathname;
            return (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href || "#"}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-blue-500/12 text-blue-200"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
