import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaperworkWorkspace } from "@/components/paperwork/paperwork-workspace";
import { PageContainer } from "@/components/ui/page-container";
import { hasMongoPaperworkStore, readAllPaperworkConfigs } from "@/lib/paperwork/amu-store";
import { divisionSlug as paperworkDivisionSlug } from "@/lib/paperwork/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ divisionSlug: string }> }): Promise<Metadata> {
  const { divisionSlug: slug } = await params;
  return { title: `${slug.replace(/-/g, " ")} Paperwork` };
}

export default async function DatabaseDivisionPage({
  params,
}: {
  params: Promise<{ divisionSlug: string }>;
}) {
  if (!hasMongoPaperworkStore()) notFound();
  const { divisionSlug: slug } = await params;
  const configs = await readAllPaperworkConfigs();
  const config = configs.find((entry) => paperworkDivisionSlug(entry.division.key) === slug);
  if (!config) notFound();
  return <PageContainer><PaperworkWorkspace config={config} /></PageContainer>;
}
