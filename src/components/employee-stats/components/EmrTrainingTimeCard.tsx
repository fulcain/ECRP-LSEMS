"use client";

import { useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import { ClipboardList, Copy, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalStorage, useSharedLocalStorageString } from "@/app/hooks/useLocalStorage";

import {
  generateEmrTrainingTimeEmailBBCode,
  generateEmrTrainingTimeProfileBBCode,
} from "@/components/employee-stats/lib/generate-emr-training-time-bbcode";
import {
  SHARED_SIG_NAME_KEY,
  SHARED_SIG_RANK_KEY,
  SHARED_FTD_RANK_KEY,
  SHARED_SIGNATURE_KEY,
  SHARED_EMAIL_DATE_KEY,
} from "@/components/employee-stats/lib/generate-fti-promotion-bbcode";

const FORM_STORAGE_KEY = "ftd-emr-training-time-form-v1";

export function EmrTrainingTimeCard() {
  const [savedForm, setSavedForm] = useLocalStorage(FORM_STORAGE_KEY, {
    emrName: "",
    daysLeft: "",
  });

  // Read from the stored form, write back per field. Mirroring it into its own
  // `useState`s lost the stored values: the mount pass persisted the empty
  // defaults over them before they could be applied.
  const setField = (field: keyof typeof savedForm, value: string) =>
    setSavedForm((prev) => ({ ...prev, [field]: value }));

  const emrName = savedForm.emrName;
  const daysLeft = savedForm.daysLeft;

  const setEmrName = (value: string) => setField("emrName", value);
  const setDaysLeft = (value: string) => setField("daysLeft", value);

  const [sigName] = useSharedLocalStorageString(SHARED_SIG_NAME_KEY, "");
  const [sigRank] = useSharedLocalStorageString(SHARED_SIG_RANK_KEY, "");
  const [ftdRank] = useSharedLocalStorageString(SHARED_FTD_RANK_KEY, "");
  const [signature] = useSharedLocalStorageString(SHARED_SIGNATURE_KEY, "");
  const [date] = useSharedLocalStorageString(SHARED_EMAIL_DATE_KEY, "");

  const values = useMemo(
    () => ({ emrName, daysLeft, sigName, sigRank, ftdRank, signature, date }),
    [emrName, daysLeft, sigName, sigRank, ftdRank, signature, date],
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
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">EMR Name</Label>
            <Input
              value={emrName}
              onChange={(e) => setEmrName(e.target.value)}
              placeholder="Lastname"
            />
          </div>
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
          Date, name, rank, FTD rank and signature are pulled from the Shared Signature bar above.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => handleCopy("Email", emailBB)} className="px-6">
            <Copy className="h-4 w-4 mr-1.5" />
            Copy Email
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleCopy("Profile post", profileBB)}
            className="px-6"
          >
            <ClipboardList className="h-4 w-4 mr-1.5" />
            Copy Profile Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}