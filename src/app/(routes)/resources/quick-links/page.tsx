import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { QuickLinksBrowser } from "./components/QuickLinksBrowser";
import { divisionFromParam, quickLinksDirectory } from "./lib/quick-links-directory";
import { QUICK_LINK_DIVISION_PARAM } from "./lib/quick-links-scope";

/**
 * The directory, or one division's share of it.
 *
 * A division's own section links here with `?division=<key>`: the same page
 * scoped, not a copy of it. Search, pins and recents work in both, the links
 * still live once in the division that owns them, and there is no second list
 * that can drift out of step with this one.
 */
export default async function QuickLinksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const raw = params[QUICK_LINK_DIVISION_PARAM];
  const scope = divisionFromParam(Array.isArray(raw) ? raw[0] : raw);
  const directory = quickLinksDirectory(scope ? [scope] : undefined);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="LSEMS Resources"
        title={scope ? `${scope.label} Quick Links` : "Quick Links"}
        subtitle={
          scope
            ? `${scope.data.divisionName} - search it, pin it, or open every division's links instead.`
            : "Every division's links in one place, with search, pins and recents so the one you need is never more than a keystroke away."
        }
      />
      <QuickLinksBrowser divisions={directory} scoped={scope !== null} />
    </PageContainer>
  );
}
