"use client";

import { useLocalStorage } from "@/app/hooks/useLocalStorage";
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
import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";

type UpcomingCourseType = "new" | "reschedule" | "cancelled";

const COURSE_TYPE_OPTIONS: {
  value: UpcomingCourseType;
  label: string;
}[] = [
  { value: "new", label: "New" },
  { value: "reschedule", label: "Reschedule" },
  { value: "cancelled", label: "Cancelled" },
];

export function UpcomingCourseProcessor() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const pad = (num: number, size: number = 2) =>
    String(num).padStart(size, "0");

  const [courseType, setCourseType] = useLocalStorage<UpcomingCourseType>(
    "uc-courseType",
    "new",
  );

  // Sync initial course type from URL query param (takes priority over localStorage)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("type") as UpcomingCourseType | null;
    if (fromUrl && COURSE_TYPE_OPTIONS.some((o) => o.value === fromUrl)) {
      setCourseType(fromUrl);
    }
  }, [setCourseType]);

  // Sync URL when course type changes (skip initial mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.delete("format");
    params.set("type", courseType);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }, [courseType]);

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
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="panel relative overflow-hidden">
        {/* The page's accent as a single line, so it reads as identity rather
            than as a second background behind the content. */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-warning/70 to-transparent" />
        <div className="relative p-4 sm:p-5 lg:p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="panel-inner p-5 transition-colors hover:border-primary/30">
              <div className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="courseType"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Course Type
                  </Label>
                  <Select
                    value={courseType}
                    onValueChange={(value) =>
                      setCourseType(value as UpcomingCourseType)
                    }
                  >
                    <SelectTrigger
                      id="courseType"
                      className="w-full border-border bg-surface-hover text-foreground transition-all duration-200 hover:border-border"
                    >
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-surface text-foreground">
                      {COURSE_TYPE_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="transition-all duration-200 hover:bg-surface-hover/60"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(courseType === "new" ||
                  courseType === "cancelled" ||
                  courseType === "reschedule") && (
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="datetime"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Course Date &amp; Time (UTC)
                    </Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border-border bg-surface-hover text-foreground transition-all duration-200 hover:border-border sm:w-[260px]",
                              !date && !datetime && "text-muted-foreground",
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
                        <PopoverContent
                          className="w-auto border-border bg-surface p-0"
                          align="start"
                        >
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
                          (datetime
                            ? format(new Date(datetime + "Z"), "HH:mm")
                            : "")
                        }
                        onChange={(e) => setTime(e.target.value)}
                        className="w-[140px] border-border bg-surface-hover text-foreground transition-all duration-200 hover:border-border focus-visible:ring-2"
                      />
                    </div>
                  </div>
                )}

                {courseType === "reschedule" && (
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="prevDatetime"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Previous Date &amp; Time (UTC)
                    </Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border-border bg-surface-hover text-foreground transition-all duration-200 hover:border-border sm:w-[260px]",
                              !prevDate && !prevDatetime && "text-muted-foreground",
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
                        <PopoverContent
                          className="w-auto border-border bg-surface p-0"
                          align="start"
                        >
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
                        className="w-[140px] border-border bg-surface-hover text-foreground transition-all duration-200 hover:border-border focus-visible:ring-2"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="instructor"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Instructor Name
                  </Label>
                  <Input
                    id="instructor"
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="First Last"
                    required
                    className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-all duration-200 hover:border-border focus-visible:ring-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                type="submit"
                className="border-border text-muted-foreground transition-all duration-200 hover:scale-[1.02] hover:border-amber-500/40 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 hover:text-amber-200 active:scale-[0.98]"
              >
                Generate
              </Button>
              <Button
                variant="destructive"
                type="button"
                onClick={handleClear}
                className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Clear
              </Button>
            </div>
          </form>

          {output && (
            <div className="mt-6 space-y-3">
              <div className="panel-inner p-5 transition-colors hover:border-primary/30">
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-border bg-background/80 p-4 font-mono text-sm leading-relaxed text-foreground">
                  {output}
                </pre>
              </div>
              <Button
                onClick={handleCopy}
                variant="secondary"
                className={`transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  copied
                    ? "bg-emerald-600 text-foreground hover:bg-emerald-500"
                    : "bg-surface-hover text-foreground hover:bg-surface-hover"
                }`}
              >
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
