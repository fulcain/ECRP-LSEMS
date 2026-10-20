import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { dispatchDueReminders } from "@/lib/reminder-dispatch";

/**
 * POST/GET /api/reminders/dispatch - the scheduler's entry point.
 *
 * Any scheduler may call this: Vercel Cron sends
 * `Authorization: Bearer $CRON_SECRET`, and a free external scheduler can send
 * `x-cron-secret` instead. This route is deliberately outside the member
 * session: a cron has no cookie, and the secret is the whole gate. Without a
 * configured secret it refuses rather than running unauthenticated.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const header = req.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const supplied =
    bearer || (req.headers.get("x-cron-secret") ?? "").trim();

  if (!supplied) return false;
  const suppliedBytes = Buffer.from(supplied);
  const secretBytes = Buffer.from(secret);
  // Compare byte lengths, not string lengths: a non-ASCII secret can encode to
  // a different number of bytes, and timingSafeEqual throws on a length mismatch.
  if (suppliedBytes.length !== secretBytes.length) return false;
  return timingSafeEqual(suppliedBytes, secretBytes);
}

async function run(req: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: "CRON_SECRET is not set, so the dispatch endpoint is closed.",
      },
      { status: 503 },
    );
  }

  if (!authorized(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const result = await dispatchDueReminders();
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          result.reason === "not-configured"
            ? "No reminder store is configured on this deployment."
            : `Could not read the reminder store (${result.detail ?? "unknown"}).`,
      },
      { status: result.reason === "not-configured" ? 503 : 500 },
    );
  }

  return NextResponse.json(result);
}

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}
