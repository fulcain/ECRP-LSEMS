"use client";

import {
  Aside,
  Bold,
  BbLink,
  BulletList,
  Category,
  Command,
  CriticalCallout,
  Divider,
  EyebrowLabel,
  Em,
  Item,
  NumberedList,
  OOC,
  Tinted,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/primitives";
import { Clock } from "lucide-react";

export function CertFailedNotes() {
  return (
    <div className="space-y-2.5">
      <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-2.5">
        <EyebrowLabel icon={Clock}>
          CERTIFICATION - Junior Paramedic+ - 1h 30m minimum / 3h maximum
        </EyebrowLabel>
      </div>

      <Category title="Beginning" ordered>
        <Item>
          <Bold>
            Read their student profile. Ensure that you are eligible to do
            a Certification for the EMR if they failed one before.
          </Bold>
        </Item>
        <Item>
          <Bold>
            Ensure that they did all of the assigned mandatory ride-alongs
            (a minimum of 2 + however many assigned) if they failed their
            previous certification attempt.
          </Bold>
        </Item>
        <Item>
          <Bold>Ensure they&rsquo;ve passed their Pre-Certification.</Bold>
        </Item>
        <Item>Ask if the EMR has any questions before starting.</Item>
        <Item>
          Inform the EMR that during this phase they are on their own
          unless a crisis occurs or they make a major error.
        </Item>
        <Item>
          Make sure the EMR creates its own unit and follows all
          shift-starting protocols.
        </Item>
        <Item>Proceed to observe the EMR.</Item>
        <Item>
          <Bold>
            Request Call Priority over radio. Either you, or the EMR may do
            this request.
          </Bold>
        </Item>
      </Category>

      <Category title="During the Certification" ordered>
        <Item>Observe the EMR.</Item>
        <Item>
          Pay attention to their treatments, scene management,
          communication, and radio calls.
        </Item>
        <Item>
          If there are no PD calls, question the EMR about PD/SD calls and
          set up a small scenario. Make sure EMR understands them,
          especially if they did not have too much experience throughout
          the training.
        </Item>
      </Category>

      <Category title="Ending the Certification" ordered>
        <Item>
          Give the EMR the certification result and feedback on their
          work.
        </Item>
        <Item>
          Before handing the EMR their new badge, have them swear the{" "}
          <Bold>Hippocratic Oath</Bold> (found below).
        </Item>
        <Item>
          Begin going down the following checklist:
          <NumberedList>
            <Item>
              Let the EMR, now EMT-B, pick their callsign. Tell them they
              can check which one is available on the{" "}
              <BbLink href="https://gov.eclipse-rp.net/viewtopic.php?p=126127#p126127">
                LSEMS Staff Roster
              </BbLink>
              .{" "}
              <Em>
                <span className="text-red-700 dark:text-red-400 not-italic">
                  Reminder that callsigns go from ECHO-11 to ECHO-99, and
                  that ECHO-69 may not be assigned.
                </span>
              </Em>
            </Item>
            <Item>
              Give them their medical license. <OOC><Command>/givemedical</Command></OOC>
            </Item>
            <Item>
              Tell the EMR about Duty Reports, and mention that they are
              not mandatory but are encouraged to be filled out at least
              once a pay period.
            </Item>
            <Item>
              Inform the EMR that the leadership team may take them aside
              for an <Bold>informal</Bold> 1-on-1 session around every 3
              months. These are just a casual conversation to allow them
              the opportunity to communicate with the Leadership Team.
            </Item>
            <Item>
              Inform the EMR that since they are now an EMT-B they can
              join divisions.
            </Item>
            <Item>
              Ask them if they have a pager. If not, ask them if they
              want one. Explain what a pager is and make sure they know
              how to properly use it!{" "}
              <Aside>
                (( Make sure they understand they have to RP pressing it
                with a simple /me, and check the discord if they have the
                &lsquo;On Call Program&rsquo; role either way. ))
              </Aside>
            </Item>
            <Item>
              <Aside>
                (( F4 rank adjustment, Discord, Teamspeak - reference{" "}
                <BbLink href="https://gov.eclipse-rp.net/viewtopic.php?t=74487">
                  Section 5 of the Supervisor Handbook
                </BbLink>{" "}
                for detailed guidance for TeamSpeak while the person is
                offline. ))
              </Aside>
            </Item>
            <Item>
              Post the certification paperwork in the EMR Student
              Profile, and fill it out.
            </Item>
            <Item>Archive the EMR Student Profile.</Item>
            <Item>
              Update the{" "}
              <BbLink href="https://gov.eclipse-rp.net/viewtopic.php?t=9497">
                Staff Roster
              </BbLink>{" "}
              - You only need to adjust the Staff Roster (second post),
              copy the EMR entry into the appropriate numerical slot in
              the EMT section, edit the rank from{" "}
              <Tinted tone="amber">&ldquo;EMR&rdquo;</Tinted> to{" "}
              <Tinted tone="amber">&ldquo;EMT-B&rdquo;</Tinted>.
            </Item>
            <Item>
              Post the EMT-B promotion format into their personnel file{" "}
              - Post format can be{" "}
              <BbLink href="https://gov.eclipse-rp.net/viewtopic.php?t=216104#PROMOTIONS">
                found here
              </BbLink>{" "}
              (Section 9.14).
            </Item>
            <Item>
              Edit the personnel file top post - Title, rank, callsign,
              and edit the Promotions section, linking to the promotion
              post.
            </Item>
            <Item>Move the personnel file to EMT Personnel Files.</Item>
            <Item>Create the EMR a divisional file.</Item>
            <Item>Update the Dashboard, ensuring the EMR is promoted to EMT-B.</Item>
            <Item>
              Send them the Promotion Email for EMT-B found (
              <BbLink href="https://gov.eclipse-rp.net/viewtopic.php?t=216104#PROMOTIONS">
                here
              </BbLink>
              ){" "}
              <Aside>
                ((copy the appropriate link to your address bar and
                you&apos;ll get the proper email format to send from
                there))
              </Aside>
            </Item>
            <Item>
              Remove them from the EMR usergroup, and add them to the EMT
              usergroup, making it their primary group (unless they are
              employed elsewhere and prefer that one).
            </Item>
            <Item>
              Employee Adjustment post -{" "}
              <BbLink href="https://gov.eclipse-rp.net/viewtopic.php?p=445130#RANK-ADJUSTMENT">
                Format here
              </BbLink>{" "}
              (Section 9.12), and{" "}
              <BbLink href="https://gov.eclipse-rp.net/viewtopic.php?f=573">
                here
              </BbLink>{" "}
              is the location to post it.
            </Item>
            <Item>
              <OOC>Request an acp rank change in discord</OOC>
            </Item>
          </NumberedList>
        </Item>
        <Item>
          Give the EMR the <span className="text-red-700 dark:text-red-400 font-semibold">fail</span>{" "}
          result and continue with the Processing section below.
        </Item>
      </Category>

      <Divider />

      <Category title="Processing a Failed Certification" ordered>
        <Item>
          <Bold>Minimum of 2 Mandatory Ride-alongs</Bold> must be assigned,
          in addition to:
          <BulletList>
            <Item>Additional ride-alongs if you deemed necessary.</Item>
          </BulletList>
        </Item>
        <Item>Update the EMR Profile title with the assigned ride-alongs.</Item>
        <Item>Post your FT Session Report.</Item>
        <Item>
          Reach out to the Head of Field Training about the failed
          certification, email preferably.
          <div className="mt-1.5">
            <OOC>
              Tagging <Em>@Head of Field Training</Em> in{" "}
              <Bold>discord #notifications</Bold>, linking to the
              paperwork (once completed), is also acceptable!
            </OOC>
          </div>
        </Item>
      </Category>

      <CriticalCallout>
        Make sure to be honest in the FT Session Report - generic positive
        feedback does a poor job of preparing the EMR for their next
        attempt.
      </CriticalCallout>
    </div>
  );
}
