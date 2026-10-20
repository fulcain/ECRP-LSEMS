/**
 * Turning what the Command page submitted into a reminder the store can hold.
 *
 * The meeting time arrives as a date, a time and the zone they were typed in;
 * the page also says how long before it to remind. Doing the arithmetic here -
 * rather than trusting a computed ISO string from the browser - means a wrong
 * client clock cannot move a reminder, and the cron has one unambiguous moment
 * to compare against.
 */

import { fromZonedTime } from "date-fns-tz";

import {
  REMINDER_LEAD_MAX_MINUTES,
  REMINDER_LEAD_UNIT_MINUTES,
  REMINDER_TIME_ZONE,
  REMINDER_TITLE_MAX,
  isReminderLeadUnit,
  isReminderRoleAlias,
  type ReminderLeadUnit,
  type ReminderRoleAlias,
} from "@/configs/command-reminders";

export type ReminderInput = {
  title: string;
  roleAlias: ReminderRoleAlias;
  /** UTC, ISO. */
  eventAt: string;
  remindBeforeMinutes: number;
  /** UTC, ISO: `eventAt` minus the lead time. */
  scheduledFor: string;
  timeZone: string;
};

export type ReminderInputResult =
  | { ok: true; input: ReminderInput }
  | { ok: false; error: string };

export function parseReminderInput(
  body: unknown,
  now: number = Date.now(),
): ReminderInputResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "The reminder is missing its fields." };
  }
  const raw = body as Record<string, unknown>;

  const title =
    typeof raw.title === "string" ? raw.title.replace(/\s+/g, " ").trim() : "";
  if (!title) return { ok: false, error: "Give the reminder a title." };
  if (title.length > REMINDER_TITLE_MAX) {
    return {
      ok: false,
      error: `Keep the title under ${REMINDER_TITLE_MAX} characters.`,
    };
  }

  if (!isReminderRoleAlias(raw.roleAlias)) {
    return {
      ok: false,
      error:
        "Choose a role to ping: Supervisor, Divisional Head or Employee.",
    };
  }
  const roleAlias = raw.roleAlias;

  // The page no longer offers a zone picker, and a caller that still sends one
  // must not have its local time silently read as UTC.
  if (
    raw.timeZone !== undefined &&
    (typeof raw.timeZone !== "string" ||
      raw.timeZone.trim().toUpperCase() !== REMINDER_TIME_ZONE)
  ) {
    return {
      ok: false,
      error: "Times are entered in UTC. Remove the timezone or set it to UTC.",
    };
  }

  const eventDate =
    typeof raw.eventDate === "string" ? raw.eventDate.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return { ok: false, error: "Choose the meeting date." };
  }
  // `fromZonedTime` would happily roll 31 February into March. Compare the
  // parsed day back to the typed one so an impossible date is refused instead
  // of silently becoming a different meeting.
  const calendarDate = new Date(`${eventDate}T00:00:00Z`);
  if (
    Number.isNaN(calendarDate.getTime()) ||
    calendarDate.toISOString().slice(0, 10) !== eventDate
  ) {
    return { ok: false, error: "That is not a real calendar date." };
  }

  const eventTime =
    typeof raw.eventTime === "string" ? raw.eventTime.trim() : "";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(eventTime)) {
    return { ok: false, error: "Choose the meeting time." };
  }

  // Only a number or a non-empty numeric string counts. `Number(null)`,
  // `Number("")` and `Number(false)` are all 0, which would quietly turn a
  // missing lead field into "at the meeting time".
  const rawLead = raw.remindBefore;
  if (
    (typeof rawLead !== "number" && typeof rawLead !== "string") ||
    (typeof rawLead === "string" && rawLead.trim() === "")
  ) {
    return {
      ok: false,
      error: "Choose how long before the meeting to remind (whole numbers only).",
    };
  }
  const remindBefore =
    typeof rawLead === "number" ? rawLead : Number(rawLead.trim());
  if (
    !Number.isFinite(remindBefore) ||
    !Number.isInteger(remindBefore) ||
    remindBefore < 0
  ) {
    return {
      ok: false,
      error: "Choose how long before the meeting to remind (whole numbers only).",
    };
  }
  if (!isReminderLeadUnit(raw.remindUnit)) {
    return { ok: false, error: "Choose a reminder unit." };
  }
  const remindUnit: ReminderLeadUnit = raw.remindUnit;
  const remindBeforeMinutes =
    remindBefore * REMINDER_LEAD_UNIT_MINUTES[remindUnit];
  if (remindBeforeMinutes > REMINDER_LEAD_MAX_MINUTES) {
    return {
      ok: false,
      error: "That lead time is longer than a year.",
    };
  }

  const event = fromZonedTime(
    `${eventDate}T${eventTime}:00`,
    REMINDER_TIME_ZONE,
  );
  if (Number.isNaN(event.getTime())) {
    return { ok: false, error: "That date and time could not be read." };
  }
  // A minute of grace covers a page that was open while the moment passed.
  if (event.getTime() < now - 60_000) {
    return { ok: false, error: "Pick a meeting time in the future." };
  }

  const scheduled = new Date(event.getTime() - remindBeforeMinutes * 60_000);
  if (scheduled.getTime() < now - 60_000) {
    return {
      ok: false,
      error:
        "That reminder time has already passed. Choose a shorter lead time or a later meeting.",
    };
  }

  return {
    ok: true,
    input: {
      title,
      roleAlias,
      eventAt: event.toISOString(),
      remindBeforeMinutes,
      scheduledFor: scheduled.toISOString(),
      timeZone: REMINDER_TIME_ZONE,
    },
  };
}
