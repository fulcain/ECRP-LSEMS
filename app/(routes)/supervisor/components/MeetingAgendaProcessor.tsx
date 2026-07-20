"use client";

import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useMedic } from "@/app/context/MedicContext";
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
import {
  Calendar as CalendarIcon,
  Copy,
  ListChecks,
  Clock,
  FileText,
  AlertTriangle,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { meetingTemplates, MeetingType } from "@/app/templates/meetings";
import Link from "next/link";

export function MeetingAgendaProcessor() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const { medicCredentials } = useMedic();

  const pad = (num: number, size: number = 2) =>
    String(num).padStart(size, "0");

  const [meetingType, setMeetingType] = useLocalStorage<MeetingType>(
    "meeting-type",
    "supervisor"
  );

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [output, setOutput] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);

  const isCredentialsEmpty =
    !medicCredentials.name || !medicCredentials.signature || !medicCredentials.rank;

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

  const formatDateForDisplay = (d: Date) => {
    const weekday = d.toLocaleString("en-GB", {
      weekday: "long",
      timeZone: "UTC",
    });
    const dayNum = d.getUTCDate();
    const dayOrdinal = getOrdinal(dayNum);
    const month = d.toLocaleString("en-GB", {
      month: "long",
      timeZone: "UTC",
    });
    const year = d.getUTCFullYear();
    return `${weekday}, ${dayOrdinal} ${month} ${year}`;
  };

  const formatDateForSubject = (d: Date) => {
    const day = pad(d.getUTCDate());
    const month = d
      .toLocaleString("en-GB", { month: "short", timeZone: "UTC" })
      .toUpperCase();
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const activeTemplate = meetingTemplates.find((t) => t.value === meetingType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      toast.error("Please select both a date and time.");
      return;
    }

    const [hhRaw, miRaw] = time.split(":");
    const hours = pad(Number(hhRaw || 0));
    const minutes = pad(Number(miRaw || 0));
    const dayNum = pad(date.getUTCDate());
    const monthNum = pad(date.getUTCMonth() + 1);
    const year = date.getUTCFullYear();
    const urlDate = `${year}-${monthNum}-${dayNum}`;

    const meetingDate = formatDateForDisplay(date);
    const meetingTime = `${hours}:${minutes}`;

    const subject =
      activeTemplate?.renderSubject(formatDateForSubject(date)) || "";
    const body =
      activeTemplate?.renderBody({
        meetingDate,
        meetingTime,
        urlDate,
        hours,
        minutes,
        medicName: medicCredentials.name,
        medicRank: medicCredentials.rank,
        medicSignature: medicCredentials.signature,
      }) || "";

    setSubjectLine(subject);
    setOutput(body);
    setCopied(false);
    setCopiedSubject(false);
    toast.success("Meeting agenda generated successfully!");
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      toast.success("BBCode copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopySubject = () => {
    if (!subjectLine) return;
    navigator.clipboard.writeText(subjectLine).then(() => {
      setCopiedSubject(true);
      toast.success("Subject line copied!");
      setTimeout(() => setCopiedSubject(false), 2000);
    });
  };

  const handleClear = () => {
    setMeetingType("supervisor");
    setDate(undefined);
    setTime("");
    setOutput("");
    setSubjectLine("");
    setCopied(false);
    setCopiedSubject(false);
    toast.info("Form cleared.");
  };

  if (!isClient) return null;

  return (
    <div className="space-y-5">
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />

      {/* Credentials Warning */}
      {isCredentialsEmpty && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              Staff credentials not set
            </p>
            <p className="text-xs text-amber-400/70">
              Set your name, signature, and rank in the{" "}
              <Link
                href="/staff"
                className="underline transition-colors hover:text-amber-300"
              >
                Staff Page
              </Link>{" "}
              so the signature section auto-fills.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Meeting Type */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="meetingType"
                className="text-sm font-medium text-slate-300"
              >
                Meeting Type
              </Label>
              <Select
                value={meetingType}
                onValueChange={(value) =>
                  setMeetingType(value as MeetingType)
                }
              >
                <SelectTrigger
                  id="meetingType"
                  className="w-full border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-slate-500"
                >
                  <SelectValue placeholder="Select meeting type" />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-900 text-white">
                  {meetingTemplates.map((tmpl) => (
                    <SelectItem
                      key={tmpl.value}
                      value={tmpl.value}
                      className="transition-all duration-150 hover:bg-slate-700/60"
                    >
                      {tmpl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time (UTC) */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-300">
                Meeting Date & Time (UTC)
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[260px] justify-start text-left font-normal border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-slate-500",
                        !date && "text-slate-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto border-slate-700 bg-slate-900 p-0"
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
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-[140px] border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-slate-500 focus-visible:ring-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            type="submit"
            className="border-slate-600 text-slate-300 transition-all duration-200 hover:scale-[1.02] hover:border-indigo-500/40 hover:bg-indigo-950/20 hover:text-indigo-200 active:scale-95"
          >
            Generate
          </Button>
          <Button
            variant="destructive"
            type="button"
            onClick={handleClear}
            className="transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            Clear
          </Button>
        </div>
      </form>

      {/* Step-by-Step Instructions */}
      {activeTemplate && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
          <div className="mb-4 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              Step-by-Step: How to Post a {activeTemplate.label}
            </h3>
          </div>
          <ol className="space-y-2">
            {activeTemplate.steps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-slate-300"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300 ring-1 ring-indigo-400/30">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="space-y-3">
          {/* Subject Line */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Subject Line
              </h4>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/5 bg-slate-950/80 p-4 font-mono text-sm leading-relaxed text-amber-200">
              {subjectLine}
            </pre>
            <Button
              onClick={handleCopySubject}
              variant="secondary"
              className={`mt-3 transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                copiedSubject
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
            >
              {copiedSubject ? "Copied!" : "Copy Subject Line"}
            </Button>
          </div>

          {/* BBCode Body */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                BBCode Body
              </h4>
            </div>
            <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/5 bg-slate-950/80 p-4 font-mono text-sm leading-relaxed text-slate-100">
              {output}
            </pre>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCopy}
              variant="secondary"
              className={`transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                copied
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
            >
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Copied!" : "Copy BBCode to Clipboard"}
            </Button>
            {activeTemplate?.forumUrl && output && (
              <a
                href={activeTemplate.forumUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  navigator.clipboard.writeText(output).then(() => {
                    setCopied(true);
                    toast.success("BBCode copied! Opening forum...");
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
              >
                <Button
                  variant="secondary"
                  className="transition-all duration-200 hover:scale-[1.02] active:scale-95 bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy BBCode & Open Forum
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
