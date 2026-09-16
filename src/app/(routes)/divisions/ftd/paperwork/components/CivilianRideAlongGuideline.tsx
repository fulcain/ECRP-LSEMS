import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, FileCheck2 } from "lucide-react";

/**
 * Readable guideline rendered at the top of the Civilian Ride-Along form.
 *
 * The original guidance is authored in BBCode for the FTO-command post.
 * Here we render the same prose as plain HTML so the medic can read it
 * inline before filling out a phase. We drop the `[spoil]`/forum
 * scaffolding that only made sense on Discourse, and use a native
 * `<details>` element so we don't pull in a Radix accordion dependency.
 */

export function CivilianRideAlongGuideline() {
  return (
    <Card className="border shadow-sm bg-muted/40">
      <CardContent className="p-5 space-y-4 text-sm leading-relaxed">
        <p className="text-center font-medium">
          Below you will find formats for Civilian Ride-Alongs.
          Please make sure to personalize the signature when you use them!
        </p>

        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 space-y-2">
          <p className="flex items-center gap-2 font-semibold text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            Session Guideline - read before conducting any session
          </p>
          <details className="text-sm text-muted-foreground cursor-pointer">
            <summary className="font-medium text-foreground hover:text-primary transition-colors select-none py-1">
              Show rules
            </summary>
            <div className="space-y-2 mt-2">
              <p>
                When a ride-along request has been approved,{" "}
                <strong className="text-foreground">
                  any EMT-I or above
                </strong>{" "}
                may conduct a session. Remember to{" "}
                <strong className="text-foreground">
                  rename your unit to a Zulu unit.
                </strong>{" "}
                When a ride-along session has ended, it is required to
                fill out and add a ride-along log to the individual&apos;s
                ride-along request.
              </p>
              <p>
                As the medic in charge during a session, you are required
                to enforce all of the terms and conditions listed in the
                ride-along request. When beginning a ride-along session,{" "}
                <strong className="text-foreground">
                  ask for identification and frisk the individual.
                </strong>{" "}
                The ride-along partner needs to be identifiable
                throughout the session,{" "}
                <strong className="text-foreground">
                  the use of masks is prohibited.
                </strong>{" "}
                If they refuse to be frisked, you are not allowed to begin
                a session with them. Communicate with the individual and
                answer any questions they have, however{" "}
                <strong className="text-foreground">
                  you are not allowed to share any internal information
                  about the medical department.
                </strong>
              </p>
              <p>
                Should you find a weapon on the civilian, they are to
                securely store it away before they ask for the ride-along
                again.{" "}
                <strong className="text-foreground">
                  Having weapons on you as medical personnel is strictly
                  prohibited and must not be done.
                </strong>
              </p>
              <p>
                There is no enforced minimum ride-along session duration,
                but be mindful that you shouldn&apos;t really begin one
                should you not have the time for at least 15 minutes.
                You may end a ride-along session at any point. A session
                should be concluded at the place where it started ((unless
                the person has to go due to OOC reasons) ), and a session
                must begin at any of our hospitals. Ride-along logs must
                be added to the ride-along request within{" "}
                <strong className="text-foreground">
                  30 minutes after ending a session.
                </strong>
              </p>
            </div>
          </details>
        </div>

        <div className="rounded-md border p-3 space-y-1.5">
          <p className="flex items-center gap-2 font-semibold text-sm">
            <FileCheck2 className="h-4 w-4 text-primary" />
            Available formats
          </p>
          <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">Accepted</strong> - Use
              when the request has been approved.
            </li>
            <li>
              <strong className="text-foreground">Expired</strong> - Use
              when the request has expired.
            </li>
            <li>
              <strong className="text-foreground">Denied</strong> - Use
              when rejecting the request. Requires at least one reason.
              Email a copy to the applicant.
            </li>
            <li>
              <strong className="text-foreground">On Hold</strong> - Use
              when the application requires a second opinion.
            </li>
            <li>
              <strong className="text-foreground">Ride-Along Report</strong>{" "}
              - Posted in the ride-along request upon completing a
              session.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
