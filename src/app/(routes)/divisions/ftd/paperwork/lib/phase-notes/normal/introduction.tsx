"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INTRO_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/intro-email-content";

import {
  Bold,
  BulletList,
  Category,
  Command,
  Em,
  EyebrowLabel,
  Item,
  OOC,
  SectionHeader,
  Tinted,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/primitives";

/** Phase notes for the Introduction (first-time) session; last item copies INTRO_EMAIL_CONTENT. */
export function IntroductionNotes() {
  const [copied, setCopied] = useState(false);
  // Ref so rapid re-clicks clear the previous "reset copied" timer instead of stacking.
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    },
    [],
  );

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(INTRO_EMAIL_CONTENT);
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard write can fail (e.g. permissions / insecure context);
      // the surface here is intentionally narrow - fall back silently.
      setCopied(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="mt-6">
        <EyebrowLabel>SESSION INFORMATION AND GUIDES</EyebrowLabel>
      </div>

      <div className="mt-2">
        <SectionHeader>Introduction - EMT-I+</SectionHeader>

        <Category title="Uniform and On Duty">
          <Item>
            Let the EMR know that they <Bold>cannot</Bold> be on duty without a
            trainer. Make sure they understand this. If they cannot find a
            trainer by using the radio then direct them to the Student area.
          </Item>
          <Item>
            <OOC>
              Inform them that they must first reach out in <Command>/r</Command>{" "}
              for an FTO and if they have no luck then they can also reach out
              on the MD discord in the <Command>#fto-availability</Command>{" "}
              channel using the copy paste provided.
            </OOC>
          </Item>
          <Item>
            Bring the EMR into our locker room and show them where their locker
            is and provide them with their uniform, bodycam and ALS bag.
          </Item>
          <Item>
            <OOC>
              Explain how to use the <Command>/FL</Command> command, and the
              surrounding RP. Make sure they know they must RP pulling out
              equipment as well as putting it back.
            </OOC>
          </Item>
          <Item>
            We are required to wear body cams on duty, and they are provided by
            LSEMS. Make sure the EMR is aware that they must have a bodycam
            running when on shift, at all times and demonstrate how to do so
            correctly.
          </Item>
          <Item>
            <OOC>
              Educate them on Bodycam RP rules, and explain that you will need
              to RP putting one on but you are not required to use recording
              software. If you can record, it is recommended but not required.
            </OOC>
          </Item>
          <Item>
            <OOC>
              Let them know that they do NOT have access to everything they see
              in the uniform menu. They can only wear uniforms that they ICly
              have access to.
            </OOC>
          </Item>
          <Item>
            Let them know that if they change their name at all for any reason
            then they MUST notify Command and High Command.
          </Item>
          <Item>
            <Bold>
              Inform the EMR, if they are detained and arrested, they must
              notify Command and High Command immediately with what they were
              charged with.
            </Bold>{" "}
            Please have the EMR repeat this back to you.
          </Item>
          <Item>
            Let them know that if they are IA&rsquo;ed for any reason, they
            cannot talk to <Bold>anyone</Bold> about it. They can only speak to
            those handling the IA report when asked directly about the report.
          </Item>
          <Item>
            <OOC>
              IA reports cannot be talked about OOC as well, about an IC IA
              report nor an OOC IA report.
            </OOC>
          </Item>
          <Item>
            Inform the EMR of the social media policy: no livestreaming and/or
            donating to livestreams on duty and if you are distracted by your
            phone, do not use it on duty.
          </Item>
        </Category>

        <Category title="Unit Management">
          <Item>
            Explain the following to the EMR:
            <BulletList>
              <Item>
                How to create a unit <OOC> <Command>/createunit [name]</Command></OOC>
              </Item>
              <Item>
                Renaming the unit <OOC><Command>/renameunit [name]</Command></OOC>
              </Item>
              <Item>
                Disbanding the unit <OOC> <Command>/disbandunit</Command></OOC>
              </Item>
              <Item>
                Joining a unit <OOC><Command>/joinunit [name]</Command></OOC>
              </Item>
              <Item>
                Leaving a unit <OOC><Command>/leaveunit</Command></OOC>
              </Item>
            </BulletList>
          </Item>
          <Item>
            Have the EMR create the unit, but make sure they ran through all
            four of the above at least once. And let them know that they will
            be creating the unit from here on out.
          </Item>
          <Item>
            Inform the EMR that there can be a maximum of 2 medics per unit,
            FTP callsigns and high command are exempt from this rule.
          </Item>
        </Category>

        <Category title="Callsigns">
          <Item>Shortly explain to the EMR how our rank system works.</Item>
          <Item>
            Inform the EMR about the existence of{" "}
            <Tinted tone="amber">Zulu (Z), Echo (E), Delta (D), Oscar (O), Charlie (C), Bravo (B), and Alpha (A)</Tinted>
            .
            <ul className="mt-1.5 ml-4 space-y-1 text-[13px]">
              <li>
                <Bold>Zulu</Bold> - Training Units{" "}
                <Tinted tone="amber">Z-11, D-1Z, O-1Z, C-1Z, B-1Z, A-1Z</Tinted>
              </li>
              <li>
                <Bold>Echo</Bold> - EMTs (EMT-B/I/A/P)
              </li>
              <li>
                <Bold>Delta</Bold> - Master EMT
              </li>
              <li>
                <Bold>Oscar</Bold> - Supervisors-in-training (Junior
                Paramedic)
              </li>
              <li>
                <Bold>Charlie</Bold> - Supervisors (Paramedic/Senior
                Paramedic/Lead Paramedic)
              </li>
              <li>
                <Bold>Bravo</Bold> - Command
                (Lieutenant/Captain/Commander)
              </li>
              <li>
                <Bold>Alpha</Bold> - High Command (Deputy Chief,
                Assistant Chief, Chief of EMS)
              </li>
            </ul>
          </Item>
          <Item>
            Explain to the EMR that the highest-ranked medic on a scene is the
            scene leader.
          </Item>
          <Item>
            Explain that callsigns range from Echo-11 to Echo-99, whilst Delta
            and Charlie callsigns range from 1-10 or as necessary.
          </Item>
          <Item>
            Remind the EMR that they cannot leave a scene without first
            acquiring permission from whoever is scene leader.
          </Item>
          <Item>
            Inform the EMR about the existence of divisional callsigns:
            <BulletList>
              <Item><Bold>AMU</Bold> - Advanced Medical Unit</Item>
              <Item><Bold>BLS</Bold> - Basic Life Support</Item>
              <Item><Bold>PR</Bold> - Public Relations</Item>
              <Item><Bold>RED</Bold> - Recruitment and Employment</Item>
              <Item><Bold>ENG</Bold> - Fire Engine</Item>
              <Item><Bold>FIRE</Bold> - Fire unit</Item>
              <Item><Bold>EVAC</Bold> - Air unit</Item>
              <Item><Bold>RSC</Bold> - Kamacho unit</Item>
              <Item><Bold>LFG</Bold> - Lifeguard</Item>
              <Item><Bold>FOR</Bold> - Forensics</Item>
            </BulletList>
          </Item>
        </Category>

        <Category title="Radio">
          <Item>
            Explain to the EMR that they always have to be on MD frequency
            while on duty.
          </Item>
          <Item>
            Inform them that we respect each other on the radio and if someone
            is speaking we don&rsquo;t <Bold>interrupt!</Bold> Teach them how to
            react when they hear someone speaking at the same time.
          </Item>
        </Category>

        <Category title="On Duty Equipment">
          <Item>
            Inform the EMR that they are given service equipment and that it is
            not to be used inappropriately.
          </Item>
          <Item>
            Inform the EMR that any form of abuse of service equipment is
            punishable and could lead to dismissal from the department if
            serious enough.
          </Item>
          <Item>
            Inform the EMR that any personal weapon or tool is to be left at
            home or personal vehicle.
          </Item>
          <Item>
            Inform the EMR that Kevlar is available after their Certification,
            and that they will have one available in their vehicles at all
            times. It is only to be worn in (potential) hostile or
            life-threatening situations, and can be requested by the most
            senior on shift.
          </Item>
        </Category>

        <Category title="Pillbox Hospital Tour">
          <Item>
            <Bold>Vending machines (Ward D):</Bold> Take the EMR into Ward D and
            show them where to find the vending machine (first door on the
            right). Inform the EMR that anything acquired from this vending
            machine is for <Bold>LSEMS Staff</Bold> only.
          </Item>
          <Item>
            <Bold>Morgue:</Bold> Inform the EMR that the Morgue is to remain{" "}
            <Bold>LOCKED</Bold> at all times.
          </Item>
          <Item>
            <Bold>Employee Parking:</Bold>
            <BulletList>
              <Item>
                Show the EMR how to lock/unlock the gates. Explain that this is
                for on duty staff only. Off duty employee&rsquo;s with a
                vehicle here will be towed and secure impounded if the
                leadership team deems it necessary.
              </Item>
              <Item>
                Explain to the EMR that the employee parking only keeps the
                vehicle safe. No valuables should be kept in the vehicle as the
                location is susceptible to lock pickers.{" "}
                <Em>
                  If a vehicle has valuables stored, parking at Legion Parking
                  would be recommended instead.
                </Em>
              </Item>
            </BulletList>
          </Item>
          <Item>
            Inform the EMR that all doors that are accessible by the public are
            to be kept <Bold>locked</Bold> at all times.
          </Item>
        </Category>

        <Category title="Hospitals">
          <Item>
            Show the EMR where to drop off at Upper Pillbox, then Lower
            Pillbox.
          </Item>
          <Item>
            Roam to Paleto MD, and explain how to perform a drop off at Paleto
            MD (through the right side where the entrance of the building is,
            driving around to the exit on the left).
          </Item>
          <Item>
            Take the EMR inside Paleto MD, showing them where they could clock
            on, as well as where the plastic surgeon is located.
          </Item>
          <Item>
            Inform the EMR that if they wish to clock on at Paleto MD, they
            should park their vehicle at Paleto Parking, as it is unsafe to
            park at Paleto MD.
          </Item>
        </Category>

        <Category title="TeamSpeak (OOC)">
          <Item>
            <OOC>
              Ask them to join <Bold>TeamSpeak 3</Bold>, and make sure they have
              the correct IC name.
            </OOC>
          </Item>
          <Item>
            <OOC>
              Explain to them how to set up the unit tag before their name in
              TeamSpeak, for example{" "}
              <Tinted tone="amber">[Z-11] John Doe</Tinted>.
            </OOC>
          </Item>
          <Item>
            <OOC>
              <Bold>
                Inform the EMR that they may not connect to the TeamSpeak
                server while on a criminal focused character. Doing so will
                lead to server punishments.
              </Bold>
            </OOC>
          </Item>
          <Item>
            <OOC>
              Explain that if we use VOIP we say, Zulu, if we use VOIP we type,{" "}
              <Tinted tone="amber">Z</Tinted> instead of Zulu.
            </OOC>
          </Item>
        </Category>

        <Category title="OOC Corruption + Faction Commands (OOC)">
          <Item>
            <OOC>
              Explain the OOC corruption ruling that LSEMS has in place to the
              EMR. Inform them we don&rsquo;t require IC evidence to terminate
              due to any illegal activities.
            </OOC>
          </Item>
          <Item>
            <OOC>
              Explain that faction-related commands are a privilege and not
              given out to mess around with. Explain that they cannot use the
              commands without first doing the applicable roleplay before
              using the command. If found to have done so it can lead to
              Faction repercussions and/or server punishments.
            </OOC>
          </Item>
          <Item>
            <OOC>
              Explain that much like faction commands, faction equipment and
              vehicles also follow the same consequences as commands.
            </OOC>
          </Item>
          <Item>
            <OOC>
              Explain that if they receive an admin punishment that they MUST
              tell High Command within 48 hours. Let them know that they need
              to send the link to the report and to inform High Command when it
              is concluded along with the result.
            </OOC>
          </Item>
          <Item>
            <OOC>
              Let them know that in the event that they cannot post an LOA for
              OOC reasons then they should reach out to someone from Command or
              High Command to let them know.
            </OOC>
          </Item>
        </Category>

        <Category title="Ending Introduction">
          <Item>
            Tell the EMR they can use the radio to attempt to reach a certified
            Field Training Officer for training and teach them how to do it.
          </Item>
          <Item>
            Example:{" "}
            <Tinted tone="maroon">
              &ldquo;EMR Smith to dispatch, are there any available
              FTOs?&rdquo;
            </Tinted>{" "}
            <OOC>
              <Bold>NO VOIP RADIO</Bold>
            </OOC>
          </Item>
          <Item>
            Inform them that they have a mandatory <Bold>30</Bold> minute break
            between the introduction and phase I.{" "}
            <Bold>
              Explain to them they should go over their introduction email once
              more to fully grasp all the information they&rsquo;ve been given.
            </Bold>
          </Item>
          <Item>
            Encourage the EMR to fill out a duty report once a week. Although
            not required, it does help supervisors see your work.
          </Item>
          <Item>
            If you want you can take the EMR on a ride-along or ask someone
            else if they can take them if they want to see how it works.
          </Item>
          <Item>
            <div className="space-y-2">
              <div>
                <Bold>
                  Before proceeding to do your paperwork, check if the EMR
                  has received the Introduction email. If not, send the EMR
                  the Introduction email:
                </Bold>{" "}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEmail}
                  aria-label={
                    copied ? "Introduction email copied" : "Copy Introduction Email"
                  }
                  className="h-7 gap-1.5 px-2.5 text-xs"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  {copied ? "Copied!" : "Copy email"}
                </Button>        
              </div>
            </div>
          </Item>
        </Category>
      </div>
    </div>
  );
}

