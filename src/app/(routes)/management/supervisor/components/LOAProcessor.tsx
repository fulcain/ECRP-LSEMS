"use client";

import { useMedic } from "@/app/context/MedicContext";
import { loaTemplates } from "@/app/templates/loa";
import { rankOptions } from "@/app/constants/general/ranks";
import { rankInfo } from "@/app/templates/promotions/rank-info";
import { copyBBCode } from "@/app/helpers/copyBBCode";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { pickPostTarget } from "@/app/helpers/forumHandoff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bounce, ToastContainer } from "react-toastify";
import { useEffect, useMemo, useState } from "react";
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
  Plus,
  Check,
} from "lucide-react";

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

const MONTH_MAP: Record<string, number> = Object.fromEntries(
  MONTH_NAMES.map((month, index) => [month, index]),
);

// Rank words from the app's rank lists, matched case-insensitively against the
// words around the name in a pasted LOA title. Honorifics, section labels and
// statuses ("LOA Active", "[Approved]") are title furniture, not the name.
const RANK_WORDS = new Set(
  [
    ...rankOptions,
    ...Object.values(rankInfo).map((info) => info.shortLabel),
    "basic",
    "intermediate",
    "advanced",
    "loa",
    "roh",
    "mr",
    "ms",
    "mrs",
    "mx",
    "dr",
    "active",
    "approved",
    "denied",
    "extended",
    "expired",
  ]
    .flatMap((rank) => rank.toLowerCase().split(/\s+/))
    .filter(Boolean),
);

