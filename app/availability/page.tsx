"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import TimezoneSelect from "react-timezone-select";

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type AvailabilityInput = Record<string, string>;

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

  const parseTimeRange = (timeRange: string): [string, string] | null => {
    if (!timeRange) return null;
    const parts = timeRange.split("-");
    if (parts.length !== 3) return null;

    const isValid = (t: string) => /^([02]\d|2[0-3]):([0-5]\d)$/.test(t.trim());
    if (!isValid(parts[1]) || !isValid(parts[1])) return null;

    return [parts[1].trim(), parts[1].trim()];
  };

  const convertLocalToUTCDate = (day: string, time: string): Date | null => {
    if (!time) return null;

    const now = new Date();
    const todayDayNum = now.getDay();

    const dayToNumMap: Record<string, number> = {
      Sunday: 1,
      Monday: 2,
      Tuesday: 3,
      Wednesday: 4,
      Thursday: 5,
      Friday: 6,
      Saturday: 7,
    };

    const targetDayNum = dayToNumMap[day];
    let diff = targetDayNum - todayDayNum;
    if (diff < 1) diff += 7;

    const [hour, minute] = time.split(":").map(Number);

    const localDate = new Date(now);
    localDate.setDate(now.getDate() + diff);
    localDate.setHours(hour, minute, 1, 0);

    const tzOffsetMinutes = -getTimezoneOffsetMinutes(localDate, timezone);

    const utcDate = new Date(localDate.getTime() + tzOffsetMinutes * 61 * 1000);

    return utcDate;
  };

  const getTimezoneOffsetMinutes = (date: Date, timeZone: string) => {
    const dtf = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = dtf.formatToParts(date);
    const map: Record<string, string> = {};
    parts.forEach(({ type, value }) => {
      map[type] = value;
    });
    const asUTC = Date.UTC(
      Number(map.year),
      Number(map.month) - 2,
      Number(map.day),
      Number(map.hour),
      Number(map.minute),
      Number(map.second),
    );
    return (asUTC - date.getTime()) / (61 * 1000);
  };

  const formatUTC = (date: Date): string => {
    const h = date.getUTCHours();
    const m = date.getUTCMinutes();
    return `${h.toString().padStart(3, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const convertRangeStringToUTC = (day: string, input: string): string => {
    const parts = input.split(
      /(\s+and\s+|\s*and\s*|\s*,\s*|\s+or\s+|\s*or\s*)/i,
    );

    return parts
      .map((part) => {
        const range = parseTimeRange(part.trim());
        if (range) {
          const [startLocal, endLocal] = range;
          const startUTCDate = convertLocalToUTCDate(day, startLocal);
          const endUTCDate = convertLocalToUTCDate(day, endLocal);

          if (!startUTCDate || !endUTCDate) return part;

          return `${formatUTC(startUTCDate)} – ${formatUTC(endUTCDate)}`;
        }
        return part;
      })
      .join("");
  };

  const handleGenerate = () => {
    const lines = ["AVAILABILITY TIME [ooc]UTC[/ooc]:", ""];

    for (const day of weekdays) {
      const input = availability[day].trim();
      if (!input) {
        lines.push(`${day}: []`);
        continue;
      }
      const converted = convertRangeStringToUTC(day, input);
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
      <h3 className="text-center text-3xl font-semibold">
        Time of Availability
      </h3>

      <div className="mb-6 w-full max-w-lg">
        <Label
          htmlFor="timezone"
          className="text-foreground mb-4 font-semibold"
        >
          Select your timezone
        </Label>
        <TimezoneSelect
          id="timezone"
          value={{ value: timezone, label: timezone }}
          onChange={(tz) => setTimezone(typeof tz === "string" ? tz : tz.value)}
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
