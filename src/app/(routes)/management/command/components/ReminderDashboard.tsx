"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { formatDistanceToNow } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import {
  AlertTriangle,
  AtSign,
  Ban,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Globe2,
  Megaphone,
  Pencil,
  RefreshCw,
  Send,
  ShieldAlert,
  Timer,
  Trash2,
  Webhook,
} from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmptyState,
  PageSection,
  StatTile,
} from "@/components/ui/surface";
import {
  REMINDER_MAX_ATTEMPTS,
  REMINDER_TIME_ZONE,
  reminderRoleName,
  type CommandReminder,
  type ReminderStatus,
} from "@/configs/command-reminders";
import type { GlobalConfigWriteAccess } from "@/lib/global-config-store";
import { cn } from "@/lib/utils";
import {
  ReminderDialog,
  type ReminderDialogMode,
} from "./ReminderDialog";

type ReminderDashboardProps = {
  initialReminders: CommandReminder[];
  initialError: string | null;
  storeConfigured: boolean;
  storeWritable: boolean;
  writeAccess: GlobalConfigWriteAccess;
  webhookConfigured: boolean;
  cronConfigured: boolean;
};

type Filter = "all" | ReminderStatus;

const STATUS_ORDER: Record<ReminderStatus, number> = {
  scheduled: 0,
  failed: 1,
  cancelled: 2,
  sent: 3,
};

const STATUS_META: Record<
  ReminderStatus,
  {
    label: string;
    variant: "default" | "muted" | "success" | "warning";
    icon: ComponentType<{ className?: string }>;
  }
> = {
  scheduled: { label: "Scheduled", variant: "default", icon: Clock3 },
  sent: { label: "Sent", variant: "success", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", variant: "muted", icon: Ban },
  failed: { label: "Needs attention", variant: "warning", icon: AlertTriangle },
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "scheduled", label: "Scheduled" },
  { key: "sent", label: "Sent" },
  { key: "failed", label: "Needs attention" },
  { key: "cancelled", label: "Cancelled" },
];

function meetingTime(reminder: CommandReminder, timeZone: string): string {
  return formatInTimeZone(
    new Date(reminder.eventAt),
    timeZone,
    "EEE d MMM yyyy 'at' HH:mm",
  );
}

function leadLabel(minutes: number): string {
  if (minutes === 0) return "At the meeting time";
  const plural = (value: number, unit: string) =>
    `${value} ${unit}${value === 1 ? "" : "s"} before`;
  if (minutes % 10080 === 0) return plural(minutes / 10080, "week");
  if (minutes % 1440 === 0) return plural(minutes / 1440, "day");
  if (minutes % 60 === 0) return plural(minutes / 60, "hour");
  return plural(minutes, "minute");
}

function relativeTime(reminder: CommandReminder): string {
  if (reminder.status === "sent") {
    // A receipt without a timestamp is still a sent reminder; falling through
    // would label it "Due ..." even though it will never be posted again.
    return `Sent ${formatDistanceToNow(
      new Date(reminder.sentAt ?? reminder.updatedAt),
      { addSuffix: true },
    )}`;
  }
  if (reminder.status === "failed") {
    return `Last attempt ${formatDistanceToNow(new Date(reminder.updatedAt), {
      addSuffix: true,
    })}`;
  }
  if (reminder.status === "cancelled") {
    return `Was due ${formatDistanceToNow(new Date(reminder.scheduledFor), {
      addSuffix: true,
    })}`;
  }
  return `Due ${formatDistanceToNow(new Date(reminder.scheduledFor), {
    addSuffix: true,
  })}`;
}

/**
 * The Command page's working list.
 *
 * The server renders the first list so the page never flashes an empty state;
 * every action replaces it with the list the API returns, which is the same
 * list the store now holds. A conflict response carries the current list too,
 * so a lost edit is corrected on screen rather than only reported in a toast.
 */
