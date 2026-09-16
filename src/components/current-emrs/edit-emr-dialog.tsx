"use client";

import { useEffect, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  formatDisplayDate,
} from "@/lib/format-date";

interface EditEMRDialogProps {
  row: TableDataType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setData: React.Dispatch<React.SetStateAction<TableDataType[]>>;
}

// Normalize the sheet's "TRUE"/"FALSE" strings into booleans for the checkbox.
const toBool = (value: unknown) =>
  String(value).trim().toUpperCase() === "TRUE";

/**
 * Edit dialog for a single EMR row. Uses calendar date pickers for
 * Start Date / Training Reminder Date / 4 Weeks. Sends dates in
 * `DD/MMM` format to match the sheet.
 */
export function EditEMRDialog({
  row,
  open,
  onOpenChange,
  setData,
}: EditEMRDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  // Popover open states
  const [startOpen, setStartOpen] = useState(false);
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [fourWeeksOpen, setFourWeeksOpen] = useState(false);

  // Calendar date pickers
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [trainingReminderDate, setTrainingReminderDate] = useState<Date | undefined>();
  const [fourWeeksDate, setFourWeeksDate] = useState<Date | undefined>();

  const [form, setForm] = useState({
    EMR: "",
    profileLink: "",
    reminderSent: false,
    reinstatee: false,
    loa: false,
    notes: "",
  });

  // Parse the row's CSV date strings into Date objects when the dialog opens.
  useEffect(() => {
    if (!row) return;
    setForm({
      EMR: String(row["EMR"] ?? ""),
      profileLink: String(row["Profile Link"] ?? ""),
      reminderSent: toBool(row["Reminder Sent?"]),
      reinstatee: toBool(row["Reinstatee?"]),
      loa: toBool(row["LOA?"]),
      notes: String(row["Notes"] ?? ""),
    });
    setStartDate(parseDate(String(row["Start Date"] ?? "")) ?? undefined);
    setTrainingReminderDate(parseDate(String(row["Training Reminder Date"] ?? "")) ?? undefined);
    setFourWeeksDate(parseDate(String(row["4 Weeks"] ?? "")) ?? undefined);
  }, [row]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!row) return;

    if (
      !form.EMR ||
      !form.profileLink ||
      !trainingReminderDate ||
      !startDate ||
      !fourWeeksDate
    ) {
      toast.error("Fill all required fields", { theme: "dark" });
      return;
    }

    setSubmitting(true);

    try {
      const formattedStart = formatDisplayDate(startDate);
      const formattedTraining = formatDisplayDate(trainingReminderDate);
      const formattedFourWeeks = formatDisplayDate(fourWeeksDate);

      const res = await fetch("/api/update-emr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalEMR: String(row["EMR"] ?? ""),
          ...form,
          startDate: formattedStart,
          trainingReminder: formattedTraining,
          fourWeeks: formattedFourWeeks,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("EMR record updated successfully", { theme: "dark" });
        // Update the row in local state immediately so the table
        // reflects the change right away (published CSV can be cached).
        const updatedRow: TableDataType = {
          "EMR": form.EMR,
          "Start Date": formattedStart,
          "Training Reminder Date": formattedTraining,
          "4 Weeks": formattedFourWeeks,
          "Reminder Sent?": form.reminderSent ? "TRUE" : "FALSE",
          "Reinstatee?": form.reinstatee ? "TRUE" : "FALSE",
          "LOA?": form.loa ? "TRUE" : "FALSE",
          "Notes": form.notes,
          "Profile Link": form.profileLink,
        };
        setData((prev) =>
          prev.map((r) =>
            String(r["EMR"] ?? "").trim().toLowerCase() ===
            String(row["EMR"] ?? "").trim().toLowerCase()
              ? { ...r, ...updatedRow }
              : r,
          ),
        );
        onOpenChange(false);
      } else {
        toast.error(
          `Something went wrong: ${result.error ?? result.raw ?? JSON.stringify(result)}`,
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
            <DialogTitle>Edit EMR Record</DialogTitle>
            <DialogDescription>
              Update the fields for this EMR record. Changes are saved to the
              sheet.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>EMR Name</Label>
              <Input
                placeholder="Enter EMR's Name"
                value={form.EMR}
                onChange={(e) => setForm({ ...form, EMR: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>EMR Profile Link</Label>
              <Input
                placeholder="Enter EMR profile URL"
                value={form.profileLink}
                onChange={(e) =>
                  setForm({ ...form, profileLink: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Start Date</Label>
              <Popover open={startOpen} onOpenChange={setStartOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    {startDate ? formatDisplayDate(startDate) : "Pick a date"}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      if (date) {
                        const training = new Date(date);
                        training.setDate(training.getDate() + 21);
                        setTrainingReminderDate(training);

                        const fourWeeks = new Date(date);
                        fourWeeks.setDate(fourWeeks.getDate() + 28);
                        setFourWeeksDate(fourWeeks);
                      }
                      setStartOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Training Reminder Date</Label>
              <Popover open={trainingOpen} onOpenChange={setTrainingOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    {trainingReminderDate
                      ? formatDisplayDate(trainingReminderDate)
                      : "Pick a date"}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={trainingReminderDate}
                    onSelect={(date) => {
                      setTrainingReminderDate(date);
                      setTrainingOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Label>4 Weeks</Label>
              <Popover open={fourWeeksOpen} onOpenChange={setFourWeeksOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    {fourWeeksDate
                      ? formatDisplayDate(fourWeeksDate)
                      : "Pick a date"}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fourWeeksDate}
                    onSelect={(date) => {
                      setFourWeeksDate(date);
                      setFourWeeksOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.reminderSent}
                onCheckedChange={(checked) =>
                  setForm({ ...form, reminderSent: !!checked })
                }
              />
              <Label>Reminder Sent?</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.reinstatee}
                onCheckedChange={(checked) =>
                  setForm({ ...form, reinstatee: !!checked })
                }
              />
              <Label>Reinstatee?</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.loa}
                onCheckedChange={(checked) =>
                  setForm({ ...form, loa: !!checked })
                }
              />
              <Label>LOA?</Label>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Notes</Label>
              <Input
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
