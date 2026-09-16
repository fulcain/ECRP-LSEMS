"use client";

import {
  Bold,
  EmptyNotesState,
  Em,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/primitives";

export function ReinstatementCertFailedNotes() {
  return (
    <EmptyNotesState
      title="Reinstatement Certification Failed - reference notes"
      message=""
      tip={
        <>
          <Bold>Tip:</Bold> cross-reference the normal{" "}
          <Em>Certification</Em> notes for the failed-flow mechanics
          (minimum 2 mandatory ride-alongs, Head-of-Field-Training
          notification, FT Session Report honesty prompt).
        </>
      }
    />
  );
}
