"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Clock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QUIZ_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/quiz-email-content";

import {
  Bold,
  BulletList,
  Category,
  EyebrowLabel,
  ImportantNote,
  Item,
  Spoiler,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/primitives";

export function PreCertNotes() {
  const [copied, setCopied] = useState(false);
  // Ref so rapid re-clicks clear the previous "reset copied" timer instead of stacking.
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    },
    [],
  );

  const handleCopyQuiz = async () => {
    await navigator.clipboard.writeText(QUIZ_EMAIL_CONTENT);
    setCopied(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-2.5">
      <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-2.5">
        <EyebrowLabel icon={Clock}>
          PRE-CERTIFICATION - EMT-A+ · 1h 30m minimum / 3h maximum
        </EyebrowLabel>
      </div>

      <Category title="Beginning" ordered>
        <Item>
          Make sure the EMR has handled and transported a 10-15 during their
          training, and did it correctly. If this is not the case,{" "}
          <Bold>
            the EMR cannot pass the Pre-Cert until they treat, handle and
            transport a 10-15.
          </Bold>
        </Item>
        <Item>
          Ask if the EMR has any questions about any of the previous parts
          of training.
        </Item>
        <Item>
          Inform the EMR that during this session, they are on their own
          unless a crisis occurs or they make a major mistake.
        </Item>
        <Item>
          Make sure the EMR creates its own unit and properly does the
          entire starting shift process without error.
        </Item>
        <Item>
          Let the EMR drive an ambulance out of the garage, and inform them
          that they may station wherever, as well as roam around.
        </Item>
      </Category>

      <Category title="During the Pre-Cert" ordered>
        <Item>
          <Bold>
            Request Call and Department Priority over radio. Either you, or
            the EMR may do this request.
          </Bold>
        </Item>
        <Item>
          Observe the EMR, but do not cause total silence, you can and
          should communicate with them to relax them.
        </Item>
        <Item>
          Write feedback on how what the EMR did incorrectly if anything
          does go wrong.
        </Item>
        <Item>
          If the EMR is still having some troubles, make some notes and give
          them feedback at the end.
        </Item>
        <Item>
          Ensure we watch the driving closely and fail if they are a danger
          when driving the ambulance. If you see them not following proper
          emergency vehicle protocol while driving, make note of this.
        </Item>
      </Category>

      <Category title="Ending" ordered>
        <Item>
          <span className="text-red-700 dark:text-red-400 font-semibold">
            If the EMR has made a mistake large enough, this is a direct
            Fail, and they are to do mandatory ride-alongs equal to
            whatever you decide before re-attempting the pre-certification.
          </span>
        </Item>
        <Item>
          Inform the EMR that they are now able to clock on as EMR-1,
          EMR-2, and so forth as long as an EMT+I is on duty. If the last
          EMT+I gets off duty, tell them they should head off as well until
          someone else clocks on.
        </Item>
        <Item>
          Encourage the EMR to do their Certification as soon as possible
          (within or at around 24 hours after passing Pre-Cert, not
          required!) while they&rsquo;re able to retain their confidence.
        </Item>
        <Item>
          Inform the EMR that they can also be on shift while they are
          paired up with an EMT-B, under a Zulu callsign.
        </Item>
        <Item>
          Hand them an On-Call Program Pager &amp; explain the program. The
          EMR is not obliged to join, so do inform them of this as well.
        </Item>
        <Item>
          Encourage the EMR to reach out to a Jr. Paramedic+ to schedule
          their Certification.
        </Item>
        <Item>
          Complete the paperwork and make sure to edit the top post with
          &ldquo;[Pending Certification] Fname Lname&rdquo;.
        </Item>
      </Category>

      <Category title="Helpful Questions" ordered>
        <Spoiler title="Show helpful questions checklist">
          <BulletList>
            <Item>Did the EMR create a unit?</Item>
            <Item>Did the EMR start service correctly?</Item>
            <Item>Did the EMR park their ambulance correctly in the ambulance bay?</Item>
            <Item>Did the EMR check if there are any calls to take from the call list?</Item>
            <Item>Did the EMR respond to calls without you asking to do it?</Item>
            <Item>Did the EMR follow call priority?</Item>
            <Item>Did the EMR manage to use radio calls properly?</Item>
            <Item>Did the EMR respond to department radio if there were any department calls?</Item>
            <Item>Did the EMR handle department radio properly and timely?</Item>
            <Item>Did the EMR handle PD/SD calls properly?</Item>
            <Item>Did the EMR use our MD frequency to radio that they responding to PD/SD calls?</Item>
            <Item>Did the EMR ask if the patient is a 10-15 or 10-16?</Item>
            <Item>Did the EMR ask if any treatment has been done before?</Item>
            <Item>Did the EMR ask if they clear to load the patient to an ambulance if the patient was 10-15?</Item>
            <Item>Did the EMR ask PD/SD where they want to go?</Item>
            <Item>Did the EMR properly radio transporting a 10-15?</Item>
            <Item>Did the EMR ask PD/SD if they clear to drop patients at MD?</Item>
            <Item>Did the EMR keep their ambulance locked at all times?</Item>
            <Item>Did the EMR properly utilize code 2, 3 and 4?</Item>
            <Item>Did the EMR drive properly?</Item>
            <Item>Did the EMR know how to utilize all necessary radio calls and codes throughout?</Item>
            <Item>Did the EMR treat properly and timely?</Item>
            <Item>Did the EMR roam properly and safely?</Item>
          </BulletList>
        </Spoiler>
      </Category>

      <ImportantNote>
        <div className="space-y-2">
          <div>
            <Bold>Note:</Bold> The EMR should only be sent the quiz if they{" "}
            <span className="font-semibold text-red-700 dark:text-red-400">
              fail
            </span>{" "}
            their Pre-Certification.{" "}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyQuiz}
              aria-label={copied ? "Quiz copied" : "Copy Quiz"}
              className="h-7 gap-1.5 px-2.5 text-xs"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {copied ? "Copied!" : "Copy quiz"}
            </Button>
          </div>
        </div>
      </ImportantNote>
    </div>
  );
}
