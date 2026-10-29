import { ThemeProvider } from "@/components/ui/theme-provider";
import { ToastHost } from "@/components/ui/toast-host";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { SidebarLayout } from "@/components/layout/sidebar/sidebar-layout";
import { MedicProvider } from "@/app/context/MedicContext";
import { headerLinks } from "@/components/layout/header/configs/HeaderLinks";
import { canEditFtp, filterAccessibleLinks, userHasAccess } from "@/lib/role-config";
import { getSession } from "@/lib/session";
import { readAccessMatrix } from "@/lib/access-matrix-store";
import { FTD_TABS } from "@/configs/ftd-tabs";
import { QUICK_SEARCH_CATALOG } from "@/configs/quick-search-catalog";

export const metadata: Metadata = {
  // The brand is written down once. Every route's layout declares only its own
  // name ("Supervisor Tools", "Paperwork", ...) and the template turns it into
  // the tab title, so a page can't end up with a differently-spelled app name.
  title: {
    default: "ECRP LSEMS",
    template: "ECRP LSEMS | %s",
  },
  description: "Emergency medical services operations workspace",
  // The department emblem, the same file the sidebar and page headers draw.
  // Declared here rather than as an `app/icon.*` so there is one copy of the
  // image to update - the stray `app/favicon.ico` it replaces was still the
  // old FTD badge and would win over it.
  icons: { icon: "/General.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f8f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0f" },
  ],
};

/**
 * The app shell.
 *
 * The navigation is filtered here, on the server, with the very rules the
 * middleware enforces - a member gets the pages they may open and nothing
 * else, and a signed-out visitor gets no navigation at all. Deciding it in
 * one place is what keeps the sidebar honest: a route can't be reachable by
 * URL but visible to everyone, or hidden from someone who can open it.
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  // The same matrix the middleware gates on, so a hidden page is never left in
  // the sidebar and a granted one is never left out of it.
  const overrides = await readAccessMatrix();
  const links = filterAccessibleLinks(
    headerLinks,
    session?.roles ?? null,
    session?.discordId,
    overrides,
  );
  // Only the hrefs travel to the sidebar: the icons are components and can't
  // cross into a client component, so the shell pairs them up on its side.
  const allowedHrefs = links.flatMap((item) => (item.href ? [item.href] : []));
  const canSearchRoute = (route: string) =>
    Boolean(
      session &&
        userHasAccess(route, session.roles, session.discordId, overrides),
    );
  const searchItems = [
    ...links.flatMap((item) => [
      ...(item.href ? [{ label: item.label, href: item.href, group: item.group }] : []),
      ...(item.children ?? []).map((child) => ({
        label: child.label,
        href: child.href,
        group: item.group,
      })),
    ]),
    ...FTD_TABS.filter((tab) =>
      canSearchRoute(tab.href),
    ).map((tab) => ({ label: tab.label, href: tab.href, group: "FTD" })),
    ...QUICK_SEARCH_CATALOG
      .filter(
        (item) =>
          canSearchRoute(item.route) &&
          (!item.privileged ||
            (session && canEditFtp(session.roles, session.discordId))),
      )
      .map(({ label, href, group, keywords }) => ({
        label,
        href,
        group,
        keywords,
      })),
  ];
  // The rail's collapsed state is a cookie so the first paint matches the
  // member's last choice instead of hydrating expanded and snapping shut.
  const jar = await cookies();
  const initialCollapsed = jar.get("sidebar-collapsed")?.value === "1";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {/* The palette lives on `:root` (light) and `.dark`; the class on <html>
            is what makes `dark:` utilities apply. forcedTheme used to pin this
            app dark while the shell was dark-only - the toggle now owns it. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <MedicProvider>
            <SidebarLayout
              allowedHrefs={allowedHrefs}
              searchItems={searchItems}
              signedIn={session !== null}
              initialCollapsed={initialCollapsed}
            >
              {children}
            </SidebarLayout>
            {/* One toast container for the whole app, themed with it. */}
            <ToastHost />
          </MedicProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
