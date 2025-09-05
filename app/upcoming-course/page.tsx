"use client";

import { useLocalStorage } from "@/app/hooks/useLocalStorage";
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
import React, { useState, useEffect } from "react";

export default function UpcomingCourse() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const [courseType, setCourseType] = useLocalStorage<
    "new" | "reschedule" | "cancelled"
  >("uc-courseType", "new");

  const [datetime, setDatetime] = useLocalStorage<string>("uc-datetime", "");
  const [prevDatetime, setPrevDatetime] = useLocalStorage<string>(
    "uc-prevDatetime",
    "",
  );
  const [instructor, setInstructor] = useLocalStorage<string>(
    "uc-instructor",
    "",
  );

  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isClient) return null;

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
          Upcoming Course
        </h1>
        <p className="text-slate-400">
          Create, Edit and Cancel an Upcoming BLS Course
        </p>
      </div>

      <form className="flex flex-col gap-6">
        {/* Course Type */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="courseType">Course Type</Label>
          <Select
            value={courseType}
            onValueChange={(value) =>
              setCourseType(value as "new" | "reschedule" | "cancelled")
            }
          >
            <SelectTrigger id="courseType" className="w-full bg-slate-700">
              <SelectValue placeholder="Select course type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 text-white">
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reschedule">Reschedule</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Date */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="datetime">Course Date & Time (UTC)</Label>
          <Input
            id="datetime"
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="bg-slate-700 text-white"
          />
        </div>

        {/* Previous Date for Reschedule */}
        {courseType === "reschedule" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="prevDatetime">Previous Date & Time (UTC)</Label>
            <Input
              id="prevDatetime"
              type="datetime-local"
              value={prevDatetime}
              onChange={(e) => setPrevDatetime(e.target.value)}
              className="bg-slate-700 text-white"
            />
          </div>
        )}

        {/* Instructor Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="instructor">Instructor Name</Label>
          <Input
            id="instructor"
            type="text"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            placeholder="First Last"
            className="bg-slate-700 text-white"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="secondary" type="submit">
            Generate
          </Button>
          <Button
            variant="destructive"
            type="button"
            onClick={() => {
              setCourseType("new");
              setDatetime("");
              setPrevDatetime("");
              setInstructor("");
              setOutput("");
            }}
          >
            Clear
          </Button>
        </div>
      </form>

      {output && (
        <div className="mt-6">
          <pre className="rounded-lg bg-slate-900 p-4 whitespace-pre-wrap text-white">
            {output}
          </pre>
          <Button
            className="mt-2"
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(output);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      )}
    </main>
  );
}
