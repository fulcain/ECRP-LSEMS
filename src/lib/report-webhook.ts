/**
 * The one place the Report Form talks to Discord.
 *
 * A webhook can post a message drawn from a fixed shape, which is all this
 * needs: the request is rendered by `reportMessage` and sent once.
 *
 * `?wait=true` on the post makes Discord answer with the created message; it
 * costs nothing and leaves the door open for a future feature to reference it.
 */

import { reportMessage, type Report } from "@/configs/reports";

/** The execute URL, without a trailing slash or any query string of its own. */
function baseWebhookUrl(): string | null {
  const raw = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, "").split("?")[0];
}

export function isReportWebhookConfigured(): boolean {
  return baseWebhookUrl() !== null;
}

export type WebhookResult =
  | { ok: true; messageId?: string }
  | { ok: false; detail: string };

/** Discord's answer, trimmed to something a toast can show. */
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
  return `The notification failed (${res.status}${hint})${body ? `: ${body.slice(0, 300)}` : ""}`;
}

/** Post a report, returning the id of the message it created. */
export async function postReport(report: Report): Promise<WebhookResult> {
  const base = baseWebhookUrl();
  if (!base) {
    return {
      ok: false,
      detail:
        "The notification service is not configured on this deployment, so nothing was sent.",
    };
  }

  try {
    const res = await fetch(`${base}?wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportMessage(report)),
      cache: "no-store",
    });

    if (!res.ok) return { ok: false, detail: await failureDetail(res) };

    // `wait=true` answers with the message object; if the body is ever empty
    // the post still succeeded, it just cannot be referenced later.
    const created = (await res.json().catch(() => null)) as { id?: string } | null;
    return { ok: true, messageId: created?.id };
  } catch (err) {
    return {
      ok: false,
      detail: `Could not reach the notification service: ${String(err)}`,
    };
  }
}
