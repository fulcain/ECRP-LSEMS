import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { memberDisplayName } from "@/lib/member-name";
import { canManageReminders } from "@/lib/role-config";
import { parseReminderInput } from "@/lib/reminder-input";
import {
  cancelReminder,
  createReminder,
  deleteReminder,
  listReminders,
  sendReminderNow,
  updateReminder,
  type ReminderServiceResult,
} from "@/lib/reminder-service";

/**
 * GET  /api/reminders - the stored list.
 * POST /api/reminders - create, update, cancel, send or delete one.
 *
 * The page gate is not a gate on these methods, so every request re-checks the
 * caller here. The author of a reminder is taken from the session, never from
 * the body, so the page cannot be used to schedule a message under someone
 * else's name.
 */

export const dynamic = "force-dynamic";

async function requireManager() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: "Not signed in." },
        { status: 401 },
      ),
    };
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: "Your session is no longer valid - sign in again." },
        { status: 401 },
      ),
    };
  }

  if (!canManageReminders(payload.roles, payload.discordId)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: "Your roles do not manage Command reminders." },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const, payload };
}

function respond(result: ReminderServiceResult) {
  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        conflict: result.status === 409,
        reminders: result.reminders,
      },
      { status: result.status },
    );
  }
  return NextResponse.json({
    success: true,
    reminders: result.reminders,
    messageId: result.messageId,
  });
}

export async function GET() {
  const caller = await requireManager();
  if (!caller.ok) return caller.response;
  return respond(await listReminders());
}

export async function POST(req: Request) {
  const caller = await requireManager();
  if (!caller.ok) return caller.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const request = (body ?? {}) as Record<string, unknown>;
  const action = typeof request.action === "string" ? request.action : "";
  const id = typeof request.id === "string" ? request.id : "";

  switch (action) {
    case "create": {
      const parsed = parseReminderInput(request);
      if (!parsed.ok) {
        return NextResponse.json(
          { success: false, error: parsed.error },
          { status: 400 },
        );
      }
      const name =
        memberDisplayName(caller.payload) ?? caller.payload.username;
      return respond(
        await createReminder(parsed.input, {
          discordId: caller.payload.discordId,
          name,
        }),
      );
    }

    case "update": {
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Which reminder should be updated?" },
          { status: 400 },
        );
      }
      const parsed = parseReminderInput(request);
      if (!parsed.ok) {
        return NextResponse.json(
          { success: false, error: parsed.error },
          { status: 400 },
        );
      }
      const expectedUpdatedAt =
        typeof request.expectedUpdatedAt === "string"
          ? request.expectedUpdatedAt
          : undefined;
      return respond(
        await updateReminder(id, expectedUpdatedAt, parsed.input),
      );
    }

    case "cancel": {
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Which reminder should be cancelled?" },
          { status: 400 },
        );
      }
      return respond(await cancelReminder(id));
    }

    case "delete": {
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Which reminder should be deleted?" },
          { status: 400 },
        );
      }
      return respond(await deleteReminder(id));
    }

    case "send": {
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Which reminder should be sent?" },
          { status: 400 },
        );
      }
      return respond(await sendReminderNow(id));
    }

    default:
      return NextResponse.json(
        {
          success: false,
          error:
            "Unknown action. Use create, update, cancel, delete or send.",
        },
        { status: 400 },
      );
  }
}
