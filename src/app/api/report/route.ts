import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import { userHasAccess } from "@/lib/role-config";
import { readAccessMatrix } from "@/lib/access-matrix-store";
import { postReport } from "@/lib/report-webhook";
import { isReportType } from "@/configs/reports";
import { ROUTES } from "@/configs/routes";

/**
 * `POST /api/report` - send a bug report or a feature request to the developer.
 *
 * The person asking is taken from their session, never from the request body,
 * so the message can name who sent it without anyone typing a name in.
 */

/** A long pasted wall is trimmed to something the message can carry. */
const MAX_MESSAGE_LENGTH = 4000;

export async function POST(req: Request) {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "Your session is no longer valid - sign in again." },
      { status: 401 },
    );
  }

  const matrix = await readAccessMatrix();
  if (
    !userHasAccess(
      ROUTES.resources.report,
      payload.roles,
      payload.discordId,
      matrix,
    )
  ) {
    return NextResponse.json(
      { error: "Your roles do not open the report form." },
      { status: 403 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    type?: unknown;
    message?: unknown;
  };

  const message = typeof body.message === "string" ? body.message : "";
  if (!isReportType(body.type)) {
    return NextResponse.json({ error: "Pick Bug or Feature." }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Write something first." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      {
        error: `That is ${message.length} characters; keep it under ${MAX_MESSAGE_LENGTH}.`,
      },
      { status: 400 },
    );
  }

  // The Staff Page's own name for this member first, then Discord's.
  const authorName =
    payload.nick ?? payload.globalName ?? payload.username ?? "Unknown";

  const posted = await postReport({ type: body.type, message, authorName });
  if (!posted.ok) {
    return NextResponse.json({ error: posted.detail }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
