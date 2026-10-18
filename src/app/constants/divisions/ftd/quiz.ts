/**
 * The EMR → EMT-Basic quiz, as the marking guide on GOV declares it
 * ("Quiz Guidelines, Answer Sheet & Formats" in the FTD quick links). The FTI
 * page's marking sheet and the generated result emails are both built from
 * this one declaration, so the app cannot drift from the answer sheet.
 */

import { QUIZ_BLANK_IMAGE, QUIZ_RESULTS_MAX } from "@/app/constants/divisions/ftd/quiz-document";

export const QUIZ_AREA_URL = "https://gov.eclipse-rp.net/viewforum.php?f=3748";
export const QUIZ_ARCHIVE_URL = "https://gov.eclipse-rp.net/viewforum.php?f=3749";
export const QUIZ_STUDENT_AREA_URL = "https://gov.eclipse-rp.net/viewforum.php?f=1926";

export const QUIZ_EMAIL_SUBJECT = "Quiz Results";

export const QUIZ_MAX_POINTS = {
  regular: QUIZ_RESULTS_MAX.total,
  ooc: QUIZ_RESULTS_MAX.ooc,
} as const;
export const QUIZ_PASS_MARK = { regular: 12, ooc: 5 } as const;

export type QuizMcQuestion = {
  id: number;
  /** OOC questions sit outside the 16 regular points. */
  ooc: boolean;
  answers: string[];
};

export const QUIZ_MC_ANSWERS: QuizMcQuestion[] = [
  { id: 1, ooc: false, answers: ["B", "D"] },
  { id: 2, ooc: false, answers: ["D"] },
  { id: 3, ooc: false, answers: ["D"] },
  { id: 4, ooc: false, answers: ["A"] },
  { id: 5, ooc: false, answers: ["D"] },
  { id: 6, ooc: false, answers: ["B", "C"] },
  { id: 7, ooc: false, answers: ["A", "C"] },
  // Questions 8 and 9 are the guide's (( ... )) pair - the two OOC points.
  { id: 8, ooc: true, answers: ["D"] },
  { id: 9, ooc: true, answers: ["C"] },
];

export type QuizLongQuestion = {
  id: number;
  ooc: boolean;
  /** Every listed point is one mark. */
  points: string[];
};

export const QUIZ_LONG_ANSWERS: QuizLongQuestion[] = [
  {
    id: 10,
    ooc: false,
    points: [
      "Patient consenting to the drug test.",
      "Patient being educated on the correct dosage or the dangers of overdosing methadone.",
      "Obtaining the patient's information, phone number, name, etc. (the needed info is on the prescription itself), and doing the paperwork / writing the prescription.",
    ],
  },
  {
    id: 11,
    ooc: false,
    points: [
      "Asking everyone to step away from the patient, remaining calm.",
      "Asking for a 10-70 / on duty supervisor, or requesting PD/SD assistance. Both are acceptable.",
      "Attempting to treat the patient if possible.",
    ],
  },
  {
    id: 12,
    ooc: false,
    points: [
      "Calling for a 10-70 to the call they're responding to and dropping response, or asking PD/SD for assistance as they're the only unit.",
      "Stopping at the sidewalk patient and providing treatment.",
      "Picking up the sidewalk patient, and provided the original call isn't too far away, going to the original call and transporting both.",
    ],
  },
  {
    id: 13,
    ooc: true,
    points: [
      "Removing clothing around the fracture using a pair of scissors.",
      "Applying a splint over the fracture and a sling around the arm to prevent any further movement.",
      "Using a pre-wrapped coldpack/icepack, or wrapping a coldpack/icepack in a towel and holding it against the splinted fracture.",
    ],
  },
  {
    id: 14,
    ooc: true,
    points: [
      "Treating someone who is not scriptly injured, or dropping someone off at the hospital who is also not scriptly injured - using a similar /do as the automated /do from dropping a scriptly injured patient off.",
    ],
  },
];

export const QUIZ_IMAGES = {
  /** The blank quiz form's own banner - the marked quiz is rebuilt under it. */
  blank: QUIZ_BLANK_IMAGE,
  passed: "https://i.ibb.co/VpM2qJFT/i-VZ9t-SK.png",
  failed: "https://i.ibb.co/Vc0rJZMx/q-MY6bs8.png",
} as const;
