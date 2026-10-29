import { NextResponse } from "next/server";

import { canEditFtp } from "@/lib/role-config";
import { readAuthCookie } from "@/lib/cookies";
import { verifySessionToken } from "@/lib/jwt";
import {
  isGlobalConfigConfigured,
  isGlobalConfigWritable,
} from "@/lib/global-config-store";
import {
  employeeRosterFallback,
  readEmployeeRoster,
  writeEmployeeRoster,
} from "@/lib/employee-store";
import { parseEmployeeRecord } from "@/lib/employee-records";
import { validateName } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Session = {
  discordId: string;
  username?: string | null;
  roles: string[];
};

type SessionResult =
  | { ok: true; session: Session }
  | { ok: false; response: NextResponse };

async function readSession(request: Request): Promise<SessionResult> {
  const token = readAuthCookie(request);
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not signed in." }, { status: 401 }),
    };
  }
  return { ok: true, session };
}

export async function GET(request: Request) {
  const auth = await readSession(request);
  if (!auth.ok) return auth.response;

  const canEdit = canEditFtp(auth.session.roles, auth.session.discordId);
  const initializeIfMissing =
    new URL(request.url).searchParams.get("initialize") === "1" && canEdit;
  const result = await readEmployeeRoster({ initializeIfMissing });

  return NextResponse.json({
    employees: result.ok ? result.employees : employeeRosterFallback(),
    canEdit: canEdit && result.ok && isGlobalConfigWritable(),
    writable: isGlobalConfigWritable(),
    configured: isGlobalConfigConfigured(),
    storedInConfig: result.ok && result.storedInConfig,
    sourceError: result.ok ? undefined : result.error,
  });
}

export async function POST(request: Request) {
  const auth = await readSession(request);
  if (!auth.ok) return auth.response;
  if (!canEditFtp(auth.session.roles, auth.session.discordId)) {
    return NextResponse.json(
      { error: "Forbidden: the employee roster is edited by FTD Head, Assistant Head of FTD and Command+." },
      { status: 403 },
    );
  }
  if (!isGlobalConfigWritable()) {
    return NextResponse.json(
      { error: "Roster changes are currently unavailable. Please try again later." },
      { status: 409 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Expected an employee action." }, { status: 400 });
  }

  const requestBody = body as Record<string, unknown>;
  const action = requestBody.action;
  if (action !== "add" && action !== "edit" && action !== "remove") {
    return NextResponse.json({ error: "Choose add, edit, or remove." }, { status: 400 });
  }

  const result = await readEmployeeRoster({ initializeIfMissing: true });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const employees = [...result.employees];
  if (action === "add") {
    const parsed = parseEmployeeRecord(requestBody.employee);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 422 });
    if (employees.some((employee) => employee.name.toLowerCase() === parsed.value.name.toLowerCase())) {
      return NextResponse.json({ error: "An employee with that name is already listed." }, { status: 409 });
    }
    employees.push(parsed.value);
  } else {
    const currentName = typeof requestBody.currentName === "string" ? requestBody.currentName.trim() : "";
    const currentNameResult = validateName(currentName, "Current employee name");
    if (!currentNameResult.ok) {
      return NextResponse.json({ error: currentNameResult.error }, { status: 422 });
    }
    const index = employees.findIndex(
      (employee) => employee.name.toLowerCase() === currentName.toLowerCase(),
    );
    if (index < 0) {
      return NextResponse.json({ error: "That employee is no longer in the roster. Reload the page." }, { status: 404 });
    }

    if (action === "remove") {
      employees.splice(index, 1);
    } else {
      const parsed = parseEmployeeRecord(requestBody.employee);
      if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 422 });
      if (
        employees.some(
          (employee, employeeIndex) =>
            employeeIndex !== index && employee.name.toLowerCase() === parsed.value.name.toLowerCase(),
        )
      ) {
        return NextResponse.json({ error: "An employee with that name is already listed." }, { status: 409 });
      }
      employees[index] = parsed.value;
    }
  }

  const write = await writeEmployeeRoster(employees);
  if (!write.ok) {
    const status = write.reason === "invalid-roster" ? 422 : 502;
    return NextResponse.json(
      { error: write.detail ?? "The employee roster could not be saved." },
      { status },
    );
  }

  return NextResponse.json({ employees, storedInConfig: true });
}
