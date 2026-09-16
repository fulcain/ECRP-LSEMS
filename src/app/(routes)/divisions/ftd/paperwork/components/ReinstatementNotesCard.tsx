"use client";

import { BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/app/(routes)/divisions/ftd/paperwork/components/SessionContext";
import {
  reinstatementConfig,
  ReinstatementPhaseKey,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/reinstatementConfig";
import { resolveReinstatementNotes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/registry";
import { NotesPanel } from "@/app/(routes)/divisions/ftd/paperwork/components/NotesPanel";

function isReinstatementPhaseKey(
  value: unknown,
): value is ReinstatementPhaseKey {
  return typeof value === "string" && value in reinstatementConfig;
}

/** Reference panel for the active reinstatement-form phase, with Guide/Script views. */
export function ReinstatementNotesCard() {
  const { currentPhase } = useSession();

  if (!isReinstatementPhaseKey(currentPhase)) return null;
  const phase: ReinstatementPhaseKey = currentPhase;
  const config = reinstatementConfig[phase];
  const entry = resolveReinstatementNotes(phase);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          Reinstatement Notes - {config.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {entry ? (
          <NotesPanel spoken={entry.Spoken} storageKey={phase}>
            <entry.Visual />
          </NotesPanel>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No reference notes available for this reinstatement phase.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
