"use client";

import * as React from "react";

import { BbcodePreview } from "@/components/handbook/bbcode-preview";

/**
 * The Guide view: the handbook section itself, rendered.
 *
 * This used to be a hand-written React component per phase - twenty-three of
 * them, each a second copy of a section of the EMR profile - and they drifted
 * from the handbook the moment it was updated (one still told trainers that
 * panic calls showed in PD/SD dispatch long after the profile had stopped
 * saying so). A trainer reading a guide that disagrees with the profile is worse
 * than no guide, so the section is rendered as it stands instead: update the
 * profile in the Handbook tab and every guide moves with it.
 *
 * The rendering is the app's own BBCode renderer, the same one the Handbook tab
 * previews with, so a tag the profile uses is a tag this can show.
 */
export function HandbookGuide({
  bbcode,
  section,
  extras,
}: {
  bbcode: string;
  /** The handbook section this was read from, so a trainer can go and find it. */
  section: string;
  /** The copy-button blocks that are not handbook text (emails, the quiz). */
  extras?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        Read straight from the handbook section{" "}
        <code className="rounded border border-border px-1 font-mono">
          {section}
        </code>{" "}
        - editing it in the FTD Command Handbook tab updates this and the profile
        together.
      </p>

      <BbcodePreview bbcode={bbcode} className="max-h-[560px]" />

      {extras}
    </div>
  );
}
