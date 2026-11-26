import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { isPaperworkMakerAvailable } from "@/lib/paperwork/availability";
import {
  createEmptyPaperworkConfig,
  type PaperworkConfig,
} from "@/lib/paperwork/schema";
import { isDiscordAdmin } from "@/lib/role-config";
import { getSession } from "@/lib/session";
import { hasMongoPaperworkStore, readAMUPaperwork } from "@/lib/paperwork/amu-store";
import amuSeed from "@/app/constants/paperwork/generated/amu.json";
import { PaperworkMaker } from "./components/paperwork-maker";

export const metadata: Metadata = {
  title: "Paperwork Maker",
  description: "Edit and save paperwork formats for the app.",
};

export const dynamic = "force-dynamic";

/**
 * The visual editor. Three locks, all on the server: this build must be a
 * local file generation or an AMU database store must be available, and the
 * caller must be a `DISCORD_ADMIN_IDS` developer. The API repeats both checks.
 */
export default async function PaperworkMakerPage() {
  if (!isPaperworkMakerAvailable()) notFound();

  const session = await getSession();
  if (!session || !isDiscordAdmin(session.discordId)) {
    redirect("/unauthorized?path=/development/paperwork-maker&hint=role");
  }

  const databaseStore = hasMongoPaperworkStore();
  let initial: PaperworkConfig = databaseStore
    ? (amuSeed as PaperworkConfig)
    : createEmptyPaperworkConfig();
  let databaseUnavailable = false;
  if (databaseStore) {
    try {
      initial = await readAMUPaperwork();
    } catch (error) {
      databaseUnavailable = true;
      console.error("Paperwork Maker database read failed; using the bundled AMU config.", error);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow={databaseStore ? "Division Paperwork" : "LSEMS Development"}
        title="Paperwork Maker"
        subtitle={databaseStore
            ? "Create or edit division paperwork and save it directly to the shared database."
          : "Build a division's paperwork as data: pages, formats, fields, placeholders and buttons. Preview it with the same renderer the app uses, then generate the files it needs - nothing is written until you press Generate."}
      />
      <PaperworkMaker
        initial={initial}
        productionStore={databaseStore}
        databaseUnavailable={databaseUnavailable}
      />
    </PageContainer>
  );
}
