"use client";

import React, { useState } from "react";
import TimezoneSelect from "react-timezone-select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  AvailabilityInput,
  weekdays,
  convertRangeStringToUTC,
} from "@/app/helpers/timeUtils";

export default function Availability() {
  const initialTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [timezone, setTimezone] = useState<string>(initialTz);

  const [availability, setAvailability] = useState<AvailabilityInput>(
    weekdays.reduce((acc, day) => {
      acc[day] = "";
      return acc;
    }, {} as AvailabilityInput),
  );

  const [output, setOutput] = useState<string>("");

  const handleGenerate = () => {
    const lines = ["AVAILABILITY TIME [ooc]UTC[/ooc]:", ""];

    for (const day of weekdays) {
      const input = availability[day].trim();
      if (!input) {
        lines.push(`${day}: []`);
        continue;
      }
      const converted = convertRangeStringToUTC(day, input, timezone);
      lines.push(`${day}: [${converted}]`);
    }

    setOutput(lines.join("\n"));
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="text-foreground mx-auto mt-20 flex max-w-2xl flex-col items-center gap-6">
      <h3 className="text-center text-3xl font-semibold">Time of Availability</h3>

      <div className="mb-6 w-full max-w-lg">
        <Label htmlFor="timezone" className="text-foreground mb-4 font-semibold">
          Select your timezone
        </Label>
        <TimezoneSelect
          id="timezone"
          value={{ value: timezone, label: timezone }}
          onChange={(tz) =>
            setTimezone(typeof tz === "string" ? tz : tz.value)
          }
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
              boxShadow: "none",
              minHeight: 40,
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
            }),
            singleValue: (base) => ({
              ...base,
              color: "var(--foreground)",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused
                ? "var(--muted)"
                : "var(--background)",
              color: "var(--foreground)",
              cursor: "pointer",
            }),
            input: (base) => ({
              ...base,
              color: "var(--foreground)",
            }),
            placeholder: (base) => ({
              ...base,
              color: "var(--muted-foreground)",
            }),
            dropdownIndicator: (base) => ({
              ...base,
              color: "var(--foreground)",
            }),
            indicatorSeparator: (base) => ({
              ...base,
              backgroundColor: "var(--border)",
            }),
          }}
        />
      </div>

      <div className="grid w-full max-w-lg grid-cols-2 gap-6">
        {weekdays.map((day) => (
          <div
            key={day}
            className="border-border flex flex-col gap-2 rounded border p-3"
          >
            <Label htmlFor={day} className="text-foreground font-semibold">
              {day}
            </Label>
            <Input
              id={day}
              placeholder="08:00 - 12:00 and 14:00 - 22:00"
              value={availability[day]}
              onChange={(e) =>
                setAvailability((prev) => ({ ...prev, [day]: e.target.value }))
              }
              className="bg-background text-foreground placeholder:text-muted-foreground max-w-[300px] text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleGenerate}
          variant="secondary"
          className="cursor-pointer"
        >
          Generate
        </Button>
        <Button
          onClick={handleCopy}
          variant="secondary"
          className="cursor-pointer"
          disabled={!output}
        >
          Copy
        </Button>
      </div>

      {output && (
        <pre className="border-border bg-card text-card-foreground mt-8 max-w-lg rounded border p-4 whitespace-pre-wrap">
          {output}
        </pre>
      )}
    </div>
  );
}
