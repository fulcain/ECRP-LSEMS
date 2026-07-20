"use client";

import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out min-h-screen",
        collapsed ? "lg:pl-[72px]" : "lg:pl-64",
      )}
    >
      {children}
    </div>
  );
}
