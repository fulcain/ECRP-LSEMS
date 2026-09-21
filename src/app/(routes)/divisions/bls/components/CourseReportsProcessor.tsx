"use client";

import { useMedic } from "@/app/context/MedicContext";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { directorTitleForDivisionKey } from "@/app/constants/general/directorRoles";
import {
  renderCourseReport,
  type CourseReportType,
} from "@/app/templates/bls-formats/course-report";
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
import { TabBar, type Tab } from "@/components/ui/tab-bar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  BadgeDollarSign,
  BookOpen,
  Calendar as CalendarIcon,
  Check,
  ClipboardCopy,
  ExternalLink,
  GraduationCap,
  MapPin,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const COPIED_FLASH_MS = 1800;

const REPORT_OPTIONS: Tab<CourseReportType>[] = [
  {
    value: "joint",
    label: "Joint BLS Course Reports",
    icon: GraduationCap,
    accent: "border-cyan-300/40 dark:border-cyan-400/40 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
  },
  {
    value: "normal",
    label: "Normal BLS Course Reports",
    icon: GraduationCap,
    accent: "border-emerald-300/40 dark:border-emerald-400/40 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  },
  {
    value: "ots",
    label: "On the Spot Classes",
    icon: GraduationCap,
    accent: "border-violet-300/40 dark:border-violet-400/40 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300",
  },
];

const HUE = 190; // cyan accent for the course reports tab

/** Strips non-digits and groups with commas: "10000" → "10,000" */
function formatFunds(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

/** One row of a name + optional department/company. */
type PersonRow = { name: string; company: string };

/** Departments/companies selectable for student & graduate rows (Normal/OTS). */
const COMPANY_OPTIONS = [
  "CIV",
  "JB",
  "DCC",
  "Bayview",
  "Bennys",
  "Weazel",
  "DOC",
  "PD",
  "SD",
  "EMS",
  "Reapplicants",
] as const;

/** Pricing hint posted alongside BLS course reports. */
const PRICE_HINT_BBCODE = `Full Price: $20,000 cash or $21,000 wire.
Discount: $10,000 cash or $11,000 wire for JB, DCC, Bayview, Bennys & Weazel personnel.
Free: SADOC (CO1+), LSPD, Reapplicants, LSSD & LSEMS`;

/** GOV topic each report type is posted into. */
const REPORT_TOPIC_URLS: Record<CourseReportType, string> = {
  joint: "https://gov.eclipse-rp.net/viewtopic.php?t=222067",
  normal: "https://gov.eclipse-rp.net/viewtopic.php?t=129042",
  ots: "https://gov.eclipse-rp.net/viewtopic.php?t=129042",
};

export function CourseReportsProcessor() {
  const { medicCredentials, divisionRanks } = useMedic();
  const [reportType, setReportType] = useLocalStorage<CourseReportType>(
    "bls-course-report-type",
    "joint",
  );

  // Sync initial report type from URL query param (takes priority over localStorage)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("type") as CourseReportType | null;
    if (fromUrl && REPORT_OPTIONS.some((o) => o.value === fromUrl)) {
      setReportType(fromUrl);
    }
  }, [setReportType]);

  // Sync URL when report type changes (skip initial mount)
  const reportFirstRender = useRef(true);
  useEffect(() => {
    if (reportFirstRender.current) {
      reportFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.delete("format");
    params.set("type", reportType);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }, [reportType]);

  // Every input persists to localStorage so a refresh never wipes the draft.
  const [dateIso, setDateIso] = useLocalStorage<string>("bls-cr-date", "");
  const parsedDate = dateIso ? new Date(dateIso) : undefined;
  const date =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate
      : undefined;
  const [time, setTime] = useLocalStorage<string>("bls-cr-time", "12:00");
  const [isMe, setIsMe] = useLocalStorage<boolean>("bls-cr-is-me", false);
  const [instructorsInput, setInstructorsInput] = useLocalStorage<string>(
    "bls-cr-instructors",
    "",
  );
  const [location, setLocation] = useLocalStorage<string>(
    "bls-cr-location",
    "Pillbox MD",
  );
  const [graduates, setGraduates] = useLocalStorage<PersonRow[]>(
    "bls-cr-graduates",
    [{ name: "", company: "" }],
  );
  const [guideEmailSent, setGuideEmailSent] = useLocalStorage<boolean>(
    "bls-cr-guide-email",
    false,
  );
  const [fundsObtained, setFundsObtained] = useLocalStorage<string>(
    "bls-cr-funds",
    "",
  );
  const [moneyGivenToGovernment, setMoneyGivenToGovernment] =
    useLocalStorage<boolean>("bls-cr-gov-money", false);
  const [receiptUrl, setReceiptUrl] = useLocalStorage<string>(
    "bls-cr-receipt",
    "",
  );
  const [receiptWeazelUrl, setReceiptWeazelUrl] = useLocalStorage<string>(
    "bls-cr-receipt-weazel",
    "",
  );
  const [officersInput, setOfficersInput] = useLocalStorage<string>(
    "bls-cr-officers",
    "",
  );
  const [students, setStudents] = useLocalStorage<PersonRow[]>(
    "bls-cr-students",
    [{ name: "", company: "" }],
  );
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | undefined>(undefined);

  // Clear any in-flight "Copied!" flash if the component unmounts mid-flash.
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== undefined) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const addGraduate = () =>
    setGraduates((prev) => [...prev, { name: "", company: "" }]);
  const removeGraduate = (index: number) =>
    setGraduates((prev) => prev.filter((_, i) => i !== index));
  const updateGraduate = (
    index: number,
    field: keyof PersonRow,
    value: string,
  ) =>
    setGraduates((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );

  const addStudent = () =>
    setStudents((prev) => [...prev, { name: "", company: "" }]);
  const removeStudent = (index: number) =>
    setStudents((prev) => prev.filter((_, i) => i !== index));
  const updateStudent = (
    index: number,
    field: keyof PersonRow,
    value: string,
  ) =>
    setStudents((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );

  // When "It's me" is checked, the first instructor slot is auto-filled with
  // the saved rank + name from the Staff page.
  const meInstructor = [medicCredentials.rank, medicCredentials.name]
    .filter(Boolean)
    .join(" ");

  // "EMS Rank | BLS Rank" line used by the OTS signature block, or the
  // director's own title when they cover Basic Life Support.
  const blsRank = divisionRanks["Basic Life Support"] ?? "";
  const directorTitle = directorTitleForDivisionKey(
    medicCredentials.directorRole,
    "bls",
  );
  const medicRankLine = directorTitle
    ? `${directorTitle} / ${medicCredentials.rank}`
    : blsRank
      ? `${medicCredentials.rank} | ${blsRank}`
      : medicCredentials.rank || undefined;

  const dateStr = date
    ? format(date, "dd/MMM/yyyy").toUpperCase()
    : "01/JUL/2026";

  const bbcodeOutput = useMemo(() => {
    // Single instructor input, split on "&": "RANK A & RANK B" → two lines.
    const typedInstructors = instructorsInput
      .split("&")
      .map((entry) => entry.trim())
      .filter(Boolean);
    const effectiveInstructors = isMe
      ? meInstructor
        ? [meInstructor]
        : []
      : typedInstructors;

    // Graduates: plain names for joint, "Name - Company" for normal.
    const graduateLines = graduates
      .map((graduate) => {
        const name = graduate.name.trim();
        if (!name) return "";
        return reportType === "normal" && graduate.company
          ? `${name} - ${graduate.company}`
          : name;
      })
      .filter(Boolean);

    // Students (OTS): "Name - Company".
    const studentLines = students
      .map((student) => {
        const name = student.name.trim();
        if (!name) return "";
        return student.company ? `${name} - ${student.company}` : name;
      })
      .filter(Boolean);

    // Officers (OTS): single input, split on "&" like instructors.
    const officerLines = officersInput
      .split("&")
      .map((entry) => entry.trim())
      .filter(Boolean);

    return renderCourseReport({
      type: reportType,
      date: dateStr,
      time: time || undefined,
      instructors: effectiveInstructors,
      location,
      graduates: graduateLines,
      guideEmailSent,
      fundsObtained: formatFunds(fundsObtained) || undefined,
      moneyGivenToGovernment,
      receiptUrl: receiptUrl.trim() || undefined,
      officers: officerLines,
      students: studentLines,
      receiptWeazelUrl: receiptWeazelUrl.trim() || undefined,
      medicName: medicCredentials.name || undefined,
      medicRank: medicRankLine,
      medicSignature: medicCredentials.signature || undefined,
    });
  }, [
    reportType,
    dateStr,
    time,
    instructorsInput,
    isMe,
    meInstructor,
    location,
    graduates,
    guideEmailSent,
    fundsObtained,
    moneyGivenToGovernment,
    receiptUrl,
    officersInput,
    students,
    receiptWeazelUrl,
    medicCredentials.name,
    medicRankLine,
    medicCredentials.signature,
  ]);

  const flashCopied = () => {
    if (copyTimerRef.current !== undefined) {
      window.clearTimeout(copyTimerRef.current);
    }
    setCopied(true);
    copyTimerRef.current = window.setTimeout(
      () => setCopied(false),
      COPIED_FLASH_MS,
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bbcodeOutput);
    flashCopied();
  };

  // Open first so the popup is not blocked by the await below losing the
  // user-activation window, then copy.
  const handleCopyAndOpen = () => {
    window.open(REPORT_TOPIC_URLS[reportType], "_blank", "noopener,noreferrer");
    void navigator.clipboard.writeText(bbcodeOutput).then(flashCopied);
  };

  const hsl = `${HUE} 70% 55%`;

  return (
    <>
      {/* ── Self-contained one-shot entry animations ── */}
      <style>{`
        @keyframes crFadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes crCheckPop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .cr-animate-fade-up {
          animation: crFadeSlideUp 0.35s ease-out both;
        }
        .cr-animate-check {
          animation: crCheckPop 0.4s ease-out both;
        }
      `}</style>
      {/* ── Sub-tab selector (Joint / Normal) ── */}
      <TabBar
        tabs={REPORT_OPTIONS}
        active={reportType}
        onChange={setReportType}
        ariaLabel="BLS course report type"
        className="mb-6"
      />

      {/* ── Course Pricing Guide ── */}
      <div
        className="cr-animate-fade-up relative mb-6 overflow-hidden rounded-[1.5rem] border bg-[linear-gradient(135deg,hsl(190_80%_96%_/_0.9),hsl(190_85%_90%_/_0.95))] border-[hsl(190_70%_55%_/_0.4)] transition-colors duration-200 dark:bg-[linear-gradient(135deg,hsl(190_65%_8%_/_0.9),hsl(190_50%_3%_/_0.95))]"
      >
        {/* Animated gradient wash */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background: `radial-gradient(circle at 15% 25%, hsl(${hsl} / 0.25) 0%, transparent 50%),
                         radial-gradient(circle at 85% 80%, hsl(${HUE + 40} 70% 55% / 0.15) 0%, transparent 45%)`,
          }}
        />
        <div className="relative p-5 lg:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-lg"
                style={{
                  borderColor: `hsl(${hsl} / 0.45)`,
                  backgroundColor: `hsl(${hsl} / 0.18)`,
                }}
              >
                <BadgeDollarSign
                  className="h-5 w-5"
                  style={{ color: `hsl(${hsl})` }}
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-cyan-700 dark:text-cyan-300 uppercase">
                  Course Pricing
                </p>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  Price Guide &amp; Discounts
                </h3>
              </div>
            </div>
          </div>
          {/* A dark code block in both themes - the hint is BBCode meant for
              pasting, and a dark terminal panel reads as such in light too. */}
          <pre
            className="overflow-x-auto rounded-xl border p-4 font-mono text-xs leading-relaxed"
            style={{
              borderColor: `hsl(${hsl} / 0.25)`,
              backgroundColor: "rgba(2, 6, 23, 0.85)",
              color: "hsl(210 40% 92%)",
            }}
          >
            {PRICE_HINT_BBCODE}
          </pre>
        </div>
      </div>

      <div className="panel relative overflow-hidden">
        {/* The status colour as a single accent line rather than a wash. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-70"
          style={{
            background: `radial-gradient(circle at 20% 30%, hsl(${hsl} / 0.18) 0%, transparent 45%),
                         radial-gradient(circle at 80% 70%, hsl(${HUE + 40} 70% 55% / 0.10) 0%, transparent 40%)`,
          }}
        />

        <div className="relative grid gap-8 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          {/* ════ LEFT COLUMN ════ */}
          <section className="min-w-0 space-y-6">
            {/* ── Course Report Builder ── */}
            <div className="panel-inner p-5 transition-colors hover:border-primary/30">
              <div className="mb-4 flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `hsl(${hsl} / 0.2)` }}
                >
                  <GraduationCap
                    className="h-4 w-4"
                    style={{ color: `hsl(${hsl})` }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Course Report Builder
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                {/* ── Date & Time ── */}
                <div
                  className="cr-animate-fade-up space-y-4 rounded-xl border border-border bg-surface-hover/40 p-4"
                  key={reportType + "-datetime"}
                >
                  <p className="text-xs font-semibold tracking-[0.18em] text-cyan-700 dark:text-cyan-300 uppercase">
                    Date &amp; Time
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="course-report-date">Course date</Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start border-border bg-surface-hover text-left font-normal text-foreground transition-all duration-200 hover:border-border",
                              !date && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date
                              ? format(date, "dd/MMM/yyyy").toUpperCase()
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
                            onSelect={(d) =>
                              setDateIso(d ? d.toISOString() : "")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Input
                        id="course-report-time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-[140px] border-border bg-surface-hover text-foreground transition-all duration-200 hover:border-border focus-visible:ring-2"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Date renders as{" "}
                      <span className="font-mono">DD/MMM/YYYY</span>. Time is
                      24-hour <span className="font-mono">HH:MM</span>.
                    </p>
                  </div>
                </div>

                {/* ── Instructor ── */}
                <div
                  className="cr-animate-fade-up space-y-3 rounded-xl border border-border bg-surface-hover/40 p-4"
                  key={reportType + "-instructor"}
                >
                  <p className="text-xs font-semibold tracking-[0.18em] text-cyan-700 dark:text-cyan-300 uppercase">
                    Instructor
                  </p>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface-hover/60 px-3 py-2 text-sm text-foreground transition-all duration-200 hover:border-cyan-500/40 hover:bg-cyan-50/20 dark:hover:bg-cyan-950/20">
                    <input
                      type="checkbox"
                      checked={isMe}
                      onChange={(e) => setIsMe(e.target.checked)}
                      className="h-4 w-4 accent-cyan-500"
                    />
                    <span>
                      It&apos;s me - auto-fill my rank &amp; name
                      {meInstructor && (
                        <span className="ml-2 rounded-md bg-cyan-100 dark:bg-cyan-500/15 px-1.5 py-0.5 font-mono text-xs text-cyan-700 dark:text-cyan-300">
                          {meInstructor}
                        </span>
                      )}
                    </span>
                  </label>
                  {isMe && !meInstructor && (
                    <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                      No saved rank &amp; name found - set them on the{" "}
                      <span className="font-medium">Staff page</span> to
                      auto-fill, or uncheck to type it manually.
                    </p>
                  )}

                  <Input
                    value={isMe ? meInstructor : instructorsInput}
                    onChange={(e) => setInstructorsInput(e.target.value)}
                    disabled={isMe}
                    placeholder="RANK NAME"
                    className="w-full border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-all duration-200 hover:border-cyan-500/50 focus-visible:ring-2 focus-visible:ring-cyan-400/30 dark:focus-visible:ring-cyan-500/30 disabled:opacity-60"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isMe ? (
                      <>
                        Uncheck to type multiple instructors separated with{" "}
                        <span className="font-mono">&amp;</span>.
                      </>
                    ) : (
                      <>
                        Separate multiple instructors with{" "}
                        <span className="font-mono">&amp;</span> - e.g.{" "}
                        <span className="font-mono">
                          RANK NAME &amp; RANK NAME
                        </span>{" "}
                        - each renders on its own line.
                      </>
                    )}
                  </p>
                </div>

                {/* ── Officer(s) name (OTS only) ── */}
                {reportType === "ots" && (
                  <div
                    className="cr-animate-fade-up space-y-3 rounded-xl border border-border bg-surface-hover/40 p-4"
                    key={reportType + "-officers"}
                  >
                    <p className="text-xs font-semibold tracking-[0.18em] text-violet-700 dark:text-violet-300 uppercase">
                      Officer(s) name
                    </p>
                    <Input
                      value={officersInput}
                      onChange={(e) => setOfficersInput(e.target.value)}
                      placeholder="Officer Name"
                      className="w-full border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-all duration-200 hover:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-400/30 dark:focus-visible:ring-violet-500/30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple officers with{" "}
                      <span className="font-mono">&amp;</span> - e.g.{" "}
                      <span className="font-mono">
                        Officer Name &amp; Officer Name
                      </span>{" "}
                      - each renders on its own line.
                    </p>
                  </div>
                )}

                {/* ── Students (OTS only) ── */}
                {reportType === "ots" && (
                  <div
                    className="cr-animate-fade-up space-y-3 rounded-xl border border-border bg-surface-hover/40 p-4"
                    key={reportType + "-students"}
                  >
                    <p className="text-xs font-semibold tracking-[0.18em] text-violet-700 dark:text-violet-300 uppercase">
                      Students
                    </p>
                    <div className="space-y-2">
                      {students.map((student, index) => {
                        const isLast = index === students.length - 1;
                        return (
                          <div
                            key={index}
                            className="cr-animate-fade-up flex flex-wrap items-center gap-2"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-hover/50 font-mono text-xs text-muted-foreground">
                              {index + 1}
                            </span>
                            <Input
                              value={student.name}
                              onChange={(e) =>
                                updateStudent(index, "name", e.target.value)
                              }
                              placeholder="Fname Lname"
                              className="min-w-[140px] flex-1 border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-all duration-200 hover:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-400/30 dark:focus-visible:ring-violet-500/30"
                            />
                            <Select
                              value={student.company}
                              onValueChange={(value) =>
                                updateStudent(index, "company", value)
                              }
                            >
                              <SelectTrigger className="h-10 w-[140px] shrink-0 border-border bg-surface-hover text-foreground transition-all duration-200 hover:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-400/30 dark:focus-visible:ring-violet-500/30">
                                <SelectValue placeholder="Company" />
                              </SelectTrigger>
                              <SelectContent className="border-border/80 bg-surface text-foreground">
                                {COMPANY_OPTIONS.map((company) => (
                                  <SelectItem key={company} value={company}>
                                    {company}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {isLast ? (
                              <Button
                                type="button"
                                onClick={addStudent}
                                size="icon"
                                title="Add student"
                                className="h-10 w-10 shrink-0 bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-1 ring-violet-300/30 dark:ring-violet-500/30 transition-all duration-200 hover:scale-[1.02] hover:bg-violet-500/30 hover:text-violet-200"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                onClick={() => removeStudent(index)}
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 shrink-0 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-[1.02] hover:bg-red-50/40 dark:hover:bg-red-950/40 hover:text-red-300"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Combines with the selected department as{" "}
                      <span className="font-mono">
                        Fname Lname - Company
                      </span>
                      .
                    </p>
                  </div>
                )}

                {/* ── Location (joint/normal only) ── */}
                {reportType !== "ots" && (
                  <div
                    className="cr-animate-fade-up space-y-2 rounded-xl border border-border bg-surface-hover/40 p-4"
                    key={reportType + "-location"}
                  >
                    <p className="text-xs font-semibold tracking-[0.18em] text-cyan-700 dark:text-cyan-300 uppercase">
                      Location
                    </p>
                    <div className="flex items-center gap-2">
                      <MapPin
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        style={{ color: `hsl(${hsl} / 0.7)` }}
                      />
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger className="w-full border-border bg-surface-hover text-foreground transition-all duration-200 hover:border-border focus-visible:ring-2">
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent className="border-border/80 bg-surface text-foreground">
                          <SelectItem value="Pillbox MD">Pillbox MD</SelectItem>
                          <SelectItem value="Paleto MD">Paleto MD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* ── Course Graduates (joint/normal only) ── */}
                {reportType !== "ots" && (
                  <div
                    className="cr-animate-fade-up space-y-3 rounded-xl border border-border bg-surface-hover/40 p-4"
                    key={reportType + "-graduates"}
                  >
                    <p className="text-xs font-semibold tracking-[0.18em] text-red-700 dark:text-red-300 uppercase">
                      Course Graduates
                    </p>
                    <div className="space-y-2">
                      {graduates.map((graduate, index) => {
                        const isLast = index === graduates.length - 1;
                        return (
                          <div
                            key={index}
                            className="cr-animate-fade-up flex flex-wrap items-center gap-2"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-hover/50 font-mono text-xs text-muted-foreground">
                              {index + 1}
                            </span>
                            <Input
                              value={graduate.name}
                              onChange={(e) =>
                                updateGraduate(index, "name", e.target.value)
                              }
                              placeholder="Firstname Lastname"
                              className="min-w-[140px] flex-1 border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-all duration-200 hover:border-red-500/50 focus-visible:ring-2 focus-visible:ring-red-400/30 dark:focus-visible:ring-red-500/30"
                            />
                            {reportType === "normal" && (
                              <Select
                                value={graduate.company}
                                onValueChange={(value) =>
                                  updateGraduate(index, "company", value)
                                }
                              >
                                <SelectTrigger className="h-10 w-[140px] shrink-0 border-border bg-surface-hover text-foreground transition-all duration-200 hover:border-red-500/50 focus-visible:ring-2 focus-visible:ring-red-400/30 dark:focus-visible:ring-red-500/30">
                                  <SelectValue placeholder="Company" />
                                </SelectTrigger>
                                <SelectContent className="border-border/80 bg-surface text-foreground">
                                  {COMPANY_OPTIONS.map((company) => (
                                    <SelectItem key={company} value={company}>
                                      {company}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {isLast ? (
                              <Button
                                type="button"
                                onClick={addGraduate}
                                size="icon"
                                title="Add graduate"
                                className="h-10 w-10 shrink-0 bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300 ring-1 ring-red-300/30 dark:ring-red-500/30 transition-all duration-200 hover:scale-[1.02] hover:bg-red-500/30 hover:text-red-200"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                onClick={() => removeGraduate(index)}
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 shrink-0 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-[1.02] hover:bg-red-50/40 dark:hover:bg-red-950/40 hover:text-red-300"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {reportType === "normal" && (
                      <p className="text-xs text-muted-foreground">
                        Combines with the selected department as{" "}
                        <span className="font-mono">
                          Firstname Lastname - Company
                        </span>
                        .
                      </p>
                    )}
                  </div>
                )}

                {/* ── Confirmation (funds, gov money, receipts) ── */}
                <div
                  className="cr-animate-fade-up space-y-3 rounded-xl border border-border bg-surface-hover/40 p-4"
                  key={reportType + "-guide"}
                >
                  <p className="text-xs font-semibold tracking-[0.18em] text-cyan-700 dark:text-cyan-300 uppercase">
                    {reportType === "normal"
                      ? "Funds & Confirmation"
                      : reportType === "ots"
                        ? "Funds & Receipts"
                        : "Confirmation"}
                  </p>

                  {reportType !== "joint" && (
                    <div className="space-y-2">
                      <Label htmlFor="course-report-funds">
                        Funds obtained
                      </Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="course-report-funds"
                          inputMode="numeric"
                          value={fundsObtained}
                          onChange={(e) =>
                            setFundsObtained(
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          placeholder="10000"
                          className="border-border bg-surface-hover pl-7 text-foreground placeholder:text-muted-foreground transition-all duration-200 hover:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-400/30 dark:focus-visible:ring-emerald-500/30"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Converts to{" "}
                        <span className="font-mono">
                          ${formatFunds(fundsObtained) || "N/A"}
                        </span>{" "}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {reportType !== "joint" && (
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface-hover/60 px-3 py-2 text-sm text-foreground transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20">
                        <input
                          type="checkbox"
                          checked={moneyGivenToGovernment}
                          onChange={(e) =>
                            setMoneyGivenToGovernment(e.target.checked)
                          }
                          className="h-4 w-4 accent-emerald-500"
                        />
                        <span>
                          Money given to the Government?{" "}
                          <span className="font-mono text-xs text-muted-foreground">
                            {moneyGivenToGovernment ? "[✓]" : "[ ]"}
                          </span>
                        </span>
                      </label>
                    )}
                    {reportType !== "ots" && (
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface-hover/60 px-3 py-2 text-sm text-foreground transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20">
                        <input
                          type="checkbox"
                          checked={guideEmailSent}
                          onChange={(e) => setGuideEmailSent(e.target.checked)}
                          className="h-4 w-4 accent-emerald-500"
                        />
                        <span>
                          BLS Guide email sent?{" "}
                          <span className="font-mono text-xs text-muted-foreground">
                            {guideEmailSent ? "[✓]" : "[ ]"}
                          </span>
                        </span>
                      </label>
                    )}
                  </div>

                  {/* ── Guide link (near the BLS Guide email confirmation) ── */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {reportType === "joint" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            "https://gov.eclipse-rp.net/viewtopic.php?t=222071",
                            "_blank",
                          )
                        }
                        className="border-border text-muted-foreground transition-all duration-200 hover:scale-[1.02] hover:border-cyan-500/40 hover:bg-cyan-50/20 dark:hover:bg-cyan-950/20 hover:text-cyan-200"
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        Open Guide Topic
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            "/divisions/bls?tab=formats&format=quick-guide",
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        className="border-border text-muted-foreground transition-all duration-200 hover:scale-[1.02] hover:border-cyan-500/40 hover:bg-cyan-50/20 dark:hover:bg-cyan-950/20 hover:text-cyan-200"
                      >
                        <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                        BLS Quick Guide
                      </Button>
                    )}
                  </div>

                  {reportType !== "joint" && (
                    <div className="space-y-2">
                      <Label htmlFor="course-report-receipt">
                        {reportType === "ots"
                          ? "Receipt (funds) attachment URL"
                          : "Receipt attachment URL"}
                      </Label>
                      <Input
                        id="course-report-receipt"
                        type="url"
                        value={receiptUrl}
                        onChange={(e) => setReceiptUrl(e.target.value)}
                        placeholder="https://i.ibb.co/…"
                        className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-all duration-200 hover:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-400/30 dark:focus-visible:ring-emerald-500/30"
                      />
                      <p className="text-xs text-muted-foreground">
                        Goes inside the BBCode link:{" "}
                        <span className="font-mono">
                          [url=YOUR-URL]*Attachment*[/url]
                        </span>
                        . Leave empty if there is no receipt — the report will
                        print <span className="font-mono">N/A</span>.
                      </p>
                    </div>
                  )}

                  {reportType === "ots" && (
                    <div className="space-y-2">
                      <Label htmlFor="course-report-receipt-weazel">
                        Receipt (Weazel) attachment URL
                      </Label>
                      <Input
                        id="course-report-receipt-weazel"
                        type="url"
                        value={receiptWeazelUrl}
                        onChange={(e) => setReceiptWeazelUrl(e.target.value)}
                        placeholder="https://i.ibb.co/…"
                        className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-all duration-200 hover:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-400/30 dark:focus-visible:ring-emerald-500/30"
                      />
                      <p className="text-xs text-muted-foreground">
                        Goes inside the BBCode link:{" "}
                        <span className="font-mono">
                          [url=YOUR-URL]*Attachment*[/url]
                        </span>
                        . Leave empty if there is no receipt — the report will
                        print <span className="font-mono">N/A</span>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </section>

          {/* ════ RIGHT COLUMN ════ */}
          <section className="min-w-0 space-y-6">
            {/* ── Generated Output ── */}
            <div className="panel-inner p-5 transition-colors hover:border-primary/30">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Generated Output
                  </p>
                  <h3 className="mt-0.5 text-xl font-semibold text-foreground">
                    Ready to paste BBCode
                  </h3>
                </div>
                <div className="flex items-start gap-2">
                  <Button
                    onClick={handleCopyAndOpen}
                    variant="outline"
                    size="default"
                    className="border-border text-muted-foreground transition-all duration-200 hover:scale-[1.02] hover:border-cyan-500/40 hover:bg-cyan-50/20 dark:hover:bg-cyan-950/20 hover:text-cyan-200 active:scale-[0.98]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Copy &amp; Open Report
                  </Button>
                  <Button
                    onClick={handleCopy}
                    size="default"
                    className={`transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      copied
                        ? "bg-emerald-600 text-foreground hover:bg-emerald-500"
                        : ""
                    }`}
                    style={
                      !copied
                        ? { backgroundColor: `hsl(${hsl})`, color: "white" }
                        : {}
                    }
                  >
                    {copied ? (
                      <Check className="cr-animate-check h-4 w-4" />
                    ) : (
                      <ClipboardCopy className="h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy BBCode"}
                  </Button>
                </div>
              </div>

              <Textarea
                value={bbcodeOutput}
                readOnly
                className="min-h-[340px] resize-none border-border/60 bg-background/80 font-mono text-sm leading-relaxed text-foreground transition-all duration-200 focus-visible:ring-2 lg:min-h-[460px]"
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
