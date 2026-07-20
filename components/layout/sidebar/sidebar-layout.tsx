"use client";

import { headerLinks } from "@/components/layout/header/configs/HeaderLinks";
import { SidebarDesktop } from "./components/sidebar-desktop";
import { SidebarMobile } from "./components/sidebar-mobile";
import { SidebarProvider } from "./sidebar-context";
import { ContentWrapper } from "./content-wrapper";
import React from "react";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarDesktop headerLinks={headerLinks} />
      <SidebarMobile headerLinks={headerLinks} />
      <ContentWrapper>{children}</ContentWrapper>
    </SidebarProvider>
  );
}
