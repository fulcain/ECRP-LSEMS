"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "react-toastify";
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
import { FieldError } from "@/components/ui/field-error";
import {
  INPUT_LIMITS,
  validateDateString,
  validateName,
  validateText,
  validateUrl,
  validationMessage,
} from "@/lib/validation";

interface CreateNewEMRProps {
  setData: React.Dispatch<React.SetStateAction<TableDataType[]>>;
}

export function CreateNewEMR({ setData }: CreateNewEMRProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    const nextErrors: Record<string, string> = {};
    const nameError = validationMessage(validateName(form.EMR, "EMR name"));
    if (nameError) nextErrors.EMR = nameError;
    const linkError = validationMessage(
      validateUrl(form.profileLink, "EMR profile link"),
    );
    if (linkError) nextErrors.profileLink = linkError;
    const notesError = validationMessage(
      validateText(form.notes, "Notes", { required: false, max: INPUT_LIMITS.notes }),
    );
    if (notesError) nextErrors.notes = notesError;
    if (!startDate) {
      nextErrors.startDate = "Start date is required.";
    } else {
      const startError = validationMessage(
        validateDateString(formatDisplayDate(startDate), "Start date"),
      );
      if (startError) nextErrors.startDate = startError;
    }
    if (!trainingReminderDate) {
      nextErrors.trainingReminder = "Training reminder date is required.";
    }
    if (!fourWeeksDate) {
      nextErrors.fourWeeks = "Four weeks date is required.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(Object.values(nextErrors)[0]);
      return;
    }

    if (!startDate || !trainingReminderDate || !fourWeeksDate) return;

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
        toast.success("EMR record created successfully");

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
        setErrors({});
      } else {
        toast.error(
          `Something went wrong: ${result.error ?? result.raw ?? JSON.stringify(result)}`
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

      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        Create New EMR Record
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 border p-4 rounded-lg"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="create-emr-name">EMR Name</Label>
          <Input
            id="create-emr-name"
            placeholder="Enter EMR's Name"
            value={form.EMR}
            maxLength={INPUT_LIMITS.name}
            aria-invalid={Boolean(errors.EMR) || undefined}
            onChange={(e) => setForm({ ...form, EMR: e.target.value })}
          />
          <FieldError message={errors.EMR} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="create-emr-profile-link">EMR Profile Link</Label>
          <Input
            id="create-emr-profile-link"
            placeholder="Enter EMR profile URL"
            value={form.profileLink}
            maxLength={INPUT_LIMITS.url}
            aria-invalid={Boolean(errors.profileLink) || undefined}
            onChange={(e) => setForm({ ...form, profileLink: e.target.value })}
          />
          <FieldError message={errors.profileLink} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="create-emr-start-date">Start Date</Label>
          <Popover open={startOpen} onOpenChange={setStartOpen}>
            <PopoverTrigger asChild>
              <Button
                id="create-emr-start-date"
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
          <FieldError message={errors.startDate} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="create-emr-training-reminder">
            Training Reminder Date
          </Label>
          <Popover open={trainingOpen} onOpenChange={setTrainingOpen}>
            <PopoverTrigger asChild>
              <Button
                id="create-emr-training-reminder"
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
          <FieldError message={errors.trainingReminder} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="create-emr-four-weeks">4 Weeks</Label>
          <Popover open={fourWeeksOpen} onOpenChange={setFourWeeksOpen}>
            <PopoverTrigger asChild>
              <Button
                id="create-emr-four-weeks"
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
          <FieldError message={errors.fourWeeks} />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="create-emr-reinstatee"
            checked={form.reinstatee}
            onCheckedChange={(checked) =>
              setForm({ ...form, reinstatee: !!checked })
            }
          />
          <Label htmlFor="create-emr-reinstatee">Reinstatee?</Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="create-emr-loa"
            checked={form.loa}
            onCheckedChange={(checked) => setForm({ ...form, loa: !!checked })}
          />
          <Label htmlFor="create-emr-loa">LOA?</Label>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="create-emr-notes">Notes</Label>
          <Input
            id="create-emr-notes"
            placeholder="Notes"
            value={form.notes}
            maxLength={INPUT_LIMITS.notes}
            aria-invalid={Boolean(errors.notes) || undefined}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <FieldError message={errors.notes} />
        </div>

        <Button type="submit" loading={submitting} className="mt-2 w-full">
          Create Record
        </Button>
      </form>
    </>
  );
}
