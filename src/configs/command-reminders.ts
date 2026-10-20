/**
 * The Command page's reminders, declared once.
 *
 * A reminder is a meeting time, how long before it to speak up, and a role to
 * ping. The page stores the list in the same Vercel Global Config as the
 * permission matrix, and a cron endpoint reads it and posts what is due. This
 * module is pure - it imports no store and no request API - so the page, the
 * API routes and the cron endpoint all agree on what a reminder is and what it
 * says in Discord.
 */

import { ROLES } from "@/configs/roles";

/** The Global Config item that holds the reminder list. */
export const REMINDERS_KEY = "command-reminders";

/**
 * Command meetings are typed, stored and read in UTC. Keeping one zone means
 * the form, the store and the cron cannot disagree about what "18:00" means.
 */
export const REMINDER_TIME_ZONE = "UTC";

export const REMINDER_TITLE_MAX = 120;
/** After this many failed posts the cron stops retrying and the page shows it. */
export const REMINDER_MAX_ATTEMPTS = 10;

/**
 * The roles a reminder may ping. Deliberately a short list: the Command page
 * announces meetings to the department, not to arbitrary guild roles.
 */
export const REMINDER_ROLE_ALIASES = [
  "Supervisor",
  "DivisionalHead",
  "Employee",
] as const;

export type ReminderRoleAlias = (typeof REMINDER_ROLE_ALIASES)[number];

export function isReminderRoleAlias(
  value: unknown,
): value is ReminderRoleAlias {
  return (
    typeof value === "string" &&
    (REMINDER_ROLE_ALIASES as readonly string[]).includes(value)
  );
}

/** The units the page offers for "remind me this long before the meeting". */
export const REMINDER_LEAD_UNITS = [
  "minutes",
  "hours",
  "days",
  "weeks",
] as const;

export type ReminderLeadUnit = (typeof REMINDER_LEAD_UNITS)[number];

export function isReminderLeadUnit(
  value: unknown,
): value is ReminderLeadUnit {
  return (
    typeof value === "string" &&
    (REMINDER_LEAD_UNITS as readonly string[]).includes(value)
  );
}

export const REMINDER_LEAD_UNIT_MINUTES: Record<ReminderLeadUnit, number> = {
  minutes: 1,
  hours: 60,
  days: 1440,
  weeks: 10080,
};

/** A year ahead is enough for any meeting this page schedules. */
export const REMINDER_LEAD_MAX_MINUTES = 525_600;

export type ReminderStatus = "scheduled" | "sent" | "cancelled" | "failed";

export type ReminderAuthor = {
  discordId: string;
  name: string;
};

export type CommandReminder = {
  id: string;
  title: string;
  /**
   * The role to ping, by registry alias rather than snowflake: the mention is
   * resolved from `ROLES` when the message is built, so a renamed or re-id'd
   * role follows the registry instead of a copy stored months ago.
   */
  roleAlias: ReminderRoleAlias;
  /** When the meeting itself starts, in UTC (ISO). */
  eventAt: string;
  /** How many minutes before `eventAt` the reminder is posted. */
  remindBeforeMinutes: number;
  /** The moment to post, in UTC (ISO): `eventAt` minus the lead time. */
  scheduledFor: string;
  /** Always `REMINDER_TIME_ZONE`; kept so stored reminders keep their shape. */
  timeZone: string;
  status: ReminderStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: ReminderAuthor;
  sentAt?: string;
  discordMessageId?: string;
  /** How many times the cron has tried and failed. */
  attempts: number;
  lastError?: string;
};

const REMINDER_STATUSES: readonly ReminderStatus[] = [
  "scheduled",
  "sent",
  "cancelled",
  "failed",
];

export function isReminderStatus(value: unknown): value is ReminderStatus {
  return (
    typeof value === "string" &&
    (REMINDER_STATUSES as readonly string[]).includes(value)
  );
}

/** The registry's display name for a reminder's role, falling back to the alias. */
export function reminderRoleName(alias: ReminderRoleAlias): string {
  return ROLES[alias]?.name ?? alias;
}

/**
 * What the webhook posts for a reminder, or `null` when the role no longer
 * resolves to a Discord id.
 *
 * `allowed_mentions.roles` is what makes the ping actually notify: a webhook
 * that mentions a role without it renders the mention and stays silent. The
 * parse list stays empty so nothing else in the text can ever become a ping.
 */
