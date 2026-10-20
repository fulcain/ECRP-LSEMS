import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { canManageReminders } from "@/lib/role-config";
import { getSession } from "@/lib/session";
import { probeGlobalConfigWriteAccess } from "@/lib/global-config-store";
import {
  isReminderStoreConfigured,
  isReminderStoreWritable,
  readRemindersDetailed,
} from "@/lib/reminder-store";
import { isReminderWebhookConfigured } from "@/lib/reminder-webhook";
import { ReminderDashboard } from "./components/ReminderDashboard";

/**
 * The Command page: the department's meeting reminders.
 *
 * The middleware already refuses this page to anyone without
 * `COMMAND_TOOL_ROLES` or a `DISCORD_ADMIN_IDS` bypass, and
 * `canManageReminders` reads that same list forwards, so the check below is a
 * second lock on the same door. The page is deliberately locked in the code:
 * it posts to a Discord channel, which is not a permission the matrix editor
 * should be able to hand out.
 */

export const metadata: Metadata = {
  title: "Command",
  description: "Schedule and manage the department's meeting reminders",
};

export default async function CommandPage() {
  const session = await getSession();
  if (!session || !canManageReminders(session.roles, session.discordId)) {
    redirect("/unauthorized?path=/management/command&hint=role");
  }

  const [read, writeAccess] = await Promise.all([
    readRemindersDetailed(),
    probeGlobalConfigWriteAccess(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="LSEMS Management"
        title="Command"
        subtitle="Schedule the department's meeting reminders. Meetings are entered in UTC, and the page shows your own local time beside them; the reminder is posted to the reminders channel and pings the role you pick. Discord shows every reader the meeting in their own timezone."
      />
      <ReminderDashboard
        initialReminders={read.ok ? read.reminders : []}
        initialError={
          read.ok
            ? null
            : read.reason === "not-configured"
              ? "No reminder store is configured on this deployment."
              : `Could not read the reminder store (${read.detail ?? "unknown"}).`
        }
        storeConfigured={isReminderStoreConfigured()}
        storeWritable={isReminderStoreWritable()}
        writeAccess={writeAccess}
        webhookConfigured={isReminderWebhookConfigured()}
        cronConfigured={Boolean(process.env.CRON_SECRET?.trim())}
      />
    </PageContainer>
  );
}
