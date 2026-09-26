import { readExtensionSummary } from "@/lib/extension-download";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ExtensionInstallCard } from "./components/ExtensionInstallCard";

/**
 * Where a member installs the browser extension.
 *
 * The version and file count come from the archive the download button hands
 * out, so this page can't advertise an extension the repo no longer has.
 */
export default async function BrowserExtensionPage() {
  const summary = await readExtensionSummary();
  // Set once the store listing is live and the card stops asking people to unzip
  // anything. Unset here and the page falls back to the folder download.
  const storeUrl = process.env.NEXT_PUBLIC_EXTENSION_STORE_URL?.trim() || null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="LSEMS Resources"
        title="Browser Extension"
        subtitle="A one-time install that turns every Copy & Open button into a ready-to-fill GOV post: open the page, press Fill, and the title, recipients and BBCode are written in for you to review and Submit."
      />

      <div className="space-y-6">
        <ExtensionInstallCard
          version={summary?.version ?? "1.0.0"}
          fileCount={summary?.fileCount ?? 0}
          available={summary !== null}
          storeUrl={storeUrl}
        />
      </div>
    </PageContainer>
  );
}
