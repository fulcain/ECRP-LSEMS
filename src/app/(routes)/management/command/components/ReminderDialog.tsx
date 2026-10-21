"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { CalendarClock, Send } from "lucide-react";
import { toast } from "react-toastify";

import {
  BuilderField,
  BuilderRequirement,
  BuilderSection,
} from "@/components/builder/builder-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  REMINDER_LEAD_UNITS,
  REMINDER_LEAD_UNIT_MINUTES,
  REMINDER_ROLE_ALIASES,
  REMINDER_TIME_ZONE,
  REMINDER_TITLE,
  type CommandReminder,
  type ReminderLeadUnit,
  type ReminderRoleAlias,
} from "@/configs/command-reminders";
import { ROLES } from "@/configs/roles";

const REMINDER_ROLE_NAMES = REMINDER_ROLE_ALIASES.map(
  (alias) => ROLES[alias].name,
);

export type ReminderDialogMode =
  | { kind: "create" }
  | { kind: "edit"; reminder: CommandReminder };

type ReminderDialogProps = {
  mode: ReminderDialogMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (reminders: CommandReminder[]) => void;
  /** The store is configured and writable; the form cannot post otherwise. */
  enabled: boolean;
};

/** Split a stored minute count into the largest whole unit that fits. */
function leadParts(minutes: number): {
  value: string;
  unit: ReminderLeadUnit;
} {
  if (minutes > 0 && minutes % REMINDER_LEAD_UNIT_MINUTES.weeks === 0) {
    return { value: String(minutes / REMINDER_LEAD_UNIT_MINUTES.weeks), unit: "weeks" };
  }
  if (minutes > 0 && minutes % REMINDER_LEAD_UNIT_MINUTES.days === 0) {
    return { value: String(minutes / REMINDER_LEAD_UNIT_MINUTES.days), unit: "days" };
  }
  if (minutes > 0 && minutes % REMINDER_LEAD_UNIT_MINUTES.hours === 0) {
    return { value: String(minutes / REMINDER_LEAD_UNIT_MINUTES.hours), unit: "hours" };
  }
  return { value: String(minutes), unit: "minutes" };
}

const UNIT_LABEL: Record<ReminderLeadUnit, string> = {
  minutes: "minutes",
  hours: "hours",
  days: "days",
  weeks: "weeks",
};

/**
 * The one form a reminder is written in, for both a new one and an edit.
 *
 * The meeting is typed in UTC and the page sends the event plus the lead time;
 * the server turns that into the one instant both the list and the cron use.
 * The browser's own zone is only read back for the "your time" line, so a
 * member still sees when the meeting is for them without the form offering a
 * second, ambiguous clock to type into.
 */
