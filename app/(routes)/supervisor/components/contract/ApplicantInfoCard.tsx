"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, Users } from "lucide-react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type ApplicantTitle = "Mr." | "Ms.";

type ApplicantInfoCardProps = {
  personnelName: string;
  onNameChange: (value: string) => void;
  title: ApplicantTitle;
  onTitleChange: (value: ApplicantTitle) => void;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  dateHired: Date | undefined;
  onDateHiredChange: (value: Date | undefined) => void;
  manualDate: string;
  onManualDateChange: (value: string) => void;
  isManualDate: boolean;
  onManualDateToggle: (value: boolean) => void;
  employeeProfileLink: string;
  onEmployeeProfileLinkChange: (value: string) => void;
  personnelFileLink: string;
  onPersonnelFileLinkChange: (value: string) => void;
};

export function ApplicantInfoCard({
  personnelName,
  onNameChange,
  title,
  onTitleChange,
  phoneNumber,
  onPhoneNumberChange,
  dateHired,
  onDateHiredChange,
  manualDate,
  onManualDateChange,
  isManualDate,
  onManualDateToggle,
  employeeProfileLink,
  onEmployeeProfileLinkChange,
  personnelFileLink,
  onPersonnelFileLinkChange,
}: ApplicantInfoCardProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-medium text-slate-300">
          Applicant information
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <Input
          value={personnelName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Applicant's full name"
          className="border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-slate-500"
        />
        <Select
          value={title}
          onValueChange={(value) => onTitleChange(value as ApplicantTitle)}
        >
          <SelectTrigger className="border-slate-700 bg-slate-950 text-white sm:w-[100px] focus-visible:ring-1 focus-visible:ring-slate-500">
            <SelectValue placeholder="Title" />
          </SelectTrigger>
          <SelectContent className="border-slate-700 bg-slate-900 text-white">
            <SelectItem value="Mr.">Mr.</SelectItem>
            <SelectItem value="Ms.">Ms.</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Phone Number</Label>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder="e.g. 555-1234"
            className="border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-slate-500"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-400">Date Hired</Label>
            <button
              type="button"
              onClick={() => onManualDateToggle(!isManualDate)}
              className="text-[10px] text-sky-400 hover:text-sky-300 transition-colors"
            >
              {isManualDate ? "Use calendar" : "Enter manually"}
            </button>
          </div>
          {isManualDate ? (
            <Input
              type="text"
              value={manualDate}
              onChange={(e) => onManualDateChange(e.target.value)}
              placeholder="dd/MMM/YYYY"
              className="border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-slate-500"
            />
          ) : (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start border-slate-700 bg-slate-950 text-left font-normal text-white hover:bg-slate-900 hover:text-white focus-visible:ring-1 focus-visible:ring-slate-500",
                    !dateHired && "text-slate-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                  {dateHired ? format(dateHired, "dd/MMM/yyyy").toUpperCase() : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto border-slate-700 bg-slate-900 p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateHired}
                  onSelect={(day) => {
                    onDateHiredChange(day);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Employee Profile Link</Label>
          <Input
            type="url"
            value={employeeProfileLink}
            onChange={(e) => onEmployeeProfileLinkChange(e.target.value)}
            placeholder="https://gov.eclipse-rp.net/..."
            className="border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-slate-500"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Personnel File Link</Label>
          <Input
            type="url"
            value={personnelFileLink}
            onChange={(e) => onPersonnelFileLinkChange(e.target.value)}
            placeholder="https://gov.eclipse-rp.net/..."
            className="border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-slate-500"
          />
        </div>
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
      </p>
    </div>
  );
}
