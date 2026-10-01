import type { HandbookFormatKey } from "@/app/constants/divisions/ftd/handbook";
import type { PhaseKey } from "@/app/(routes)/divisions/ftd/paperwork/lib/paperworkConfig";
import type { ReinstatementPhaseKey } from "@/app/(routes)/divisions/ftd/paperwork/lib/reinstatementConfig";

/**
 * Which handbook section each phase's notes are built from, and where they go.
 *
 * Declared once because three things read it and they have to agree: the build
 * script that writes a guide from its section, the check that fails when a guide
 * has fallen behind one, and the reader who wants to know where a phase's text
 * comes from. A phase with no section here is a phase nobody can keep in step.
 */
export type PhaseNotePlacement = {
  /** The `id` of the `HANDBOOK_SECTIONS` entry the notes are read from. */
  section: string;
  /** The Guide component's file, from the repository root. */
  guide: string;
  /** The component the registry renders. */
  component: string;
};

const NOTES_DIR =
  "src/app/(routes)/divisions/ftd/paperwork/lib/phase-notes";

export const NORMAL_NOTE_PLACEMENTS: Record<PhaseKey, PhaseNotePlacement> = {
  introduction: {
    section: "introduction",
    guide: `${NOTES_DIR}/normal/introduction.tsx`,
    component: "IntroductionNotes"
  },
  phase1: {
    section: "phase-1",
    guide: `${NOTES_DIR}/normal/phase1.tsx`,
    component: "Phase1Notes"
  },
  phase2: {
    section: "phase-2",
    guide: `${NOTES_DIR}/normal/phase2.tsx`,
    component: "Phase2Notes"
  },
  phase3: {
    section: "phase-3",
    guide: `${NOTES_DIR}/normal/phase3.tsx`,
    component: "Phase3Notes"
  },
  preCert: {
    section: "pre-certification",
    guide: `${NOTES_DIR}/normal/preCert.tsx`,
    component: "PreCertNotes"
  },
  certPassed: {
    section: "certification",
    guide: `${NOTES_DIR}/normal/certPassed.tsx`,
    component: "CertPassedNotes"
  },
  certFailed: {
    section: "certification",
    guide: `${NOTES_DIR}/normal/certFailed.tsx`,
    component: "CertFailedNotes"
  },
  rideAlong: {
    section: "ride-along-paperwork",
    guide: `${NOTES_DIR}/normal/rideAlong.tsx`,
    component: "RideAlongNotes"
  },
};

export const REINSTATEMENT_NOTE_PLACEMENTS: Record<
  ReinstatementPhaseKey,
  PhaseNotePlacement
> = {
  reinstatementPhase1: {
    section: "reinstatement-phase-i",
    guide: `${NOTES_DIR}/reinstatement/reinstatementPhase1.tsx`,
    component: "ReinstatementPhase1Notes"
  },
  reinstatementPhase2: {
    section: "reinstatement-phase-ii",
    guide: `${NOTES_DIR}/reinstatement/reinstatementPhase2.tsx`,
    component: "ReinstatementPhase2Notes"
  },
  reinstatementCertPassed: {
    section: "reinstatement-certification",
    guide: `${NOTES_DIR}/reinstatement/reinstatementCertPassed.tsx`,
    component: "ReinstatementCertPassedNotes"
  },
  reinstatementCertFailed: {
    section: "reinstatement-certification",
    guide: `${NOTES_DIR}/reinstatement/reinstatementCertFailed.tsx`,
    component: "ReinstatementCertFailedNotes"
  },
  reinstatementRideAlong: {
    section: "ride-along-paperwork",
    guide: `${NOTES_DIR}/reinstatement/reinstatementRideAlong.tsx`,
    component: "ReinstatementRideAlongNotes"
  },
};

/** Every phase's placement, whichever format it belongs to. */
export function allPhaseNotePlacements(): PhaseNotePlacement[] {
  return [
    ...Object.values(NORMAL_NOTE_PLACEMENTS),
    ...Object.values(REINSTATEMENT_NOTE_PLACEMENTS),
  ];
}

/** The placements of one profile's own phases. */
export function phaseNotePlacementsForFormat(
  format: HandbookFormatKey,
): PhaseNotePlacement[] {
  return Object.values(
    format === "reinstatement"
      ? REINSTATEMENT_NOTE_PLACEMENTS
      : NORMAL_NOTE_PLACEMENTS,
  );
}

// An accepted update rebuilds this list rather than only the phases whose section
// the paste changed: "Update Regular FTP" is a statement that the Regular profile
// is now current, so every Regular phase is read again, and a Guide that was
// behind its section before the paste is not left behind after it. The list is
// the format's own, so one profile's update never names the other's phases - a
// Phase whose notes come out identical is not written, which is what keeps the
// second update in a row down to the phases that actually moved.
