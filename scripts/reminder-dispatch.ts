/**
 * The local scheduler.
 *
 * A deployment has no scheduler of its own unless one calls the endpoint, so
 * this is how the reminder pass is exercised on a development machine. It
 * calls the same `dispatchDueReminders` the endpoint does, against the same
 * store and webhook from `.env`; production can use any free HTTP scheduler.
 *
 *   npm run reminders:dispatch             one pass
 *   npm run reminders:dispatch -- --watch  a pass every 30 seconds
 *   npm run reminders:dispatch -- --dry-run
 */

import { isReminderDue } from "@/configs/command-reminders";
import { dispatchDueReminders } from "@/lib/reminder-dispatch";
import { readRemindersDetailed } from "@/lib/reminder-store";

const args = process.argv.slice(2);
const watch = args.includes("--watch");
const dryRun = args.includes("--dry-run");
const intervalArg = args.find((arg) => arg.startsWith("--interval="));
const intervalSeconds = Math.max(
  5,
  Number(intervalArg?.split("=")[1] ?? 30) || 30,
);

function stamp(): string {
  return new Date().toISOString();
}

async function runOnce(): Promise<void> {
  if (dryRun) {
    const read = await readRemindersDetailed();
    if (!read.ok) {
      console.error(`[reminders] ${read.reason}: ${read.detail ?? "unknown"}`);
      return;
    }
    const due = read.reminders.filter((reminder) => isReminderDue(reminder));
    if (due.length === 0) {
      console.log(`[reminders] ${stamp()} nothing due`);
      return;
    }
    for (const reminder of due) {
      console.log(
        `[reminders] ${stamp()} would send "${reminder.title}" (due ${reminder.scheduledFor})`,
      );
    }
    return;
  }

  const result = await dispatchDueReminders();
  if (!result.ok) {
    console.error(`[reminders] ${result.reason}: ${result.detail ?? "unknown"}`);
    return;
  }
  if (result.checked === 0) {
    console.log(`[reminders] ${stamp()} nothing due`);
    return;
  }
  console.log(
    `[reminders] ${stamp()} checked ${result.checked}, sent ${result.sent}, failed ${result.failed}`,
  );
  for (const error of result.errors) {
    console.error(`[reminders]   ${error}`);
  }
}

let running = false;

async function tick(): Promise<void> {
  if (running) return;
  running = true;
  try {
    await runOnce();
  } catch (err) {
    console.error(`[reminders] ${String(err)}`);
  } finally {
    running = false;
  }
}

await tick();

if (watch) {
  console.log(
    `[reminders] watching every ${intervalSeconds}s${dryRun ? " (dry run)" : ""} - Ctrl+C to stop`,
  );
  setInterval(tick, intervalSeconds * 1000);
}
