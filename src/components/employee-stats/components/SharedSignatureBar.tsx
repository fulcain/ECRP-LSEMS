"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Signature } from "lucide-react";
import { useMedic } from "@/app/context/MedicContext";
import { useSharedLocalStorageString } from "@/app/hooks/useLocalStorage";
import { DIVISIONS } from "@/configs/roles";

import {
  SHARED_SIG_NAME_KEY,
  SHARED_SIG_RANK_KEY,
  SHARED_SIGNATURE_KEY,
  SHARED_FTD_RANK_KEY,
  SHARED_EMAIL_DATE_KEY,
} from "@/components/employee-stats/lib/generate-fti-promotion-bbcode";

function readSessionDefaults() {
  try {
    const raw = localStorage.getItem("ftd-session-details");
    if (!raw) return { name: "", signature: "" };
    const parsed = JSON.parse(raw);
    return {
      name: parsed?.ftoName ?? "",
      signature: parsed?.signature ?? "",
    };
  } catch {
    return { name: "", signature: "" };
  }
}

/**
 * The member's Staff Page credentials, read straight from storage.
 *
 * Read synchronously (rather than through the context) so the first render
 * already has them: `useLocalStorage` hydrates after mount, and seeding a
 * shared field from an empty value would otherwise race the stored one.
 */
function readStaffDefaults() {
  const empty = { name: "", rank: "", signature: "", ftdRank: "" };
  try {
    const credentials = JSON.parse(
      localStorage.getItem("medic-credentials") ?? "null",
    );
    const divisionRanks =
      JSON.parse(localStorage.getItem("division-ranks") ?? "null") ?? {};
    return {
      name: credentials?.name ?? "",
      rank: credentials?.rank ?? "",
      signature: credentials?.signature ?? "",
      ftdRank: divisionRanks[DIVISIONS.ftd.label] ?? "",
    };
  } catch {
    return empty;
  }
}

/** True when this shared field already holds a saved value. */
function hasStoredSharedValue(key: string): boolean {
  try {
    return localStorage.getItem(`shared-${key}`) !== null;
  } catch {
    return false;
  }
}

export function SharedSignatureBar({
  subtitle = "applies to all emails below",
}: {
  subtitle?: string;
}) {
  const [sigName, setSigName] = useSharedLocalStorageString(SHARED_SIG_NAME_KEY, "");
  const [sigRank, setSigRank] = useSharedLocalStorageString(SHARED_SIG_RANK_KEY, "");
  const [ftdRank, setFtdRank] = useSharedLocalStorageString(SHARED_FTD_RANK_KEY, "");
  const [signature, setSignature] = useSharedLocalStorageString(SHARED_SIGNATURE_KEY, "");
  const [emailDate, setEmailDate] = useSharedLocalStorageString(SHARED_EMAIL_DATE_KEY, "");
  const { medicCredentials, divisionRanks } = useMedic();

  function todayFormatted(): string {
    const now = new Date();
    const day = now.getDate();
    const s = ["th", "st", "nd", "rd"];
    const v = day % 100;
    const ordinal = day + (s[(v - 20) % 10] || s[v] || s[0]);
    const month = now.toLocaleString("en-US", { month: "long" });
    return `${month} ${ordinal}, ${now.getFullYear()}`;
  }

  const [initDone, setInitDone] = useState(false);
  useEffect(() => {
    if (initDone) return;
    // Only fields that hold nothing yet are filled: whatever the member typed
    // here wins, then the Staff Page, then the last paperwork session.
    const staff = readStaffDefaults();
    const session = readSessionDefaults();
    if (!hasStoredSharedValue(SHARED_SIG_NAME_KEY)) {
      setSigName(staff.name || session.name);
    }
    if (!hasStoredSharedValue(SHARED_SIG_RANK_KEY)) setSigRank(staff.rank);
    if (!hasStoredSharedValue(SHARED_SIGNATURE_KEY)) {
      setSignature(staff.signature || session.signature);
    }
    if (!hasStoredSharedValue(SHARED_FTD_RANK_KEY)) setFtdRank(staff.ftdRank);
    if (!hasStoredSharedValue(SHARED_EMAIL_DATE_KEY)) {
      setEmailDate(todayFormatted());
    }
    setInitDone(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Re-read the Staff Page - the deliberate pass, for after a promotion or a
   * signature change, so the fields below never have to be retyped.
   */
  const loadFromStaffPage = () => {
    const ftd = divisionRanks[DIVISIONS.ftd.label] ?? "";
    if (medicCredentials.name) setSigName(medicCredentials.name);
    if (medicCredentials.rank) setSigRank(medicCredentials.rank);
    if (medicCredentials.signature) setSignature(medicCredentials.signature);
    if (ftd) setFtdRank(ftd);
  };

  return (
    <Card className="ring-1 ring-inset ring-primary/10">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>
            <Signature className="h-4 w-4 text-muted-foreground" />
            Shared Signature <span className="font-normal text-muted-foreground">- {subtitle}</span>
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadFromStaffPage}
            title="Copy your saved name, rank and signature from the Staff Page"
            className="whitespace-nowrap"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            From Staff Page
          </Button>
        </div>
        <p className="text-xs font-normal text-muted-foreground">
          Name, Rank and Signature are filled in from your Staff Page - edit
          them there to change them everywhere.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Date</Label>
            <Input
              value={emailDate}
              onChange={(e) => setEmailDate(e.target.value)}
              placeholder="August 23rd, 2026"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Name</Label>
            <Input
              value={sigName}
              onChange={(e) => setSigName(e.target.value)}
              placeholder="Fname Lname"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Rank</Label>
            <Input
              value={sigRank}
              onChange={(e) => setSigRank(e.target.value)}
              placeholder="Captain"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">FTD Rank</Label>
            <Input
              value={ftdRank}
              onChange={(e) => setFtdRank(e.target.value)}
              placeholder="Head of Field Training"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Signature URL</Label>
            <Input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="https://i.ibb.co/..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}