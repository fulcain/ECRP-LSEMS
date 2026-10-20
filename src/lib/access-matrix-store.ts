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

import {
  ACCESS_MATRIX_KEY,
  sanitizeMatrix,
  type AccessMatrix,
} from "@/configs/access-matrix";
import {
  isGlobalConfigConfigured,
  isGlobalConfigWritable,
  probeGlobalConfigWriteAccess,
  readGlobalConfigItem,
  writeGlobalConfigItem,
  type GlobalConfigWriteAccess,
  type GlobalConfigWriteFailure,
} from "@/lib/global-config-store";

/** Whether a matrix can be read at all (the editor shows a setup hint if not). */
export function isMatrixStoreConfigured(): boolean {
  return isGlobalConfigConfigured();
}

/** Whether a matrix can be *written* - the editor needs this too. */
export function isMatrixStoreWritable(): boolean {
  return isGlobalConfigWritable();
}

function warnOnce(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(`[access-matrix] ${message}`);
}

const warned = new Set<string>();

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
  const read = await readGlobalConfigItem(ACCESS_MATRIX_KEY);
  if (!read.ok) {
    if (read.reason === "unreadable") {
      warnOnce(
        `could not read the matrix (${read.detail ?? "unknown"}) - using the registry.`,
      );
    }
    return read;
  }

  if (!read.value) return { ok: true, matrix: null };

  const parsed = sanitizeMatrix(read.value);
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
export type WriteAccess = GlobalConfigWriteAccess;

export async function probeWriteAccess(): Promise<WriteAccess> {
  return probeGlobalConfigWriteAccess();
}

/** Why a save could not happen, so the editor can say something useful. */
export type MatrixWriteFailure = GlobalConfigWriteFailure;

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
  return writeGlobalConfigItem(ACCESS_MATRIX_KEY, matrix);
}
