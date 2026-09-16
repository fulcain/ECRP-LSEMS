"use client";

import * as React from "react";
import type { PhaseKey } from "@/app/(routes)/divisions/ftd/paperwork/lib/paperworkConfig";
import type { ReinstatementPhaseKey } from "@/app/(routes)/divisions/ftd/paperwork/lib/reinstatementConfig";

import { IntroductionNotes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/introduction";
import { Phase1Notes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/phase1";
import { Phase2Notes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/phase2";
import { Phase3Notes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/phase3";
import { PreCertNotes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/preCert";
import { CertPassedNotes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/certPassed";
import { CertFailedNotes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/certFailed";
import { RideAlongNotes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/rideAlong";

import { ReinstatementPhase1Notes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/reinstatementPhase1";
import { ReinstatementPhase2Notes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/reinstatementPhase2";
import { ReinstatementCertPassedNotes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/reinstatementCertPassed";
import { ReinstatementCertFailedNotes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/reinstatementCertFailed";
import { ReinstatementRideAlongNotes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/reinstatement/reinstatementRideAlong";

import { INTRODUCTION_SPOKEN } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/spoken/introduction";
import { PHASE1_SPOKEN } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/spoken/phase1";
import { PHASE2_SPOKEN } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/spoken/phase2";
import { PHASE3_SPOKEN } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/spoken/phase3";
import { PRECERT_SPOKEN } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/spoken/preCert";
import { CERT_PASSED_SPOKEN } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/spoken/certPassed";
import { CERT_FAILED_SPOKEN } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/spoken/certFailed";
import { RIDE_ALONG_SPOKEN } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/spoken/rideAlong";

import { REINSTATEMENT_PHASE1_SPOKEN } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/spoken/reinstatementPhase1";
import { REINSTATEMENT_PHASE2_SPOKEN } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/spoken/reinstatementPhase2";
import { REINSTATEMENT_CERT_PASSED_SPOKEN } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/spoken/reinstatementCertPassed";
import { REINSTATEMENT_CERT_FAILED_SPOKEN } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/spoken/reinstatementCertFailed";
import { REINSTATEMENT_RIDE_ALONG_SPOKEN } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/spoken/reinstatementRideAlong";

/**
 * A phase note has two always-available views: `Visual` (the original
 * formatted reference) and `Spoken` (a paste-friendly, first-person script).
 */
export interface PhaseNoteEntry {
  Visual: React.ComponentType;
  Spoken: string;
}

export const NORMAL_NOTES: Record<PhaseKey, PhaseNoteEntry> = {
  introduction: { Visual: IntroductionNotes, Spoken: INTRODUCTION_SPOKEN },
  phase1: { Visual: Phase1Notes, Spoken: PHASE1_SPOKEN },
  phase2: { Visual: Phase2Notes, Spoken: PHASE2_SPOKEN },
  phase3: { Visual: Phase3Notes, Spoken: PHASE3_SPOKEN },
  preCert: { Visual: PreCertNotes, Spoken: PRECERT_SPOKEN },
  certPassed: { Visual: CertPassedNotes, Spoken: CERT_PASSED_SPOKEN },
  certFailed: { Visual: CertFailedNotes, Spoken: CERT_FAILED_SPOKEN },
  rideAlong: { Visual: RideAlongNotes, Spoken: RIDE_ALONG_SPOKEN },
};

export const REINSTATEMENT_NOTES: Record<ReinstatementPhaseKey, PhaseNoteEntry> = {
  reinstatementPhase1: {
    Visual: ReinstatementPhase1Notes,
    Spoken: REINSTATEMENT_PHASE1_SPOKEN,
  },
  reinstatementPhase2: {
    Visual: ReinstatementPhase2Notes,
    Spoken: REINSTATEMENT_PHASE2_SPOKEN,
  },
  reinstatementCertPassed: {
    Visual: ReinstatementCertPassedNotes,
    Spoken: REINSTATEMENT_CERT_PASSED_SPOKEN,
  },
  reinstatementCertFailed: {
    Visual: ReinstatementCertFailedNotes,
    Spoken: REINSTATEMENT_CERT_FAILED_SPOKEN,
  },
  reinstatementRideAlong: {
    Visual: ReinstatementRideAlongNotes,
    Spoken: REINSTATEMENT_RIDE_ALONG_SPOKEN,
  },
};

export function resolveNormalNotes(
  key: string | null | undefined,
): PhaseNoteEntry | undefined {
  if (!key) return undefined;
  return (NORMAL_NOTES as Record<string, PhaseNoteEntry | undefined>)[key];
}

export function resolveReinstatementNotes(
  key: string | null | undefined,
): PhaseNoteEntry | undefined {
  if (!key) return undefined;
  return (REINSTATEMENT_NOTES as Record<string, PhaseNoteEntry | undefined>)[
    key
  ];
}
