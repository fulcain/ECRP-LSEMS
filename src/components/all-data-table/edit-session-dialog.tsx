"use client";

import { useEffect, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
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
      toast.error("Fill all required fields", { theme: "dark" });
      return;
    }

    if (originalRowNumber == null) {
      toast.error(
        "Missing sheet row identifier - reload the table so the CSV index re-syncs.",
        { theme: "dark" },
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
        toast.success("FT session updated successfully", { theme: "dark" });
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
          `Something went wrong: ${result.error ?? result.raw ?? result.detail ?? JSON.stringify(result)}`,
          { theme: "dark" },
        );
      }
    } catch (err) {
      toast.error("Network error or Apps Script blocked", { theme: "dark" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

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
              <Label>Sheet Row</Label>
              <Input
                value={
                  originalRowNumber != null ? String(originalRowNumber) : "-"
                }
                readOnly
                disabled
                className="bg-muted/40 cursor-not-allowed text-muted-foreground font-mono"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Instructor&apos;s Name</Label>
              <Input
                placeholder="Enter instructor&apos;s name"
                value={form.yourName}
                onChange={(e) =>
                  setForm({ ...form, yourName: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Date</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
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
                <Label>Time Start (UTC)</Label>
                <Input
                  placeholder="Enter start time"
                  value={form.timeStart}
                  onChange={(e) =>
                    setForm({ ...form, timeStart: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Time Finish (UTC)</Label>
                <Input
                  placeholder="Enter finish time"
                  value={form.timeFinish}
                  onChange={(e) =>
                    setForm({ ...form, timeFinish: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>EMR&apos;s Name</Label>
              <Input
                placeholder="Enter EMR&apos;s name"
                value={form.emrName}
                onChange={(e) =>
                  setForm({ ...form, emrName: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Session Conducted</Label>
              <Input
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
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
