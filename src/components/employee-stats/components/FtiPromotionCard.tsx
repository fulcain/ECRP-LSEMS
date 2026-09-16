"use client";

import { useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Check, Copy, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSharedLocalStorageString } from "@/app/hooks/useLocalStorage";

import {
  generateFtiPromotionEmailBBCode,
  FTI_PROMOTION_TITLE,
  SHARED_SIG_NAME_KEY,
  SHARED_SIG_RANK_KEY,
  SHARED_FTD_RANK_KEY,
  SHARED_SIGNATURE_KEY,
  SHARED_EMAIL_DATE_KEY,
} from "@/components/employee-stats/lib/generate-fti-promotion-bbcode";

export function FtiPromotionCard() {
  const [sigName] = useSharedLocalStorageString(SHARED_SIG_NAME_KEY, "");
  const [sigRank] = useSharedLocalStorageString(SHARED_SIG_RANK_KEY, "");
  const [ftdRank] = useSharedLocalStorageString(SHARED_FTD_RANK_KEY, "");
  const [signature] = useSharedLocalStorageString(SHARED_SIGNATURE_KEY, "");
  const [date] = useSharedLocalStorageString(SHARED_EMAIL_DATE_KEY, "");

  const bbcode = useMemo(
    () => generateFtiPromotionEmailBBCode({ name: sigName, rank: sigRank, ftdRank, signature, date }),
    [sigName, sigRank, ftdRank, signature, date],
  );

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bbcode);
      toast.success("FTI Promotion email copied to clipboard", { theme: "dark" });
    } catch {
      toast.error("Couldn't copy to clipboard - check browser permissions.", { theme: "dark" });
    }
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
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground italic">
          Date, name, rank, FTD rank and signature are pulled from the Shared Signature bar above.
        </p>

        <Button size="sm" onClick={copyToClipboard} className="px-6" variant="gradient">
          <Copy className="h-4 w-4 mr-1.5" />
          Copy FTI Promotion Email
        </Button>
      </CardContent>
    </Card>
  );
}