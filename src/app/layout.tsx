import { ThemeProvider } from "@/components/ui/theme-provider";
import type { Metadata } from "next";
import "./globals.css";
import "./lsems.css";
import "react-toastify/dist/ReactToastify.css";
import { SidebarLayout } from "@/components/layout/sidebar/sidebar-layout";
import { MedicProvider } from "@/app/context/MedicContext";
import { headerLinks } from "@/components/layout/header/configs/HeaderLinks";
import { filterAccessibleLinks } from "@/lib/role-config";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "LSEMS Operations | ECRP",
  description: "Emergency medical services operations workspace",
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
  const links = filterAccessibleLinks(
    headerLinks,
    session?.roles ?? null,
    session?.discordId,
  );
  // Only the hrefs travel to the sidebar: the icons are components and can't
  // cross into a client component, so the shell pairs them up on its side.
  const allowedHrefs = links.flatMap((item) => (item.href ? [item.href] : []));

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MedicProvider>
            <SidebarLayout allowedHrefs={allowedHrefs}>{children}</SidebarLayout>
          </MedicProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
