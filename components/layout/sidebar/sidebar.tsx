"use client";

import { headerLinks } from "@/components/layout/header/configs/HeaderLinks";
import { SidebarDesktop } from "./components/sidebar-desktop";
import { SidebarMobile } from "./components/sidebar-mobile";
import { SidebarProvider } from "./sidebar-context";
import React from "react";

export function Sidebar() {
  return (
    <SidebarProvider>
      <SidebarDesktop headerLinks={headerLinks} />
      <SidebarMobile headerLinks={headerLinks} />
    </SidebarProvider>
  );
}
