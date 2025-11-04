"use client";

import {
  AvailabilityInput,
  weekdays,
  convertRangeStringToUTC,
} from "@/app/helpers/timeUtils";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { BodyAndMainTitle } from "@/components/BodyMainAndTitle/BodyMainAndTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import TimezoneSelect from "react-timezone-select";

export default function Availability() {
  const initialTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [timezone, setTimezone] = useState<string>(initialTz);
  const [availability, setAvailability] = useLocalStorage<AvailabilityInput>(
    "availability",
    weekdays.reduce(
      (acc, day) => ({ ...acc, [day]: "" }),
      {} as AvailabilityInput,
    ),
  );
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  return (
    <BodyAndMainTitle
      title="Time of Availability"
      description="Create your time of availability by writing your time and converting
          it to UTC time"
    >
      {/* Timezone Selector */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="timezone">Select your timezone</Label>
        <TimezoneSelect
          id="timezone"
          value={{ value: timezone, label: timezone }}
          onChange={(tz) => setTimezone(typeof tz === "string" ? tz : tz.value)}
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: "#1e293b",
              color: "#fff",
              minHeight: 40,
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: "#1e293b",
              color: "#fff",
            }),
            singleValue: (base) => ({ ...base, color: "#fff" }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? "#374151" : "#1e293b",
              color: "#fff",
              cursor: "pointer",
            }),
          }}
        />
      </div>

      {/* Weekdays Inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className="flex flex-col gap-2 rounded bg-slate-800 p-3"
          >
            <Label htmlFor={day}>{day}</Label>
            <Input
              id={day}
              value={availability[day]}
              onChange={(e) =>
                setAvailability({ ...availability, [day]: e.target.value })
              }
              placeholder="08:00 - 12:00 and 14:00 - 22:00"
              className="bg-slate-700 text-white"
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="secondary"
          onClick={() => {
            const utcLines = ["AVAILABILITY TIME [ooc]UTC[/ooc]:", ""];
            weekdays.forEach((day) => {
              const val = availability[day].trim();
              utcLines.push(
                `${day}: [${val ? convertRangeStringToUTC(day, val, timezone) : ""}]`,
              );
            });
            setOutput(utcLines.join("\n"));
            setCopied(false);
          }}
        >
          Generate
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            const empty = weekdays.reduce(
              (acc, day) => ({ ...acc, [day]: "" }),
              {} as AvailabilityInput,
            );
            setAvailability(empty);
            setOutput("");
            setCopied(false);
          }}
        >
          Clear
        </Button>
      </div>

      {/* Output */}
      {output && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Converted to UTC</h2>
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(output);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copied!" : "Copy (UTC)"}
            </Button>
          </div>
          <pre className="rounded bg-slate-900 p-4 whitespace-pre-wrap text-white">
            {output}
          </pre>
        </div>
      )}
    </BodyAndMainTitle>
  );
}
