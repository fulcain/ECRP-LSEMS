import { FtdSectionHeader } from "@/components/ftd-section-header";
import { PageContainer } from "@/components/ui/page-container";
import { FTD_TABS, type FtdTabValue } from "@/configs/ftd-tabs";
import { userHasAccess } from "@/lib/role-config";
import { getSession } from "@/lib/session";

/**
 * The FTD workspace shell. Every page beneath `/divisions/ftd` is a tab in
 * here, so the heading and the bar render once at the section level rather than
 * being repeated by each page - the pages render content only.
 *
 * The heading comes from the active tab's own config (`configs/ftd-tabs.ts`),
 * which is also where its `href` and gate live, so a page's title can never
 * disagree with the tab that leads to it.
 *
 * The tabs are filtered with the same rule the route gate enforces, so a member
 * sees exactly the tabs they can open - an instructor is not shown the Command
 * tab they would be bounced out of.
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
    <PageContainer>
      <FtdSectionHeader available={available} />
      {children}
    </PageContainer>
  );
}
