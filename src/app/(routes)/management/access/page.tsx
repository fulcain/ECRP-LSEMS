import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { canManageAccess } from "@/lib/role-config";
import { getSession } from "@/lib/session";
import {
  isMatrixStoreConfigured,
  isMatrixStoreWritable,
  probeWriteAccess,
  readAccessMatrix,
} from "@/lib/access-matrix-store";
import { AccessMatrixEditor } from "./components/AccessMatrixEditor";

/**
 * The live permission editor.
 *
 * The middleware already refuses this page to anyone without `CommandPlusTeam`
 * (or a `DISCORD_ADMIN_IDS` bypass), so the check below is a second lock on the
 * same door rather than the lock itself - and the page is the one route the
 * stored matrix may never rule on, so no edit made here can open or close it.
 */

export const metadata: Metadata = {
  title: "Access Manager",
  description: "Live control of which ranks may open which pages and tabs",
};

export default async function AccessManagerPage() {
  const session = await getSession();
  if (!session || !canManageAccess(session.roles, session.discordId)) {
    redirect("/unauthorized?path=/management/access&hint=role");
  }

  const [stored, writeAccess] = await Promise.all([
    readAccessMatrix(),
    probeWriteAccess(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="LSEMS Management"
        title="Access Manager"
        subtitle="Control which ranks can open which pages and tabs - this is where access is decided, and changes are live for everyone within a few seconds. A page with no row below is open to every employee; Command+ always keeps every page, so a row decides who else may open it."
      />
      <AccessMatrixEditor
        stored={stored}
        configured={isMatrixStoreConfigured()}
        writable={isMatrixStoreWritable()}
        writeAccess={writeAccess}
      />
    </PageContainer>
  );
}