function extractName(raw: string): string | null {
  // Separators and stray single letters ("l" is a common typo of "|") are
  // debris, not part of the name. Apostrophes stay so O'Brien survives.
  const tokens = raw
    .replace(/[|\[\]{}()\-,:;."]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
  // Rank words can sit before the name ("Senior Paramedic Remmi Raccoon") or
  // after it ("Remmi Raccoon Senior Paramedic") - strip from both ends.
  let start = 0;
  let end = tokens.length - 1;
  while (start <= end && RANK_WORDS.has(tokens[start].toLowerCase())) start += 1;
  while (end >= start && RANK_WORDS.has(tokens[end].toLowerCase())) end -= 1;
  const words = tokens.slice(start, end + 1);
  if (words.length < 2) return null;
  return `${words[words.length - 2]} ${words[words.length - 1]}`;
}

function getTomorrowUTC(): string {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return `${String(tomorrow.getUTCDate()).padStart(2, "0")}/${MONTH_NAMES[tomorrow.getUTCMonth()]}/${tomorrow.getUTCFullYear()}`;
}

function parseDate(dateStr: string): Date | null {
  const normalized = dateStr.trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2})\/(?:([A-Z]{3})|(\d{1,2}))\/(\d{4})$/);
  if (!match) return null;
  const [, dayStr, monthName, monthNumber, yearStr] = match;
  const month = monthName ? MONTH_MAP[monthName] : parseInt(monthNumber, 10) - 1;
  if (month < 0 || month > 11) return null;
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
  // Everything typed here survives a reload or a browser restart: an LOA is
  // filled in over a shift, and losing half of it to a refresh is the worst
  // thing this page can do to someone.
  const [selectedTemplate, setSelectedTemplate] = useLocalStorage<string>(
    "supervisor-loa-template",
    "approved",
  );
  const [personnelName, setPersonnelName] = useLocalStorage<string>(
    "supervisor-loa-name",
    "",
  );
  const [title, setTitle] = useLocalStorage<"Mr." | "Ms.">(
    "supervisor-loa-honorific",
    "Mr.",
  );
  const [startDate, setStartDate] = useLocalStorage<string>(
    "supervisor-loa-start-date",
    "",
  );
  const [endDate, setEndDate] = useLocalStorage<string>(
    "supervisor-loa-end-date",
    "",
  );
  const [extendedStartDate, setExtendedStartDate] = useLocalStorage<string>(
    "supervisor-loa-extended-start-date",
    "",
  );
  const [extendedEndDate, setExtendedEndDate] = useLocalStorage<string>(
    "supervisor-loa-extended-end-date",
    "",
  );
  const [startWorkAt, setStartWorkAt] = useLocalStorage<string>(
    "supervisor-loa-return-date",
    "",
  );
  const [denialReasons, setDenialReasons] = useLocalStorage<string[]>(
    "supervisor-loa-denial-reasons",
    [""],
  );
  const [loaType, setLoaType] = useLocalStorage<"LOA" | "ROH">(
    "supervisor-loa-type",
    "LOA",
  );
  // Both links are pasted once and kept: the request topic is where the reply
  // goes, the personnel file is where the LOA spoiler lives.
  const [loaLink, setLoaLink] = useLocalStorage<string>(
    "supervisor-loa-request-link",
    "",
  );
  const [quickFill, setQuickFill] = useState("");
  const [quickFillStatus, setQuickFillStatus] = useState<"idle" | "success" | "error">("idle");

  // An expired LOA needs a return-to-work date, so default it to tomorrow - but
  // never over a date that was already picked, which storage now restores.
  useEffect(() => {
    if (selectedTemplate !== "expired") return;
    setStartWorkAt((current) => current || getTomorrowUTC());
  }, [selectedTemplate, setStartWorkAt]);

  const handleQuickFill = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setQuickFillStatus("idle");
      return;
    }

    // LOA titles vary: a rank prefix, "|" or "l" as separator, month numbers
    // or names in the dates, and each date often sits in brackets
    // ("[25/SEP/2026] to [09/OCT/2026]"). Find the date range anywhere, then
    // take the rank + name from the text around it.
    const rangeMatch = trimmedValue.match(
      /(\d{1,2}\/(?:[A-Za-z]{3}|\d{1,2})\/\d{4})[\s\])}]*?(?:to|until|till|thru|through|-|\u2013|\u2014)[\s\[({]*?(\d{1,2}\/(?:[A-Za-z]{3}|\d{1,2})\/\d{4})/i,
    );
    if (!rangeMatch) {
      setQuickFillStatus("error");
      return;
    }

    const [, start, end] = rangeMatch;
    if (!parseDate(start) || !parseDate(end)) {
      setQuickFillStatus("error");
      return;
    }

    // The name normally precedes the dates; a few titles put it after them.
    const rangeStart = rangeMatch.index ?? 0;
    const name =
      extractName(trimmedValue.slice(0, rangeStart)) ??
      extractName(trimmedValue.slice(rangeStart + rangeMatch[0].length));
    if (!name) {
      setQuickFillStatus("error");
      return;
    }

    setPersonnelName(name);
    if (selectedTemplate === "extended") {
      setExtendedStartDate(start);
      setExtendedEndDate(end);
    } else {
      setStartDate(start);
      setEndDate(end);
    }
    setQuickFillStatus("success");
  };

  const isCredentialsEmpty =
    !medicCredentials.name || !medicCredentials.signature || !medicCredentials.rank;

  const numberOfDays = useMemo(
    () => calculateDays(startDate, endDate),
    [startDate, endDate],
  );

  const extendedNumberOfDays = useMemo(
    () => calculateDays(extendedStartDate, extendedEndDate),
    [extendedStartDate, extendedEndDate],
  );

  const activeTemplate = useMemo(
    () => loaTemplates.find((t) => t.value === selectedTemplate),
    [selectedTemplate],
  );

  const personnelSnippet = useMemo(() => {
    const link = loaLink.trim();
    const start = startDate.trim();
    const end = endDate.trim();
    if (!link || !start || !end) return "";
    return `[url=${link}]${loaType} -> ${start} - ${end}[/url]`;
  }, [loaLink, loaType, startDate, endDate]);

  const snippetStatus = useMemo(() => {
    const link = loaLink.trim();
    const start = startDate.trim();
    const end = endDate.trim();
    if (!link)
      return {
        ready: false,
        title: "Personnel profile LOA section: link required",
        hint: "Paste the request form link and fill the leave dates to generate the spoiler content.",
      };
    if (!start || !end)
      return {
        ready: false,
        title: "Personnel profile LOA section: dates required",
        hint: "Fill in the Leave Dates above to complete the snippet.",
      };
    return {
      ready: true,
      title: "Personnel profile LOA section ready",
      hint: 'Copy Snippet, then paste it into the "LOA/ROH" spoiler of the member\'s file by hand.',
    };
  }, [loaLink, startDate, endDate]);

  const generatedBBCode = useMemo(() => {
    if (!activeTemplate) return "";
    return activeTemplate.renderBody({
      personnelName,
      title,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      startWorkAt: startWorkAt.trim(),
      numberOfDays,
      extendedStartDate: extendedStartDate.trim(),
      extendedEndDate: extendedEndDate.trim(),
      extendedNumberOfDays,
      medicName: medicCredentials.name,
      medicRank: medicCredentials.rank,
      medicSignature: medicCredentials.signature,
      denialReasons:
        selectedTemplate === "denied"
          ? denialReasons.map((r) => r.trim()).filter(Boolean)
          : undefined,
      loaType,
      loaLink: loaLink.trim(),
    });
  }, [
    activeTemplate,
    personnelName,
    title,
    startDate,
    endDate,
    startWorkAt,
    numberOfDays,
    extendedStartDate,
    extendedEndDate,
    extendedNumberOfDays,
    medicCredentials,
    selectedTemplate,
    denialReasons,
    loaType,
    loaLink,
  ]);

  // The member's own request topic, as pasted above: the approval is a reply in
  // it, so this is both the page to open and the page the extension fills.
  const requestTopicUrl = loaLink.trim();

  const handleCopy = () => {
    copyBBCode({
      bbCodeText: generatedBBCode,
      post: {
        feature: "the LOA processor",
        url: requestTopicUrl || undefined,
      },
    });
  };

  // Same post, but it opens the request topic with it: the extension fills that
  // topic's quick reply as the page loads, so the reply is written before the
  // member has scrolled to it.
  const handleCopyAndOpenRequest = () => {
    if (!generatedBBCode || !requestTopicUrl) return;
    copyBBCodeAndOpen({
      bbCodeText: generatedBBCode,
      url: requestTopicUrl,
      post: {
        feature: "the LOA processor",
        url: pickPostTarget(requestTopicUrl, null),
      },
    });
  };

  // Copied, never handed over: the personnel file's LOA spoiler has to be edited
  // by hand in the file's own post, which is an edit page - and there is no post
  // id to open it with, so anything the extension did there could only replace
  // the member's file. Plain clipboard copy, pasted into the spoiler.
  const handleCopySnippet = () => {
    copyBBCode({ bbCodeText: personnelSnippet });
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
        transition={Bounce}
      />
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="space-y-5">
          {/* Template Selector */}
          <div className="panel-inner p-5">
            <Label className="mb-3 block text-sm font-medium text-muted-foreground">
              Select LOA Format
            </Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {loaTemplates.map((tmpl) => (
                <button
                  key={tmpl.value}
                  onClick={() => setSelectedTemplate(tmpl.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    selectedTemplate === tmpl.value
                      ? `${tmpl.border} ${tmpl.badge} scale-[1.02]`
                      : "border-border bg-surface-hover/50 text-muted-foreground hover:border-border hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  {templateIcons[tmpl.value]}
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Fill (LOA Active and Extended only) */}
          {(selectedTemplate === "approved" || selectedTemplate === "extended") && (
          <div className="panel-inner border-info/30 p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-sm font-semibold text-foreground">Quick Fill LOA Fields</h3>
            </div>
            <div className="flex gap-2">
              <Input
                value={quickFill}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuickFill(value);
                  handleQuickFill(value);
                }}
                placeholder="Rank FirstName LastName | [25/SEP/2026] to [09/OCT/2026]"
                className={`border-border bg-surface-hover/50 font-mono text-foreground placeholder:text-muted-foreground focus:border-cyan-500/50 ${
                  quickFillStatus === "success"
                    ? "border-emerald-300/50 dark:border-emerald-500/50"
                    : quickFillStatus === "error"
                      ? "border-red-300/50 dark:border-red-500/50"
                      : ""
                }`}
              />
            </div>
            {quickFillStatus !== "idle" && (
              <p
                className={`mt-2 flex items-center gap-1.5 text-[10px] ${
                  quickFillStatus === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {quickFillStatus === "success" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {quickFillStatus === "success"
                  ? "LOA fields filled successfully."
                  : 'Format not recognized. Use: Rank FirstName LastName | [25/SEP/2026] to [09/OCT/2026].'}
              </p>
            )}
            <p className="mt-2 text-[10px] text-muted-foreground">
              Copy the title of the LOA and paste it all here.
            </p>
          </div>
          )}

          {/* Personnel Info */}
          <div className="panel-inner p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-foreground">
                Personnel Information
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs text-muted-foreground">
                  Personnel Name
                </Label>
                <Input
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  placeholder="Enter full name (e.g., John Smith)"
                  className="border-border bg-surface-hover/50 text-foreground placeholder:text-muted-foreground focus:border-blue-500/50"
                />
              </div>

              <div>
                <Label className="mb-2 block text-xs text-muted-foreground">
                  Title
                </Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTitle("Mr.")}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      title === "Mr."
                        ? "border-blue-300/50 dark:border-blue-500/50 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                        : "border-border bg-surface-hover/50 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    Mr.
                  </button>
                  <button
                    onClick={() => setTitle("Ms.")}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      title === "Ms."
                        ? "border-pink-300/50 dark:border-pink-500/50 bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300"
                        : "border-border bg-surface-hover/50 text-muted-foreground hover:border-border hover:text-foreground"
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
            <div className="panel-inner p-5">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h3 className="text-sm font-semibold text-foreground">Leave Dates</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">
                    Start Date
                  </Label>
                  <Input
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value.toUpperCase())}
                    placeholder="DD/MMM/YYYY (e.g. 20/JUL/2026)"
                    className="border-border bg-surface-hover/50 font-mono text-foreground placeholder:text-muted-foreground focus:border-green-500/50"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">
                    End Date
                  </Label>
                  <Input
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value.toUpperCase())}
                    placeholder="DD/MMM/YYYY (e.g. 20/AUG/2026)"
                    className="border-border bg-surface-hover/50 font-mono text-foreground placeholder:text-muted-foreground focus:border-green-500/50"
                  />
                </div>
              </div>

              {/* Day Count */}
              {startDate && endDate && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-300/20 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {numberOfDays}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      {numberOfDays === 1 ? "1 day" : `${numberOfDays} days`}
                    </p>
                    <p className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60">
                      Duration automatically calculated
                    </p>
                  </div>
                  {numberOfDays > 30 && (
                    <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 px-2.5 py-1">
                      <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">
                        Requires HC Approval
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Date Fields (LOA Extended only) */}
          {selectedTemplate === "extended" && (
            <div className="panel-inner border-warning/30 p-5">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <h3 className="text-sm font-semibold text-foreground">Extension Dates</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">
                    Start Date
                  </Label>
                  <Input
                    value={extendedStartDate}
                    onChange={(e) => setExtendedStartDate(e.target.value.toUpperCase())}
                    placeholder="DD/MMM/YYYY (e.g. 20/JUL/2026)"
                    className="border-border bg-surface-hover/50 font-mono text-foreground placeholder:text-muted-foreground focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">
                    End Date
                  </Label>
                  <Input
                    value={extendedEndDate}
                    onChange={(e) => setExtendedEndDate(e.target.value.toUpperCase())}
                    placeholder="DD/MMM/YYYY (e.g. 20/AUG/2026)"
                    className="border-border bg-surface-hover/50 font-mono text-foreground placeholder:text-muted-foreground focus:border-orange-500/50"
                  />
                </div>
              </div>

              {/* Day Count */}
              {extendedStartDate && extendedEndDate && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-orange-300/20 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/10 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/20">
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {extendedNumberOfDays}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      {extendedNumberOfDays === 1 ? "1 day" : `${extendedNumberOfDays} days`}
                    </p>
                    <p className="text-[10px] text-orange-600/60 dark:text-orange-400/60">
                      Duration automatically calculated
                    </p>
                  </div>
                  {extendedNumberOfDays > 30 && (
                    <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 px-2.5 py-1">
                      <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">
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
            <div className="panel-inner p-5">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-semibold text-foreground">Work Schedule</h3>
              </div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">
                Start Work At
              </Label>
              <Input
                value={startWorkAt}
                onChange={(e) => setStartWorkAt(e.target.value.toUpperCase())}
                placeholder="DD/MMM/YYYY (e.g. 21/JUL/2026)"
                className="border-border bg-surface-hover/50 font-mono text-foreground placeholder:text-muted-foreground focus:border-amber-500/50"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Replaces the date after {'"tomorrow on"'}
              </p>
            </div>
          )}

          {/* Denial Reasons (conditional) */}
          {selectedTemplate === "denied" && (
            <div className="panel-inner border-destructive/30 p-5">
              <div className="mb-4 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <h3 className="text-sm font-semibold text-foreground">
                  Denial Reasons
                </h3>
              </div>

              <div className="space-y-2">
                {denialReasons.map((reason, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={reason}
                      onChange={(e) => {
                        const next = [...denialReasons];
                        next[index] = e.target.value;
                        setDenialReasons(next);
                      }}
                      placeholder={`Reason ${index + 1}`}
                      className="flex-1 border-border bg-surface-hover/50 text-foreground placeholder:text-muted-foreground focus:border-red-500/50"
                    />
                    {denialReasons.length > 1 && (
                      <Button
                        type="button"
                        onClick={() =>
                          setDenialReasons((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 shrink-0 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-[1.02] hover:bg-red-50/40 dark:hover:bg-red-950/40 hover:text-red-300"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={() => setDenialReasons((prev) => [...prev, ""])}
                variant="outline"
                size="sm"
                className="mt-3 border-border text-muted-foreground transition-all duration-200 hover:scale-[1.02] hover:border-red-500/40 hover:bg-red-50/20 dark:hover:bg-red-950/20 hover:text-red-200"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add reason
              </Button>
            </div>
          )}

          {/* Credentials Warning */}
          {isCredentialsEmpty && (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-300/20 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Staff credentials not set
                </p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                  Set your name, signature, and rank in the{" "}
                  <Link
                    href="/workspace/staff"
                    className="underline transition-colors hover:text-amber-300"
                  >
                    Staff Page
                  </Link>{" "}
                  so templates can auto-fill your information.
                </p>
              </div>
            </div>
          )}

          {/* Personnel File Section (LOA Approved only) */}
          {selectedTemplate === "approved" && (
            <div className="panel-inner border-primary/30 p-5">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-foreground">
                  Personnel File Section
                </h3>
              </div>

              {/* Leave Type checkboxes */}
              <div>
                <Label className="mb-2 block text-xs text-muted-foreground">
                  Leave Type
                </Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(["LOA", "ROH"] as const).map((type) => {
                    const isSelected = loaType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setLoaType(type)}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? type === "LOA"
                              ? "border-emerald-300/50 dark:border-emerald-500/50 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "border-blue-300/50 dark:border-blue-500/50 bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300"
                            : "border-border bg-surface-hover/50 text-muted-foreground hover:border-border hover:bg-surface-hover hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded border transition-all duration-200 ${
                            isSelected
                              ? type === "LOA"
                                ? "border-emerald-300 dark:border-emerald-400 bg-emerald-400 text-background"
                                : "border-blue-300 dark:border-blue-400 bg-blue-400 text-background"
                              : "border-border bg-surface-hover/50 text-transparent"
                          }`}
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Request Form Link */}
              <div className="mt-4">
                <Label className="mb-1.5 block text-xs text-muted-foreground">
                  Request Form Link
                </Label>
                <Input
                  value={loaLink}
                  onChange={(e) => setLoaLink(e.target.value)}
                  placeholder="Paste the request form URL (e.g. https://gov.eclipse-rp.net/viewtopic.php?t=12345)"
                  className="border-border bg-surface-hover/50 text-foreground placeholder:text-muted-foreground focus:border-blue-500/50"
                />
              </div>

              {/* Status Indicator */}
              <div
                className={`mt-4 flex items-center gap-2.5 rounded-xl border p-3 transition-colors duration-200 ${
                  snippetStatus.ready
                    ? "border-emerald-300/20 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10"
                    : "border-amber-300/20 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10"
                }`}
              >
                {snippetStatus.ready ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                )}
                <div className="min-w-0">
                  <p
                    className={`text-xs font-medium ${snippetStatus.ready ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}
                  >
                    {snippetStatus.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/80">
                    {snippetStatus.hint}
                  </p>
                </div>
              </div>

              {/* Snippet Preview */}
              {personnelSnippet && (
                <div className="mt-3 rounded-xl border border-border bg-surface-raised/60 p-3">
                  <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-emerald-800/90 dark:text-emerald-200/90">
                    {personnelSnippet}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={handleCopySnippet}
                  disabled={!personnelSnippet}
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                  Copy Snippet
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a
                    href="https://gov.eclipse-rp.net/viewforum.php?f=605"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Personnel Files
                  </a>
                </Button>
              </div>
            </div>
          )}

          {/* Personnel File Hint (other templates) */}
          {selectedTemplate !== "approved" && (
            <div className="rounded-2xl border border-blue-300/20 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-4">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Personnel File Section
                  </p>
                  <p className="mt-1 text-xs text-blue-600/70 dark:text-blue-400/70">
                    Update the personnel file by editing the spoiler tagged
                    &quot;LOA/ROH&quot; with the request form link.
                  </p>
                </div>
              </div>

              {/* The decision is a reply in the member's own request topic, so
                  the field the approved flow uses is needed here too - without
                  it Copy & Open Request has nothing to open. */}
              <div className="mt-3">
                <Label
                  htmlFor="loa-request-link"
                  className="mb-1.5 block text-xs text-muted-foreground"
                >
                  Request Form Link
                </Label>
                <Input
                  id="loa-request-link"
                  value={loaLink}
                  onChange={(e) => setLoaLink(e.target.value)}
                  placeholder="Paste the request form URL (e.g. https://gov.eclipse-rp.net/viewtopic.php?t=12345)"
                  className="border-border bg-surface-hover/50 text-foreground placeholder:text-muted-foreground focus:border-blue-500/50"
                />
                <p className="mt-1.5 text-[10px] text-blue-600/70 dark:text-blue-400/70">
                  Copy &amp; Open Request opens this topic and fills the reply
                  body in - no title, the decision is a reply in the member&apos;s
                  own request topic.
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <a
                    href="https://gov.eclipse-rp.net/viewforum.php?f=605"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Personnel Files
                  </a>
                </Button>
              </div>
            </div>
          )}

          {/* Copy Buttons */}
          <div className="space-y-3">
            {/* Wraps rather than overflows: the pair shares a row on a wide
                screen and stacks on a narrow one. */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCopy}
                disabled={!generatedBBCode}
                variant="gradient"
                size="lg"
                className="flex-1 basis-48"
              >
                <Copy className="h-4 w-4" />
                Copy BBCode
              </Button>
              <Button
                onClick={handleCopyAndOpenRequest}
                disabled={!generatedBBCode || !requestTopicUrl}
                variant="outline"
                size="lg"
                className="flex-1 basis-48"
                title={
                  requestTopicUrl
                    ? "Opens the request topic with this reply filled in"
                    : "Paste the Request Form Link above first"
                }
              >
                <ExternalLink className="h-4 w-4" />
                Copy &amp; Open Request
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">
                {requestTopicUrl
                  ? "Copy & Open Request opens the request topic with this reply ready: press Fill on the page to write it in, then Submit."
                  : "Paste the Request Form Link above to unlock Copy & Open Request, which opens that topic with the reply already written into it."}
              </p>
              <Button asChild variant="ghost" size="sm">
                <a
                  href="https://ecrplsems.com/tasks"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Mark task complete on LSEMS
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="panel">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
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
            <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-surface-raised/60 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
              {generatedBBCode || "// Fill in the fields to generate BBCode"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
