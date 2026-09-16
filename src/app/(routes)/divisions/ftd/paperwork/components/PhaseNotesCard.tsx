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
  paperworkConfig,
  PhaseKey,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/paperworkConfig";
import { resolveNormalNotes } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/registry";
import { NotesPanel } from "@/app/(routes)/divisions/ftd/paperwork/components/NotesPanel";

function isPaperworkPhaseKey(value: unknown): value is PhaseKey {
  return typeof value === "string" && value in paperworkConfig;
}

/** Reference panel for the active normal-form phase, with Guide/Script views. */
export function PhaseNotesCard() {
  const { currentPhase } = useSession();

  if (!isPaperworkPhaseKey(currentPhase)) return null;
  const phase: PhaseKey = currentPhase;
  const config = paperworkConfig[phase];
  const entry = resolveNormalNotes(phase);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          Phase Notes - {config.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {entry ? (
          <NotesPanel spoken={entry.Spoken} storageKey={phase}>
            <entry.Visual />
          </NotesPanel>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No reference notes available for this phase.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
