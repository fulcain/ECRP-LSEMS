/**
 * The Vercel Global Config, as one small read/write API.
 *
 * Two unrelated things live in the same config - the permission matrix and the
 * Command reminders - and both need the same asymmetry: reads go through the
 * SDK (which works in the Edge runtime), writes go through the REST API with
 * `VERCEL_API_TOKEN` (Node only). Keeping that here is what stops one of them
 * from growing a second, subtly different copy of the token rules.
 */

import { createClient } from "@vercel/global-config";

/** The connection string env var the SDK reads, newest name first. */
function connectionString(): string | undefined {
  return process.env.GLOBAL_CONFIG ?? process.env.EDGE_CONFIG;
}

/** Whether a config can be read at all. */
export function isGlobalConfigConfigured(): boolean {
  return Boolean(connectionString());
}

/** Whether a config can be written - the API routes need this too. */
export function isGlobalConfigWritable(): boolean {
  return Boolean(process.env.VERCEL_API_TOKEN && process.env.GLOBAL_CONFIG_ID);
}

const warned = new Set<string>();

/** Log a configuration problem once, not on every request. */
export function warnGlobalConfigOnce(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
}

/**
 * The `teamId` query parameter to send, if any.
 *
 * Vercel only wants this for a **Full Account** token reaching a team: team-
 * and project-scoped tokens already imply their team, and the docs say to omit
 * it for them. Sending it when it isn't wanted is not harmless - a wrong value
 * turns every write into `403 forbidden`, and a project id pasted into this
 * variable is an easy mistake to make. So the value is only used when it really
 * is a team id, and otherwise ignored out loud rather than silently breaking
 * saving.
 */
function teamIdForRequests(): string | undefined {
  const raw = process.env.VERCEL_TEAM_ID?.trim();
  if (!raw) return undefined;
  if (raw.startsWith("team_")) return raw;

  warnGlobalConfigOnce(
    `[global-config] VERCEL_TEAM_ID="${raw}" is not a team id (it should start with \`team_\`), so it is being ignored. ` +
      "A team- or project-scoped token already implies its team; remove the variable unless you are using a Full Account token.",
  );
  return undefined;
}

/**
 * The outcome of a read, keeping "there is no item" apart from "the read
 * failed".
 *
 * A caller that only reads can treat both as empty; a caller that is about to
 * overwrite an item must not, or an unreadable store would look like an empty
 * one and happily clobber whatever is really there.
 */
export type GlobalConfigRead =
  | { ok: true; value: unknown | null }
  | { ok: false; reason: "not-configured" | "unreadable"; detail?: string };

export async function readGlobalConfigItem(
  key: string,
  options?: { consistentRead?: boolean },
): Promise<GlobalConfigRead> {
  const connection = connectionString();
  if (!connection) return { ok: false, reason: "not-configured" };

  try {
    const client = createClient(connection);
    // Config reads are normally served from the SDK's cache, which is right for
    // the permission matrix. Mutable data (the reminder list) has to see its
    // own writes, or a create can write back a list from before the last send.
    const value = await client.get(
      key,
      options?.consistentRead ? { consistentRead: true } : undefined,
    );
    return { ok: true, value: value ?? null };
  } catch (err) {
    return { ok: false, reason: "unreadable", detail: String(err) };
  }
}

/** Whether the configured token may actually write, checked read-only. */
export type GlobalConfigWriteAccess =
  | "ok"
  | "unauthorized"
  | "unknown"
  | "not-configured";

export async function probeGlobalConfigWriteAccess(): Promise<GlobalConfigWriteAccess> {
  const token = process.env.VERCEL_API_TOKEN;
  const configId = process.env.GLOBAL_CONFIG_ID;
  if (!token || !configId) return "not-configured";

  const teamId = teamIdForRequests();
  const url =
    `https://api.vercel.com/v1/global-config/${configId}` +
    (teamId ? `?teamId=${encodeURIComponent(teamId)}` : "");

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) return "ok";
    if (res.status === 401 || res.status === 403) return "unauthorized";
    return "unknown";
  } catch {
    return "unknown";
  }
}

/** Why a write could not happen, so a page can say something useful. */
export type GlobalConfigWriteFailure =
  | "not-configured"
  | "rejected"
  | "network";

export type GlobalConfigWriteResult =
  | { ok: true }
  | { ok: false; reason: GlobalConfigWriteFailure; detail?: string };

/**
 * Upsert one item.
 *
 * This always names the one key it owns and leaves every other item in the
 * config alone. A "replace the whole config" write would be a way to destroy
 * items nobody touched, for no gain. One key also means one write, so a save
 * can never land half-applied.
 */
export async function writeGlobalConfigItem(
  key: string,
  value: unknown,
): Promise<GlobalConfigWriteResult> {
  const token = process.env.VERCEL_API_TOKEN;
  const configId = process.env.GLOBAL_CONFIG_ID;
  if (!token || !configId) {
    return {
      ok: false,
      reason: "not-configured",
      detail:
        "Set VERCEL_API_TOKEN and GLOBAL_CONFIG_ID to save changes from the app.",
    };
  }

  const teamId = teamIdForRequests();
  const url =
    `https://api.vercel.com/v1/global-config/${configId}/items` +
    (teamId ? `?teamId=${encodeURIComponent(teamId)}` : "");

  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ operation: "upsert", key, value }],
      }),
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      return { ok: false, reason: "rejected", detail: text.slice(0, 500) };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: "network", detail: String(err) };
  }
}
