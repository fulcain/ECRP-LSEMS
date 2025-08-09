"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";

export default function UpcomingCourse() {
  const [courseType, setCourseType] = useState<
    "new" | "reschedule" | "cancelled"
  >("new");
  const [datetime, setDatetime] = useState("");
  const [prevDatetime, setPrevDatetime] = useState("");
  const [instructor, setInstructor] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return `${n}th`;
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

  const pad = (num: number) => String(num).padStart(2, "0");

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
      formatted: `${weekday}, ${dayOrdinal} ${month} ${year} @ ${hours}:${minutes} ((UTC))`,
      urlDate,
      hours,
      minutes,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (courseType === "cancelled") {
      if (!datetime || !instructor.trim()) {
        alert("Please fill in date/time and instructor name");
        return;
      }
    } else if (courseType === "reschedule") {
      if (!datetime || !prevDatetime || !instructor.trim()) {
        alert("Please fill in all fields for reschedule");
        return;
      }
    } else {
      // new
      if (!datetime || !instructor.trim()) {
        alert("Please fill in date/time and instructor name");
        return;
      }
    }

    const newDateInfo = formatDate(datetime);
    if (!newDateInfo) {
      alert("Invalid new date/time");
      return;
    }

    const instructorName = instructor.trim();

    let result = "";

    if (courseType === "new") {
      result = `
[hr][/hr]
[b]${newDateInfo.formatted} - ${instructorName}[/b]
[img]https://www.inyourowntime.zone/${newDateInfo.urlDate}_${newDateInfo.hours}.${newDateInfo.minutes}_UTC.png[/img]
[hr][/hr]
      `.trim();
    } else if (courseType === "cancelled") {
      result = `
[hr][/hr]
[b][size=110][color=red]Class cancelled[/color][/size][/b]
[b][s]${newDateInfo.formatted} - ${instructorName}[/s][/b]
[img]https://www.inyourowntime.zone/${newDateInfo.urlDate}_${newDateInfo.hours}.${newDateInfo.minutes}_UTC.png[/img]
[hr][/hr]
      `.trim();
    } else if (courseType === "reschedule") {
      const prevDateInfo = formatDate(prevDatetime);
      if (!prevDateInfo) {
        alert("Invalid previous date/time");
        return;
      }

      result = `
[hr][/hr]
[b][size=110][color=darkorange]Class rescheduled[/color][/size][/b]
[b][s]${prevDateInfo.formatted} - ${instructorName}[/s][/b]
[b]${newDateInfo.formatted} - ${instructorName}[/b]
[img]https://www.inyourowntime.zone/${newDateInfo.urlDate}_${newDateInfo.hours}.${newDateInfo.minutes}_UTC.png[/img]
[hr][/hr]
      `.trim();
    }

    setOutput(result);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="text-foreground mx-auto mt-20 max-w-xl">
      <h3 className="mb-10 text-center text-3xl font-semibold">
        Upcoming Course
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Label htmlFor="courseType">Course Type:</Label>
          <Select
            value={courseType}
            onValueChange={(value) => setCourseType(value as typeof courseType)}
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
            <Input
              id="datetime"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              required
            />
          </div>
        )}

        {courseType === "reschedule" && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="prevDatetime">Previous Date & Time (UTC):</Label>
            <Input
              id="prevDatetime"
              type="datetime-local"
              value={prevDatetime}
              onChange={(e) => setPrevDatetime(e.target.value)}
              required
            />
          </div>
        )}

        {courseType !== "cancelled" && (
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
        )}

        {courseType === "cancelled" && (
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
        )}

        <Button variant="outline" type="submit" className="cursor-pointer">
          Generate
        </Button>
      </form>

      {output && (
        <>
          <pre className="mt-6 rounded border border-gray-600 bg-gray-900 p-4 whitespace-pre-wrap text-white">
            {output}
          </pre>
          <Button onClick={handleCopy} variant="secondary" className="mt-2">
            {copied ? "Copied!" : "Copy"}
          </Button>
        </>
      )}
    </div>
  );
}
