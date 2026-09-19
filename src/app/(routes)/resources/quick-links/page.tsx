import { divisions } from "@/app/constants/divisions";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { QuickLinksBrowser } from "./components/QuickLinksBrowser";
import { linkId, type QuickLinkDivision } from "./lib/quick-links-search";

/**
 * Only what the browser needs crosses into the client component: the division
 * label, its emblem and its links. The rest of a division's declaration (ranks,
 * membership role, images) would be dead weight in the payload.
 */
const directory: QuickLinkDivision[] = divisions.map((division) => ({
  label: division.label,
  image: division.image,
  divisionName: division.data.divisionName,
  links: division.data.quickLinks.map((link) => ({
    id: linkId(division.label, link.url),
    name: link.name,
    url: link.url,
  })),
}));

export default function QuickLinksPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="LSEMS Resources"
        title="Quick Links"
        subtitle="Every division's links in one place, with search, pins and recents so the one you need is never more than a keystroke away."
      />
      <QuickLinksBrowser divisions={directory} />
    </PageContainer>
  );
}
