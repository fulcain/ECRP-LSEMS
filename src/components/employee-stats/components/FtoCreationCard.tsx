"use client";

import { useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Copy, ExternalLink, User, Calendar, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { handOffForumPost } from "@/app/helpers/forumHandoff";

import {
  generateFtoCreationBBCode,
  GOV_FTO_CREATION_POST_URL,
  GOV_FT_ROSTER_EDIT_URL,
} from "@/components/employee-stats/lib/generate-fto-creation-bbcode";

const FORM_STORAGE_KEY = "ftd-fto-creation-form-v2";

export function FtoCreationCard({ onRefresh }: { onRefresh?: () => void }) {
  const [savedForm, setSavedForm] = useLocalStorage(FORM_STORAGE_KEY, {
    ftoTraineeName: "",
    applicationDate: "",
  });

  // Read from the stored form, write back per field, so a refresh doesn't wipe
  // them out. Mirroring the hook into its own `useState`s lost the stored
  // values: the mount pass persisted the empty defaults over them.
  const setField = (field: keyof typeof savedForm, value: string) =>
    setSavedForm((prev) => ({ ...prev, [field]: value }));

  const ftoTraineeName = savedForm.ftoTraineeName;
  const applicationDate = savedForm.applicationDate;

  const setFtoTraineeName = (value: string) =>
    setField("ftoTraineeName", value);
  const setApplicationDate = (value: string) =>
    setField("applicationDate", value);

  const bbcode = useMemo(
    () =>
      generateFtoCreationBBCode({
        applicationName: ftoTraineeName,
        applicationDate,
      }),
    [ftoTraineeName, applicationDate],
  );


  const hasApplicationInfo = ftoTraineeName.trim() !== "";

  const copyToClipboard = async (alsoOpenGov: boolean) => {
    const handedOff = handOffForumPost(
      {
        subject: ftoTraineeName.trim()
          ? `FTO Student Profile | ${ftoTraineeName.trim()}`
          : "",
        url: GOV_FTO_CREATION_POST_URL,
        feature: "the FTO creation card",
      },
      bbcode,
    );
    try {
      await navigator.clipboard.writeText(bbcode);
      toast.success(
        handedOff
          ? "BBCode copied - press Fill on the GOV post to put it in"
          : "BBCode copied to clipboard",
        { theme: "dark" },
      );
    } catch {
      toast.error("Couldn't copy to clipboard - check browser permissions.", {
        theme: "dark",
      });
      return;
    }
    if (alsoOpenGov) {
      window.open(GOV_FTO_CREATION_POST_URL, "_blank", "noopener,noreferrer");
    }
  };

  const copyNameAndOpenRoster = async () => {
    try {
      await navigator.clipboard.writeText(ftoTraineeName);
      toast.success("Application name copied to clipboard", { theme: "dark" });
    } catch {
      toast.error("Couldn't copy to clipboard - check browser permissions.", {
        theme: "dark",
      });
      return;
    }
    window.open(GOV_FT_ROSTER_EDIT_URL, "_blank", "noopener,noreferrer");
  };

  const handleRefresh = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(FORM_STORAGE_KEY) ?? "{}");
      setFtoTraineeName(parsed?.ftoTraineeName ?? "");
      setApplicationDate(parsed?.applicationDate ?? "");
    } catch {
      setFtoTraineeName("");
      setApplicationDate("");
    }
    onRefresh?.();
  };

  return (
    <div className="space-y-4">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
      />

      <div className="flex items-center gap-3 justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          FTO Creation
        </h2>
                <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          title="Refresh form values and roster"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* ── Application Info Card ────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
            Application Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">
              Application Name
            </Label>
            <Input
              value={ftoTraineeName}
              onChange={(e) => setFtoTraineeName(e.target.value)}
              placeholder="Fname Lname"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Date of Application Acceptance
            </Label>
            <Input
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
              placeholder="DD/MMM/YYYY (e.g. 13/Jul/2026)"
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border/40 bg-surface-hover/30 p-3 flex flex-wrap gap-2 justify-center md:justify-start">
        <Button
          size="sm"
          variant="secondary"
          disabled={!hasApplicationInfo}
          onClick={() => copyToClipboard(false)}
          className="px-6"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy BBCode
        </Button>
        <Button
          size="sm"
          disabled={!hasApplicationInfo}
          onClick={() => copyToClipboard(true)}
          className="px-6"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Copy and Open Gov
        </Button>
    
        <div className="flex flex-col items-start gap-1">
          <Button
            size="sm"
            variant="secondary"
            disabled={!hasApplicationInfo}
            onClick={copyNameAndOpenRoster}
            className="px-6"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open FT Roster
          </Button>
          <span className="text-xs text-muted-foreground italic">
            Also copies the application name.
          </span>
        </div>
      </div>
    </div>
  );
}
