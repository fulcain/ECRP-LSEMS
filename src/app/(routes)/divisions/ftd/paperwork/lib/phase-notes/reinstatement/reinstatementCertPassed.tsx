"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Clock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMTB_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/emtb-email-content";
import { EMTI_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/emti-email-content";
import { EMTA_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/emta-email-content";
import { MASTER_EMT_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/master-emt-email-content";

import {
  OOC,
  BbLink,
  Bold,
  BulletList,
  Category,
  EyebrowLabel,
  Item,
  Spoiler,
  WarningCallout,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/primitives";

/**
 * Each entry is a single per-rank post-promotion email. Append more
 * entries as the reinstatement email set grows (Paramedic, etc.).
 * The label is what shows next to the copy button; the content is
 * the verbatim BBCode written to the trainer's clipboard.
 */
const EMT_EMAILS: Array<{ label: string; content: string }> = [
  { label: "EMT-B", content: EMTB_EMAIL_CONTENT },
  { label: "EMT-I", content: EMTI_EMAIL_CONTENT },
  { label: "EMT-A", content: EMTA_EMAIL_CONTENT },
  { label: "Master EMT", content: MASTER_EMT_EMAIL_CONTENT },
];

/**
 * Phase notes for Reinstatement Certification (junior paramedic+).
 *
 * The "EMT E-mails" section at the bottom renders one copy button per
 * rank from `EMT_EMAILS` instead of a single pastebin link. Each
 * button writes its content to the clipboard and flashes "Copied!".
 */
export function ReinstatementCertPassedNotes() {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  // Tracks the pending "reset copied state" timer so rapid re-clicks
  // (or swaps between rank buttons) don't stack overlapping timers
  // that race to flip the UI back to its idle state early.
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    },
    [],
  );

  const handleCopyEmail = async (label: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedLabel(label);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopiedLabel(null), 1800);
  };

  return (
    <div className="space-y-2.5">
      <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-2.5">
        <EyebrowLabel icon={Clock}>
          REINSTATEMENT CERTIFICATION - Junior Paramedic+ - 1h 30m
          minimum / 3h maximum
        </EyebrowLabel>
      </div>

      <WarningCallout>
        <Bold>THE REINSTATEE SHOULD HANDLE EVERYTHING</Bold>
      </WarningCallout>

      <Category title="Beginning">
        <BulletList>
          <Item>
            Make sure the reinstatee knows how to handle and
            transport a 10-15 if they have not handled one during
            the reinstatement program. If necessary, create a
            mock-up scenario.
          </Item>
          <Item>
            Inform the reinstatee&apos; that during this
            certification they are on their own.
          </Item>
          <Item>
            Ensure the reinstatee creates the unit for the
            certification. (D-6Z, C-2Z, B-2Z, A-1Z etc...)
          </Item>
        </BulletList>
      </Category>

      <Category title="During examination">
        <BulletList>
          <Item>
            Pay attention to their communication, locking their
            ambulance, radio calls, scene management, and
            treatment.
          </Item>
          <Item>
            Ensure the reinstatee&apos; attends a department radio
            call and is able to communicate and efficiently deal
            with the hectic situation it can become.
          </Item>
        </BulletList>
      </Category>

      <Category title="Ending certification">
        <BulletList>
          <Item>
            Give the reinstatee&apos; their certification result
            and the feedback you gathered whilst supervising them.
          </Item>
          <Item>
            Make sure they have a medical license, and offer them
            a Pager (optional to take it){" "}
            <OOC>Don&apos;t forget the discord role!</OOC>
          </Item>
          <Item>
            Inform the reinstatee&apos; regarding duty reports
            being optional but are encouraged to fill one out.
          </Item>
          <Item>
            Inform the reinstatee&apos; regarding the divisions we
            have and that they&apos;re eligible to join, and
            encourage them to join a few.
          </Item>
          <Item>
            Complete certification paperwork alongside handing the
            reinstatee&apos; their new rank and callsign (let them
            pick) within LSEMS. (The rank is predetermined and is
            stated in the top post)
          </Item>
          <Item>
            Post the EMR/REINSTATEE Promotion Checklist on their
            personnel profile
          </Item>
        </BulletList>
      </Category>

      <Category title="Useful Links">
        <BulletList>
          <Item>
            <BbLink href="https://gov.eclipse-rp.net/viewtopic.php?f=597&t=9497">
              Staff Roster
            </BbLink>
          </Item>
          <Item>
            <BbLink href="https://gov.eclipse-rp.net/ucp.php?i=ucp_groups&mode=manage">
              Groups
            </BbLink>
          </Item>
          <Item>
            <BbLink href="https://gov.eclipse-rp.net/viewforum.php?f=605">
              Personnel Files
            </BbLink>
          </Item>
          <Item>
            <BbLink href="https://gov.eclipse-rp.net/viewtopic.php?t=216104#PROMOTIONS">
              Promotion Checklist
            </BbLink>
          </Item>
        </BulletList>
      </Category>

      <Spoiler title="Hippocratic Oath">
        <p className="text-sm text-foreground/85 mb-3">
          Before handing the EMR their EMT badge, have them swear the
          Hippocratic Oath found below.
        </p>
        <div className="rounded-lg border border-[#800000]/30 dark:border-rose-400/30 bg-amber-50/40 dark:bg-amber-950/20 px-4 py-5 space-y-3">
          <p className="text-center text-base font-semibold italic text-[#800000] dark:text-rose-300">
            I, <Bold>FName LName</Bold>, swear to fulfill, to the
            best of my ability and judgment, this covenant:
          </p>
          <div className="text-[15px] leading-relaxed space-y-2.5 italic text-foreground/90">
            <p>
              I will respect the hard-won scientific gains of those
              who walked the steps I walk now, and gladly share such
              knowledge as is mine with those who are to follow.
            </p>
            <p>
              I will apply, for the benefit of the sick, all measures
              which are required to better their condition.
            </p>
            <p>
              I will remember that there is an art to medicine as
              well as science, and that warmth, sympathy, and
              understanding may outweigh the surgeon&apos;s knife or
              the chemist&apos;s drug.
            </p>
            <p>
              I will never be ashamed to say &ldquo;I know
              not,&rdquo; nor will I fail to call in my colleagues
              when the skills of another are needed for a
              patient&apos;s recovery.
            </p>
            <p>
              I will respect the privacy of my patients, for their
              problems are not disclosed to me that the world may
              know.
            </p>
            <p>
              I will remember that I do not treat a chart or
              simulation, but a sick or injured human being, whose
              illness may affect the person&apos;s family and
              economic stability.
            </p>
            <p>
              I will prevent disease whenever I can, for prevention
              is preferable to cure.
            </p>
            <p>
              I will remember that I remain a member of society,
              with special obligations to all my fellow human
              beings, those sound of mind and body as well as the
              infirm.
            </p>
            <p>
              If I do not violate this oath, may I enjoy life,
              respected while I live and remembered with affection
              thereafter.
            </p>
            <p>
              If I do not violate this oath, may I long experience
              the joy of healing those who seek my help.
            </p>
          </div>
        </div>
      </Spoiler>

      <div className="space-y-2">
        <p className="text-sm text-foreground/90">
          Each post-promotion email below has its own copy button -
          pick the one matching the reinstatee&apos;s new rank and Email it to them.
        </p>
        <ul className="space-y-2">
          {EMT_EMAILS.map(({ label, content }) => {
            const isCopied = copiedLabel === label;
            return (
              <li
                key={label}
                className="flex flex-wrap items-center gap-2 rounded-md border border-border/50 bg-muted/20 px-3 py-2"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyEmail(label, content)}
                  aria-label={
                    isCopied
                      ? `${label} email copied`
                      : `Copy ${label} email`
                  }
                  className="h-7 gap-1.5 px-2.5 text-xs"
                >
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  {isCopied ? "Copied!" : `Copy ${label} email`}
                </Button>
                <span className="text-xs italic text-muted-foreground">
                  Click to copy the {label} post-promotion email to your clipboard.
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
