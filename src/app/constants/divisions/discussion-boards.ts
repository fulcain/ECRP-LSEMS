import type { DivisionKey } from "@/configs/roles";

/**
 * The discussion boards, declared once.
 *
 * A board is a forum section a member posts a topic into, and five pages offer
 * them: the FTD paperwork tab, the FTI page, the FTD command tab, the BLS page
 * and the RED page. The forum id lives here rather than in each of those pages,
 * so a section that moves is a single edit - the same reason
 * `helpers/govLinks.ts` exists.
 *
 * `division` is whose template pre-fills the body and whose header the post
 * carries: a discussion post is written in the division's own house style, so
 * the FTD boards share FTD's template and the BLS boards share BLS's.
 */

export type DiscussionBoardKey =
  | "ftdDiscussionBoard"
  | "ftdInstructorBoard"
  | "ftdCommandBoard"
  | "redDiscussionBoard"
  | "blsDiscussionBoard"
  | "blsSeniorInstructorBoard";

export type DiscussionBoard = {
  label: string;
  description: string;
  /** The posting page a new topic goes on. */
  url: string;
  division: DivisionKey;
};

export const DISCUSSION_BOARDS: Record<DiscussionBoardKey, DiscussionBoard> = {
  ftdDiscussionBoard: {
    label: "FTD Discussion Board",
    description: "Open a topic in the Field Training discussion board.",
    url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=1882",
    division: "ftd",
  },
  ftdInstructorBoard: {
    label: "FTD Instructor Discussion Board",
    description: "Open a topic only the instructors' board carries.",
    url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=2000",
    division: "ftd",
  },
  ftdCommandBoard: {
    label: "Command Area Discussion Board",
    description: "Open a topic in the FTD command area.",
    url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=1928",
    division: "ftd",
  },
  redDiscussionBoard: {
    label: "RED Discussion Board",
    description: "Open a topic in the RED discussion board.",
    url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=1892",
    division: "red",
  },
  blsDiscussionBoard: {
    label: "BLS Discussion Board",
    description: "Open a topic in the BLS discussion board.",
    url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=1889",
    division: "bls",
  },
  blsSeniorInstructorBoard: {
    label: "Senior Instructor Discussion Board",
    description: "Open a topic in the senior instructors' board.",
    url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=3819",
    division: "bls",
  },
};
