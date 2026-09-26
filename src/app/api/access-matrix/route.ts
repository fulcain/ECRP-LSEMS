import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { canManageAccess } from "@/lib/role-config";
import { sameMatrix, sanitizeMatrix } from "@/configs/access-matrix";
import {
  isMatrixStoreConfigured,
  isMatrixStoreWritable,
  probeWriteAccess,
  readAccessMatrix,
  readAccessMatrixDetailed,
  writeAccessMatrix,
} from "@/lib/access-matrix-store";

/**
 * GET  /api/access-matrix - the stored matrix, plus whether this deployment can
 *                           read and write one at all.
 * POST /api/access-matrix - replace it.
 *                           Body: `{ matrix: { route: [aliases] }, base: {...} }`
 *
 * The page gate is only on the page, and these are the endpoints that actually
 * change who may open what, so both methods re-check the caller here rather
 * than trusting that the request came from the editor. `canManageAccess` is the
 * same rule the middleware enforces on the page, read forwards.
 *
 * A save writes exactly one item, and only after checking that the stored value
 * is still the one the editor was working from (`base`). Without that check the
 * store is last-write-wins, and two managers editing at once would mean the
 * slower save silently crumpling the faster one's rows - the same class of loss
 * the payload fix addressed, arriving from the other direction. A conflict is a
 * 409 with the current value, never a quiet overwrite.
 */

// The stored value has to be read per request - that is the entire point.
export const dynamic = "force-dynamic";

type Manager =
  | { ok: true; roles: readonly string[]; discordId: string }
  | { ok: false; response: NextResponse };

async function requireManager(): Promise<Manager> {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      ),
    };
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 },
      ),
    };
  }

  if (!canManageAccess(payload.roles, payload.discordId)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Forbidden: the permission matrix is CommandPlusTeam only.",
        },
        { status: 403 },
      ),
    };
  }

  return { ok: true, roles: payload.roles, discordId: payload.discordId };
}

export async function GET() {
  const caller = await requireManager();
  if (!caller.ok) return caller.response;

  return NextResponse.json({
    success: true,
    configured: isMatrixStoreConfigured(),
    writable: isMatrixStoreWritable(),
    // Read-only, so "saving will work" is answered before anyone edits a row.
    writeAccess: await probeWriteAccess(),
    stored: await readAccessMatrix(),
  });
}

export async function POST(req: Request) {
  const caller = await requireManager();
  if (!caller.ok) return caller.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const request = (body ?? {}) as { matrix?: unknown; base?: unknown };

  const parsed = sanitizeMatrix(request.matrix);
  if (!parsed) {
    return NextResponse.json(
      { success: false, error: "Body must be { matrix: { route: [roles] } }" },
      { status: 400 },
    );
  }

  // The editor always sends what it read; absent means "I expect nothing",
  // which is the correct reading for a first save against an empty store.
  const parsedBase = sanitizeMatrix(request.base ?? {});
  if (!parsedBase) {
    return NextResponse.json(
      { success: false, error: "`base` must be an override set" },
      { status: 400 },
    );
  }

  const current = await readAccessMatrixDetailed();
  if (!current.ok) {
    // Never guess at the stored value on the way to overwriting it.
    return NextResponse.json(
      {
        success: false,
        reason: current.reason,
        error:
          current.reason === "not-configured"
            ? "No permission store is configured, so there is nothing to save to."
            : `Could not read the stored matrix (${current.detail ?? "unknown"}), so it will not be overwritten.`,
      },
      { status: current.reason === "not-configured" ? 501 : 503 },
    );
  }

  const stored = current.matrix ?? {};
  if (!sameMatrix(stored, parsedBase.matrix)) {
    return NextResponse.json(
      {
        success: false,
        conflict: true,
        error:
          "Someone else changed the matrix while you were editing. Reload to see their version, then re-apply your changes.",
        stored,
      },
      { status: 409 },
    );
  }

  const result = await writeAccessMatrix(parsed.matrix);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, reason: result.reason, error: result.detail },
      { status: result.reason === "not-configured" ? 501 : 502 },
    );
  }

  return NextResponse.json({ success: true, dropped: parsed.dropped });
}
