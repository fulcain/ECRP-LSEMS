"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import Image from "next/image";
import {
  Check,
  ClipboardCopy,
  ExternalLink,
  Plus,
  ShieldCheck,
  Signature,
  Tag,
  X,
} from "lucide-react";
import { useMedic } from "@/app/context/MedicContext";
import { redTemplates } from "@/app/templates/red-formats";
import { BodyAndMainTitle } from "@/components/layout/main-and-title";
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
import { Textarea } from "@/components/ui/textarea";

const COPIED_FLASH_MS = 1800;

const genderOptions = ["Mr.", "Mrs."] as const;

/** Maps a format value to a distinct hue for lifecycle styling */
const formatHue: Record<string, string> = {
  "pending-review": "142",
  "pending-edit": "45",
  denied: "0",
  withdrawn: "30",
  "pending-interview": "190",
  "interview-scheduled": "200",
  "pending-decision": "270",
  "pending-contract": "170",
  accepted: "160",
  "feedback-request": "210",
  "frd-feedback-request": "250",
  "pending-employer-feedback": "40",
  "discord-invite": "220",
};


export default function REDFormatsPage() {
  const { medicCredentials, divisionRanks } = useMedic();
  const [selectedFormat, setSelectedFormat] = useState<
    (typeof redTemplates)[number]["value"]
  >(redTemplates[0].value);
  const [gender, setGender] = useState<(typeof genderOptions)[number]>(
    genderOptions[0],
  );
  const [applicantName, setApplicantName] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedTitleTag, setCopiedTitleTag] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const copyTimerRef = useRef<number | undefined>(undefined);
  const prevFormatRef = useRef(selectedFormat);

  // Trigger a subtle re-animation when the format changes
  useEffect(() => {
    if (prevFormatRef.current !== selectedFormat) {
      setAnimKey((k) => k + 1);
      prevFormatRef.current = selectedFormat;
    }
  }, [selectedFormat]);

  // Clear any in-flight "Copied!" flash if the component unmounts mid-flash.
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== undefined) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);
  const [reasons, setReasons] = useState<string[]>([""]);
  const [denialType, setDenialType] = useLocalStorage<"IC" | "OOC">(
    "red-formats:denialType",
    "OOC",
  );
  const [applyOtherChar, setApplyOtherChar] = useLocalStorage<
    "may" | "may not"
  >("red-formats:applyOtherChar", "may");
  const [weeks, setWeeks] = useLocalStorage<number>(
    "red-formats:weeks",
    2,
  );
  const [employeeName] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");

  const addReason = () => setReasons((prev) => [...prev, ""]);
  const removeReason = (index: number) =>
    setReasons((prev) => prev.filter((_, i) => i !== index));
  const updateReason = (index: number, value: string) =>
    setReasons((prev) => prev.map((r, i) => (i === index ? value : r)));

  const activeFormat =
    redTemplates.find((format) => format.value === selectedFormat) ??
    redTemplates[0];
  const redRank = divisionRanks.RED ?? "";

  const hue = formatHue[activeFormat.value] ?? "0";
  const hsl = `${hue} 70% 55%`;

  const bbcodeOutput = useMemo(() => {
    const applicant = `${gender} ${applicantName.trim() || "Applicant Name"}`;
    const medicRank = redRank
      ? `${medicCredentials.rank} / ${redRank}`
      : medicCredentials.rank || undefined;
    return activeFormat.renderBody({
      applicant,
      reasons,
      medicName: medicCredentials.name || undefined,
      medicRank,
      medicSignature: medicCredentials.signature || undefined,
      denialType,
      applyOtherChar,
      weeks,
      employeeName: employeeName || undefined,
      interviewDate: interviewDate || undefined,
      interviewTime: interviewTime || undefined,
    });
  }, [
    activeFormat,
    applicantName,
    gender,
    reasons,
    medicCredentials.name,
    medicCredentials.rank,
    medicCredentials.signature,
    redRank,
    denialType,
    applyOtherChar,
    weeks,
    employeeName,
    interviewDate,
    interviewTime,
  ]);

  const flashCopied = (setter: (value: boolean) => void) => {
    if (copyTimerRef.current !== undefined) {
      window.clearTimeout(copyTimerRef.current);
    }
    setter(true);
    copyTimerRef.current = window.setTimeout(
      () => setter(false),
      COPIED_FLASH_MS,
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bbcodeOutput);
    setCopiedTitleTag(false);
    flashCopied(setCopied);
  };

  const handleCopyTitleTag = async () => {
    if (!activeFormat.titleTag) return;
    await navigator.clipboard.writeText(activeFormat.titleTag);
    setCopied(false);
    flashCopied(setCopiedTitleTag);
  };

  return (
    <>
      {/* ── Animated background keyframes ── */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px color-mix(in srgb, hsl(${hsl}) 15%, transparent); }
          50% { box-shadow: 0 0 40px color-mix(in srgb, hsl(${hsl}) 30%, transparent); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkPop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, hsl(${hsl}) 30%, transparent); }
          50% { box-shadow: 0 0 0 8px color-mix(in srgb, hsl(${hsl}) 0%, transparent); }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 12s ease infinite;
        }
        .animate-glow {
          animation: pulseGlow 3s ease-in-out infinite;
        }
        .animate-fade-up {
          animation: fadeSlideUp 0.35s ease-out both;
        }
        .animate-check {
          animation: checkPop 0.4s ease-out both;
        }
        .animate-badge-pulse {
          animation: badgePulse 2.5s ease-in-out infinite;
        }
      `}</style>

      <BodyAndMainTitle
        title="RED Formats"
        description="Build RED application responses with saved staff credentials and quick-swap BBCode placeholders."
      >
        <div
          key={animKey}
          className="animate-glow relative overflow-hidden rounded-[2rem] border backdrop-blur-sm transition-all duration-700"
          style={{
            borderColor: `hsl(${hue} 70% 50% / 0.25)`,
            background: `linear-gradient(135deg, hsl(${hue} 60% 6% / 0.95), hsl(${hue} 50% 3% / 0.98))`,
          }}
        >
          {/* Animated gradient overlay */}
          <div
            className="animate-gradient pointer-events-none absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(circle at 20% 30%, hsl(${hsl} / 0.18) 0%, transparent 45%),
                           radial-gradient(circle at 80% 70%, hsl(${parseInt(hue) + 40} 70% 55% / 0.10) 0%, transparent 40%)`,
            }}
          />
          {/* Extra subtle grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(hsla(0,0%,100%,0.1) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.1) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative grid gap-8 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            {/* ════ LEFT COLUMN ════ */}
            <section className="space-y-6">
              {/* ── Application Builder ── */}
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
                <div className="mb-4 flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `hsl(${hsl} / 0.2)` }}
                  >
                    <ShieldCheck className="h-4 w-4" style={{ color: `hsl(${hsl})` }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      Application Builder
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Format Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="red-format">Format</Label>
                    <Select
                      value={selectedFormat}
                      onValueChange={(value) =>
                        setSelectedFormat(
                          value as (typeof redTemplates)[number]["value"],
                        )
                      }
                    >
                      <SelectTrigger
                        id="red-format"
                        className="w-full border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-slate-500 focus-visible:ring-2"
                      >
                        <SelectValue placeholder="Select a format" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700/80 bg-slate-900/95 text-white backdrop-blur-xl">
                        {redTemplates.map((option) => {
                          const optHue =
                            formatHue[option.value] ?? "0";
                          return (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="transition-all duration-150 hover:bg-slate-700/60"
                            >
                              <span className="flex items-center gap-2.5">
                                <span
                                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/20"
                                  style={{
                                    backgroundColor: `hsl(${optHue} 70% 55%)`,
                                  }}
                                />
                                <span>{option.label}</span>
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gender & Name - animated wrapper */}
                  <div
                    key={selectedFormat + "-fields"}
                    className="animate-fade-up space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="applicant-gender">
                        Applicant title
                      </Label>
                      <Select
                        value={gender}
                        onValueChange={(value) =>
                          setGender(
                            value as (typeof genderOptions)[number],
                          )
                        }
                        disabled={selectedFormat === "discord-invite"}
                      >
                        <SelectTrigger
                          id="applicant-gender"
                          className="w-full border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-slate-500 data-[disabled]:opacity-50"
                        >
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                        <SelectContent className="border-slate-700 bg-slate-900 text-white">
                          {genderOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="applicant-name">
                        Applicant name
                      </Label>
                      <Input
                        id="applicant-name"
                        value={applicantName}
                        onChange={(event) =>
                          setApplicantName(event.target.value)
                        }
                        placeholder="Enter the applicant's name"
                        disabled={selectedFormat === "discord-invite"}
                        className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500 focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* ── Conditional fields ── */}
                  {selectedFormat === "interview-scheduled" && (
                    <div
                      key="interview"
                      className="animate-fade-up space-y-3 rounded-xl border border-white/5 bg-slate-800/40 p-4"
                    >
                      <p className="text-xs font-semibold tracking-[0.2em] text-sky-300 uppercase">
                        Interview details
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="interview-date">
                          Interview date
                        </Label>
                        <Input
                          id="interview-date"
                          value={interviewDate}
                          onChange={(event) =>
                            setInterviewDate(event.target.value)
                          }
                          placeholder="e.g. 15 JUL 2026"
                          className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 transition-all duration-200 hover:border-sky-500/50 focus-visible:ring-2 focus-visible:ring-sky-500/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="interview-time">
                          Interview time ((UTC))
                        </Label>
                        <Input
                          id="interview-time"
                          value={interviewTime}
                          onChange={(event) =>
                            setInterviewTime(event.target.value)
                          }
                          placeholder="e.g. 14:00"
                          className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 transition-all duration-200 hover:border-sky-500/50 focus-visible:ring-2 focus-visible:ring-sky-500/30"
                        />
                      </div>
                    </div>
                  )}

                  {selectedFormat === "pending-edit" && (
                    <div
                      key="pending-edit"
                      className="animate-fade-up space-y-3 rounded-xl border border-white/5 bg-slate-800/40 p-4"
                    >
                      <p className="text-xs font-semibold tracking-[0.2em] text-amber-300 uppercase">
                        Hold reasons
                      </p>
                      <div className="space-y-2">
                        {reasons.map((reason, index) => (
                          <div
                            key={index}
                            className="animate-fade-up flex items-center gap-2"
                            style={{
                              animationDelay: `${index * 0.05}s`,
                            }}
                          >
                            <Input
                              value={reason}
                              onChange={(e) =>
                                updateReason(index, e.target.value)
                              }
                              placeholder={`Reason ${index + 1}`}
                              className="flex-1 border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 transition-all duration-200 hover:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/30"
                            />
                            {reasons.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeReason(index)}
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 shrink-0 text-red-400 transition-all duration-200 hover:scale-110 hover:bg-red-950/40 hover:text-red-300"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        onClick={addReason}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 transition-all duration-200 hover:scale-[1.02] hover:border-amber-500/40 hover:bg-amber-950/20 hover:text-amber-200"
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add reason
                      </Button>
                    </div>
                  )}

                  {selectedFormat === "denied" && (
                    <div
                      key="denied"
                      className="animate-fade-up space-y-4 rounded-xl border border-white/5 bg-slate-800/40 p-4"
                    >
                      <p className="text-xs font-semibold tracking-[0.2em] text-red-300 uppercase">
                        Denial details
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="denial-type">Denial type</Label>
                        <Select
                          value={denialType}
                          onValueChange={(value) =>
                            setDenialType(value as "IC" | "OOC")
                          }
                        >
                          <SelectTrigger
                            id="denial-type"
                            className="w-full border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-red-500/50"
                          >
                            <SelectValue placeholder="Select denial type" />
                          </SelectTrigger>
                          <SelectContent className="border-slate-700 bg-slate-900 text-white">
                            <SelectItem value="IC">
                              IC - In Character
                            </SelectItem>
                            <SelectItem value="OOC">
                              OOC - Out of Character
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="apply-other-char">
                          Apply on another character
                        </Label>
                        <Select
                          value={applyOtherChar}
                          onValueChange={(value) =>
                            setApplyOtherChar(value as "may" | "may not")
                          }
                        >
                          <SelectTrigger
                            id="apply-other-char"
                            className="w-full border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-red-500/50"
                          >
                            <SelectValue placeholder="Select permission" />
                          </SelectTrigger>
                          <SelectContent className="border-slate-700 bg-slate-900 text-white">
                            <SelectItem value="may">May</SelectItem>
                            <SelectItem value="may not">May not</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">
                          Choose whether the applicant can reapply on another
                          character during the cooldown.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weeks">Cool-down weeks</Label>
                        <Input
                          id="weeks"
                          type="number"
                          min={1}
                          value={weeks}
                          onChange={(e) =>
                            setWeeks(
                              e.target.value === ""
                                ? 1
                                : Number(e.target.value),
                            )}
                          placeholder="2, 4, or more"
                          className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 transition-all duration-200 hover:border-red-500/50 focus-visible:ring-2 focus-visible:ring-red-500/30"
                        />
                        <p className="text-xs text-slate-500">
                          Standard cooldown is 2 or 4 weeks.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label>Reasons for denial</Label>
                        <div className="space-y-2">
                          {reasons.map((reason, index) => (
                            <div
                              key={index}
                              className="animate-fade-up flex items-center gap-2"
                              style={{
                                animationDelay: `${index * 0.05}s`,
                              }}
                            >
                              <Input
                                value={reason}
                                onChange={(e) =>
                                  updateReason(index, e.target.value)
                                }
                                placeholder={`Reason ${index + 1}`}
                                className="flex-1 border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 transition-all duration-200 hover:border-red-500/50 focus-visible:ring-2 focus-visible:ring-red-500/30"
                              />
                              {reasons.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeReason(index)}
                                  size="icon"
                                  variant="ghost"
                                  className="h-10 w-10 shrink-0 text-red-400 transition-all duration-200 hover:scale-110 hover:bg-red-950/40 hover:text-red-300"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          onClick={addReason}
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 transition-all duration-200 hover:scale-[1.02] hover:border-red-500/40 hover:bg-red-950/20 hover:text-red-200"
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          Add reason
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Live Format Card ── */}
              <div>
                <div
                  className={`rounded-[1.5rem] border bg-gradient-to-br p-5 transition-all duration-500 ${activeFormat.border} ${activeFormat.accent} hover:brightness-110`}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-white">
                      Live Format Card
                    </h3>
                    <span
                      className={`animate-badge-pulse rounded-full px-3 py-1 text-xs font-semibold ${activeFormat.badge}`}
                    >
                      {activeFormat.label}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm text-slate-200">
                    {/* Applicant */}
                    <div className="group rounded-2xl border border-white/10 bg-slate-950/45 p-4 transition-all duration-200 hover:border-white/20 hover:bg-slate-950/60">
                      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.24em] text-slate-500 uppercase">
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: `hsl(${hsl})` }}
                        />
                        Applicant
                      </p>
                      <p className="text-xl font-semibold tracking-tight text-white">
                        {gender}{" "}
                        {applicantName.trim() || "Applicant Name"}
                      </p>
                    </div>

                    {/* Ranks */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 transition-all duration-200 hover:border-white/20 hover:bg-slate-950/60">
                        <p className="mb-1 text-[10px] font-semibold tracking-[0.24em] text-slate-500 uppercase">
                          Saved Rank
                        </p>
                        <p className="truncate font-medium text-white">
                          {medicCredentials.rank || (
                            <span className="text-slate-500 italic">
                              Not set
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 transition-all duration-200 hover:border-white/20 hover:bg-slate-950/60">
                        <p className="mb-1 text-[10px] font-semibold tracking-[0.24em] text-slate-500 uppercase">
                          RED Rank
                        </p>
                        <p className="truncate font-medium text-white">
                          {redRank || (
                            <span className="text-slate-500 italic">
                              Not set
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Signature */}
                    <div className="group rounded-2xl border border-white/10 bg-slate-950/45 p-4 transition-all duration-200 hover:border-white/20 hover:bg-slate-950/60">
                      <div className="mb-2 flex items-center gap-2 text-white">
                        <Signature
                          className="h-4 w-4"
                          style={{ color: `hsl(${hsl})` }}
                        />
                        <span className="font-semibold">
                          Saved Signature
                        </span>
                      </div>
                      {medicCredentials.signature ? (
                        <Image
                          src={medicCredentials.signature}
                          alt="Saved signature"
                          width={260}
                          height={70}
                          className="h-auto max-h-20 w-auto rounded-md bg-white/95 p-2 object-contain ring-1 ring-white/10 transition-all duration-200 group-hover:ring-white/20"
                        />
                      ) : (
                        <p className="text-sm leading-relaxed text-slate-400">
                          Add your signature from the{" "}
                          <span className="font-medium text-slate-300">
                            Staff Page
                          </span>{" "}
                          to have it dropped into each RED format.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ════ RIGHT COLUMN ════ */}
            <section className="space-y-6">
              {/* ── Generated Output ── */}
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-500 uppercase">
                      Generated Output
                    </p>
                    <h3 className="mt-0.5 text-xl font-semibold text-white">
                      Ready to paste BBCode
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedFormat === "feedback-request" && (
                      <Button
                        onClick={() =>
                          window.open(
                            "https://gov.eclipse-rp.net/viewforum.php?f=2516",
                            "_blank",
                          )
                        }
                        variant="outline"
                        size="sm"
                        className="border-sky-600/50 text-sky-300 transition-all duration-200 hover:scale-[1.03] hover:border-sky-500 hover:bg-sky-950/40 hover:text-sky-200"
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        Open Forum
                      </Button>
                    )}
                    {selectedFormat === "frd-feedback-request" && (
                      <Button
                        onClick={() =>
                          window.open(
                            "https://gov.eclipse-rp.net/viewtopic.php?t=118519",
                            "_blank",
                          )
                        }
                        variant="outline"
                        size="sm"
                        className="border-violet-600/50 text-violet-300 transition-all duration-200 hover:scale-[1.03] hover:border-violet-500 hover:bg-violet-950/40 hover:text-violet-200"
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        Info Topic
                      </Button>
                    )}
                    {activeFormat.titleTag && (
                      <>
                        <span className="rounded-md border border-slate-700 bg-slate-900/80 px-2.5 py-1 font-mono text-xs tracking-wide text-slate-300 shadow-sm">
                          {activeFormat.titleTag}
                        </span>
                        <Button
                          onClick={handleCopyTitleTag}
                          variant="outline"
                          size="sm"
                          className={`transition-all duration-200 hover:scale-[1.03] ${
                            copiedTitleTag
                              ? "border-emerald-500/60 bg-emerald-950/30 text-emerald-300"
                              : "border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                          }`}
                          title={`Copies "${activeFormat.titleTag}" to your clipboard`}
                        >
                          {copiedTitleTag ? (
                            <Check className="animate-check h-3.5 w-3.5" />
                          ) : (
                            <Tag className="h-3.5 w-3.5" />
                          )}
                          {copiedTitleTag ? "Copied!" : "Copy tag"}
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={handleCopy}
                      size="default"
                      className={`transition-all duration-200 hover:scale-[1.03] active:scale-95 ${
                        copied
                          ? "bg-emerald-600 text-white hover:bg-emerald-500"
                          : ""
                      }`}
                      style={
                        !copied
                          ? {
                              backgroundColor: `hsl(${hsl})`,
                              color: "white",
                            }
                          : {}
                      }
                    >
                      {copied ? (
                        <Check className="animate-check h-4 w-4" />
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
                  className="min-h-[460px] resize-none border-slate-700/60 bg-slate-950/80 font-mono text-sm leading-relaxed text-slate-100 transition-all duration-200 focus-visible:ring-2"
                />

              </div>
            </section>
          </div>
        </div>
      </BodyAndMainTitle>
    </>
  );
}
