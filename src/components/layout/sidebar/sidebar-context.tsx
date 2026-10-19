"use client";

import { createContext, useContext, useState } from "react";

type SidebarContextType = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCollapsed: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const COLLAPSED_COOKIE = "sidebar-collapsed";

/**
 * The collapse state lives in a cookie rather than localStorage so the server
 * can render the rail in the state it was left in - stored client-side, a
 * reload painted the expanded rail first and collapsed it after hydration.
 */
export function SidebarProvider({
  initialCollapsed = false,
  children,
}: {
  initialCollapsed?: boolean;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsedState] = useState(initialCollapsed);

  const setCollapsed: React.Dispatch<React.SetStateAction<boolean>> = (
    value,
  ) => {
    setCollapsedState((prev) => {
      const next =
        typeof value === "function"
          ? (value as (previous: boolean) => boolean)(prev)
          : value;
      document.cookie = `${COLLAPSED_COOKIE}=${
        next ? "1" : "0"
      }; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  };

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, toggleCollapsed }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
}
