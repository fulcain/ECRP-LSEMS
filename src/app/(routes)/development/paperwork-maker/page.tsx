import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { isPaperworkMakerAvailable } from "@/lib/paperwork/availability";
import { createEmptyPaperworkConfig } from "@/lib/paperwork/schema";
import { isDiscordAdmin } from "@/lib/role-config";
import { getSession } from "@/lib/session";
import { PaperworkMaker } from "./components/paperwork-maker";

export const metadata: Metadata = {
  title: "Paperwork Maker",
  description:
    "Build a division's paperwork, preview it, and generate its files (development only)",
};

export const dynamic = "force-dynamic";

/**
 * The visual editor. Three locks, all on the server: this build must be a
 * development one, the caller must be a `DISCORD_ADMIN_IDS` developer, and the
 * API behind the buttons repeats both checks - a hidden nav item is not a gate.
 */
export default async function PaperworkMakerPage() {
  if (!isPaperworkMakerAvailable()) notFound();

  const session = await getSession();
  if (!session || !isDiscordAdmin(session.discordId)) {
    redirect("/unauthorized?path=/development/paperwork-maker&hint=role");
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="LSEMS Development"
        title="Paperwork Maker"
        subtitle="Build a division's paperwork as data: pages, formats, fields, placeholders and buttons. Preview it with the same renderer the app uses, then generate the files it needs - nothing is written until you press Generate."
      />
      <PaperworkMaker initial={createEmptyPaperworkConfig()} />
    </PageContainer>
  );
}
