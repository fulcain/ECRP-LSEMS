"use client";

import { headerLinks } from "@/components/layout/header/configs/HeaderLinks";
import { SidebarDesktop } from "./components/sidebar-desktop";
import { SidebarMobile } from "./components/sidebar-mobile";
import { SidebarProvider } from "./sidebar-context";
import { ContentWrapper } from "./content-wrapper";
import React from "react";

/**
 * The shell around every page.
 *
 * `allowedHrefs` is what the signed-in member may open, decided on the server
 * with the same rules the route gate enforces. It arrives as hrefs rather than
 * whole nav items because the item icons are components, which cannot cross
 * into a client component - so the access decision is the server's and this
 * only renders the subset it was handed.
 */
export function SidebarLayout({
  allowedHrefs,
  children,
}: {
  allowedHrefs: readonly string[];
  children: React.ReactNode;
}) {
  const links = headerLinks.filter(
    (item) => item.href && allowedHrefs.includes(item.href),
  );

  return (
    <SidebarProvider>
      <SidebarDesktop headerLinks={links} />
      <SidebarMobile headerLinks={links} />
      <ContentWrapper>{children}</ContentWrapper>
    </SidebarProvider>
  );
}
