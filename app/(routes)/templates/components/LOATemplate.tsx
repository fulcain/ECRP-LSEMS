"use client";

import { useMedic } from "@/app/context/MedicContext";
import { copyBBCode } from "@/app/helpers/copyBBCode";
import {
  generateLOARequestBody,
  generateLOATitle,
  GOV_LOA_POST_URL,
} from "@/app/templates/loa-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CalendarDays,
  Copy,
  ExternalLink,
  FileText,
  RotateCcw,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Bounce, ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";

const splitName = (name: string): { firstName: string; lastName: string } => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

export function LOATemplate() {
  const { medicCredentials } = useMedic();

  const [rank, setRank] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [icReason, setIcReason] = useState("");
  const [oocReason, setOocReason] = useState("");

  // Auto-fill from the staff page until the user edits a field, so fields
  // populate even though credentials hydrate from localStorage after mount.
  const [rankTouched, setRankTouched] = useState(false);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);

  useEffect(() => {
    if (!rankTouched && medicCredentials.rank) {
      setRank(medicCredentials.rank);
    }
  }, [medicCredentials.rank, rankTouched]);

  useEffect(() => {
    const { firstName: first, lastName: last } = splitName(
      medicCredentials.name,
    );
    if (!firstNameTouched && first) setFirstName(first);
    if (!lastNameTouched && last) setLastName(last);
  }, [medicCredentials.name, firstNameTouched, lastNameTouched]);

  const isCredentialsEmpty =
    !medicCredentials.name ||
    !medicCredentials.signature ||
    !medicCredentials.rank;

  const resetFromCredentials = () => {
    setRank(medicCredentials.rank);
    const { firstName: first, lastName: last } = splitName(
      medicCredentials.name,
    );
    setFirstName(first);
    setLastName(last);
    setRankTouched(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
  };

  const context = {
    rank: rank.trim(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    startDate: startDate.trim(),
    endDate: endDate.trim(),
    icReason: icReason.trim(),
    oocReason: oocReason.trim(),
  };

  const title = generateLOATitle(context);
  const body = generateLOARequestBody(context);

  // Both reasons are required before anything can be copied.
  const reasonsComplete = Boolean(context.icReason && context.oocReason);

  const handleCopyTemplate = () => {
    if (!reasonsComplete) return;
    copyBBCode({ bbCodeText: body });
  };

  const handleCopyTitle = () => {
    if (!reasonsComplete) return;
    copyBBCode({ bbCodeText: title });
  };

  return (
    <div className="space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="dark"
        transition={Bounce}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="space-y-5">
          {/* Employee Information */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">
                Employee Information
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs text-slate-400">
                  Rank
                </Label>
                <Input
                  value={rank}
                  onChange={(e) => {
                    setRank(e.target.value);
                    setRankTouched(true);
                  }}
                  placeholder="e.g. Senior Paramedic"
                  className="border-white/10 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-xs text-slate-400">
                    First Name
                  </Label>
                  <Input
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setFirstNameTouched(true);
                    }}
                    placeholder="First name"
                    className="border-white/10 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-slate-400">
                    Last Name
                  </Label>
                  <Input
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setLastNameTouched(true);
                    }}
                    placeholder="Last name"
                    className="border-white/10 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500/50"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFromCredentials}
                className="cursor-pointer border-slate-600 text-slate-300 transition-all duration-200 hover:scale-[1.01] hover:border-amber-500/40 hover:bg-amber-950/20 hover:text-amber-200 active:scale-[0.99]"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Reset to Staff Page
              </Button>
            </div>
          </div>

          {/* Leave Dates */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-green-400" />
              <h3 className="text-sm font-semibold text-white">
                Leave of Absence Dates
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-xs text-slate-400">
                  Beginning Date
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
                  Return Date
                </Label>
                <Input
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value.toUpperCase())}
                  placeholder="DD/MMM/YYYY (e.g. 20/AUG/2026)"
                  className="border-white/10 bg-slate-800/50 font-mono text-white placeholder:text-slate-500 focus:border-green-500/50"
                />
              </div>
            </div>
          </div>

          {/* Reasons */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5">
            <div className="mb-4 flex-col flex items-start gap-2">
              <div className="flex gap-2 items-center justify-center">
              <FileText className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Reason</h3>
              </div>
                <p className="text-xs text-gray-500">Reason Does not have to be too specific, but please leave both an IC and OOC reason.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs text-slate-400">
                  IC Reason
                </Label>
                <Textarea
                  value={icReason}
                  onChange={(e) => setIcReason(e.target.value)}
                  placeholder="In-character reason for the leave of absence"
                  rows={3}
                  className="w-full resize-y border-white/10 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-amber-500/50"
                />
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-slate-400">
                  OOC Reason
                </Label>
                <Textarea
                  value={oocReason}
                  onChange={(e) => setOocReason(e.target.value)}
                  placeholder="Out-of-character reason - wrapped in (( ... )) with [ooc][/ooc]"
                  rows={3}
                  className="w-full resize-y border-white/10 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-amber-500/50"
                />
                <p className="mt-1 text-[10px] text-slate-500">
                  Placed after the IC reason inside{" "}
                  <code className="text-amber-300/80">(( ... ))</code>.
                </p>
              </div>
            </div>
          </div>

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
                  so the rank and name auto-fill.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="h-fit rounded-2xl border border-white/10 bg-slate-900/90">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-white">
                Post Preview
              </h3>
            </div>
            <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[10px] font-medium text-emerald-100 ring-1 ring-emerald-400/40">
              LOA
            </span>
          </div>

          <div className="space-y-4 p-5">
            {/* Title */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <Label className="text-xs text-slate-400">Post Title</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyTitle}
                  disabled={!title || !reasonsComplete}
                  className="h-7 border-slate-600 px-2 text-[10px] text-slate-300 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-700 hover:text-white"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  Copy Title
                </Button>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/50 px-3 py-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="truncate font-mono text-xs text-emerald-200">
                  {title}
                </span>
              </div>
            </div>

            {/* Body */}
            <div>
              <Label className="mb-2 block text-xs text-slate-400">
                Template Body
              </Label>
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/5 bg-slate-950/50 p-4 font-mono text-xs leading-relaxed text-slate-300">
                {body}
              </pre>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
              <Button
                type="button"
                onClick={handleCopyTemplate}
                disabled={!reasonsComplete}
                className="w-full cursor-pointer bg-sky-600 py-6 text-sm font-semibold text-white shadow-lg shadow-sky-950/30 transition-all duration-300 hover:scale-[1.01] hover:bg-sky-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Template
              </Button>

              <Link
                href={GOV_LOA_POST_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  type="button"
                  onClick={handleCopyTemplate}
                  disabled={!reasonsComplete}
                  className="w-full cursor-pointer border-emerald-600/50 bg-emerald-600 py-6 text-sm font-semibold text-white shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Copy to GOV
                </Button>
              </Link>
            </div>

            {!reasonsComplete && (
              <p className="flex items-center gap-1.5 text-[10px] text-amber-400/90">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                Fill in both the IC and OOC reasons to enable the copy buttons.
              </p>
            )}

            <p className="text-[10px] leading-relaxed text-slate-500">
              Copy to GOV copies the template and opens the LOA posting page -
              paste the body there and use the post title above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}