/**
 * The operations behind the Command page and its API, kept out of the route so
 * the page, the endpoint and the cron all write the same way.
 *
 * The list is optimistic where it can be: every mutation reads the current
 * item, changes what it owns and writes the whole list back. Edits also carry
 * the `updatedAt` the editor opened, so two people changing the same reminder
 * get a refusal instead of the slower save silently winning.
 */

import { randomUUID } from "node:crypto";

import {
  REMINDER_MAX_ATTEMPTS,
  type CommandReminder,
  type ReminderAuthor,
} from "@/configs/command-reminders";
import {
  readRemindersDetailed,
  writeReminders,
  type ReminderRead,
  type ReminderWriteResult,
} from "@/lib/reminder-store";
import { postReminder } from "@/lib/reminder-webhook";
import type { ReminderInput } from "@/lib/reminder-input";

export type ReminderServiceResult =
  | { ok: true; reminders: CommandReminder[]; messageId?: string }
  | { ok: false; status: number; error: string; reminders?: CommandReminder[] };

function readFailure(read: Exclude<ReminderRead, { ok: true }>): ReminderServiceResult {
  return {
    ok: false,
    status: read.reason === "not-configured" ? 501 : 503,
    error:
      read.reason === "not-configured"
        ? "No reminder store is configured on this deployment."
        : `Could not read the reminder store (${read.detail ?? "unknown"}).`,
  };
}

function writeFailure(write: Exclude<ReminderWriteResult, { ok: true }>): ReminderServiceResult {
  return {
    ok: false,
    status: write.reason === "not-configured" ? 501 : 502,
    error: write.detail ?? "Could not save the reminder store.",
  };
}

export async function listReminders(): Promise<ReminderServiceResult> {
  const read = await readRemindersDetailed();
  if (!read.ok) return readFailure(read);
  return { ok: true, reminders: read.reminders };
}

export async function createReminder(
  input: ReminderInput,
  author: ReminderAuthor,
  now: Date = new Date(),
): Promise<ReminderServiceResult> {
  const read = await readRemindersDetailed();
  if (!read.ok) return readFailure(read);

  // A double-click (or a resubmitted request) must not create the same meeting
  // twice. The content is the identity here: same title, role, meeting and lead.
  const duplicate = read.reminders.find(
    (reminder) =>
      reminder.status === "scheduled" &&
      reminder.title === input.title &&
      reminder.roleAlias === input.roleAlias &&
      reminder.eventAt === input.eventAt &&
      reminder.remindBeforeMinutes === input.remindBeforeMinutes,
  );
  if (duplicate) return { ok: true, reminders: read.reminders };

  const nowIso = now.toISOString();
  const reminder: CommandReminder = {
    id: randomUUID(),
    ...input,
    status: "scheduled",
    createdAt: nowIso,
    updatedAt: nowIso,
    createdBy: author,
    attempts: 0,
  };

  const reminders = [reminder, ...read.reminders];
  const write = await writeReminders(reminders);
  if (!write.ok) return writeFailure(write);
  return { ok: true, reminders };
}

export async function updateReminder(
  id: string,
  expectedUpdatedAt: string | undefined,
  input: ReminderInput,
  now: Date = new Date(),
): Promise<ReminderServiceResult> {
  const read = await readRemindersDetailed();
  if (!read.ok) return readFailure(read);

  const current = read.reminders.find((reminder) => reminder.id === id);
  if (!current) {
    return { ok: false, status: 404, error: "That reminder no longer exists." };
  }
  if (current.status === "sent") {
    return {
      ok: false,
      status: 409,
      error: "That reminder has already been sent. Create a new one instead.",
    };
  }
  if (expectedUpdatedAt && current.updatedAt !== expectedUpdatedAt) {
    return {
      ok: false,
      status: 409,
      error:
        "Somebody else changed this reminder while you were editing. Reload and try again.",
      reminders: read.reminders,
    };
  }

  const nowIso = now.toISOString();
  const updated: CommandReminder = {
    ...current,
    ...input,
    status: "scheduled",
    updatedAt: nowIso,
    attempts: 0,
  };
  delete updated.lastError;
  delete updated.sentAt;
  delete updated.discordMessageId;

  const reminders = read.reminders.map((reminder) =>
    reminder.id === id ? updated : reminder,
  );
  const write = await writeReminders(reminders);
  if (!write.ok) return writeFailure(write);
  return { ok: true, reminders };
}

