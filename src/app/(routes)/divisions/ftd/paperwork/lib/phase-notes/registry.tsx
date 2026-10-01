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



/**
 * The Guide a phase renders, built from the handbook section it is drawn from.
 */
export interface PhaseNoteEntry {
  Visual: React.ComponentType;
}

export const NORMAL_NOTES: Record<PhaseKey, PhaseNoteEntry> = {
  introduction: { Visual: IntroductionNotes },
  phase1: { Visual: Phase1Notes },
  phase2: { Visual: Phase2Notes },
  phase3: { Visual: Phase3Notes },
  preCert: { Visual: PreCertNotes },
  certPassed: { Visual: CertPassedNotes },
  certFailed: { Visual: CertFailedNotes },
  rideAlong: { Visual: RideAlongNotes },
};

export const REINSTATEMENT_NOTES: Record<ReinstatementPhaseKey, PhaseNoteEntry> = {
  reinstatementPhase1: {
    Visual: ReinstatementPhase1Notes,
  },
  reinstatementPhase2: {
    Visual: ReinstatementPhase2Notes,
  },
  reinstatementCertPassed: {
    Visual: ReinstatementCertPassedNotes,
  },
  reinstatementCertFailed: {
    Visual: ReinstatementCertFailedNotes,
  },
  reinstatementRideAlong: {
    Visual: ReinstatementRideAlongNotes,
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
