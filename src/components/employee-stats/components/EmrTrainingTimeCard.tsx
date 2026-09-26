"use client";

import { useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Check, Copy, ExternalLink, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEmrProfileLinks } from "@/components/current-emrs/useEmrProfileLinks";
import { EmrNameSelect } from "@/components/employee-stats/components/EmrNameSelect";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useMedic } from "@/app/context/MedicContext";
import { DIVISIONS } from "@/configs/roles";
import { getCurrentDateFormatted } from "@/app/helpers/getCurrentDateFormatted";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import { pickPostTarget } from "@/app/helpers/forumHandoff";
import { GOV_PM_COMPOSE_URL } from "@/app/helpers/govLinks";

import {
  generateEmrTrainingTimeEmailBBCode,
  generateEmrTrainingTimeProfileBBCode,
  TRAINING_REMINDER_TITLE,
} from "@/components/employee-stats/lib/generate-emr-training-time-bbcode";

const FORM_STORAGE_KEY = "ftd-emr-training-time-form-v1";

export function EmrTrainingTimeCard() {
  const { medicCredentials, divisionRanks } = useMedic();

  const [savedForm, setSavedForm] = useLocalStorage(FORM_STORAGE_KEY, {
    emrName: "",
    emrNameManual: "",
    daysLeft: "",
  });

  // The same list the paperwork picks an EMR from. It is the only place the
  // profile links live, so choosing here is what lets the button open the right
  // profile instead of the whole forum.
  const emrList = useEmrProfileLinks();

  // Read from the stored form, write back per field. Mirroring it into its own
  // `useState`s lost the stored values: the mount pass persisted the empty
  // defaults over them before they could be applied.
  const setField = (field: keyof typeof savedForm, value: string) =>
    setSavedForm((prev) => ({ ...prev, [field]: value }));

  const emrName = savedForm.emrName;
  // Stored forms predate the manual field, so it is read with a fallback.
  const emrNameManual = savedForm.emrNameManual ?? "";
  const resolvedEmr = emrName || emrNameManual;
  const daysLeft = savedForm.daysLeft;

  const selectedProfileLink =
    emrList.find((entry) => entry.EMR === emrName)?.profileLink ?? "";

  const setEmrName = (value: string) => setField("emrName", value);
  const setEmrNameManual = (value: string) => setField("emrNameManual", value);
  const setDaysLeft = (value: string) => setField("daysLeft", value);

  const values = useMemo(
    () => ({
      emrName: resolvedEmr,
      daysLeft,
      sigName: medicCredentials.name,
      sigRank: medicCredentials.rank,
      ftdRank: divisionRanks[DIVISIONS.ftd.label] || "",
      signature: medicCredentials.signature,
      date: getCurrentDateFormatted(),
    }),
    [resolvedEmr, daysLeft, medicCredentials, divisionRanks],
  );

  const emailBB = useMemo(() => generateEmrTrainingTimeEmailBBCode(values), [values]);

  const profileBB = useMemo(() => generateEmrTrainingTimeProfileBBCode(values), [values]);

  const handleCopy = async (label: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${label} copied to clipboard`, { theme: "dark" });
    } catch {
      toast.error("Couldn't copy to clipboard - check browser permissions.", { theme: "dark" });
    }
  };

  // The email is sent as a GOV private message, so the title travels with the
  // body and the composer opens with both ready to fill.
  const copyAndOpenPm = () => {
    copyBBCodeAndOpen({
      bbCodeText: emailBB,
      url: GOV_PM_COMPOSE_URL,
      post: {
        subject: TRAINING_REMINDER_TITLE,
        feature: "the EMR training reminder card",
        url: pickPostTarget(GOV_PM_COMPOSE_URL),
      },
    });
  };

  // The profile post belongs in the EMR's own profile, so one button takes
  // both: the post is copied (and handed to the extension) and that profile
  // opens with it ready to fill.
  const copyAndOpenProfile = () => {
    if (!profileBB || !selectedProfileLink) return;
    copyBBCodeAndOpen({
      bbCodeText: profileBB,
      url: selectedProfileLink,
      post: {
        feature: "the EMR training reminder card",
        url: pickPostTarget(selectedProfileLink),
      },
    });
  };

  const [titleCopied, setTitleCopied] = useState(false);
  const copyTitle = async () => {
    try {
      await navigator.clipboard.writeText(TRAINING_REMINDER_TITLE);
      setTitleCopied(true);
      setTimeout(() => setTitleCopied(false), 1200);
    } catch {
      toast.error("Couldn't copy title.", { theme: "dark" });
    }
  };

  return (
    <Card>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <CardHeader className="pb-3">
        <CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
          EMR Training Time Reminder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-surface-hover/30 px-3 py-2">
          <span className="text-[11px] text-muted-foreground">Title:</span>
          <code className="text-xs font-mono text-foreground/80">{TRAINING_REMINDER_TITLE}</code>
          <button
            type="button"
            onClick={copyTitle}
            title="Copy title"
            aria-label="Copy title"
            className="cursor-pointer ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            {titleCopied ? (
              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <EmrNameSelect
            emrs={emrList}
            value={emrName}
            onValueChange={setEmrName}
            manualValue={emrNameManual}
            onManualChange={setEmrNameManual}
          />
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Days Left</Label>
            <Input
              value={daysLeft}
              onChange={(e) => setDaysLeft(e.target.value)}
              placeholder="14"
            />
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground italic">
          Date, name, rank, FTD rank and signature come from your Staff Page.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => handleCopy("Email", emailBB)} className="px-6">
            <Copy className="h-4 w-4 mr-1.5" />
            Copy Email
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={copyAndOpenPm}
            className="px-6"
            title="Copies the email and opens a new GOV private message, titled with it"
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Copy &amp; Open PM
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!selectedProfileLink}
            onClick={copyAndOpenProfile}
            className="px-6"
            title={
              !emrName
                ? "Choose an EMR from the list above first"
                : selectedProfileLink
                  ? "Copies the profile post and opens this EMR's profile with it"
                  : "This EMR has no profile link in the list"
            }
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Copy &amp; Open EMR Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}