export function reminderWebhookPayload(reminder: CommandReminder): {
  content: string;
  allowed_mentions: { parse: string[]; roles: string[] };
} | null {
  const roleId = ROLES[reminder.roleAlias]?.id;
  if (!roleId) return null;

  const when = new Date(reminder.eventAt);
  if (Number.isNaN(when.getTime())) return null;
  const unix = Math.floor(when.getTime() / 1000);

  return {
    content: [
      `Hey <@&${roleId}>! Reminder for the meeting: **${reminder.title}**`,
      // Discord renders this in every reader's own timezone, which is what keeps
      // one stored UTC moment readable to a department spread across zones.
      `Meeting starts <t:${unix}:F> (<t:${unix}:R>)`,
    ].join("\n"),
    allowed_mentions: { parse: [], roles: [roleId] },
  };
}

/** Whether the cron should post this reminder now. */
export function isReminderDue(
  reminder: CommandReminder,
  now: number = Date.now(),
): boolean {
  if (reminder.status !== "scheduled") return false;
  // A reminder that has a Discord receipt has been posted. This is a second
  // guard on the status: a stale write must never make an old post due again.
  if (reminder.sentAt || reminder.discordMessageId) return false;
  const when = new Date(reminder.scheduledFor).getTime();
  return Number.isFinite(when) && when <= now;
}

function readString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function readTimestamp(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return Number.isNaN(new Date(value).getTime()) ? null : value;
}

function readAuthor(value: unknown): ReminderAuthor | null {
  if (!value || typeof value !== "object") return null;
  const author = value as Record<string, unknown>;
  if (typeof author.discordId !== "string" || typeof author.name !== "string") {
    return null;
  }
  return { discordId: author.discordId, name: author.name };
}

function parseStoredReminder(value: unknown): CommandReminder | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;

  const id = readString(raw.id, 64);
  const title = readString(raw.title, REMINDER_TITLE_MAX);
  const roleAlias = isReminderRoleAlias(raw.roleAlias)
    ? raw.roleAlias
    : null;
  const scheduledFor = readTimestamp(raw.scheduledFor);
  // A reminder stored before the lead time existed still has a moment to post;
  // read it as an event with no lead rather than dropping it.
  const eventAt =
    readTimestamp(raw.eventAt) ?? scheduledFor;
  const remindBeforeMinutes =
    typeof raw.remindBeforeMinutes === "number" &&
    Number.isFinite(raw.remindBeforeMinutes)
      ? Math.max(0, Math.floor(raw.remindBeforeMinutes))
      : 0;
  const createdAt = readTimestamp(raw.createdAt);
  const updatedAt = readTimestamp(raw.updatedAt);
  const createdBy = readAuthor(raw.createdBy);
  if (
    !id ||
    !title ||
    !roleAlias ||
    !scheduledFor ||
    !eventAt ||
    !isReminderStatus(raw.status) ||
    !createdAt ||
    !updatedAt ||
    !createdBy
  ) {
    return null;
  }

  const reminder: CommandReminder = {
    id,
    title,
    roleAlias,
    eventAt,
    remindBeforeMinutes,
    scheduledFor,
    // Older records kept the zone they were typed in; their eventAt is still
    // one absolute instant, so read them as UTC from now on.
    timeZone: REMINDER_TIME_ZONE,
    status: raw.status,
    createdAt,
    updatedAt,
    createdBy,
    attempts:
      typeof raw.attempts === "number" && Number.isFinite(raw.attempts)
        ? Math.max(0, Math.floor(raw.attempts))
        : 0,
  };

  if (typeof raw.sentAt === "string" && readTimestamp(raw.sentAt)) {
    reminder.sentAt = raw.sentAt;
  }
  if (typeof raw.discordMessageId === "string") {
    reminder.discordMessageId = raw.discordMessageId;
  }
  if (typeof raw.lastError === "string") {
    reminder.lastError = raw.lastError.slice(0, 300);
  }
  // A stored receipt is proof the post happened. If a stale write put the
  // status back to scheduled, trust the receipt so the cron cannot post it a
  // second time.
  if (reminder.sentAt || reminder.discordMessageId) reminder.status = "sent";

  return reminder;
}

/**
 * Read an untrusted value (the store item) as a reminder list.
 *
 * Returns `null` when the item is not a list at all, which is the signal that
 * the store holds something this build cannot use and must not overwrite.
 * Individual unreadable entries are dropped and counted rather than failing the
 * whole list, so one corrupt row cannot hide every other reminder.
 */
export function sanitizeReminders(
  value: unknown,
): { reminders: CommandReminder[]; dropped: number } | null {
  if (!Array.isArray(value)) return null;

  const reminders: CommandReminder[] = [];
  const seen = new Set<string>();
  let dropped = 0;
  for (const item of value) {
    const parsed = parseStoredReminder(item);
    if (!parsed) {
      dropped += 1;
      continue;
    }
    if (seen.has(parsed.id)) {
      dropped += 1;
      continue;
    }
    seen.add(parsed.id);
    reminders.push(parsed);
  }
  return { reminders, dropped };
}
