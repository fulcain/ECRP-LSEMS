"use client";

import { useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Check, Copy, ExternalLink, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMedic } from "@/app/context/MedicContext";
import { DIVISIONS } from "@/configs/roles";
import { getCurrentDateFormatted } from "@/app/helpers/getCurrentDateFormatted";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import { pickPostTarget } from "@/app/helpers/forumHandoff";
import { GOV_PM_COMPOSE_URL } from "@/app/helpers/govLinks";

import {
  generateFtiPromotionEmailBBCode,
  FTI_PROMOTION_TITLE,
} from "@/components/employee-stats/lib/generate-fti-promotion-bbcode";

export function FtiPromotionCard() {
  const { medicCredentials, divisionRanks } = useMedic();

  const bbcode = useMemo(
    () =>
      generateFtiPromotionEmailBBCode({
        name: medicCredentials.name,
        rank: medicCredentials.rank,
        ftdRank: divisionRanks[DIVISIONS.ftd.label] || "",
        signature: medicCredentials.signature,
        date: getCurrentDateFormatted(),
      }),
    [medicCredentials, divisionRanks],
  );

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bbcode);
      toast.success("FTI Promotion email copied to clipboard", { theme: "dark" });
    } catch {
      toast.error("Couldn't copy to clipboard - check browser permissions.", { theme: "dark" });
    }
  };

  // The email is sent as a GOV private message, so the title travels with the
  // body and the composer opens with both ready to fill.
  const copyAndOpenPm = () => {
    copyBBCodeAndOpen({
      bbCodeText: bbcode,
      url: GOV_PM_COMPOSE_URL,
      post: {
        subject: FTI_PROMOTION_TITLE,
        feature: "the FTI promotion email card",
        url: pickPostTarget(GOV_PM_COMPOSE_URL),
      },
    });
  };

  const [titleCopied, setTitleCopied] = useState(false);
  const copyTitle = async () => {
    try {
      await navigator.clipboard.writeText(FTI_PROMOTION_TITLE);
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
          FTI Promotion Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-surface-hover/30 px-3 py-2">
          <span className="text-[11px] text-muted-foreground">Title:</span>
          <code className="text-xs font-mono text-foreground/80">{FTI_PROMOTION_TITLE}</code>
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

        <p className="text-[11px] text-muted-foreground italic">
          Date, name, rank, FTD rank and signature come from your Staff Page.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={copyToClipboard} className="px-6" variant="gradient">
            <Copy className="h-4 w-4 mr-1.5" />
            Copy FTI Promotion Email
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
        </div>
      </CardContent>
    </Card>
  );
}