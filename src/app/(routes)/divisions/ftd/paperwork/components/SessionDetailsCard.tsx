"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { formatDateForSheet } from "@/lib/format-date";
import { XCircle, RotateCcw } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { useSession } from "@/app/(routes)/divisions/ftd/paperwork/components/SessionContext";
import { formatTime12h } from "@/app/(routes)/divisions/ftd/paperwork/lib/formatTime";
import { sessions } from "@/constants/sessions";

/** Trainer/date/times/EMR/session inputs shared by both paperwork forms.
 *  (Civilian Ride-Along hides this card entirely at the parent level.) */
export function SessionDetailsCard() {
  const {
    details,
    setDetails,
    resolvedEMR,
    ftoNames,
    emrList,
  } = useSession();

  const [submitting, setSubmitting] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const [emrSearch, setEmrSearch] = useState("");
  const [dateOpen, setDateOpen] = useState(false);

  const update = (patch: Partial<typeof details>) =>
    setDetails((prev) => ({ ...prev, ...patch }));

  const isEmrSelected = details.emrName || details.emrNameManual;
  const isNameSelected = details.ftoName;

  const resetEMRSelection = () => {
    update({ emrName: "", emrNameManual: "" });
    setEmrSearch("");
    toast.info("EMR field cleared", { theme: "dark" });
  };

  const resetNameSelection = () => {
    update({ ftoName: "" });
    setNameSearch("");
    toast.info("Name field cleared", { theme: "dark" });
  };

  const handleTimeChange = (
    field: 'timeStart' | 'timeFinish',
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value;
    // Strip non-digit/colon and collapse repeated colons.
    const filtered = raw.replace(/[^\d:]/g, '').replace(/:+/g, ':');
    // Auto-insert colon after 2 digits if typing forward
    if (
      filtered.length === 2 &&
      !filtered.includes(':') &&
      details[field].length < 2
    ) {
      update({ [field]: filtered + ':' });
    } else {
      update({ [field]: filtered });
    }
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent non-numeric, non-colon, non-control keys
    if (e.key.length === 1 && !/[\d:]/.test(e.key)) {
      e.preventDefault();
    }
  };

  /** Clears every field that describes one session. The signature is the
   *  member's own, not the session's, so it survives both this and the reset
   *  that follows a successful save. */
  const resetSessionFields = () => {
    setDetails((prev) => ({
      ...prev,
      ftoName: "",
      date: undefined,
      timeStart: "",
      timeFinish: "",
      emrName: "",
      emrNameManual: "",
      sessionConducted: "",
    }));
    setNameSearch("");
    setEmrSearch("");
  };

  const clearAll = () => {
    resetSessionFields();
    toast.info("Session details cleared", { theme: "dark" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !details.ftoName ||
      !details.date ||
      !details.timeStart ||
      !details.timeFinish ||
      !resolvedEMR ||
      !details.sessionConducted
    ) {
      toast.error("Fill all the fields", { theme: "dark" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        yourName: details.ftoName,
        date: formatDateForSheet(details.date),
        timeStart: formatTime12h(details.timeStart),
        timeFinish: formatTime12h(details.timeFinish),
        emrName: resolvedEMR,
        sessionConducted: details.sessionConducted,
      };

      const res = await fetch("/api/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        // The session is saved, so the form is done with: clear it for the
        // next one. The toast is the only confirmation the user gets, so it
        // must not be the thing that vanishes.
        resetSessionFields();
        toast.success("Session created - details reset for the next one", {
          theme: "dark",
        });
      } else {
        toast.error("Something went wrong", { theme: "dark" });
      }
    } catch (err) {
      toast.error("Network error or Apps Script blocked", { theme: "dark" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* === Session Details Card === */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Session Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* === Presenter (FTO) === */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Your Name</Label>
              {isNameSelected && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetNameSelection}
                  className="h-7 px-2 text-muted-foreground hover:text-destructive gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  <span className="text-xs">Clear</span>
                </Button>
              )}
            </div>
            <Select
              value={details.ftoName}
              onValueChange={(v) => update({ ftoName: v })}
              onOpenChange={(open) => { if (!open) setNameSearch(""); }}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select your name" />
              </SelectTrigger>
              <SelectContent>
                {ftoNames.length === 0 ? (
                  <div className="p-2 cursor-pointer">
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                ) : (
                  <>
                    <div
                      className="p-2 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        placeholder="Search..."
                        value={nameSearch}
                        onChange={(e) => setNameSearch(e.target.value)}
                        className="mb-2"
                        autoFocus
                      />
                    </div>
                    {ftoNames
                      .filter((name) =>
                        name.toLowerCase().includes(nameSearch.toLowerCase()),
                      )
                      .map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* === Date & Time === */}
          <div className="flex flex-col gap-2">
            <Label>Date</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {details.date ? format(details.date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={details.date}
                  onSelect={(date) => {
                    update({ date: date ?? undefined });
                    setDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">
                Time Start ((UTC))<span className="opacity-60">(24h)</span>
              </Label>
              <Input
                placeholder="00:00"
                maxLength={5}
                value={details.timeStart}
                onChange={(e) => handleTimeChange('timeStart', e)}
                onKeyDown={handleTimeKeyDown}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">
                Time Finish ((UTC))<span className="opacity-60">(24h)</span>
              </Label>
              <Input
                placeholder="00:00"
                maxLength={5}
                value={details.timeFinish}
                onChange={(e) => handleTimeChange('timeFinish', e)}
                onKeyDown={handleTimeKeyDown}
              />
            </div>
          </div>

          {/* === Trainee (EMR) === */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>EMR&apos;s Name</Label>
              {isEmrSelected && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetEMRSelection}
                  className="h-7 px-2 text-muted-foreground hover:text-destructive gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  <span className="text-xs">Clear</span>
                </Button>
              )}
            </div>

            <Select
              value={details.emrName}
              onValueChange={(v) => {
                update({ emrName: v, emrNameManual: "" });
                setEmrSearch("");
              }}
              onOpenChange={(open) => { if (!open) setEmrSearch(""); }}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select EMR" />
              </SelectTrigger>
              <SelectContent>
                {emrList.length === 0 ? (
                  <div className="p-2 cursor-pointer">
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                ) : (
                  <>
                    <div
                      className="p-2 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        placeholder="Search EMR..."
                        value={emrSearch}
                        onChange={(e) => setEmrSearch(e.target.value)}
                        className="mb-2"
                        autoFocus
                      />
                    </div>
                    {emrList
                      .filter((emr) =>
                        emr.EMR.toLowerCase().includes(emrSearch.toLowerCase()),
                      )
                      .map((emr, idx) => (
                        <SelectItem key={`${emr.EMR}-${idx}`} value={emr.EMR}>
                          {emr.EMR}
                        </SelectItem>
                      ))}
                  </>
                )}
              </SelectContent>
            </Select>

            <div className="relative">
              <Input
                placeholder="Type EMR name manually"
                value={details.emrNameManual}
                onChange={(e) =>
                  update({ emrNameManual: e.target.value, emrName: "" })
                }
                className={details.emrNameManual ? "pr-8" : ""}
              />
              {details.emrNameManual && (
                <button
                  type="button"
                  onClick={() => update({ emrNameManual: "" })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>

            {isEmrSelected && (
              <p className="text-xs text-muted-foreground">
                Selected: {resolvedEMR}
                {details.emrName && " (from list)"}
                {details.emrNameManual && " (manual entry)"}
              </p>
            )}
          </div>

          {/* === Session Conducted === */}
          <div className="flex flex-col gap-2">
            <Label>Session Conducted</Label>
            <Select
              value={details.sessionConducted}
              onValueChange={(v) => update({ sessionConducted: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* === Actions === */}
          <div className="flex gap-2 pt-2 items-center">
            <Button type="submit" disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Saving..." : "Create Session"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={clearAll}
              aria-label="Clear the session details"
              title="Clear the session details"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
