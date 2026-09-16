import type { CivilianRideAlongPhaseKey } from "@/app/(routes)/divisions/ftd/paperwork/lib/civilianRideAlongConfig";

export interface CivilianRideAlongValues {
  /** Applicant's full name as written on the ride-along request (e.g. "Firstname Lastname"). */
  applicantName: string;
  /** FTO's signature image URL (else blank image BBCode tag in the output). */
  signature: string;
  /** FTO's rank label (e.g. "Lead Paramedic"). */
  rank: string;
  /** Ride-Along Report only: free-form session notes. */
  notes?: string;
  /** Denied only: row of rejection reasons. Empty rows are skipped when emitted. */
  rejectionReasons?: Array<{ reason: string }>;
}

const ACCEPTED_HEADER_URL = "https://i.ibb.co/GQ4G8VM4/oai-Unb-A.png";
const REPORT_HEADER_URL = "https://i.ibb.co/WNrSTh8H/e-IVCOfs.png";
const REPORT_BANNER_URL = "https://i.ibb.co/xKYgq6P0/7x0vy1x.png";

function signatureBlock(values: CivilianRideAlongValues): string {
  return `[img]${values.signature || ""}[/img]
${values.rank || ""}`;
}

function genericSincerity(values: CivilianRideAlongValues): string {
  return `[hr][/hr]
[b]Sincerely,[/b]
${signatureBlock(values)}
[b]Los Santos Emergency Medical Services[/b]`;
}

/** Pure BBCode assembler for civilian ride-along formats. */
export function generateCivilianRideAlongBBCode(
  values: CivilianRideAlongValues,
  phase: CivilianRideAlongPhaseKey,
): string {
  const applicant = values.applicantName || "Firstname Lastname";

  switch (phase) {
    case "accepted":
      return `[img]${ACCEPTED_HEADER_URL}[/img]
[lsemssubtitle]Accepted[/lsemssubtitle][divbox=white]
[b]Dear[/b] [i]${applicant},[/i]

Your ride-along request with the [i][b]Los Santos Emergency Medical Services[/b][/i] has been [size=100][color=green][b][u]ACCEPTED.[/u][/b][/color][/size] Please keep this ride-along request readily available throughout any of your ride-along sessions. We hope that you will get to see first-hand how our Department and its Employees operate Day-to-Day.

This ride-along request is valid for 7 days from the moment the request is accepted. After the 7 days have passed your ride-along request will expire and a member of the LSEMS will archive the request. If you are still interested in our ride-along program after your request has expired, you must submit a new one. 

[b]What should I do now?[/b]
[list]
[*]You are expected to follow common courtesy and show respect to the medic in charge of your ride-along session, so, we request you to dress properly and keep an eye on your personal hygiene.

[*]If you are in possession of any weapons, make sure not to bring them to a ride-along session. The medic in charge will be frisking you before starting a ride-along session and if you are found to have weapons of any sort on your person (including knives), you will be asked to secure them in a personal vehicle or off of the property before being granted access to the ride-along. 

[*]When you are ready for a ride-along session, visit the Pillbox Medical Center and ask if any EMT-I or above is available to conduct a ride-along session. There is no limit to the number of sessions you may do, so long as your request is active.

[*]If no employees are available to conduct a ride-along session, try again another time or schedule a ride-along session beforehand. Your sessions may be conducted by a different medic each time.
[/list]
${genericSincerity(values)}
[/divbox]
[lsemsfooter][/lsemsfooter]`;

    case "expired":
      return `[img]${ACCEPTED_HEADER_URL}[/img]
[lsemssubtitle]Expired[/lsemssubtitle][divbox=white]
[b]Dear[/b] [i]${applicant},[/i]

Your ride-along request with the [b][i]Los Santos Emergency Medical Services[/i][/b] has [size=100][color=orange][b][u]EXPIRED[/u][/b][/color][/size] and is no longer valid. Thank you for showing interest in our ride-along program. If you wish to take any further ride-alongs, you must submit another ride-along request.
${genericSincerity(values)}
[/divbox]
[lsemsfooter][/lsemsfooter]`;

    case "denied": {
      const reasons = (values.rejectionReasons ?? [])
        .map((r) => r.reason.trim())
        .filter((r) => r.length > 0);
      const reasonsList =
        reasons.length > 0
          ? `[list]\n${reasons.map((r) => `[*]${r}`).join("\n")}\n[/list]`
          : `[list]\n[*]\n[/list]`;
      return `[img]${ACCEPTED_HEADER_URL}[/img]
[lsemssubtitle]Denied[/lsemssubtitle][divbox=white]
[b]Dear[/b] [i]${applicant},[/i]

Your ride-along request with the [b][i]Los Santos Emergency Medical Services[/i][/b] has been [size=100][color=red][b][u]DENIED.[/u][/b][/color][/size] We would like to thank you for showing interest in our ride-along program; however, it has been denied for the following reasons:
${reasonsList}
${genericSincerity(values)}
[/divbox]
[lsemsfooter][/lsemsfooter]`;
    }

    case "onHold":
      return `[img]${ACCEPTED_HEADER_URL}[/img]
[lsemssubtitle]On-Hold[/lsemssubtitle][divbox=white]
[b]Dear[/b] [i]${applicant},[/i]
 
We would first like to thank you for your interest in riding along Los Santos Emergency Medical Services. However, we need a bit more time to review your application in full and conduct a proper background check. As such, your application has been placed [color=Coral][b]ON-HOLD[/b] [/color]until we are able to complete the necessary steps. We appreciate your patience and you should be hearing back from us shortly. 
${genericSincerity(values)}
[/divbox]
[lsemsfooter][/lsemsfooter]`;

    case "rideAlongReport":
      return `[img]${REPORT_HEADER_URL}[/img]
[divbox=white]
[center][img]${REPORT_BANNER_URL}[/img][/center]
[b]Name:[/b] [i]${applicant}[/i]
[b]Notes (optional but preferred):[/b] [I]${values.notes || ""}[/i]

[img]${values.signature || "SIGNATURE"}[/img]
[I]${applicant}[/i]
[b]${values.rank || "Rank"}[/b]
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  }
}
