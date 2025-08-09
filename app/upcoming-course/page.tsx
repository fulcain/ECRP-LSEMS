"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type AvailabilityInput = Record<string, string>; // day => "HH:mm-HH:mm"

export default function Availability() {
  const [availability, setAvailability] = useState<AvailabilityInput>(
    weekdays.reduce((acc, day) => {
      acc[day] = "";
      return acc;
    }, {} as AvailabilityInput),
  );

  const [output, setOutput] = useState<string>("");
  const [availabilityCopied, setAvailabilityCopied] = useState(false);

  const parseTimeRange = (timeRange: string): [string, string] | null => {
    if (!timeRange) return null;
    const parts = timeRange.split("-");
    if (parts.length !== 2) return null;

    const isValid = (t: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t.trim());
    if (!isValid(parts[0]) || !isValid(parts[1])) return null;

    return [parts[0].trim(), parts[1].trim()];
  };

  const convertLocalToUTCDate = (day: string, time: string): Date | null => {
    if (!time) return null;

    const now = new Date();
    const todayDayNum = now.getDay();

    const dayToNumMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const targetDayNum = dayToNumMap[day];
    let diff = targetDayNum - todayDayNum;
    if (diff < 0) diff += 7;

    const [hour, minute] = time.split(":").map(Number);
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    targetDate.setHours(hour, minute, 0, 0);

    return targetDate;
  };

  const formatUTC = (date: Date): string => {
    const h = date.getUTCHours();
    const m = date.getUTCMinutes();
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const convertRangeStringToUTC = (day: string, input: string): string => {
    const parts = input.split(/(\s+and\s+|\s*,\s*|\s+or\s+)/i);

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
    setAvailabilityCopied(false);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setAvailabilityCopied(true);
      setTimeout(() => setAvailabilityCopied(false), 2000);
    });
  };

  return (
    <div className="text-foreground mx-auto mt-18 max-w-xl">
      <h3 className="mb-2 text-center text-3xl font-semibold">
        Time of Availability
      </h3>
      <p className="text-muted-foreground mb-6 text-center text-sm">
        Format: 08:00-12:00 and 14:00-22:00
      </p>

      <div className="grid grid-cols-2 gap-6">
        {weekdays.map((day) => (
          <div key={day} className="flex flex-col gap-1">
            <Label htmlFor={day}>{day}</Label>
            <Input
              id={day}
              placeholder="08:00 - 12:00 and 14:00 - 22:00"
              value={availability[day]}
              onChange={(e) =>
                setAvailability((prev) => ({ ...prev, [day]: e.target.value }))
              }
              className="text-sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Button variant="outline" onClick={handleGenerate}>
          Generate
        </Button>
        <Button variant="secondary" onClick={handleCopy} disabled={!output}>
          {availabilityCopied ? "Copied!" : "Copy"}
        </Button>
      </div>

      {output && (
        <pre className="mt-6 max-w-xl rounded border border-gray-600 bg-gray-900 p-4 whitespace-pre-wrap text-white">
          {output}
        </pre>
      )}
    </div>
  );
}