export async function cancelReminder(
  id: string,
  now: Date = new Date(),
): Promise<ReminderServiceResult> {
  const read = await readRemindersDetailed();
  if (!read.ok) return readFailure(read);

  const current = read.reminders.find((reminder) => reminder.id === id);
  if (!current) {
    return { ok: false, status: 404, error: "That reminder no longer exists." };
  }
  if (current.status === "sent") {
    return {
      ok: false,
      status: 409,
      error: "That reminder has already been sent, so it cannot be cancelled.",
    };
  }

  const reminders = read.reminders.map((reminder) =>
    reminder.id === id
      ? {
          ...reminder,
          status: "cancelled" as const,
          updatedAt: now.toISOString(),
        }
      : reminder,
  );
  const write = await writeReminders(reminders);
  if (!write.ok) return writeFailure(write);
  return { ok: true, reminders };
}

export async function deleteReminder(id: string): Promise<ReminderServiceResult> {
  const read = await readRemindersDetailed();
  if (!read.ok) return readFailure(read);

  if (!read.reminders.some((reminder) => reminder.id === id)) {
    return { ok: false, status: 404, error: "That reminder no longer exists." };
  }

  const reminders = read.reminders.filter((reminder) => reminder.id !== id);
  const write = await writeReminders(reminders);
  if (!write.ok) return writeFailure(write);
  return { ok: true, reminders };
}

/** The reminder after a webhook attempt, success or failure. */
export function applyPostOutcome(
  reminder: CommandReminder,
  result: Awaited<ReturnType<typeof postReminder>>,
  nowIso: string,
): CommandReminder {
  if (result.ok) {
    return {
      ...reminder,
      status: "sent",
      sentAt: nowIso,
      updatedAt: nowIso,
      discordMessageId: result.messageId,
      lastError: undefined,
    };
  }

  const attempts = reminder.attempts + 1;
  return {
    ...reminder,
    status: attempts >= REMINDER_MAX_ATTEMPTS ? "failed" : "scheduled",
    attempts,
    updatedAt: nowIso,
    lastError: result.detail,
  };
}

/**
 * Apply a post's outcome to the record that is in the store now, rather than
 * to the copy the post was made from.
 *
 * If somebody edited or moved the reminder while the webhook was in flight,
 * their edit wins and stays scheduled: the old version is what reached Discord,
 * so the new one still deserves its own moment. Without this, a slow post
 * silently replaced an edit with the stale record it started with.
 */
export function mergePostOutcome(
  latest: CommandReminder,
  posted: CommandReminder,
  outcome: CommandReminder,
): CommandReminder {
  if (
    latest.updatedAt !== posted.updatedAt ||
    latest.eventAt !== posted.eventAt ||
    latest.scheduledFor !== posted.scheduledFor
  ) {
    return latest;
  }

  return {
    ...latest,
    status: outcome.status,
    sentAt: outcome.sentAt,
    discordMessageId: outcome.discordMessageId,
    updatedAt: outcome.updatedAt,
    attempts: outcome.attempts,
    lastError: outcome.lastError,
  };
}

/**
 * Post one reminder immediately, whether it is scheduled, failed or cancelled.
 * A sent reminder is refused: a second post would be a second ping nobody
 * asked for.
 */
export async function sendReminderNow(
  id: string,
  now: Date = new Date(),
): Promise<ReminderServiceResult> {
  const read = await readRemindersDetailed();
  if (!read.ok) return readFailure(read);

  const reminder = read.reminders.find((entry) => entry.id === id);
  if (!reminder) {
    return { ok: false, status: 404, error: "That reminder no longer exists." };
  }
  if (reminder.status === "sent") {
    return {
      ok: false,
      status: 409,
      error: "That reminder has already been sent.",
    };
  }

  const nowIso = now.toISOString();
  const result = await postReminder(reminder);
  const updated = applyPostOutcome(reminder, result, nowIso);

  // Re-read after the webhook so a create or edit made while it was posting is
  // not overwritten by the list this call started with.
  const latest = await readRemindersDetailed();
  const base = latest.ok ? latest.reminders : read.reminders;
  const current = base.find((entry) => entry.id === id);
  const reminders = current
    ? base.map((entry) =>
        entry.id === id ? mergePostOutcome(current, reminder, updated) : entry,
      )
    : base;

  const write = await writeReminders(reminders);
  if (!write.ok) {
    return {
      ok: false,
      status: 502,
      error: result.ok
        ? `The reminder was posted, but its status could not be saved: ${write.detail ?? write.reason}`
        : `${result.detail} Its failure could not be saved either: ${write.detail ?? write.reason}`,
      reminders,
    };
  }

  if (!result.ok) {
    return { ok: false, status: 502, error: result.detail, reminders };
  }
  return { ok: true, reminders, messageId: result.messageId };
}