export function ReminderDashboard({
  initialReminders,
  initialError,
  storeConfigured,
  storeWritable,
  writeAccess,
  webhookConfigured,
  cronConfigured,
}: ReminderDashboardProps) {
  const [reminders, setReminders] = useState(initialReminders);
  const [error, setError] = useState(initialError);
  const [dialog, setDialog] = useState<ReminderDialogMode | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState<string | null>(null);
  // A ref, not the state above, because one click can become two events before
  // React renders the disabled button. Two "Send now" events would post twice.
  const busyRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pending, setPending] = useState<
    { kind: "send" | "delete"; reminder: CommandReminder } | null
  >(null);
  const [now, setNow] = useState<number | null>(null);
  const [localTimeZone, setLocalTimeZone] = useState<string | null>(null);

  // Relative labels and the "your time" zone are read after mount so the
  // server and the browser do not disagree about "in 2 minutes" or about which
  // zone the reader is in, and refreshed on a slow tick while the page stays
  // open.
  useEffect(() => {
    setLocalTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const writeBlockedReason = !storeConfigured
    ? "No reminder store is configured on this deployment, so the list cannot be read or saved."
    : !storeWritable
      ? "This deployment cannot write reminders. Set VERCEL_API_TOKEN and GLOBAL_CONFIG_ID, or run it on a Vercel project with Global Config write access."
      : writeAccess === "unauthorized"
        ? "Vercel rejected the write token. The list is readable, but nothing can be saved until VERCEL_API_TOKEN is replaced with one that may write this config."
        : null;

  const enabled = writeBlockedReason === null;

  const counts = useMemo(() => {
    return reminders.reduce(
      (result, reminder) => {
        result[reminder.status] += 1;
        return result;
      },
      { scheduled: 0, sent: 0, failed: 0, cancelled: 0 } as Record<
        ReminderStatus,
        number
      >,
    );
  }, [reminders]);

  const visible = useMemo(() => {
    return reminders
      .filter((reminder) => filter === "all" || reminder.status === filter)
      .sort((a, b) => {
        if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) {
          return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        }
        const aTime = new Date(a.scheduledFor).getTime();
        const bTime = new Date(b.scheduledFor).getTime();
        return a.status === "scheduled" ? aTime - bTime : bTime - aTime;
      });
  }, [reminders, filter]);

  async function runAction(
    action: "cancel" | "send" | "delete",
    reminder: CommandReminder,
    success: string,
  ): Promise<void> {
    if (busyRef.current) return;
    busyRef.current = true;
    const key = `${reminder.id}:${action}`;
    setBusy(key);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id: reminder.id }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        reminders?: CommandReminder[];
      };

      if (data.reminders) setReminders(data.reminders);

      if (!res.ok || !data.success) {
        toast.error(data.error ?? "The reminder could not be updated.", {
          autoClose: 8000,
        });
        return;
      }

      setError(null);
      toast.success(success);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  }

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/reminders", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        reminders?: CommandReminder[];
      };
      if (!res.ok || !data.success || !data.reminders) {
        toast.error(data.error ?? "Could not reload the reminders.");
        return;
      }
      setReminders(data.reminders);
      setError(null);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setRefreshing(false);
    }
  }

  async function confirmPending() {
    if (!pending) return;
    const { kind, reminder } = pending;
    setPending(null);
    if (kind === "send") {
      await runAction("send", reminder, "Reminder sent.");
    } else {
      await runAction("delete", reminder, "Reminder deleted.");
    }
  }

  function openCreate() {
    setDialog({ kind: "create" });
  }

  return (
    <>
      <div className="space-y-5">
        {writeBlockedReason && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-300/40 bg-amber-50/70 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{writeBlockedReason}</p>
          </div>
        )}

        {!webhookConfigured && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-300/40 bg-amber-50/70 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <Webhook className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <span className="font-medium">DISCORD_REMINDER_WEBHOOK_URL is
              not set or is not a valid URL.</span>{" "}
              Reminders can be scheduled, but nothing will reach Discord until
              the webhook is configured.
            </p>
          </div>
        )}

        {!cronConfigured && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-300/40 bg-amber-50/70 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <Timer className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <span className="font-medium">CRON_SECRET is not set.</span>{" "}
              The dispatch endpoint refuses to run without it, so scheduled
              reminders will not be posted automatically.
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Scheduled"
            value={counts.scheduled}
            hint="Waiting for their time"
            icon={CalendarClock}
            tone="default"
          />
          <StatTile
            label="Sent"
            value={counts.sent}
            hint="Already posted"
            icon={CheckCircle2}
            tone="success"
          />
          <StatTile
            label="Needs attention"
            value={counts.failed}
            hint="Could not be sent"
            icon={AlertTriangle}
            tone={counts.failed > 0 ? "warning" : "default"}
          />
          <StatTile
            label="Cancelled"
            value={counts.cancelled}
            hint="Kept for the record"
            icon={Ban}
            tone="default"
          />
        </div>

        <PageSection
          title="Meeting reminders"
          description="Each reminder is posted the chosen lead time before its meeting, within a minute of that moment. Meetings are entered and stored in UTC; your own time is shown beside each one."
          action={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={openCreate}
                disabled={!enabled}
              >
                <CalendarPlus />
                New reminder
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={refresh}
                loading={refreshing}
                disabled={!storeConfigured}
                aria-label="Reload reminders"
                title="Reload reminders"
              >
                <RefreshCw />
              </Button>
            </div>
          }
        >
          {reminders.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {FILTERS.map((entry) => {
                const count =
                  entry.key === "all" ? reminders.length : counts[entry.key];
                return (
                  <Button
                    key={entry.key}
                    type="button"
                    size="sm"
                    variant={filter === entry.key ? "secondary" : "ghost"}
                    onClick={() => setFilter(entry.key)}
                  >
                    {entry.label}
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </Button>
                );
              })}
            </div>
          )}

          {reminders.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No reminders yet"
              description="Schedule the next meeting and the role you pick will be pinged when the time comes."
              action={
                <Button type="button" size="sm" onClick={openCreate} disabled={!enabled}>
                  <CalendarPlus />
                  Schedule the first reminder
                </Button>
              }
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="Nothing in this filter"
              description="Try another status, or schedule a new reminder."
            />
          ) : (
            <div className="space-y-3">
              {visible.map((reminder) => {
                const meta = STATUS_META[reminder.status];
                const StatusIcon = meta.icon;
                const busyHere = busy?.startsWith(`${reminder.id}:`) ?? false;
                const canEdit = reminder.status !== "sent";
                const canSend =
                  reminder.status !== "sent" && webhookConfigured && enabled;
                const canCancel = reminder.status === "scheduled";

                return (
                  <article
                    key={reminder.id}
                    className={cn(
                      "rounded-xl border border-border bg-surface-raised/60 p-4",
                      busyHere && "opacity-70",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">
                            {reminder.title}
                          </h3>
                          <Badge variant={meta.variant}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {meta.label}
                          </Badge>
                        </div>
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <AtSign className="h-3 w-3" />
                            {reminderRoleName(reminder.roleAlias)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />
                            Meeting {meetingTime(reminder, REMINDER_TIME_ZONE)}{" "}
                            ({REMINDER_TIME_ZONE})
                          </span>
                          {localTimeZone && (
                            <span className="inline-flex items-center gap-1">
                              <Globe2 className="h-3 w-3" />
                              Your time{" "}
                              {meetingTime(reminder, localTimeZone)} (
                              {localTimeZone})
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {leadLabel(reminder.remindBeforeMinutes)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3 w-3" />
                            {relativeTime(reminder)}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {canEdit && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setDialog({ kind: "edit", reminder })
                            }
                            disabled={!enabled || busy !== null}
                          >
                            <Pencil />
                            Edit
                          </Button>
                        )}
                        {reminder.status !== "sent" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setPending({ kind: "send", reminder })}
                            disabled={!canSend || busy !== null}
                          >
                            <Send />
                            Send now
                          </Button>
                        )}
                        {canCancel && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              runAction(
                                "cancel",
                                reminder,
                                "Reminder cancelled.",
                              )
                            }
                            disabled={!enabled || busy !== null}
                          >
                            <Ban />
                            Cancel
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setPending({ kind: "delete", reminder })}
                          disabled={!enabled || busy !== null}
                        >
                          <Trash2 />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {reminder.status === "failed" && reminder.lastError && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300/40 bg-amber-50/60 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p>
                          {reminder.lastError}{" "}
                          <span className="opacity-70">
                            ({reminder.attempts}/{REMINDER_MAX_ATTEMPTS}{" "}
                            attempts)
                          </span>
                        </p>
                      </div>
                    )}

                    <p className="mt-3 text-[10px] text-muted-foreground">
                      Scheduled by {reminder.createdBy.name}
                      {now !== null && (
                        <>
                          {" "}
                          - created{" "}
                          {formatDistanceToNow(new Date(reminder.createdAt), {
                            addSuffix: true,
                          })}
                        </>
                      )}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </PageSection>
      </div>

      {dialog && (
        <ReminderDialog
          key={dialog.kind === "edit" ? dialog.reminder.id : "new"}
          mode={dialog}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          onSaved={(next) => {
            setReminders(next);
            setError(null);
          }}
          enabled={enabled}
        />
      )}

      <Dialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pending?.kind === "send" ? "Send this now?" : "Delete this reminder?"}
            </DialogTitle>
            <DialogDescription>
              {pending?.kind === "send"
                ? `This posts "${pending.reminder.title}" to Discord immediately and pings ${reminderRoleName(pending.reminder.roleAlias)}. It cannot be unsent.`
                : pending
                  ? `"${pending.reminder.title}" is removed from the list. ${
                      pending.reminder.status === "sent"
                        ? "The Discord message already posted is not deleted."
                        : "It will not be sent."
                    }`
                  : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPending(null)}
            >
              {pending?.kind === "send" ? "Not yet" : "Keep it"}
            </Button>
            <Button
              type="button"
              variant={pending?.kind === "delete" ? "destructive" : "default"}
              onClick={confirmPending}
            >
              {pending?.kind === "send" ? (
                <>
                  <Send />
                  Send now
                </>
              ) : (
                <>
                  <Trash2 />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
