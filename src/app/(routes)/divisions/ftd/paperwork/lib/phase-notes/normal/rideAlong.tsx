"use client";

import {
  Bold,
  EmptyNotesState,
  EyebrowLabel,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/primitives";
import { Clock } from "lucide-react";

export function RideAlongNotes() {
  return (
    <div className="space-y-3">
            <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-2.5">
        <EyebrowLabel icon={Clock}>
          RIDE ALONG - EMT-I+ - MINIMUM 1H, DOESNT HAVE A TIME LIMIT IF ITS OPTIONAL
        </EyebrowLabel>
      </div>
      <EmptyNotesState
        title="Quick checklist for ride-alongs"
        message="Use this checklist while you ride along to make sure the EMR covers the core responsibilities before you sign off:"
        tip={
          <ul className="list-disc pl-5 space-y-1 marker:text-[#800000] text-foreground/85 text-[13.5px]">
            <li>
              <Bold>Request Call Priority</Bold> on the MD frequency (or
              have the trainee do it).
            </li>
            <li>
              Have the EMR try <Bold>radio codes</Bold>,{" "}
              <Bold>unit management</Bold>, and <Bold>call handling</Bold>{" "}
              before stepping in - this is their play time.
            </li>
            <li>
              Note any mistakes as you go and either give feedback live
              or after the ride-along so they can correct it next
              session.
            </li>
            <li>
              <Bold>Honesty wins.</Bold> Generic praise only hurts the
              trainee - call out what didn&rsquo;t work and assign
              additional mandatories when needed.
            </li>
             <li>
           It depends on the phase they&apos;re in and whether it&apos;s
           mandatory or optional. Treat optional sessions the same as
           mandatory ones. If they&apos;re struggling with something, be
           honest about it and assign additional mandatory sessions as
           needed.
            </li>
          </ul>
        }
      />
    </div>
  );
}
