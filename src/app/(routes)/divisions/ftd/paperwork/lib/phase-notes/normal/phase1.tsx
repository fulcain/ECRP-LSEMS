"use client";

import {
  Bold,
  BulletList,
  Category,
  Command,
  Divider,
  EyebrowLabel,
  Em,
  ImportantNote,
  Item,
  OOC,
  RadioCallFormat,
  Spoiler,
  SubHeading,
  Tinted,
  WarningCallout,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/primitives";
import { Clock } from "lucide-react";

export function Phase1Notes() {
  return (
    <div className="space-y-2.5">
      <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-2.5">
        <EyebrowLabel icon={Clock}>
          PHASE 1 - EMT-I+ · 1h minimum / 2h maximum
        </EyebrowLabel>
      </div>

      <WarningCallout>
        The EMR is <Bold>not</Bold> to drive or provide treatment during
        Phase I, but is required to manage their unit.
      </WarningCallout>

      <Category title="Radio Codes" ordered>
        <Item>
          Explain to the EMR all the different radio codes we have, and what
          each one of them means.
        </Item>
        <Item>Have them open Section 14.7 of the General Handbook.</Item>
        <Item>
          You can find a list of codes here:
          <Spoiler title="Show radio codes">
            <SubHeading>Ten Codes</SubHeading>
            <BulletList>
              <Item><Bold>10-1</Bold> - Roll Call</Item>
              <Item><Bold>10-3</Bold> - Please Stop Transmitting</Item>
              <Item><Bold>10-4</Bold> - Affirmative</Item>
              <Item><Bold>10-5</Bold> - Repeat Last Transmission</Item>
              <Item><Bold>10-6</Bold> - Disregard Last Transmission</Item>
              <Item><Bold>10-8</Bold> - Available</Item>
              <Item><Bold>10-9</Bold> - Unavailable</Item>
              <Item><Bold>10-15</Bold> - Injured Suspect</Item>
              <Item><Bold>10-16</Bold> - Injured Patient</Item>
              <Item><Bold>10-20</Bold> - Location</Item>
              <Item><Bold>10-21</Bold> - Report Status</Item>
              <Item><Bold>10-37</Bold> - Unit Identify</Item>
              <Item><Bold>10-70</Bold> - Backup Request</Item>
              <Item><Bold>10-99</Bold> - Concluded Situation</Item>
            </BulletList>
            <SubHeading>Status Codes</SubHeading>
            <BulletList>
              <Item><Bold>Code 0</Bold> - Fell asleep <OOC>Game Crash</OOC></Item>
              <Item><Bold>Code 1</Bold> - Urgent Assistance Required (ALL UNITS)</Item>
              <Item><Bold>Code 2</Bold> - Non-Emergency</Item>
              <Item><Bold>Code 3</Bold> - Emergency</Item>
              <Item><Bold>Code 4</Bold> - No Further Assistance Required</Item>
              <Item><Bold>Code 6</Bold> - On scene</Item>
            </BulletList>
          </Spoiler>
        </Item>
      </Category>

      <Category title="Radio Calls" ordered>
        <Item>
          Explain to the EMR all the different radio calls we have, and what
          each one of them means.
        </Item>
        <Item>Point them to Section 14.2 of the General Handbook.</Item>
        <Item>
          You can find a list of standard radio calls here:
          <Spoiler title="Show standard radio calls">
            <SubHeading>Getting on shift and starting service under someone:</SubHeading>
            <RadioRow>
              EMR <Bold>Lastname</Bold> is starting services under <Bold>Callsign</Bold>.
            </RadioRow>
            <SubHeading>Getting on shift and forming your own unit:</SubHeading>
            <RadioRow>
              EMR <Bold>Lastname</Bold> is forming <Bold>Callsign</Bold> and is{" "}
              <Tinted tone="red">10-8</Tinted> from{" "}
              <Tinted tone="red">Pillbox</Tinted>/
              <Tinted tone="red">Paleto</Tinted>.
            </RadioRow>
            <SubHeading>Ending services while under someone:</SubHeading>
            <RadioRow>
              EMR <Bold>Lastname</Bold> is leaving <Bold>Callsign</Bold> and is{" "}
              <Tinted tone="red">10-9</Tinted> ending services.
            </RadioRow>
            <SubHeading>Ending services and disbanding the unit:</SubHeading>
            <RadioRow>
              EMR <Bold>Lastname</Bold> is disbanding <Bold>Callsign</Bold> and is{" "}
              <Tinted tone="red">10-9</Tinted> ending services.
            </RadioRow>
            <SubHeading>Radio callout when you arrive on a scene:</SubHeading>
            <RadioRow>
              <Bold>Callsign</Bold> is <Tinted tone="red">Code 6</Tinted> on last
              call. <Em>(you can say the exact number, but it is not mandatory)</Em>
            </RadioRow>
            <SubHeading>Radio callout when you are leaving a scene:</SubHeading>
            <RadioRow>
              <Bold>Callsign</Bold> is <Tinted tone="red">Code 2</Tinted>/
              <Tinted tone="red">Code 3</Tinted> to{" "}
              <Tinted tone="red">Pillbox</Tinted>/
              <Tinted tone="red">Paleto</Tinted> with{" "}
              <Tinted tone="red">X 10-15</Tinted>/
              <Tinted tone="red">10-16(s)</Tinted> from{" "}
              <Tinted tone="red">last call</Tinted>.
            </RadioRow>
            <SubHeading>Roaming:</SubHeading>
            <RadioRow>
              <Bold>Callsign</Bold> is <Tinted tone="red">10-8</Tinted> roaming{" "}
              <Tinted tone="red">Location</Tinted>/
              <Tinted tone="red">To Location</Tinted>.
            </RadioRow>
            <SubHeading>Requesting backup:</SubHeading>
            <RadioRow>
              <Bold>Callsign</Bold> to any <Tinted tone="red">10-8</Tinted>{" "}
              units, requesting a <Tinted tone="red">10-70</Tinted> on{" "}
              <Tinted tone="red">Call ID</Tinted>/
              <Tinted tone="red">Location</Tinted>.
            </RadioRow>
            <SubHeading>Sidewalk encounter or patient:</SubHeading>
            <RadioRow>
              <Bold>Callsign</Bold> is <Tinted tone="red">10-9</Tinted> with a
              sidewalk patient at <Tinted tone="red">Location</Tinted>.
            </RadioRow>
            <SubHeading>Dropping response from a call:</SubHeading>
            <RadioRow>
              <Bold>Callsign</Bold> is dropping response from{" "}
              <Tinted tone="red">Call ID</Tinted> and is{" "}
              <Tinted tone="red">Status</Tinted>.
            </RadioRow>
          </Spoiler>
        </Item>
      </Category>

      <Category title="Calls List" ordered>
        <Item>
          Introduce the EMR to our dispatch system{" "}
          <OOC>
            <Command>/calls</Command>
          </OOC>
          , inform them that we can see the location, call number, description,
          and if the call is already taken.
        </Item>
        <Item>
          Explain how to respond to calls, how to close the call, how to check
          the location of the call, cross reference this with the next section
          (Panics &amp; Backups).
          <span className="ml-1">
            <OOC>
              <Command>/resp</Command>, <Command>/closecall</Command>,{" "}
              <Command>/setcall</Command>; make sure to tell them how to
              utilize <Command>/setcall -1</Command> as well.
            </OOC>
          </span>
          <p className="mt-1.5">
            <Em>
              You can use a back-up{" "}
              <OOC>
                <Command>/backup</Command>
              </OOC>{" "}
              call to have the EMR practice how to respond, drop response, and
              close a call.
            </Em>
          </p>
          <SubHeading>Explain call priority:</SubHeading>
          <BulletList>
            <Item>Injured medics on duty</Item>
            <Item>PD and SD</Item>
            <Item>DOC and GOV</Item>
            <Item>Civilians calls from oldest to the newest</Item>
            <Item>Walk-in patients</Item>
          </BulletList>
        </Item>
        <Item>
          Inform the EMR that they can close a call if the call is older than
          one hour. <OOC>Phone time</OOC>
        </Item>
        <Item>
          Explain to the EMR why calls don&rsquo;t close by themselves. If the
          caller was not injured the call will not close.
        </Item>
        <Item>
          Explain to the EMR regarding duplicate calls and why we close them.
        </Item>
        <Item>
          If your GPS hasn&rsquo;t updated and is showing the previous call
          you&rsquo;ll need to go ahead and clear your GPS.{" "}
          <OOC>
            <Command>/setcall -1</Command>
          </OOC>
        </Item>
        <Item>
          The callers&rsquo; phone number will show up in the call log. If
          there is any trouble, it may help to call the patient.
        </Item>
      </Category>

      <Category title="Panic Button and Backup Calls" ordered>
        <Item>
          Explain to the EMR the difference between the panic button and a
          backup call.
        </Item>
        <Item>
          Inform the EMR that if they want to do a backup call, they have to
          provide a brief summary of the situation, and specify if
          it&rsquo;s MD only.{" "}
          <OOC>
            <Command>/backup [text]</Command>
          </OOC>
        </Item>
        <Item>
          Tell the EMR that if they ask for backup they must stay put at the
          location as these are associated with their cruiser.
        </Item>
        <Item>
          Explain that an EMR&rsquo;s panic button is connected to the
          location of their radio. Let them know that panics cannot have
          reasonings specified when creating them{" "}
          <OOC>CTRL + E</OOC>.
        </Item>
        <Item>
          Let the EMR know that our panics/backups now appear in PD / SD
          dispatch, and if they create a panic/backup for a situation that
          doesn&rsquo;t require PD/SD support, they should use the department
          radio to inform those departments to disregard it.{" "}
          <OOC>
            <Command>/calls</Command>
          </OOC>
          .
        </Item>
        <Item>
          Tell the EMR that if they need help from PD or SD, they should use
          the department radio and provide them with the backup/panic call
          number to provide more information.{" "}
          <OOC>
            <Command>/dep</Command>
          </OOC>
          .
        </Item>
        <Item>
          Ask the EMR if they would do a backup call or panic based on the
          following scenarios:
          <BulletList>
            <Item>They flip their ambulance</Item>
            <Item>
              Armed assailants are standing over their patient(s) and are
              issuing threats.{" "}
              <OOC>
                 Make sure to remind them of FearRP - they cannot hit
                a panic while under FearRP!
              </OOC>
            </Item>
            <Item>They run out of fuel in their ambulance.</Item>
            <Item>
              They have a severe accident resulting in them getting injured.{" "}
              <Bold>
                Remind them to call 911 to provide information{" "}
                <Bold>in addition to the panic</Bold> if they are unable to
                reach for their radio!
              </Bold>
            </Item>
          </BulletList>
        </Item>
      </Category>

      <Category title="Department Radio" ordered>
        <Item>
          Explain how we use the department radio{" "}
          <OOC>
            <Command>/dep</Command> &amp; <Command>/deplow</Command>
          </OOC>
          .
        </Item>
        <Item>
          Inform the EMR who is on department frequency. (MD, PD, SD, DOC, and
          GOV branches)
        </Item>
        <Item>
          Make sure the EMR knows that department radio has to be answered
          even if we are 10-9.
        </Item>
        <Item>
          Ensure the EMR understands that we always transmit the
          &ldquo;MD to&rdquo; when using department radio.
        </Item>
        <Item>
          Inform the EMR that we have two different methods for communicating
          over department radio:
          <BulletList>
            <Item>
              <Em>Non-Urgent:</Em> &ldquo;MD to PD/SD, how copy?&rdquo;, then
              transmit information on their response. Use a few examples for
              the EMR.
            </Item>
            <Item>
              <Em>Urgent:</Em> After hitting the panic or backup button,
              immediately use &ldquo;MD to PD/SD, need units at [call], [brief
              reason]&rdquo;. You skip the &ldquo;how copy&rdquo; for
              urgency&rsquo;s sake. Provide examples.
            </Item>
          </BulletList>
        </Item>
        <Item>
          Inform the EMR that once they are certified, a supervisor (or the
          highest rank on shift) would usually respond to departmental radio.
        </Item>
      </Category>

      <Category title="PD / SD Calls" ordered>
        <Item>
          Inform the EMRs that they need to report when they are en-route over
          our normal radio, department radio and explain why.
        </Item>
        <Item>
          Tell the EMR that the first thing to do as they approach the scene
          is to ask who is injured, who is a 10-15 or 10-16, and if any
          treatment has been given to the patients before our arrival. (Most
          PD and SD employees have BLS training)
          <BulletList>
            <Item>
              If there are no 10-15s, we behave as if it was a normal call.
            </Item>
            <Item>
              If there is an injured 10-15, we treat the patient and then we
              ask PD/SD if we can take the patient to the ambulance and which
              hospital.
            </Item>
          </BulletList>
        </Item>
        <Item>
          Explain why:
          <BulletList>
            <Item>Never take 10-15 to the ambulance without PD/SD permission</Item>
            <Item>Never leave a scene without permission from PD/SD</Item>
            <Item>Always ask which hospital PD/SD wants to go</Item>
            <Item>Never drop the patient without asking PD/SD for permission</Item>
          </BulletList>
        </Item>
        <Item>
          Make sure the EMR knows that it&rsquo;s better to ask twice than get
          IA reported for stealing a 10-15.
        </Item>
        <Item>
          Explain why sometimes PD/SD calls can be difficult. (Dealing with
          SD/PD, finding if the patient is a 10-15 or 10-16, checking which
          hospital you&rsquo;ll be heading to, and so forth.)
        </Item>
      </Category>

      <Category title="DOC Calls" ordered>
        <Item>DOC inmates should not be taken out of prison for treatment.</Item>
        <Item>
          If DOC calls you in to treat an inmate, bring them to the
          prison&rsquo;s medical ward and only then treat them.{" "}
          <OOC>Explain that you should then proceed to do regular medical RP.
            alongside There is a <Command>/dropbody</Command> point in
            the medbay, only drop the inmate thereafter both the medical
            roleplay and <Command>/stabilize</Command> have been completed.
          </OOC>
        </Item>
        <Item>
          A Correctional Officer, or any form of Law Enforcement is{" "}
          <Bold>required</Bold> to be with the medic inside the prison grounds
          at all times. This is for our safety.
        </Item>
      </Category>

      <Category title="Specialized Calls" ordered>
        <Item>
          There will be times when the assistance of a specialized division is
          required. Generally speaking, we&rsquo;re thinking of AMU, A&amp;R,
          and F&amp;R here.
        </Item>
        <Item>
          <Tinted tone="amber">AMU</Tinted> is a division that focuses on
          advanced medical treatments within hospitals.
        </Item>
        <Item>
          <Tinted tone="amber">A&amp;R (Air &amp; Rescue)</Tinted> is a
          division that focuses on rescuing from tough-to-reach spots and
          locations, utilizing helicopters and offroad vehicles.
        </Item>
        <Item>
          <Tinted tone="amber">F&amp;R (Fire &amp; Rescue)</Tinted> is a
          division that focuses on firefighting and rescuing people from
          vehicles or objects.
        </Item>
        <Item>
          If a situation where the assistance of a specialized unit is
          required pops up, but none are available, an EMR must know the
          minimum of what to do.
        </Item>
        <Item>
          <OOC>
              Inform the EMR that if they feel they need to page for AMU or
              otherwise, the patient has to be asked if they{" "}
              <Em>actually want to do that roleplay</Em> via{" "}
              <Command>/b</Command>. Both of these involve more in-depth
              character specific RP, and as such, the patient needs to have
              the time and willingness to do this RP!
          </OOC>
        </Item>
        <Item>
          Steps to take if you encounter someone stuck in a tough-to-reach
          spot and no A&amp;R trained unit is available:
          <BulletList>
            <Item>
              Get close to the caller with your vehicle, engage the parking
              brake, and continue on foot.
            </Item>
            <Item>
              Make sure you are aware of your surroundings as you attempt to
              climb up or down to the patient.
            </Item>
            <Item>Treat them, then carefully get them over to your ambulance.</Item>
          </BulletList>
        </Item>
      </Category>

      <Category title="Fire Calls" ordered>
        <Item>
          Show the EMR where to retrieve a fire extinguisher.
          <div className="mt-1">
            <OOC>
              RP first, then <Command>/fl</Command>. Tell them to press TAB in
              order to see the hotkey for the extinguisher.
            </OOC>
          </div>
        </Item>
        <Item>
          Then explain the process of extinguishing a fire to the EMR.
          <div className="mt-1">
            <OOC>
              <Command>E</Command> on the floating UI, and{" "}
              <Command>/extinguish</Command>
            </OOC>
          </div>
        </Item>
        <Item>
          Inform the EMR that there can be lingering flames, and that
          it&rsquo;s best to check the surroundings thoroughly.
          <div className="mt-1">
            <OOC>
              Additionally, explain that some fires are glitched and are only
              visible in the UI when physically close to the fire.
            </OOC>
          </div>
        </Item>
        <Item>
          <OOC>
            Any unattended fires can be handled by roadworkers after 5
            minutes, however this does not mean that fires should be left
            unattended.
          </OOC>
        </Item>
        <Item>
          Inform the EMR that these calls do not close themselves, and that it
          has to be done manually{" "}
          <OOC>
            <Command>/closecall ID</Command>
          </OOC>
          .
        </Item>
        <Item>Finally, have them return the fire extinguisher.</Item>
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
          Let the EMR take care of unit management, responding to calls, and
          closing calls.
        </Item>
        <Item>
          Ask the EMR if they want to try doing radio codes{" "}
          <OOC>
            You&apos;ll write them in chat and have them repeat them over the
            radio.
          </OOC>
        </Item>
        <Item>If the EMR doesn&rsquo;t want to do the radio try to encourage them.</Item>
        <Item>Explain to the EMR everything that you do and why.</Item>
        <Item>Make sure to say that you are happy with your EMR&rsquo;s work.</Item>
        <Item>
          Assign them 1x mandatory ride along, alongside additional mandatories
          if they require it.
        </Item>
      </Category>

      <ImportantNote>
        <Em>
          <Bold>
            <span className="underline">If the EMR performed poorly</span>,
            be honest and genuine on your report
          </Bold>
        </Em>{" "}
        - not stating they didn&rsquo;t do well is only harming the EMR.
      </ImportantNote>
    </div>
  );
}

function RadioRow({ children }: { children: React.ReactNode }) {
  return <RadioCallFormat>{children}</RadioCallFormat>;
}
