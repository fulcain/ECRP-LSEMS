"use client";

import { useMedic } from "@/app/context/MedicContext";
import { loaTemplates } from "@/app/templates/loa";
import { copyBBCode } from "@/app/helpers/copyBBCode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bounce, ToastContainer } from "react-toastify";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Copy,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Archive,
  ExternalLink,
} from "lucide-react";

const MONTH_MAP: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

function parseDate(dateStr: string): Date | null {
  const match = dateStr.trim().match(/^(\d{1,2})\/([A-Z]{3})\/(\d{4})$/);
  if (!match) return null;
  const [, dayStr, monthStr, yearStr] = match;
  const month = MONTH_MAP[monthStr.toUpperCase()];
  if (month === undefined) return null;
  const day = parseInt(dayStr, 10);
  const year = parseInt(yearStr, 10);
  const d = new Date(Date.UTC(year, month, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month || d.getUTCDate() !== day) return null;
  return d;
}

function calculateDays(start: string, end: string): number {
  const s = parseDate(start);
  const e = parseDate(end);
  if (!s || !e) return 0;
  const diff = e.getTime() - s.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}


export function LOAProcessor() {
  const { medicCredentials } = useMedic();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("approved");
  const [personnelName, setPersonnelName] = useState("");
  const [title, setTitle] = useState<"Mr." | "Ms.">("Mr.");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startWorkAt, setStartWorkAt] = useState("");
  const [denialReasons, setDenialReasons] = useState("");

  const isCredentialsEmpty =
    !medicCredentials.name || !medicCredentials.signature || !medicCredentials.rank;

  const numberOfDays = useMemo(
    () => calculateDays(startDate, endDate),
    [startDate, endDate],
  );

  const activeTemplate = useMemo(
    () => loaTemplates.find((t) => t.value === selectedTemplate),
    [selectedTemplate],
  );

  const generatedBBCode = useMemo(() => {
    if (!activeTemplate) return "";
    return activeTemplate.renderBody({
      personnelName,
      title,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      startWorkAt: startWorkAt.trim(),
      numberOfDays,
      medicName: medicCredentials.name,
      medicRank: medicCredentials.rank,
      medicSignature: medicCredentials.signature,
      denialReasons:
        selectedTemplate === "denied"
          ? denialReasons
              .split("\n")
              .map((r) => r.trim())
              .filter(Boolean)
          : undefined,
    });
  }, [
    activeTemplate,
    personnelName,
    title,
    startDate,
    endDate,
    startWorkAt,
    numberOfDays,
    medicCredentials,
    selectedTemplate,
    denialReasons,
  ]);

  const handleCopy = () => {
    copyBBCode({ bbCodeText: generatedBBCode });
  };

  const templateIcons: Record<string, React.ReactNode> = {
    approved: <CheckCircle2 className="h-4 w-4" />,
    denied: <XCircle className="h-4 w-4" />,
    extended: <Clock className="h-4 w-4" />,
    expired: <Archive className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="dark"
        transition={Bounce}
      />
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="space-y-5">
          {/* Template Selector */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
            <Label className="mb-3 block text-sm font-medium text-slate-300">
              Select LOA Format
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {loaTemplates.map((tmpl) => (
                <button
                  key={tmpl.value}
                  onClick={() => setSelectedTemplate(tmpl.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    selectedTemplate === tmpl.value
                      ? `${tmpl.border} ${tmpl.badge} scale-[1.02]`
                      : "border-white/10 bg-slate-800/50 text-slate-400 hover:border-white/20 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {templateIcons[tmpl.value]}
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Personnel Info */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">
                Personnel Information
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs text-slate-400">
                  Personnel Name
                </Label>
                <Input
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  placeholder="Enter full name (e.g., John Smith)"
                  className="border-white/10 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500/50"
                />
              </div>

              <div>
                <Label className="mb-2 block text-xs text-slate-400">
                  Title
                </Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTitle("Mr.")}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      title === "Mr."
                        ? "border-blue-500/50 bg-blue-500/20 text-blue-300"
                        : "border-white/10 bg-slate-800/50 text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    Mr.
                  </button>
                  <button
                    onClick={() => setTitle("Ms.")}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      title === "Ms."
                        ? "border-pink-500/50 bg-pink-500/20 text-pink-300"
                        : "border-white/10 bg-slate-800/50 text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    Ms.
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Date Fields (LOA Approved only) */}
          {selectedTemplate === "approved" && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-green-400" />
                <h3 className="text-sm font-semibold text-white">Leave Dates</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-xs text-slate-400">
                    Start Date
                  </Label>
                  <Input
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value.toUpperCase())}
                    placeholder="DD/MMM/YYYY (e.g. 20/JUL/2026)"
                    className="border-white/10 bg-slate-800/50 font-mono text-white placeholder:text-slate-500 focus:border-green-500/50"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-slate-400">
                    End Date
                  </Label>
                  <Input
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value.toUpperCase())}
                    placeholder="DD/MMM/YYYY (e.g. 20/AUG/2026)"
                    className="border-white/10 bg-slate-800/50 font-mono text-white placeholder:text-slate-500 focus:border-green-500/50"
                  />
                </div>
              </div>

              {/* Day Count */}
              {startDate && endDate && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                    <span className="text-lg font-bold text-emerald-400">
                      {numberOfDays}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-300">
                      {numberOfDays === 1 ? "1 day" : `${numberOfDays} days`}
                    </p>
                    <p className="text-[10px] text-emerald-400/60">
                      Duration automatically calculated
                    </p>
                  </div>
                  {numberOfDays > 30 && (
                    <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-2.5 py-1">
                      <AlertTriangle className="h-3 w-3 text-amber-400" />
                      <span className="text-[10px] font-medium text-amber-300">
                        Requires HC Approval
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Start Work At (LOA Expired only) */}
          {selectedTemplate === "expired" && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Work Schedule</h3>
              </div>
              <Label className="mb-1.5 block text-xs text-slate-400">
                Start Work At
              </Label>
              <Input
                value={startWorkAt}
                onChange={(e) => setStartWorkAt(e.target.value.toUpperCase())}
                placeholder="DD/MMM/YYYY (e.g. 21/JUL/2026)"
                className="border-white/10 bg-slate-800/50 font-mono text-white placeholder:text-slate-500 focus:border-amber-500/50"
              />
              <p className="mt-1 text-[10px] text-slate-500">
                Replaces the date after {'"tomorrow on"'}
              </p>
            </div>
          )}

          {/* Denial Reasons (conditional) */}
          {selectedTemplate === "denied" && (
            <div className="rounded-2xl border border-red-500/20 bg-slate-900/60 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <h3 className="text-sm font-semibold text-white">
                  Denial Reasons
                </h3>
              </div>
              <Textarea
                value={denialReasons}
                onChange={(e) => setDenialReasons(e.target.value)}
                placeholder={"Reason 1\nReason 2\nReason 3"}
                rows={4}
                className="border-white/10 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-red-500/50"
              />
              <p className="mt-1.5 text-[10px] text-slate-500">
                Enter one reason per line
              </p>
            </div>
          )}

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
                  so templates can auto-fill your information.
                </p>
              </div>
            </div>
          )}

          {/* Personnel File Link */}
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-300">
                  Personnel File Section
                </p>
                <p className="mt-1 text-xs text-blue-400/70">
                  Update the personnel file by editing the spoiler tagged
                  &quot;LOA/ROH&quot; with the request form link.
                </p>
              </div>
            </div>
            <a
              href="https://gov.eclipse-rp.net/viewforum.php?f=605"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/15 px-4 py-2.5 text-sm font-medium text-blue-300 transition-all duration-200 hover:border-blue-500/50 hover:bg-blue-500/25 hover:text-blue-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <ExternalLink className="h-4 w-4" />
              Open Personnel Files
            </a>
          </div>

          {/* Copy Button */}
          <Button
            onClick={handleCopy}
            disabled={!generatedBBCode}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-6 text-base font-semibold text-white shadow-lg shadow-blue-950/30 transition-all duration-300 hover:from-blue-500 hover:to-purple-500 hover:shadow-xl hover:shadow-blue-950/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy BBCode
          </Button>
        </div>

        {/* Right: Preview */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-white">
                BBCode Preview
              </h3>
            </div>
            {activeTemplate && (
              <span
                className={`rounded-lg px-2.5 py-1 text-[10px] font-medium ring-1 ${activeTemplate.badge}`}
              >
                {activeTemplate.label}
              </span>
            )}
          </div>
          <div className="p-5">
            <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/5 bg-slate-950/50 p-4 font-mono text-xs leading-relaxed text-slate-300">
              {generatedBBCode || "// Fill in the fields to generate BBCode"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
