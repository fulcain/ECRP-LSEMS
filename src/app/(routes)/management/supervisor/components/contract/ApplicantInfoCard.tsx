"use client";

import { Input } from "@/components/ui/input";
import { EmployeeNameInput } from "@/components/employees/employee-name-input";
import type { EmployeeRecord } from "@/app/constants/employees";
import { INPUT_LIMITS } from "@/lib/validation";
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
import { CalendarIcon, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type ApplicantTitle = "Mr." | "Ms.";

type ApplicantInfoCardProps = {
  personnelName: string;
  onNameChange: (value: string) => void;
  onEmployeeSelect: (employee: EmployeeRecord) => void;
  allowEmployeeSelect: boolean;
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
  onAddToEmployees: () => void;
  showAddToEmployees: boolean;
};

export function ApplicantInfoCard({
  personnelName,
  onNameChange,
  onEmployeeSelect,
  allowEmployeeSelect,
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
  onAddToEmployees,
  showAddToEmployees,
}: ApplicantInfoCardProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">
          Applicant information
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        {allowEmployeeSelect ? (
          <EmployeeNameInput
            id="contract-applicant-name"
            aria-label="Applicant's full name"
            value={personnelName}
            maxLength={INPUT_LIMITS.name}
            onChange={onNameChange}
            onEmployeeSelect={onEmployeeSelect}
            placeholder="Applicant's full name"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-border"
          />
        ) : (
          <Input
            id="contract-applicant-name"
            aria-label="Applicant's full name"
            value={personnelName}
            maxLength={INPUT_LIMITS.name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Applicant's full name"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-border"
          />
        )}
        <Select
          value={title}
          onValueChange={(value) => onTitleChange(value as ApplicantTitle)}
        >
          <SelectTrigger aria-label="Title" className="w-full border-border bg-background text-foreground focus-visible:ring-1 focus-visible:ring-border sm:w-[100px]">
            <SelectValue placeholder="Title" />
          </SelectTrigger>
          <SelectContent className="border-border bg-surface text-foreground">
            <SelectItem value="Mr.">Mr.</SelectItem>
            <SelectItem value="Ms.">Ms.</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contract-phone-number" className="text-xs text-muted-foreground">Phone Number</Label>
          <Input
            id="contract-phone-number"
            type="tel"
            value={phoneNumber}
            maxLength={32}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder="e.g. 555-1234"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-border"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="contract-date-hired" className="text-xs text-muted-foreground">Date Hired</Label>
            <button
              type="button"
              onClick={() => onManualDateToggle(!isManualDate)}
              className="text-[10px] text-sky-600 dark:text-sky-400 hover:text-sky-300 transition-colors"
            >
              {isManualDate ? "Use calendar" : "Enter manually"}
            </button>
          </div>
          {isManualDate ? (
            <Input
              id="contract-date-hired"
              type="text"
              value={manualDate}
              maxLength={INPUT_LIMITS.short}
              onChange={(e) => onManualDateChange(e.target.value)}
              placeholder="dd/MMM/YYYY"
              className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-border"
            />
          ) : (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="contract-date-hired"
                  variant="outline"
                  className={cn(
                    "w-full justify-start border-border bg-background text-left font-normal text-foreground hover:bg-surface hover:text-foreground focus-visible:ring-1 focus-visible:ring-border",
                    !dateHired && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {dateHired ? format(dateHired, "dd/MMM/yyyy").toUpperCase() : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto border-border bg-surface p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateHired}
                  onSelect={(day) => {
                    onDateHiredChange(day);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                  className="text-foreground"
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contract-employee-profile-link" className="text-xs text-muted-foreground">Employee Profile Link</Label>
          <Input
            id="contract-employee-profile-link"
            type="url"
            value={employeeProfileLink}
            maxLength={INPUT_LIMITS.url}
            onChange={(e) => onEmployeeProfileLinkChange(e.target.value)}
            placeholder="https://gov.eclipse-rp.net/..."
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-border"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contract-personnel-file-link" className="text-xs text-muted-foreground">Personnel File Link</Label>
          <Input
            id="contract-personnel-file-link"
            type="url"
            value={personnelFileLink}
            maxLength={INPUT_LIMITS.url}
            onChange={(e) => onPersonnelFileLinkChange(e.target.value)}
            placeholder="https://gov.eclipse-rp.net/..."
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-border"
          />
        </div>
      </div>

      {showAddToEmployees && (
        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            New applicant? Add them to the employee directory for future personnel workflows.
          </p>
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            disabled={!personnelName.trim()}
            onClick={onAddToEmployees}
          >
            <UserPlus className="h-4 w-4" />
            Add to Employees
          </Button>
        </div>
      )}

      <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
      </p>
    </div>
  );
}
