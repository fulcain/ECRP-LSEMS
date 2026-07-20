"use client";

import {
  AvailabilityInput,
  weekdays,
  convertRangeStringToUTC,
} from "@/app/helpers/timeUtils";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { BodyAndMainTitle } from "@/components/layout/main-and-title";
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
      <div className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-slate-950/80 shadow-2xl shadow-cyan-950/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.08),_transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsla(0,0%,100%,0.1) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative space-y-6 p-5 lg:p-8">
          {/* Timezone Selector */}
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
            <div className="flex flex-col gap-2">
              <Label htmlFor="timezone" className="text-sm font-medium text-slate-300">Select your timezone</Label>
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
                    borderColor: "#334155",
                    boxShadow: "none",
                    "&:hover": { borderColor: "#64748b" },
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: "#0f172a",
                    color: "#fff",
                    border: "1px solid #334155",
                  }),
                  singleValue: (base) => ({ ...base, color: "#fff" }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#1e293b" : "#0f172a",
                    color: "#fff",
                    cursor: "pointer",
                  }),
                }}
              />
            </div>
          </div>

          {/* Weekdays Inputs */}
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
            <h3 className="mb-4 text-sm font-semibold text-white">Daily Time Windows</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-800/50 p-4 transition-all duration-200 hover:border-white/20"
                >
                  <Label htmlFor={day} className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">{day}</Label>
                  <Input
                    id={day}
                    value={availability[day]}
                    onChange={(e) =>
                      setAvailability({ ...availability, [day]: e.target.value })
                    }
                    placeholder="08:00 - 12:00 and 14:00 - 22:00"
                    className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 transition-all duration-200 hover:border-slate-500 focus-visible:ring-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
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
              className="bg-cyan-600 text-white transition-all duration-200 hover:scale-[1.02] hover:bg-cyan-500 active:scale-95"
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
              className="transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              Clear
            </Button>
          </div>

          {/* Output */}
          {output && (
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Converted to UTC</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(output);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                    copied 
                      ? "border-emerald-500/60 bg-emerald-950/30 text-emerald-300" 
                      : "border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {copied ? "Copied!" : "Copy (UTC)"}
                </Button>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/5 bg-slate-950/80 p-4 font-mono text-sm leading-relaxed text-slate-100">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </BodyAndMainTitle>
  );
}
