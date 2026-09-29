"use client";

import * as React from "react";
import type { HandbookFormatKey } from "@/app/constants/divisions/ftd/handbook";
import { handbookSectionText, spokenFromBbcode, handbookSpoiler } from "@/lib/handbook-notes";
import type { PhaseKey } from "@/app/(routes)/divisions/ftd/paperwork/lib/paperworkConfig";
import type { ReinstatementPhaseKey } from "@/app/(routes)/divisions/ftd/paperwork/lib/reinstatementConfig";

import { HandbookGuide } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/handbook-guide";
import { PHASE_EXTRAS } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/extras";

/**
 * A phase note has two always-available views: `Visual` (the handbook section
 * rendered) and `Spoken` (that same section as paste-friendly lines).
 */
export interface PhaseNoteEntry {
  Visual: React.ComponentType;
  Spoken: string;
}

/**
 * Which handbook section each phase of the paperwork is about.
 *
 * This is the whole mapping now. Everything a trainer reads comes from the
 * section named here, so a phase and the profile can no longer say different
 * things - and there is no second copy to forget to update.
 *
 * Two pairs share a section on purpose: a passed and a failed certification are
 * the same session with a different outcome, and the profile keeps both sets of
 * paperwork in the one Certification section.
 */
const NORMAL_SECTION: Record<
  PhaseKey,
  { format: HandbookFormatKey; section: string; spoiler?: string }
> = {
  introduction: { format: "regular", section: "introduction" },
  phase1: { format: "regular", section: "phase-1" },
  phase2: { format: "regular", section: "phase-2" },
  phase3: { format: "regular", section: "phase-3" },
  preCert: { format: "regular", section: "pre-certification" },
  certPassed: { format: "regular", section: "certification" },
  certFailed: { format: "regular", section: "certification" },
  rideAlong: { format: "regular", section: "ride-along-paperwork" },
};

const REINSTATEMENT_SECTION: Record<
  ReinstatementPhaseKey,
  { format: HandbookFormatKey; section: string; spoiler?: string }
> = {
  reinstatementPhase1: { format: "reinstatement", section: "reinstatement-phase-i" },
  reinstatementPhase2: { format: "reinstatement", section: "reinstatement-phase-ii" },
  reinstatementCertPassed: {
    format: "reinstatement",
    section: "reinstatement-certification",
  },
  reinstatementCertFailed: {
    format: "reinstatement",
    section: "reinstatement-certification",
  },
  // The reinstatee ride-along paperwork is a spoiler inside the certification
  // section, and showing a ride-along trainer the whole certification would be
  // the wrong page - so this one is read out of it.
  reinstatementRideAlong: {
    format: "reinstatement",
    section: "reinstatement-certification",
    spoiler: "Reinstatee Ride-Along",
  },
};

function entryFor(
  key: string,
  where: { format: HandbookFormatKey; section: string; spoiler?: string },
): PhaseNoteEntry | undefined {
  const whole = handbookSectionText(where.format, where.section);
  if (whole === null) return undefined;
  const text = where.spoiler ? handbookSpoiler(whole, where.spoiler) : whole;
  if (text === null) return undefined;

  const extras = (PHASE_EXTRAS as Record<string, React.ReactNode>)[key];
  const Visual = () => (
    <HandbookGuide
      bbcode={text}
      section={where.spoiler ? `${where.section} › ${where.spoiler}` : where.section}
      extras={extras}
    />
  );
  Visual.displayName = `${key}Guide`;
  return { Visual, Spoken: spokenFromBbcode(text) };
}

/** Every normal phase, built from the handbook as it stands. */
export const NORMAL_NOTES: Record<PhaseKey, PhaseNoteEntry | undefined> =
  Object.fromEntries(
    Object.entries(NORMAL_SECTION).map(([key, where]) => [key, entryFor(key, where)]),
  ) as Record<PhaseKey, PhaseNoteEntry | undefined>;

/** Every reinstatement phase, built the same way. */
export const REINSTATEMENT_NOTES: Record<
  ReinstatementPhaseKey,
  PhaseNoteEntry | undefined
> = Object.fromEntries(
  Object.entries(REINSTATEMENT_SECTION).map(([key, where]) => [
    key,
    entryFor(key, where),
  ]),
) as Record<ReinstatementPhaseKey, PhaseNoteEntry | undefined>;

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
  return (REINSTATEMENT_NOTES as Record<string, PhaseNoteEntry | undefined>)[key];
}
