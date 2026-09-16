import { FtdTabs } from "@/components/ftd-tabs";
import { FTD_TABS, type FtdTabValue } from "@/configs/ftd-tabs";
import { userHasAccess } from "@/lib/role-config";
import { getSession } from "@/lib/session";

/**
 * The FTD workspace shell. Every page beneath `/divisions/ftd` is a tab in
 * here, so the bar renders once at the section level rather than being
 * repeated by each page's own layout.
 *
 * The tabs are filtered with the same rule the route gate enforces, so a
 * member sees exactly the tabs they can open - an instructor is not shown the
 * Command tab they would be bounced out of.
 */
export default async function FtdLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const available: FtdTabValue[] = session
    ? FTD_TABS.filter((tab) =>
        userHasAccess(tab.href, session.roles, session.discordId),
      ).map((tab) => tab.value)
    : [];

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 lg:px-8">
        <FtdTabs available={available} />
      </div>
      {children}
    </>
  );
}
