"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TimezoneSelect from "react-timezone-select";
import {
  CalendarDays,
  Copy,
  Check,
  Globe,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import {
  getCurrentUTCTime,
  weekdays,
  type AvailabilityInput,
} from "@/app/helpers/timeUtils";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, PageSection, StatTile } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { WeekdayRow } from "./components/WeekdayRow";
import { analyzeWeek, buildUtcBlock } from "./lib/analyze-availability";

const EMPTY_WEEK = weekdays.reduce(
  (acc, day) => ({ ...acc, [day]: "" }),
  {} as AvailabilityInput,
);

/**
 * Availability.
 *
 * Designed around the one thing this page is for: telling the department when
 * you are around, in UTC. So the shape follows the task rather than the usual
 * page template - the whole week is visible at once, each day states what it
 * will post, the converted block is built live beside it, and the copyable
 * result is never more than one click away.
 */
export default function AvailabilityPage() {
  const [timezone, setTimezone] = useState("UTC");
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);
  // Once the member picks a zone by hand, a late detection must not overwrite it.
  const timezoneChanged = useRef(false);

  const [availability, setAvailability] = useLocalStorage<AvailabilityInput>(
    "availability",
    EMPTY_WEEK,
  );
  const [copied, setCopied] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDetectedTimezone(zone);
    if (!timezoneChanged.current) setTimezone(zone);
  }, []);

  const week = useMemo(
    () => analyzeWeek(availability, timezone),
    [availability, timezone],
  );
  const output = useMemo(
    () => buildUtcBlock(availability, timezone),
    [availability, timezone],
  );

  const setDay = useCallback(
    (day: (typeof weekdays)[number], value: string) => {
      setAvailability((previous) => ({ ...previous, [day]: value }));
    },
    [setAvailability],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be refused; the block is selectable either way.
    }
  }, [output]);

  const isDetected = detectedTimezone !== null && detectedTimezone === timezone;
  const utcNow = getCurrentUTCTime();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="LSEMS Resources"
        title="Availability"
        subtitle="Set the hours you are around each day and copy the block already converted to UTC."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setClearOpen(true)}
              disabled={!week.hasAnything}
            >
              <Trash2 className="h-4 w-4" />
              Clear week
            </Button>
            <Button onClick={handleCopy} disabled={!week.hasAnything}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy UTC block"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start">
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatTile
              icon={CalendarDays}
              label="Days set"
              value={`${week.daysSet} / 7`}
              hint={
                week.daysSet === 0
                  ? "No day has an hour yet"
                  : `${7 - week.daysSet} left blank`
              }
            />
            <StatTile
              icon={Globe}
              label="Current UTC"
              value={utcNow}
            />
          </div>

          {week.unreadableDays.length > 0 && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/5 px-4 py-3"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {week.unreadableDays.join(", ")}
                </span>{" "}
                {week.unreadableDays.length === 1 ? "has" : "have"} text with no
                time in it. Those lines copy through unchanged, so write the
                hours as HH:MM to convert them.
              </p>
            </div>
          )}

          <PageSection
            title="Your week"
            description="Write your local hours. Anything from a single range to two ranges per day works."
            action={
              <div className="flex items-center gap-2">
                {isDetected && (
                  <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary ring-1 ring-inset ring-primary/20">
                    Detected
                  </span>
                )}
                {!isDetected && detectedTimezone && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      timezoneChanged.current = false;
                      setTimezone(detectedTimezone);
                    }}
                  >
                    Use {detectedTimezone}
                  </Button>
                )}
              </div>
            }
          >
            <div className="mb-4 max-w-sm">
              <Label
                htmlFor="availability-timezone"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Your timezone
              </Label>
              <div className="mt-1.5">
                <TimezoneSelect
                  id="availability-timezone"
                  value={{ value: timezone, label: timezone }}
                  onChange={(zone) => {
                    timezoneChanged.current = true;
                    setTimezone(
                      typeof zone === "string" ? zone : zone.value,
                    );
                  }}
                  // Colours come from the theme, not from a second hardcoded
                  // palette: the old inline slate values ignored the tokens.
                  styles={{
                    // `cursor` is set here rather than left to the app-wide
                    // rule: react-select styles its own parts, and those beat
                    // a base-layer rule, so this control was the one clickable
                    // thing in the app still showing an arrow.
                    control: (base) => ({
                      ...base,
                      backgroundColor: "var(--input)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      minHeight: 36,
                      boxShadow: "none",
                      cursor: "pointer",
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "var(--foreground)",
                      cursor: "pointer",
                    }),
                    input: (base) => ({
                      ...base,
                      color: "var(--foreground)",
                      cursor: "pointer",
                    }),
                    indicatorsContainer: (base) => ({
                      ...base,
                      cursor: "pointer",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused
                        ? "var(--surface-hover)"
                        : "var(--popover)",
                      color: "var(--foreground)",
                      cursor: "pointer",
                    }),
                    menuList: (base) => ({ ...base, cursor: "pointer" }),
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Times are converted from this zone to UTC.
              </p>
            </div>

            <div className="space-y-2">
              {weekdays.map((day) => (
                <WeekdayRow
                  key={day}
                  day={day}
                  analysis={week.days[day]}
                  onChange={(value) => setDay(day, value)}
                />
              ))}
            </div>
          </PageSection>
        </div>

        <aside className="space-y-3 xl:sticky xl:top-8">
          <PageSection
            title="Copyable block"
            description="Updates as you type."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                disabled={!week.hasAnything}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            }
          >
            {week.hasAnything ? (
              <pre
                aria-label="Availability block converted to UTC"
                className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-4 font-mono text-xs leading-relaxed text-foreground"
              >
                {output}
              </pre>
            ) : (
              <EmptyState
                icon={Copy}
                title="Nothing to copy yet"
                description="Set an hour on any day and the UTC block appears here."
              />
            )}
            {/* Announced rather than only shown, so a screen reader hears the copy. */}
            <p aria-live="polite" className="sr-only">
              {copied ? "Availability block copied to clipboard" : ""}
            </p>
          </PageSection>
        </aside>
      </div>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear the whole week?</DialogTitle>
            <DialogDescription>
              Every day loses its hours and cannot be recovered.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setClearOpen(false)}>
              Keep my week
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setAvailability(EMPTY_WEEK);
                setCopied(false);
                setClearOpen(false);
              }}
            >
              Clear week
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
