"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TableDataType } from "@/lib/types";
import { formatDisplayDate } from "@/lib/format-date";

interface CreateNewEMRProps {
  setData: React.Dispatch<React.SetStateAction<TableDataType[]>>;
}

export function CreateNewEMR({ setData }: CreateNewEMRProps) {
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    EMR: "",
    profileLink: "",
    reminderSent: false,
    reinstatee: false,
    loa: false,
    notes: "",
  });

  // Calendar date pickers (Date objects, formatted when sent to API)
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [trainingReminderDate, setTrainingReminderDate] = useState<Date | undefined>();
  const [fourWeeksDate, setFourWeeksDate] = useState<Date | undefined>();

  // Popover open states
  const [startOpen, setStartOpen] = useState(false);
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [fourWeeksOpen, setFourWeeksOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const payload = {
        ...form,
        startDate: formatDisplayDate(startDate),
        trainingReminder: formatDisplayDate(trainingReminderDate),
        fourWeeks: formatDisplayDate(fourWeeksDate),
      };

      const res = await fetch("/api/create-new-emr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("EMR record created successfully", { theme: "dark" });

        const formattedStart = formatDisplayDate(startDate);
        const formattedTraining = formatDisplayDate(trainingReminderDate);
        const formattedFourWeeks = formatDisplayDate(fourWeeksDate);

        // Append to local state immediately so the table updates right away
        const newRow: TableDataType = {
          "EMR": form.EMR,
          "Start Date": formattedStart,
          "Training Reminder Date": formattedTraining,
          "4 Weeks": formattedFourWeeks,
          "Reminder Sent?": form.reminderSent ? "TRUE" : "FALSE",
          "Reinstatee?": form.reinstatee ? "TRUE" : "FALSE",
          "LOA?": form.loa ? "TRUE" : "FALSE",
          "Notes": form.notes,
          "Profile Link": form.profileLink
        };
        setData((prev) => [...prev, newRow]);

        setForm({
          EMR: "",
          profileLink: "",
          reminderSent: false,
          reinstatee: false,
          loa: false,
          notes: "",
        });
        setStartDate(undefined);
        setTrainingReminderDate(undefined);
        setFourWeeksDate(undefined);
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

      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        Create New EMR Record
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 border p-4 rounded-lg"
      >
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
            onChange={(e) => setForm({ ...form, profileLink: e.target.value })}
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
            onCheckedChange={(checked) => setForm({ ...form, loa: !!checked })}
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

        <Button type="submit" disabled={submitting} className="mt-2 w-full">
          {submitting ? "Saving..." : "Create Record"}
        </Button>
      </form>
    </>
  );
}
