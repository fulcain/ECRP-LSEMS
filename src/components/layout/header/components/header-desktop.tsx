"use client";

import type { HeaderLink } from "@/components/layout/header/configs/HeaderLinks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type HeaderDesktopProps = {
  headerLinks: HeaderLink[];
};

/**
 * Matches a header link against the current route. `usePathname` returns the
 * pathname with no query string, so we ignore `?tab=` and any other query
 * params on both sides — otherwise a link like `/paperwork?tab=normal` would
 * never highlight when you're at `/paperwork` (or vice versa).
 */
function linkMatches(
  linkHref: string | undefined,
  pathname: string,
): boolean {
  if (!linkHref) return false;
  const cleanHref = linkHref.split("#")[0].split("?")[0];
  return pathname === cleanHref || pathname.startsWith(cleanHref + "/");
}

export function HeaderDesktop({ headerLinks }: HeaderDesktopProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-0.5">
      {headerLinks.map((item) => {
        const isActive = linkMatches(item.href, pathname);

        return (
          <Link
            key={item.label}
            href={item.href!}
            className={cn(
              "cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-hover/60",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}