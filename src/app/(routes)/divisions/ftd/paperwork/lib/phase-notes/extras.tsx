"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { INTRO_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/intro-email-content";
import { QUIZ_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/quiz-email-content";
import { REINTRO_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/reintro-email-content";
import { EMTB_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/emtb-email-content";
import { EMTI_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/emti-email-content";
import { EMTA_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/emta-email-content";
import { MASTER_EMT_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/master-emt-email-content";

/**
 * The parts of a phase that are **not** handbook text: the emails an FTO sends,
 * and the quiz. The profile links to these rather than carrying them, so they
 * stay beside the Guide instead of inside the handbook - and they are copy
 * buttons, not prose, which is why they are here and not in the section files.
 */

/** One paste-to-clipboard button, with the "copied" flash the old guides had. */
function CopyBlock({
  label,
  content,
  hint,
}: {
  label: string;
  content: string;
  hint?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // A clipboard write can fail on an insecure context; the button is the
      // only affordance here, so it simply stays uncopied rather than lying.
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2">
      <Button type="button" variant="outline" size="sm" onClick={copy} className="h-7 gap-1.5 px-2.5 text-xs">
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        {copied ? "Copied!" : label}
      </Button>
      {hint ? (
        <span className="text-[11px] italic text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}

/** Emails and the quiz, per phase. Anything not listed has none. */
export const PHASE_EXTRAS = {
  introduction: (
    <CopyBlock
      label="Copy the Introduction email"
      content={INTRO_EMAIL_CONTENT}
      hint="Send this to the EMR if they have not had it yet."
    />
  ),
  preCert: (
    <CopyBlock
      label="Copy the quiz"
      content={QUIZ_EMAIL_CONTENT}
      hint="Only send the quiz if they failed their Pre-Certification."
    />
  ),
  reinstatementPhase1: (
    <CopyBlock
      label="Copy the Re-Introduction email"
      content={REINTRO_EMAIL_CONTENT}
      hint="Send this to the reinstatee."
    />
  ),
  reinstatementCertPassed: (
    <div className="space-y-2">
      <p className="text-[11px] italic text-muted-foreground">
        Send the post-promotion email matching the reinstatee&apos;s new rank.
      </p>
      <CopyBlock label="Copy the EMT-B email" content={EMTB_EMAIL_CONTENT} />
      <CopyBlock label="Copy the EMT-I email" content={EMTI_EMAIL_CONTENT} />
      <CopyBlock label="Copy the EMT-A email" content={EMTA_EMAIL_CONTENT} />
      <CopyBlock label="Copy the Master EMT email" content={MASTER_EMT_EMAIL_CONTENT} />
    </div>
  ),
} satisfies Record<string, React.ReactNode>;
