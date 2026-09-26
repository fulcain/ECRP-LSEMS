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
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

const splitName = (name: string): { firstName: string; lastName: string } => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

export function LOATemplate() {
  const { medicCredentials } = useMedic();

  // Kept in local storage: a request is written over minutes, and anything typed
  // here used to be gone on a refresh. The touched flags stay in session state,
  // because they only govern what the staff page is allowed to autofill.
  const [rank, setRank, rankLoaded] = useLocalStorage<string>("loa-request-rank", "");
  const [firstName, setFirstName, firstNameLoaded] = useLocalStorage<string>(
    "loa-request-first-name",
    "",
  );
  const [lastName, setLastName, lastNameLoaded] = useLocalStorage<string>(
    "loa-request-last-name",
    "",
  );
  const [startDate, setStartDate] = useLocalStorage<string>(
    "loa-request-start-date",
    "",
  );
  const [endDate, setEndDate] = useLocalStorage<string>(
    "loa-request-end-date",
    "",
  );
  const [icReason, setIcReason] = useLocalStorage<string>("loa-request-ic-reason", "");
  const [oocReason, setOocReason] = useLocalStorage<string>(
    "loa-request-ooc-reason",
    "",
  );

  // Auto-fill from the staff page until the user edits a field, so fields
  // populate even though credentials hydrate from localStorage after mount.
  const [rankTouched, setRankTouched] = useState(false);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);

  // The staff page fills a field only while it is still empty. A value that came
  // back from storage was typed by the member, and must not be overwritten by a
  // form that is just offering a default.
  useEffect(() => {
    if (!rankLoaded || rankTouched || rank) return;
    if (medicCredentials.rank) setRank(medicCredentials.rank);
  }, [rankLoaded, rank, rankTouched, medicCredentials.rank, setRank]);

  useEffect(() => {
    if (!firstNameLoaded || !lastNameLoaded) return;
    const { firstName: first, lastName: last } = splitName(
      medicCredentials.name,
    );
    if (!firstNameTouched && first && !firstName) setFirstName(first);
    if (!lastNameTouched && last && !lastName) setLastName(last);
  }, [
    medicCredentials.name,
    firstNameTouched,
    lastNameTouched,
    firstNameLoaded,
    lastNameLoaded,
    firstName,
    lastName,
    setFirstName,
    setLastName,
  ]);

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

  // Both copies are a GOV post in the making, so the browser extension gets the
  // title and the section with them.
  const loaPost = {
    subject: title,
    url: GOV_LOA_POST_URL,
    feature: "the LOA request form",
  };

  const handleCopyTemplate = () => {
    if (!reasonsComplete) return;
    copyBBCode({ bbCodeText: body, post: loaPost });
  };

  const handleCopyTitle = () => {
    if (!reasonsComplete) return;
    copyBBCode({ bbCodeText: title, post: { ...loaPost, bbcode: "" } });
  };

  return (
    <div className="space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        transition={Bounce}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="space-y-5">
          {/* Employee Information */}
          <div className="rounded-2xl border border-border bg-surface/90 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-foreground">
                Employee Information
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs text-muted-foreground">
                  Rank
                </Label>
                <Input
                  value={rank}
                  onChange={(e) => {
                    setRank(e.target.value);
                    setRankTouched(true);
                  }}
                  placeholder="e.g. Senior Paramedic"
                  className="border-border bg-surface-hover/50 text-foreground placeholder:text-muted-foreground focus:border-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">
                    First Name
                  </Label>
                  <Input
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setFirstNameTouched(true);
                    }}
                    placeholder="First name"
                    className="border-border bg-surface-hover/50 text-foreground placeholder:text-muted-foreground focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">
                    Last Name
                  </Label>
                  <Input
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setLastNameTouched(true);
                    }}
                    placeholder="Last name"
                    className="border-border bg-surface-hover/50 text-foreground placeholder:text-muted-foreground focus:border-blue-500/50"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFromCredentials}
                className="cursor-pointer border-border text-muted-foreground transition-all duration-200 hover:scale-[1.02] hover:border-amber-500/40 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 hover:text-amber-200 active:scale-[0.98]"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Reset to Staff Page
              </Button>
            </div>
          </div>

          {/* Leave Dates */}
          <div className="rounded-2xl border border-border bg-surface/90 p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-green-600 dark:text-green-400" />
              <h3 className="text-sm font-semibold text-foreground">
                Leave of Absence Dates
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-xs text-muted-foreground">
                  Beginning Date
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
                  Return Date
                </Label>
                <Input
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value.toUpperCase())}
                  placeholder="DD/MMM/YYYY (e.g. 20/AUG/2026)"
                  className="border-border bg-surface-hover/50 font-mono text-foreground placeholder:text-muted-foreground focus:border-green-500/50"
                />
              </div>
            </div>
          </div>

          {/* Reasons */}
          <div className="rounded-2xl border border-border bg-surface/90 p-5">
            <div className="mb-4 flex-col flex items-start gap-2">
              <div className="flex gap-2 items-center justify-center">
              <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">Reason</h3>
              </div>
                <p className="text-xs text-gray-500">Reason Does not have to be too specific, but please leave both an IC and OOC reason.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs text-muted-foreground">
                  IC Reason
                </Label>
                <Textarea
                  value={icReason}
                  onChange={(e) => setIcReason(e.target.value)}
                  placeholder="In-character reason for the leave of absence"
                  rows={3}
                  className="w-full resize-y border-border bg-surface-hover/50 text-foreground placeholder:text-muted-foreground focus:border-amber-500/50"
                />
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-muted-foreground">
                  OOC Reason
                </Label>
                <Textarea
                  value={oocReason}
                  onChange={(e) => setOocReason(e.target.value)}
                  placeholder="Out-of-character reason - wrapped in (( ... )) with [ooc][/ooc]"
                  rows={3}
                  className="w-full resize-y border-border bg-surface-hover/50 text-foreground placeholder:text-muted-foreground focus:border-amber-500/50"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Placed after the IC reason inside{" "}
                  <code className="text-amber-700/80 dark:text-amber-300/80">(( ... ))</code>.
                </p>
              </div>
            </div>
          </div>

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
                  so the rank and name auto-fill.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="h-fit rounded-2xl border border-border bg-surface/90">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                Post Preview
              </h3>
            </div>
            <span className="rounded-lg bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-1 text-[10px] font-medium text-emerald-100 ring-1 ring-emerald-400/40">
              LOA
            </span>
          </div>

          <div className="space-y-4 p-5">
            {/* Title */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <Label className="text-xs text-muted-foreground">Post Title</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyTitle}
                  disabled={!title || !reasonsComplete}
                  className="h-7 border-border px-2 text-[10px] text-muted-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-surface-hover hover:text-foreground"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  Copy Title
                </Button>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-hover/50 px-3 py-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate font-mono text-xs text-emerald-800 dark:text-emerald-200">
                  {title}
                </span>
              </div>
            </div>

            {/* Body */}
            <div>
              <Label className="mb-2 block text-xs text-muted-foreground">
                Template Body
              </Label>
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-background/50 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                {body}
              </pre>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
              <Button
                type="button"
                onClick={handleCopyTemplate}
                disabled={!reasonsComplete}
                className="w-full cursor-pointer bg-sky-600 py-6 text-sm font-semibold text-foreground shadow-lg shadow-sky-950/30 transition-all duration-200 hover:scale-[1.02] hover:bg-sky-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full cursor-pointer border-emerald-600/50 bg-emerald-600 py-6 text-sm font-semibold text-foreground shadow-lg shadow-emerald-950/30 transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Copy to GOV
                </Button>
              </Link>
            </div>

            {!reasonsComplete && (
              <p className="flex items-center gap-1.5 text-[10px] text-amber-600/90 dark:text-amber-400/90">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                Fill in both the IC and OOC reasons to enable the copy buttons.
              </p>
            )}

            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Copy to GOV copies the template and opens the LOA posting page -
              paste the body there and use the post title above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}