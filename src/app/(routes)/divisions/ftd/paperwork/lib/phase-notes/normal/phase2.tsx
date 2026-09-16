"use client";

import {
  Bold,
  BbLink,
  BulletList,
  Category,
  Command,
  CriticalCallout,
  Divider,
  EyebrowLabel,
  Em,
  ImportantNote,
  Item,
  OOC,
  SourceCodeBlock,
  WarningCallout,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/primitives";
import { Clock } from "lucide-react";

export function Phase2Notes() {
  return (
    <div className="space-y-2.5">
      <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-2.5">
        <EyebrowLabel icon={Clock}>
          PHASE 2 - EMT-I+ · 1h 15m minimum / 2h 30m maximum
        </EyebrowLabel>
      </div>

      <WarningCallout>
        The EMR should begin treatment of patients near the end of Phase 2
        and managing their unit.
      </WarningCallout>

      <Category title="Volatile Patient List">
        <Item>
          Inform the EMR of the{" "}
          <BbLink href="https://gov.eclipse-rp.net/viewtopic.php?p=769876">
            Volatile Patient List
          </BbLink>
          .
        </Item>
        <Item>
          Let them know that they should check this list OFTEN as it can be
          updated frequently.
        </Item>
        <Item>
          Emphasize that PD/SD response, <Bold>OR</Bold> a 10-70 from MD, is{" "}
          <Bold>required</Bold>.
        </Item>
        <Item>
          Emphasize that individuals on this list are to be handled with
          extreme caution.
        </Item>
        <Item>
          Tell the EMR that they can reach out to anyone from the leadership
          team if they believe a name should be added.
        </Item>
        <Item>
          Elaborate on the previous point, explicitly stating that the list
          is reserved for those who may pose a direct threat to LSEMS as a
          whole.
        </Item>
      </Category>

      <Category title="Hostile Situations">
        <Item>
          Inform the EMR that our safety comes first on every scene.
        </Item>
        <Item>
          If a situation is clearly unfavorable (such as being outnumbered by
          clearly hostile individuals), avoid calling for law enforcement in
          front of them. This will give them a reason to attack us, which we
          would want to avoid at all costs.
        </Item>
        <Item>
          Let the EMR know that they need to remember that sometimes patients
          get upset and they need to be mindful of what they say for their own
          and all other medics&rsquo; safety.
        </Item>
        <Item>
          If possible, return to your vehicle and move about a block away (or
          50m+) from the hostile situation.
        </Item>
        <Item>
          Once you are a safe distance from the hostile scene, this is when
          it would be ideal to request for law enforcement over department
          radio.
        </Item>
        <Item>
          <OOC>
            Also mention using <Command>/deplow</Command> instead of{" "}
            <Command>/dep</Command>.
          </OOC>
        </Item>
      </Category>

      <Category title="GSB">
        <Item>
          Let the EMR know that sometimes GSB will reach out and ask if we
          require any assistance. Let them know that usually whoever is shift
          lead will decide whether they&rsquo;re needed or not. If that is
          them, then they have the option to tell them they&rsquo;re
          unneeded at the moment.
        </Item>
        <Item>
          Let them know that GSB is here for our protection and they are{" "}
          <Bold>NOT</Bold> to interfere with any patients unless they&rsquo;re
          a direct threat to the medic&rsquo;s life. Even then PD/SD is to
          be called immediately.
        </Item>
      </Category>

      <Category title="Treatment" ordered>
        <p className="text-sm text-foreground/80 -mt-1 mb-2 italic">
          Optional: You may use the BLS Classroom for this, provided there is
          no active BLS Class.
        </p>
        <Item>
          Ask the EMR how they&rsquo;d treat the following injuries:
          <BulletList>
            <Item>Closed fracture on a patient&rsquo;s leg.</Item>
            <Item>Gunshot wound located on the patient&rsquo;s chest.</Item>
            <Item>1st, 2nd, or 3rd-degree burns.</Item>
            <Item>Stab wounds</Item>
            <Item>Concussion</Item>
          </BulletList>
        </Item>
        <Item>
          <OOC>Explain the process of how to use the stabilize
          command and explain it is considered powergaming if you stabilize
          before doing your roleplay to find the injuries on the patient.
          <div className="mt-2 space-y-2">
            <SourceCodeBlock>
              <Command>/stabilize</Command>
              <BulletList>
                <Item>
                  Ongoing <Command>/me</Command>&rsquo;s and{" "}
                  <Command>/do</Command>&rsquo;s - inspecting and
                  discovering wounds via RP&rsquo;d response.
                </Item>
                <Item>
                  Followed by <Command>/stabilize</Command> - upon
                  knowing what treatment you are going to do or provide.
                </Item>
              </BulletList>
            </SourceCodeBlock>
            <SourceCodeBlock>
              <Command>/heal</Command>
              <BulletList>
                <Item>
                  Not allowed to use the command without prior RP.
                </Item>
                <Item>
                  Ongoing <Command>/me</Command>&rsquo;s and{" "}
                  <Command>/do</Command>&rsquo;s - inspecting and
                  discovering wounds via RP&rsquo;d response.
                </Item>
                <Item>
                  We use <Command>/heal</Command> as a reward for good RP.
                  Do not use it if people are asking for a &ldquo;bandaid&rdquo;
                  or &ldquo;icepack&rdquo; without them actually wanting to
                  do proper RP.
                </Item>
              </BulletList>
            </SourceCodeBlock>
            <SourceCodeBlock>
              <Command>/CPR</Command>
              <BulletList>
                <Item>
                  Provided after completing a BLS class or passing their
                  certification.
                </Item>
                <Item>
                  Used off duty or by on-duty SD/PD, as well as other people
                  who have a license.
                </Item>
                <Item>
                  Ongoing <Command>/me</Command>&rsquo;s and{" "}
                  <Command>/do</Command>&rsquo;s - inspecting and
                  discovering wounds via RP&rsquo;d response.
                </Item>
                <Item>
                  Misuse of this command will result in the removal of the
                  medical license.
                </Item>
              </BulletList>
            </SourceCodeBlock>
          </div>
          </OOC>
        </Item>
      </Category>

      <Category title="Methadone">
        <Item>
          Instruct the EMR to open the following section in the Department
          Manual:{" "}
          <BbLink href="https://gov.eclipse-rp.net/viewtopic.php?t=106075#9">
            7.9 - Methadone
          </BbLink>
          .
        </Item>
        <Item>
          Make sure to teach them how to properly do the{" "}
          <Bold>entire procedure</Bold>, especially the importance of
          utilizing the Prescription Section to note a prescription down.
        </Item>
        <Item>
          While looking through the Prescription Section, make sure to remind
          them that if a someone has been prescribed Methadone in the last 7
          days then you cannot prescribe them any, and if they&rsquo;ve been
          prescribed 3 times in a single month than you have to be an EMT-I+
          to prescribe any further.
          <CriticalCallout>
            This is of extreme importance, as improperly prescribing
            Methadone can and will lead to disciplinary action if done
            incorrectly.
          </CriticalCallout>
        </Item>
        <Item>
          Inform the EMR that before selling methadone they <Bold>HAVE</Bold>{" "}
          to conduct a drug test.
        </Item>
        <Item>
          Inform the EMR that anyone requesting methadone can only pay for it
          in cash, at the price of $500.
        </Item>
        <Item>
          Emphasize the importance of educating the patient about the
          dangers of an overdose of methadone and inform them that AMU or
          otherwise are there for further assistance if they seem to be
          abusing methadone.
        </Item>
        <Item>
          Make sure they remember that if they&rsquo;re unsure on anything
          that they can contact a Supervisor, Command+ or other personnel.
        </Item>
        <Item>Go over the Denied Prescription Format with them in detail.</Item>
        <Item>
          <OOC>
            Inform the EMR roleplay must be completed before using the
            command, without any roleplay, you&apos;ll be breaking
            powergaming by forcing roleplay without allowing the other
            player a chance and abusing faction commands.
          </OOC>
        </Item>
      </Category>

      <Category title="Breathalyser">
        <Item>
          Inform the EMR that before conducting a breathalyzer, they must
          have the consent of the patient. Explain that if consent is not
          given, and this is linked to a potential criminal charge, they
          are required to notify the patient that separate charges can be
          levied for &lsquo;Failure to Comply&rsquo; or potentially
          &lsquo;Tampering with Evidence&rsquo;.{" "}
          <OOC>
            <Command>/breathanalyse</Command>
          </OOC>
        </Item>
        <Item>
          Inform the EMR that if a patient&rsquo;s blood alcohol percentage
          is 0.08% and above, they are legally considered intoxicated as
          per the San Andreas Penal Code.
        </Item>
        <Item>
          Remind the EMR that we can offer intoxicated patients water,
          food, and/or a safe ride home by requesting a taxi or calling a
          friend depending on the situation. If they witness an intoxicated
          patient attempting to operate a vehicle following a breathalyzer
          test, that PD/SD should be contacted via department radio as it
          poses a risk to their safety and the safety of others.
        </Item>
        <Item>
          <OOC>
            Inform the EMR roleplay must be completed before using the
            command, without any roleplay, you&apos;ll be breaking
            powergaming by forcing roleplay without allowing the other
            player a chance and abusing faction commands.
          </OOC>
        </Item>
      </Category>

      <Category title="Time Management" ordered>
        <Item>
          Explain time management to the EMR which means choosing the closest
          hospital, treating non-critically injured people, and driving Code
          3 even when not required if one or more calls are open with nobody
          to take them.
          <BulletList>
            <Item>
              <OOC>
                Explain to the EMR when you go more in-depth on treatment in
                the field.
              </OOC>
            </Item>
            <Item>
              <OOC>Few units, many calls; quick treatment.</OOC>
            </Item>
            <Item>
              <OOC>Many units, few calls; slow and in-depth treatment.</OOC>
            </Item>
          </BulletList>
        </Item>
        <Item>
          Explain to the EMR that if we are code 3 to call and we approach
          injured people on the sidewalk, we have to stop.
        </Item>
        <Item>
          Inform the EMR that we must drop response to our previous call{" "}
          <OOC>
            <Command>/setcall -1</Command>
          </OOC>
          , radio call that we are dropping response from our current call,
          and ask another unit to take the call.
        </Item>
      </Category>

      <Divider />

      <Category title="Ending the Phase - Ride-Along" ordered>
        <Item>
          <Bold>
            Request Call Priority over radio. Either you, or the EMR may do
            this request.
          </Bold>
        </Item>
        <Item>
          If the EMR can do radio calls, unit management, and treatment by
          themselves, then don&rsquo;t give them any extra additional
          mandatory ridealongs.
        </Item>
        <Item>
          If you will be 10-8 during your ride-along, take the EMR on a short
          roam and ask the EMR to do the radio and treatment.
        </Item>
        <Item>
          If the EMR doesn&rsquo;t wish to take any feedback regarding their
          performance or is struggling on the ridealong, you may assign three
          to four mandatory ridealongs.
        </Item>
        <Item>
          Assign them 1x mandatory ride along, alongside additional
          mandatories if they require it.
        </Item>
      </Category>

      <ImportantNote>
        <Em>
          <Bold>
            <span className="underline">If the EMR performed poorly</span>,
            be honest and genuine on your report
          </Bold>
        </Em>{" "}
        - not stating they didn&rsquo;t do well is only harming the
        EMR.
      </ImportantNote>
    </div>
  );
}
