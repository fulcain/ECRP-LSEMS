/**
 * The live permission matrix, stored in a Vercel Global Config (formerly Edge
 * Config).
 *
 * Chosen because the decision has to be made in the **middleware**, which runs
 * on the Edge runtime: the registry cannot be a database read there, and a
 * per-request round trip to a database would put a network hop in front of
 * every navigation. A Global Config is globally replicated, readable from Edge
 * in milliseconds through the SDK, and updates propagate in seconds - which is
 * what makes the editor feel live.
 *
 * Reads and writes are asymmetrical on purpose:
 *   • reading uses the SDK and the `GLOBAL_CONFIG` connection string, and is
 *     safe in the Edge runtime (it is what the middleware calls);
 *   • writing uses the Vercel REST API with `VERCEL_API_TOKEN`, and only ever
 *     happens in the Node-runtime API route behind the editor.
 *
 * Everything degrades to the config defaults. With no store configured, or with
 * the store unreachable, the app behaves exactly as `configs/roles.ts` says -
 * stale roles, never a closed door, the same rule the session refresh follows.
 */

import { createClient, type GlobalConfigClient } from "@vercel/global-config";
import {
  ACCESS_MATRIX_KEY,
  sanitizeMatrix,
  type AccessMatrix,
} from "@/configs/access-matrix";

/** The connection string env var the SDK reads, newest name first. */
function connectionString(): string | undefined {
  return process.env.GLOBAL_CONFIG ?? process.env.EDGE_CONFIG;
}

/** Whether a matrix can be read at all (the editor shows a setup hint if not). */
export function isMatrixStoreConfigured(): boolean {
  return Boolean(connectionString());
}

/** Whether a matrix can be *written* - the editor needs this too. */
export function isMatrixStoreWritable(): boolean {
  return Boolean(process.env.VERCEL_API_TOKEN && process.env.GLOBAL_CONFIG_ID);
}

function warnOnce(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(`[access-matrix] ${message}`);
}

const warned = new Set<string>();

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

  warnOnce(
    `VERCEL_TEAM_ID="${raw}" is not a team id (it should start with \`team_\`), so it is being ignored. ` +
      "A team- or project-scoped token already implies its team; remove the variable unless you are using a Full Account token.",
  );
  return undefined;
}

/**
 * The outcome of a read, keeping "there is nothing stored" apart from "the read
 * failed".
 *
 * The middleware must not care - both mean "use the registry" - but a **save**
 * has to: it checks the stored value is still what the editor read before it
 * overwrites it, and an unreadable store must block that write rather than look
 * like an empty one and happily clobber whatever is really there.
 */
export type MatrixRead =
  | { ok: true; matrix: AccessMatrix | null }
  | { ok: false; reason: "not-configured" | "unreadable"; detail?: string };

export async function readAccessMatrixDetailed(): Promise<MatrixRead> {
  const connection = connectionString();
  if (!connection) return { ok: false, reason: "not-configured" };

  try {
    const client: GlobalConfigClient = createClient(connection);
    const raw = await client.get(ACCESS_MATRIX_KEY);
    if (!raw) return { ok: true, matrix: null };

    const parsed = sanitizeMatrix(raw);
    if (!parsed) {
      warnOnce(
        `the "${ACCESS_MATRIX_KEY}" item is not a matrix - ignoring it and using the registry.`,
      );
      return {
        ok: false,
        reason: "unreadable",
        detail: "the stored item is not a matrix",
      };
    }
    if (parsed.dropped.length > 0) {
      warnOnce(
        `ignored stale entries in "${ACCESS_MATRIX_KEY}": ${parsed.dropped.join(", ")}`,
      );
    }
    return { ok: true, matrix: parsed.matrix };
  } catch (err) {
    warnOnce(`could not read the matrix (${String(err)}) - using the registry.`);
    return { ok: false, reason: "unreadable", detail: String(err) };
  }
}

/**
 * The stored matrix, or `null` when there is none to read.
 *
 * `null` is deliberately the same answer for "no store configured", "the store
 * is empty" and "the store could not be reached": all three mean "use the
 * registry", which is the only safe reading of an unavailable override. A
 * caller that needs to tell those apart - the save check - wants
 * `readAccessMatrixDetailed` instead.
 */
export async function readAccessMatrix(): Promise<AccessMatrix | null> {
  const read = await readAccessMatrixDetailed();
  return read.ok ? read.matrix : null;
}

/**
 * Whether the configured token may actually write, checked **read-only**.
 *
 * `isMatrixStoreWritable` can only say the two variables are set, which is not
 * the same as "the write will work" - a token scoped to the wrong team, or one
 * without access to this config, fails at the moment someone presses Save. This
 * asks Vercel for the config's metadata instead: no state is touched, and a
 * correct scope is confirmed before anything is edited.
 */
export type WriteAccess = "ok" | "unauthorized" | "unknown" | "not-configured";

export async function probeWriteAccess(): Promise<WriteAccess> {
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

/** Why a save could not happen, so the editor can say something useful. */
export type MatrixWriteFailure =
  | "not-configured"
  | "rejected"
  | "network";

export type MatrixWriteResult =
  | { ok: true }
  | { ok: false; reason: MatrixWriteFailure; detail?: string };

/**
 * Replace the stored matrix.
 *
 * This is a **single-item upsert**: it names the one key it owns
 * (`access-matrix`) and leaves every other item in the config alone. It is
 * deliberately not a "replace the whole config" write - the store is shared
 * with anything else the project keeps there, and rewriting items nobody
 * touched would be a way to destroy them for no gain. There is also no
 * fallback worth having: the failure modes here are a bad token, a bad scope
 * or no network, and none of those get better by writing more keys.
 *
 * One item also means one write, so a save can never land half-applied.
 */
export async function writeAccessMatrix(
  matrix: AccessMatrix,
): Promise<MatrixWriteResult> {
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
        items: [
          { operation: "upsert", key: ACCESS_MATRIX_KEY, value: matrix },
        ],
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
