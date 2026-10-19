"use client";

import { useEffect, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "react-toastify";
import { NowTimeButton } from "@/components/now-time-button";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TableDataType } from "@/lib/types";
import {
  parseDate,
  formatDateForSheet,
  formatDisplayDate,
} from "@/lib/format-date";

interface EditSessionDialogProps {
  row: TableDataType | null;
  originalRowNumber: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setData: React.Dispatch<React.SetStateAction<TableDataType[]>>;
}

/**
 * Edit dialog for a single FT session row.
 *
 * Uses a calendar date-picker (not a free-text input) so the date format
 * is always correct. The sheet stores dates as `M/D/YYYY`.
 *
 * The Apps Script update handler locates the row by **sheet row number**
 * - sent as `originalRowNumber`. We also send `originalTimestamp` for
 * an optional sanity check.
 */
export function EditSessionDialog({
  row,
  originalRowNumber,
  open,
  onOpenChange,
  setData,
}: EditSessionDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // Selected date as a proper Date object (from the calendar picker).
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const [form, setForm] = useState({
    Timestamp: "",
    yourName: "",
    timeStart: "",
    timeFinish: "",
    emrName: "",
    sessionConducted: "",
  });

  // Parse the row's CSV date string into a Date when the dialog opens.
  useEffect(() => {
    if (!row) return;
    const rawDate = String(row["Date"] ?? "");
    setSelectedDate(parseDate(rawDate) ?? undefined);
    setForm({
      Timestamp: String(row["Timestamp"] ?? ""),
      yourName: String(row["Your Name"] ?? ""),
      timeStart: String(row["Time Start"] ?? ""),
      timeFinish: String(row["Time Finish"] ?? ""),
      emrName: String(row["EMR's Name"] ?? ""),
      sessionConducted: String(row["Session Conducted"] ?? ""),
    });
  }, [row]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!row) return;

    if (
      !form.yourName ||
      !selectedDate ||
      !form.timeStart ||
      !form.timeFinish ||
      !form.emrName ||
      !form.sessionConducted
    ) {
      toast.error("Fill all required fields");
      return;
    }

    if (originalRowNumber == null) {
      toast.error(
        "Missing sheet row identifier - reload the table so the CSV index re-syncs."
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/update-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalRowNumber: String(originalRowNumber),
          originalTimestamp: String(row["Timestamp"] ?? ""),
          yourName: form.yourName,
          date: formatDateForSheet(selectedDate),
          timeStart: form.timeStart,
          timeFinish: form.timeFinish,
          emrName: form.emrName,
          sessionConducted: form.sessionConducted,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("FT session updated successfully");
        const formattedDate = formatDisplayDate(selectedDate);
        const updatedRow: TableDataType = {
          ...row,
          "Date": formattedDate,
          "Your Name": form.yourName,
          "Time Start": form.timeStart,
          "Time Finish": form.timeFinish,
          "EMR's Name": form.emrName,
          "Session Conducted": form.sessionConducted,
        };
        setData((prev) =>
          prev.map((r) =>
            String(r["Timestamp"] ?? "") === String(row["Timestamp"] ?? "")
              ? updatedRow
              : r,
          ),
        );
        onOpenChange(false);
      } else {
        toast.error(
          `Something went wrong: ${result.error ?? result.raw ?? result.detail ?? JSON.stringify(result)}`
        );
      }
    } catch (err) {
      toast.error("Network error or Apps Script blocked");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit FT Session</DialogTitle>
            <DialogDescription>
              Update the fields for this FT session row.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-2">
              <Label htmlFor="session-sheet-row">Sheet Row</Label>
              <Input
                id="session-sheet-row"
                value={
                  originalRowNumber != null ? String(originalRowNumber) : "-"
                }
                readOnly
                disabled
                className="bg-muted/40 cursor-not-allowed text-muted-foreground font-mono"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="session-instructor-name">
                Instructor&apos;s Name
              </Label>
              <Input
                id="session-instructor-name"
                placeholder="Enter instructor&apos;s name"
                value={form.yourName}
                onChange={(e) =>
                  setForm({ ...form, yourName: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="session-date">Date</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="session-date"
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    {selectedDate
                      ? formatDisplayDate(selectedDate)
                      : "Pick a date"}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="session-time-start">Time Start (UTC)</Label>
                <div className="flex gap-2">
                  <Input
                    id="session-time-start"
                    placeholder="Enter start time"
                    value={form.timeStart}
                    onChange={(e) =>
                      setForm({ ...form, timeStart: e.target.value })
                    }
                  />
                  <NowTimeButton
                    onFill={(timeStart) => setForm({ ...form, timeStart })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="session-time-finish">Time Finish (UTC)</Label>
                <div className="flex gap-2">
                  <Input
                    id="session-time-finish"
                    placeholder="Enter finish time"
                    value={form.timeFinish}
                    onChange={(e) =>
                      setForm({ ...form, timeFinish: e.target.value })
                    }
                  />
                  <NowTimeButton
                    onFill={(timeFinish) => setForm({ ...form, timeFinish })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="session-emr-name">EMR&apos;s Name</Label>
              <Input
                id="session-emr-name"
                placeholder="Enter EMR&apos;s name"
                value={form.emrName}
                onChange={(e) =>
                  setForm({ ...form, emrName: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="session-conducted">Session Conducted</Label>
              <Input
                id="session-conducted"
                placeholder="What was conducted in this session?"
                value={form.sessionConducted}
                onChange={(e) =>
                  setForm({ ...form, sessionConducted: e.target.value })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
