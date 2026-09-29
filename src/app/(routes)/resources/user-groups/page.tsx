import { readExtensionSummary } from "@/lib/extension-download";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { UserGroupAdd } from "@/components/user-group-add";

/**
 * Every user group the forum has, in one page.
 *
 * It sits here rather than inside the section that looks after a group because
 * there is nothing divisional about it: the department's rank groups and each
 * division's own are the same job, done by whoever is on shift. Which groups
 * exist is declared in `app/constants/gov-groups.ts` - this page lists whatever
 * that says, so a new rank or division needs no change here.
 *
 * The version here is the extension's own, read from the folder the download
 * button hands out - the tool compares it with the copy running in the browser,
 * because a copy older than this one cannot fill GOV's member box and saying so
 * beats promising a fill that never comes.
 */
export default async function UserGroupsPage() {
  const summary = await readExtensionSummary();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="LSEMS Resources"
        title="User Groups"
        subtitle="Put a member into one of the forum's own groups - the page that does it opens with their name already in place."
      />
      <UserGroupAdd shippedVersion={summary?.version ?? null} />
    </PageContainer>
  );
}
