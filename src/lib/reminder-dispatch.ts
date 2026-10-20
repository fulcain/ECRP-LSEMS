/**
 * The cron side of Command reminders.
 *
 * One pass reads the list, posts everything due, and writes the outcome back.
 * The store is read again before writing so a reminder edited while the pass
 * was running is not replaced by the copy this pass started with - the outcome
 * is applied by id, not by rewriting the whole list from memory.
 */

import {
  isReminderDue,
  type CommandReminder,
} from "@/configs/command-reminders";
import { applyPostOutcome, mergePostOutcome } from "@/lib/reminder-service";
import {
  readRemindersDetailed,
  writeReminders,
} from "@/lib/reminder-store";
import { postReminder } from "@/lib/reminder-webhook";

export type DispatchResult =
  | {
      ok: true;
      checked: number;
      sent: number;
      failed: number;
      errors: string[];
    }
  | { ok: false; reason: "not-configured" | "unreadable"; detail?: string };

/** Post every reminder whose moment has arrived. */
export async function dispatchDueReminders(
  now: Date = new Date(),
): Promise<DispatchResult> {
  const read = await readRemindersDetailed();
  if (!read.ok) {
    return { ok: false, reason: read.reason, detail: read.detail };
  }

  const due = read.reminders.filter((reminder) =>
    isReminderDue(reminder, now.getTime()),
  );
  if (due.length === 0) {
    return { ok: true, checked: 0, sent: 0, failed: 0, errors: [] };
  }

  const nowIso = now.toISOString();
  const posted = new Map<string, CommandReminder>();
  const updates = new Map<string, CommandReminder>();
  const errors: string[] = [];
  let sent = 0;
  let failed = 0;

  for (const reminder of due) {
    const result = await postReminder(reminder);
    posted.set(reminder.id, reminder);
    updates.set(reminder.id, applyPostOutcome(reminder, result, nowIso));
    if (result.ok) {
      sent += 1;
    } else {
      failed += 1;
      errors.push(`${reminder.title}: ${result.detail}`);
    }
  }

  // Read once more so an edit made during the pass survives it. If the store
  // cannot be read again, the list this pass started with is the only record
  // of what was posted - write it rather than leaving sent reminders queued
  // for a second ping.
  const latest = await readRemindersDetailed();
  const base = latest.ok ? latest.reminders : read.reminders;
  const merged = base.map((reminder) => {
    const outcome = updates.get(reminder.id);
    const before = posted.get(reminder.id);
    if (!outcome || !before) return reminder;
    // An edit made during the pass wins; only the outcome is carried over.
    return mergePostOutcome(reminder, before, outcome);
  });
  const write = await writeReminders(merged);
  if (!write.ok) {
    errors.push(
      `Could not record the outcome: ${write.detail ?? write.reason}`,
    );
  }

  return {
    ok: true,
    checked: due.length,
    sent,
    failed,
    errors,
  };
}