export function ReminderDialog({
  mode,
  open,
  onOpenChange,
  onSaved,
  enabled,
}: ReminderDialogProps) {
  const editing = mode.kind === "edit" ? mode.reminder : null;

  const [roleAlias, setRoleAlias] = useState<ReminderRoleAlias | "">(
    editing?.roleAlias ?? REMINDER_ROLE_ALIASES[0],
  );
  const [localTimeZone, setLocalTimeZone] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [remindBefore, setRemindBefore] = useState("1");
  const [remindUnit, setRemindUnit] = useState<ReminderLeadUnit>("hours");
  const [saving, setSaving] = useState(false);
  // State is not synchronous: two submits in one render could both see
  // `saving === false` and create two reminders. The ref closes that gap.
  const savingRef = useRef(false);

  // A new reminder opens tomorrow at the same UTC time, with an hour's notice.
  // The browser's zone is read after mount only for display, which keeps the
  // server-rendered form stable and avoids a hydration mismatch.
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setLocalTimeZone(detected);

    if (editing) {
      setEventDate(
        formatInTimeZone(
          new Date(editing.eventAt),
          REMINDER_TIME_ZONE,
          "yyyy-MM-dd",
        ),
      );
      setEventTime(
        formatInTimeZone(new Date(editing.eventAt), REMINDER_TIME_ZONE, "HH:mm"),
      );
      const lead = leadParts(editing.remindBeforeMinutes);
      setRemindBefore(lead.value);
      setRemindUnit(lead.unit);
      return;
    }

    const next = new Date(Date.now() + 24 * 60 * 60 * 1000);
    setEventDate(formatInTimeZone(next, REMINDER_TIME_ZONE, "yyyy-MM-dd"));
    setEventTime(formatInTimeZone(next, REMINDER_TIME_ZONE, "HH:mm"));
  }, [editing]);

  const preview = useMemo(() => {
    if (!eventDate || !eventTime || remindBefore.trim() === "") return null;
    const amount = Number(remindBefore);
    if (!Number.isFinite(amount) || amount < 0 || !Number.isInteger(amount)) {
      return null;
    }

    try {
      const event = fromZonedTime(
        `${eventDate}T${eventTime}:00`,
        REMINDER_TIME_ZONE,
      );
      if (Number.isNaN(event.getTime())) return null;
      // A date the calendar does not have (31 February) is rolled forward by
      // the parser, so compare UTC's date back to the typed one.
      if (
        formatInTimeZone(event, REMINDER_TIME_ZONE, "yyyy-MM-dd") !== eventDate
      ) {
        return null;
      }

      const scheduled = new Date(
        event.getTime() -
          amount * REMINDER_LEAD_UNIT_MINUTES[remindUnit] * 60_000,
      );
      const now = Date.now();

      return {
        event: formatInTimeZone(
          event,
          REMINDER_TIME_ZONE,
          "EEE d MMM yyyy 'at' HH:mm",
        ),
        scheduled: formatInTimeZone(
          scheduled,
          REMINDER_TIME_ZONE,
          "EEE d MMM yyyy 'at' HH:mm",
        ),
        local: localTimeZone
          ? formatInTimeZone(event, localTimeZone, "EEE d MMM yyyy 'at' HH:mm")
          : null,
        localScheduled: localTimeZone
          ? formatInTimeZone(
              scheduled,
              localTimeZone,
              "EEE d MMM yyyy 'at' HH:mm",
            )
          : null,
        eventPassed: event.getTime() < now - 60_000,
        passed: scheduled.getTime() < now - 60_000,
      };
    } catch {
      return null;
    }
  }, [eventDate, eventTime, localTimeZone, remindBefore, remindUnit]);

  const ready =
    enabled &&
    roleAlias !== "" &&
    preview !== null &&
    !preview.passed &&
    !preview.eventPassed;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready || savingRef.current) return;

    savingRef.current = true;
    setSaving(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editing ? "update" : "create",
          id: editing?.id,
          expectedUpdatedAt: editing?.updatedAt,
          roleAlias,
          eventDate,
          eventTime,
          timeZone: REMINDER_TIME_ZONE,
          remindBefore: Number(remindBefore),
          remindUnit,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        reminders?: CommandReminder[];
      };

      if (!res.ok || !data.success || !data.reminders) {
        toast.error(data.error ?? "Could not save the reminder.", {
          autoClose: 8000,
        });
        return;
      }

      toast.success(editing ? "Reminder updated." : "Reminder scheduled.");
      onSaved(data.reminders);
      onOpenChange(false);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            {editing ? "Edit reminder" : "New meeting reminder"}
          </DialogTitle>
          <DialogDescription>
            Choose when the meeting is and how long before it to remind. The
            reminder is posted to the supervisor reminders channel, pinging the
            Supervisor role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <BuilderSection
            icon={CalendarClock}
            title="What is the meeting?"
            hint="The title is fixed for supervisor meetings; the role is who gets pinged."
          >
            <BuilderField label="Title">
              <p className="rounded-md border border-border bg-surface/40 px-3 py-2 text-sm font-medium text-foreground">
                {REMINDER_TITLE}
              </p>
            </BuilderField>

            <BuilderField
              label="Role to ping"
              hint={`Only the ${REMINDER_ROLE_NAMES.join(", ")} role${
                REMINDER_ROLE_NAMES.length === 1 ? "" : "s"
              } can be pinged.`}
            >
              <Select
                value={roleAlias || undefined}
                onValueChange={(value) =>
                  setRoleAlias(value as ReminderRoleAlias)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_ROLE_ALIASES.map((alias) => (
                    <SelectItem key={alias} value={alias}>
                      {ROLES[alias].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </BuilderField>
          </BuilderSection>

          <BuilderSection
            icon={CalendarClock}
            title="When is the meeting?"
            hint="Enter the meeting in UTC. The app shows your own time beside it; Discord shows each reader the moment in their timezone."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <BuilderField label="Meeting date (UTC)" htmlFor="reminder-date">
                <Input
                  id="reminder-date"
                  type="date"
                  value={eventDate}
                  onChange={(event) => setEventDate(event.target.value)}
                  required
                />
              </BuilderField>
              <BuilderField label="Meeting time (UTC)" htmlFor="reminder-time">
                <Input
                  id="reminder-time"
                  type="time"
                  value={eventTime}
                  onChange={(event) => setEventTime(event.target.value)}
                  required
                />
              </BuilderField>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
              <BuilderField
                label="Remind before the meeting"
                htmlFor="reminder-lead"
              >
                <Input
                  id="reminder-lead"
                  type="number"
                  min={0}
                  max={100000}
                  step={1}
                  inputMode="numeric"
                  value={remindBefore}
                  onChange={(event) => setRemindBefore(event.target.value)}
                  required
                />
              </BuilderField>
              <BuilderField label="Unit">
                <Select
                  value={remindUnit}
                  onValueChange={(value) =>
                    setRemindUnit(value as ReminderLeadUnit)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_LEAD_UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {UNIT_LABEL[unit]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </BuilderField>
            </div>

            {preview && (
              <div
                className={cn(
                  "space-y-1 rounded-lg border px-3 py-2 text-xs",
                  preview.passed || preview.eventPassed
                    ? "border-destructive/30 bg-destructive/5 text-destructive"
                    : "border-border bg-surface/40 text-muted-foreground",
                )}
              >
                <p>
                  <span className="font-medium text-foreground">
                    Meeting (UTC):
                  </span>{" "}
                  {preview.event}
                </p>
                {preview.local && (
                  <p>
                    <span className="font-medium text-foreground">
                      Your time:
                    </span>{" "}
                    {preview.local} ({localTimeZone})
                  </p>
                )}
                <p>
                  <span className="font-medium text-foreground">
                    Reminder posts (UTC):
                  </span>{" "}
                  {preview.scheduled}
                </p>
                {preview.localScheduled && (
                  <p>
                    <span className="font-medium text-foreground">
                      Your time:
                    </span>{" "}
                    {preview.localScheduled} ({localTimeZone})
                  </p>
                )}
                {preview.eventPassed && (
                  <p>That meeting time has already passed.</p>
                )}
                {!preview.eventPassed && preview.passed && (
                  <p>That reminder time has already passed.</p>
                )}
              </div>
            )}
          </BuilderSection>

          {!enabled && (
            <BuilderRequirement>
              The reminder store is not writable from this deployment, so
              nothing can be saved yet.
            </BuilderRequirement>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!ready || saving}>
              <Send className="h-4 w-4" />
              {saving
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Schedule reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
