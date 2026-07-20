"use client";

import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { BodyAndMainTitle } from "@/components/layout/main-and-title";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function UpcomingCourse() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const pad = (num: number, size: number = 2) =>
    String(num).padStart(size, "0");

  const [courseType, setCourseType] = useLocalStorage<
    "new" | "reschedule" | "cancelled"
  >("uc-courseType", "new");

  const [datetime, setDatetime] = useState<string>("");
  const [prevDatetime, setPrevDatetime] = useState<string>("");

  const [instructor, setInstructor] = useLocalStorage<string>(
    "uc-instructor",
    "",
  );

  const [date, setDate] = useState<Date | undefined>(
    datetime ? new Date(datetime + "Z") : undefined,
  );
  const [time, setTime] = useState<string>(
    datetime ? format(new Date(datetime + "Z"), "HH:mm") : "",
  );

  const [prevDate, setPrevDate] = useState<Date | undefined>(
    prevDatetime ? new Date(prevDatetime + "Z") : undefined,
  );
  const [prevTime, setPrevTime] = useState<string>(
    prevDatetime ? format(new Date(prevDatetime + "Z"), "HH:mm") : "",
  );

  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const getOrdinal = (n: number) => {
    if (n > 5 && n < 21) return `${n}th`;
    switch (n % 10) {
      case 1:
        return `${n}st`;
      case 2:
        return `${n}nd`;
      case 3:
        return `${n}rd`;
      default:
        return `${n}th`;
    }
  };

  const formatDate = (datetimeStr: string) => {
    if (!datetimeStr) return null;
    const d = new Date(datetimeStr + "Z");
    if (isNaN(d.getTime())) return null;

    const weekday = d.toLocaleString("en-GB", {
      weekday: "long",
      timeZone: "UTC",
    });
    const dayNum = d.getUTCDate();
    const dayOrdinal = getOrdinal(dayNum);
    const month = d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
    const year = d.getUTCFullYear();
    const hours = pad(d.getUTCHours());
    const minutes = pad(d.getUTCMinutes());
    const urlDate = `${year}-${pad(d.getUTCMonth() + 1)}-${pad(dayNum)}`;

    return {
	  formatted: `${weekday}, ${dayOrdinal} ${month} ${year} @ ${hours}:${minutes} [ooc]UTC[/ooc]`,
      urlDate,
      hours,
      minutes,
    };
  };

  const buildDatetimeString = useCallback((d: Date | undefined, t: string) => {
    if (!d || !t) return "";
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const [hhRaw, miRaw] = t.split(":");
    const hh = pad(Number(hhRaw || 0));
    const mi = pad(Number(miRaw || 0));
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }, []);

  // Sync local storage with UI pickers
  useEffect(() => {
    const s = buildDatetimeString(date, time);
    if (s) setDatetime(s);
  }, [date, time, buildDatetimeString, setDatetime]);

  useEffect(() => {
    const s = buildDatetimeString(prevDate, prevTime);
    if (s) setPrevDatetime(s);
  }, [prevDate, prevTime, buildDatetimeString, setPrevDatetime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newDatetimeStr =
      date && time ? buildDatetimeString(date, time) : datetime;
    const prevDatetimeStr =
      prevDate && prevTime
        ? buildDatetimeString(prevDate, prevTime)
        : prevDatetime;

    // Validation
    if (
      (courseType === "cancelled" && (!newDatetimeStr || !instructor.trim())) ||
      (courseType === "reschedule" &&
        (!newDatetimeStr || !prevDatetimeStr || !instructor.trim())) ||
      (courseType === "new" && (!newDatetimeStr || !instructor.trim()))
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newDateInfo = formatDate(newDatetimeStr);
    if (!newDateInfo) {
      toast.error("Invalid new date/time.");
      return;
    }

    const instructorName = instructor.trim();
    let result = "";

    if (courseType === "new") {
      result = `[hr][/hr]
[b]${newDateInfo.formatted} - ${instructorName}[/b]
[img]https://www.inyourowntime.zone/${newDateInfo.urlDate}_${newDateInfo.hours}.${newDateInfo.minutes}_UTC.png[/img]
[hr][/hr]`.trim();
    } else if (courseType === "cancelled") {
      result = `[hr][/hr]
[b][size=112][color=red]Class cancelled[/color][/size][/b]
[b][s]${newDateInfo.formatted} - ${instructorName}[/s][/b]
[img]https://www.inyourowntime.zone/${newDateInfo.urlDate}_${newDateInfo.hours}.${newDateInfo.minutes}_UTC.png[/img]
[hr][/hr]`.trim();
    } else if (courseType === "reschedule") {
      const prevDateInfo = formatDate(prevDatetimeStr);
      if (!prevDateInfo) {
        toast.error("Invalid previous date/time.");
        return;
      }
      result = `[hr][/hr]
[b][size=112][color=darkorange]Class rescheduled[/color][/size][/b]
[b][s]${prevDateInfo.formatted} - ${instructorName}[/s][/b]
[b]${newDateInfo.formatted} - ${instructorName}[/b]
[img]https://www.inyourowntime.zone/${newDateInfo.urlDate}_${newDateInfo.hours}.${newDateInfo.minutes}_UTC.png[/img]
[hr][/hr]`.trim();
    }

    setOutput(result);
    setCopied(false);
    toast.success("Course post generated successfully!");
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClear = () => {
    setCourseType("new");
    setDatetime("");
    setPrevDatetime("");
    setInstructor("");
    setDate(undefined);
    setTime("");
    setPrevDate(undefined);
    setPrevTime("");
    setOutput("");
    setCopied(false);
    toast.info("Form cleared.");
  };

  if (!isClient) return null;

  return (
    <BodyAndMainTitle
      title="Upcoming Course"
      description="Generate BBCode for upcoming courses that are new, rescheduled, or
          cancelled, using UTC time."
    >
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />

      <div className="relative overflow-hidden rounded-[2rem] border border-amber-500/20 bg-slate-950/80 shadow-2xl shadow-amber-950/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.12),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsla(0,0%,100%,0.1) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative p-5 lg:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
              <div className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="courseType" className="text-sm font-medium text-slate-300">Course Type</Label>
                  <Select
                    value={courseType}
                    onValueChange={(value) =>
                      setCourseType(value as "new" | "reschedule" | "cancelled")
                    }
                  >
                    <SelectTrigger id="courseType" className="w-full border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-slate-500">
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-700 bg-slate-900 text-white">
                      <SelectItem value="new" className="transition-all duration-150 hover:bg-slate-700/60">New</SelectItem>
                      <SelectItem value="reschedule" className="transition-all duration-150 hover:bg-slate-700/60">Reschedule</SelectItem>
                      <SelectItem value="cancelled" className="transition-all duration-150 hover:bg-slate-700/60">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(courseType === "new" ||
                  courseType === "cancelled" ||
                  courseType === "reschedule") && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="datetime" className="text-sm font-medium text-slate-300">Course Date & Time (UTC)</Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[260px] justify-start text-left font-normal border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-slate-500",
                              !date && !datetime && "text-slate-400",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date
                              ? format(date, "PPP")
                              : datetime
                                ? format(new Date(datetime + "Z"), "PPP")
                                : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto border-slate-700 bg-slate-900 p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => setDate(d)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Input
                        type="time"
                        value={
                          time ||
                          (datetime ? format(new Date(datetime + "Z"), "HH:mm") : "")
                        }
                        onChange={(e) => setTime(e.target.value)}
                        className="w-[140px] border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-slate-500 focus-visible:ring-2"
                      />
                    </div>
                  </div>
                )}

                {courseType === "reschedule" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="prevDatetime" className="text-sm font-medium text-slate-300">Previous Date & Time (UTC)</Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[260px] justify-start text-left font-normal border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-slate-500",
                              !prevDate && !prevDatetime && "text-slate-400",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {prevDate
                              ? format(prevDate, "PPP")
                              : prevDatetime
                                ? format(new Date(prevDatetime + "Z"), "PPP")
                                : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto border-slate-700 bg-slate-900 p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={prevDate}
                            onSelect={(d) => setPrevDate(d)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="time"
                        value={
                          prevTime ||
                          (prevDatetime
                            ? format(new Date(prevDatetime + "Z"), "HH:mm")
                            : "")
                        }
                        onChange={(e) => setPrevTime(e.target.value)}
                        className="w-[140px] border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-slate-500 focus-visible:ring-2"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="instructor" className="text-sm font-medium text-slate-300">Instructor Name</Label>
                  <Input
                    id="instructor"
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="First Last"
                    required
                    className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500 focus-visible:ring-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" type="submit" className="border-slate-600 text-slate-300 transition-all duration-200 hover:scale-[1.02] hover:border-amber-500/40 hover:bg-amber-950/20 hover:text-amber-200 active:scale-95">
                Generate
              </Button>
              <Button variant="destructive" type="button" onClick={handleClear} className="transition-all duration-200 hover:scale-[1.02] active:scale-95">
                Clear
              </Button>
            </div>
          </form>

          {output && (
            <div className="mt-6 space-y-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/5 bg-slate-950/80 p-4 font-mono text-sm leading-relaxed text-slate-100">
                  {output}
                </pre>
              </div>
              <Button 
                onClick={handleCopy} 
                variant="secondary"
                className={`transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                  copied 
                    ? "bg-emerald-600 text-white hover:bg-emerald-500" 
                    : "bg-slate-700 text-white hover:bg-slate-600"
                }`}
              >
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </BodyAndMainTitle>
  );
}
