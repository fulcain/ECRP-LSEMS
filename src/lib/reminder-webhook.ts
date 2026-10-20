/**
 * The one place a Command reminder talks to Discord.
 *
 * The channel is a webhook, not a bot: `DISCORD_REMINDER_WEBHOOK_URL` names
 * the destination, so no token with guild-wide reach is kept in the app. The
 * message itself is rendered by `reminderWebhookPayload` in the config module,
 * and `?wait=true` makes Discord answer with the created message - which is
 * what lets the page record the id and the cron tell a success from a failure.
 */

import {
  reminderWebhookPayload,
  type CommandReminder,
} from "@/configs/command-reminders";

/**
 * The execute URL with `wait=true` set.
 *
 * The query is edited, not replaced: a webhook created for a thread carries a
 * `thread_id` that must survive, or the reminder lands in the wrong channel.
 */
function webhookUrl(): string | null {
  const raw = process.env.DISCORD_REMINDER_WEBHOOK_URL?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.searchParams.set("wait", "true");
    return url.toString();
  } catch {
    return null;
  }
}

export function isReminderWebhookConfigured(): boolean {
  return webhookUrl() !== null;
}

export type ReminderPostResult =
  | { ok: true; messageId?: string }
  | { ok: false; detail: string };

/** Discord's answer, trimmed to something a toast or a stored error can show. */
async function failureDetail(res: Response): Promise<string> {
  let body = "";
  try {
    body = await res.text();
  } catch {
    // Nothing readable came back; the status line still says something.
  }
  const hint =
    res.status === 401 || res.status === 403
      ? " (the webhook URL looks revoked or wrong)"
      : res.status === 404
        ? " (no such webhook)"
        : "";
  return `Discord refused the reminder (${res.status}${hint})${body ? `: ${body.slice(0, 300)}` : ""}`;
}

/** Post one reminder, returning the id of the message it created. */
export async function postReminder(
  reminder: CommandReminder,
): Promise<ReminderPostResult> {
  const url = webhookUrl();
  if (!url) {
    return {
      ok: false,
      detail:
        "DISCORD_REMINDER_WEBHOOK_URL is not set (or is not a valid URL) on this deployment, so nothing was sent.",
    };
  }

  const payload = reminderWebhookPayload(reminder);
  if (!payload) {
    return {
      ok: false,
      detail: `The role "${reminder.roleAlias}" has no Discord id in the registry, so it cannot be pinged.`,
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      // One hanging webhook must not eat the cron's whole 60-second budget and
      // leave later reminders unposted.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return { ok: false, detail: await failureDetail(res) };

    const created = (await res.json().catch(() => null)) as { id?: string } | null;
    return { ok: true, messageId: created?.id };
  } catch (err) {
    return {
      ok: false,
      detail: `Could not reach Discord: ${String(err)}`,
    };
  }
}
