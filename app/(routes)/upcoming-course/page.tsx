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
import "react-toastify/dist/ReactToastify.css";

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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="courseType">Course Type:</Label>
          <Select
            value={courseType}
            onValueChange={(value) =>
              setCourseType(value as "new" | "reschedule" | "cancelled")
            }
          >
            <SelectTrigger id="courseType" className="w-full">
              <SelectValue placeholder="Select course type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reschedule">Reschedule</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(courseType === "new" ||
          courseType === "cancelled" ||
          courseType === "reschedule") && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="datetime">Course Date & Time (UTC):</Label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[260px] justify-start text-left font-normal",
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
                <PopoverContent className="w-auto p-0" align="start">
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
              />
            </div>
          </div>
        )}

        {courseType === "reschedule" && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="prevDatetime">Previous Date & Time (UTC):</Label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[260px] justify-start text-left font-normal",
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
                <PopoverContent className="w-auto p-0" align="start">
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
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <Label htmlFor="instructor">Instructor Name:</Label>
          <Input
            id="instructor"
            type="text"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            placeholder="First Last"
            required
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" type="submit">
            Generate
          </Button>
          <Button variant="destructive" type="button" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </form>

      {output && (
        <div className="flex flex-col gap-2">
          <pre className="mt-4 rounded border border-gray-600 bg-gray-900 p-4 whitespace-pre-wrap text-white">
            {output}
          </pre>
          <Button onClick={handleCopy} variant="secondary">
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      )}
    </BodyAndMainTitle>
  );
}
