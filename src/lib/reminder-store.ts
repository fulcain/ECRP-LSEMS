/**
 * Command reminders, stored in the Vercel Global Config beside the permission
 * matrix.
 *
 * The list is one item, read through the SDK and written through the Vercel
 * REST API - the same asymmetry `access-matrix-store.ts` explains. Keeping it
 * in the config rather than a database is deliberate: the deployment already
 * has one, it is replicated, and the cron endpoint needs a fast read far more
 * than it needs a query language.
 */

import {
  REMINDERS_KEY,
  sanitizeReminders,
  type CommandReminder,
} from "@/configs/command-reminders";
import {
  isGlobalConfigConfigured,
  isGlobalConfigWritable,
  readGlobalConfigItem,
  warnGlobalConfigOnce,
  writeGlobalConfigItem,
  type GlobalConfigWriteFailure,
} from "@/lib/global-config-store";

/** Whether a reminder list can be read at all (the page shows a hint if not). */
export function isReminderStoreConfigured(): boolean {
  return isGlobalConfigConfigured();
}

/** Whether a reminder list can be written - the API routes need this too. */
export function isReminderStoreWritable(): boolean {
  return isGlobalConfigWritable();
}

export type ReminderRead =
  | { ok: true; reminders: CommandReminder[] }
  | { ok: false; reason: "not-configured" | "unreadable"; detail?: string };

/**
 * The stored reminders, keeping "nothing stored" apart from "the read failed".
 *
 * A page can treat both as an empty list; a write must not, or an unreadable
 * store would look like an empty one and clobber whatever is really there.
 */
export async function readRemindersDetailed(): Promise<ReminderRead> {
  // Unlike the matrix, this item is changed from the app itself, so every read
  // has to see the last write. A cached read here is what lets an old reminder
  // be written back as scheduled after it was already sent.
  const read = await readGlobalConfigItem(REMINDERS_KEY, {
    consistentRead: true,
  });
  if (!read.ok) {
    if (read.reason === "unreadable") {
      warnGlobalConfigOnce(
        `[reminders] could not read "${REMINDERS_KEY}" (${read.detail ?? "unknown"}) - treating it as empty.`,
      );
    }
    return read;
  }

  if (!read.value) return { ok: true, reminders: [] };

  const parsed = sanitizeReminders(read.value);
  if (!parsed) {
    warnGlobalConfigOnce(
      `[reminders] the "${REMINDERS_KEY}" item is not a reminder list - refusing to overwrite it.`,
    );
    return {
      ok: false,
      reason: "unreadable",
      detail: "the stored item is not a reminder list",
    };
  }
  if (parsed.dropped > 0) {
    warnGlobalConfigOnce(
      `[reminders] ignored ${parsed.dropped} unreadable entr${
        parsed.dropped === 1 ? "y" : "ies"
      } in "${REMINDERS_KEY}".`,
    );
  }
  return { ok: true, reminders: parsed.reminders };
}

/** The stored reminders, or `null` when the store cannot be read. */
export async function readReminders(): Promise<CommandReminder[] | null> {
  const read = await readRemindersDetailed();
  return read.ok ? read.reminders : null;
}

export type ReminderWriteResult =
  | { ok: true }
  | { ok: false; reason: GlobalConfigWriteFailure; detail?: string };

/** Replace the whole reminder list. One item, one write. */
export async function writeReminders(
  reminders: CommandReminder[],
): Promise<ReminderWriteResult> {
  return writeGlobalConfigItem(REMINDERS_KEY, reminders);
}
