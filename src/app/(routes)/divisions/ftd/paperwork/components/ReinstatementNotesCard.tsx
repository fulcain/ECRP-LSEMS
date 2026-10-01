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

function isReinstatementPhaseKey(
  value: unknown,
): value is ReinstatementPhaseKey {
  return typeof value === "string" && value in reinstatementConfig;
}

/** Reference panel for the active reinstatement-form phase. */
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
          <div className="max-h-[600px] overflow-y-auto rounded-md border border-border/40 bg-muted/30 px-4 py-4 transition-colors">
            <entry.Visual />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No reference notes available for this reinstatement phase.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
