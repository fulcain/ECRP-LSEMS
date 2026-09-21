"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Copy, UserRound, XCircle } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

import {
  FormType,
  useSession,
} from "@/app/(routes)/divisions/ftd/paperwork/components/SessionContext";

interface NextPhaseOption {
  /** Stable value used by the Select control. */
  value: string;
  /** Static label that is shown / copied when this option is selected. */
  label: string;
  /** Marker used at render-time to swap in the dynamic "Nx Mandatory" label. */
  dynamic?: "mandatory";
}

interface NextPhaseConfig {
  dropdownKey: string;
  /** All selectable titles. */
  options: NextPhaseOption[];
  /** current-phase → next-phase default. Values must exist in `options`. */
  nextPhaseMap: Record<string, string>;
}

const NORMAL_NEXT_PHASE: NextPhaseConfig = {
  dropdownKey: "ftd-next-phase-dropdown-normal",
  options: [
    { value: "phase1", label: "Pending Phase 1" },
    { value: "phase2", label: "Pending Phase 2" },
    { value: "phase2-mandatory", label: "Pending Phase 2 Mandatory Ride-Along" },
    { value: "phase3", label: "Pending Phase 3" },
    { value: "phase3-mandatory", label: "Pending Phase 3 Mandatory Ride-Along" },
    { value: "preCert", label: "Pending Pre-Certification" },
    { value: "certPassed", label: "Pending Certification" },
    {
      value: "pending-mandatory",
      label: "Pending Nx Mandatory Ride-Along",
      dynamic: "mandatory",
    },
  ],
  nextPhaseMap: {
    introduction: "phase1",
    phase1: "phase2",
    phase2: "phase3",
    phase3: "preCert",
    preCert: "certPassed",
    certPassed: "certPassed",
    certFailed: "certPassed",
    rideAlong: "phase1",
  },
};

const REINSTATEMENT_NEXT_PHASE: NextPhaseConfig = {
  dropdownKey: "ftd-next-phase-dropdown-reinstatement",
  options: [
    { value: "reinstatementPhase1", label: "Pending Phase 1" },
    { value: "reinstatementPhase2", label: "Pending Phase 2" },
    {
      value: "reinstatementPhase2-mandatory",
      label: "Pending Phase 2 Mandatory Ride-Along",
    },
    { value: "reinstatementCertPassed", label: "Pending Certification" },
    {
      value: "pending-mandatory",
      label: "Pending Nx Mandatory Ride-Along",
      dynamic: "mandatory",
    },
  ],
  nextPhaseMap: {
    reinstatementPhase1: "reinstatementPhase2",
    reinstatementPhase2: "reinstatementCertPassed",
    reinstatementCertPassed: "reinstatementCertPassed",
    reinstatementCertFailed: "reinstatementCertPassed",
    reinstatementRideAlong: "reinstatementPhase1",
  },
};

function getNextPhaseConfig(formType: FormType): NextPhaseConfig {
  return formType === "reinstatement"
    ? REINSTATEMENT_NEXT_PHASE
    : NORMAL_NEXT_PHASE;
}

/** Dropdown + clipboard helper for the next pending phase title. */
export function NextPhaseTitleCard() {
  const {
    formType,
    currentPhase,
    additionalMandatories,
    resolvedEMR,
    details,
    setDetails,
    emrList,
  } = useSession();
  const [phaseCopied, setPhaseCopied] = useState(false);
  const [emrSearch, setEmrSearch] = useState("");

  const config = getNextPhaseConfig(formType);

  const [nextPhaseDropdown, setNextPhaseDropdown] = useLocalStorage<string>(
    config.dropdownKey,
    config.options[0].value,
  );
  // Persisted value from the other form type may not exist in this form's options; fall back to the first valid one.
  const safeNextPhaseDropdown = config.options.some(
    (o) => o.value === nextPhaseDropdown,
  )
    ? nextPhaseDropdown
    : config.options[0].value;

  // Distinguishes "first mount" (preserve persisted selection) from "phase button clicked" (auto-advance).
  const lastSyncedPhaseRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentPhase) {
      lastSyncedPhaseRef.current = null;
      return;
    }
    if (lastSyncedPhaseRef.current === currentPhase) return;
    if (lastSyncedPhaseRef.current === null) {
      lastSyncedPhaseRef.current = currentPhase;
      return;
    }
    lastSyncedPhaseRef.current = currentPhase;
    const nextValue = config.nextPhaseMap[currentPhase] ?? currentPhase;
    const safeValue = config.options.some((o) => o.value === nextValue)
      ? nextValue
      : config.options[0].value;
    setNextPhaseDropdown(safeValue);
  }, [currentPhase, config, setNextPhaseDropdown]);

  const mandatoryCount = useMemo(() => {
    const n = parseInt(additionalMandatories, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [additionalMandatories]);

  const dynamicMandatoryLabel = useMemo(
    () =>
      mandatoryCount > 0
        ? `Pending ${mandatoryCount}x Mandatory Ride-Along`
        : "Pending Nx Mandatory",
    [mandatoryCount],
  );

  const selectedOption = config.options.find(
    (o) => o.value === safeNextPhaseDropdown,
  );
  const resolvedTitle =
    selectedOption?.dynamic === "mandatory"
      ? dynamicMandatoryLabel
      : selectedOption?.label || "";

  // Build the full title with brackets and the selected EMR name for easy
  // copy-pasting into the forum topic title field.
  const fullTitle = resolvedEMR
    ? `[${resolvedTitle}] ${resolvedEMR}`
    : `[${resolvedTitle}]`;

  const copyTitle = async () => {
    if (!resolvedTitle) return;
    await navigator.clipboard.writeText(fullTitle);
    setPhaseCopied(true);
    toast.success("Next phase title copied!", { theme: "dark" });
    setTimeout(() => setPhaseCopied(false), 2000);
  };

  const hasEMR = Boolean(resolvedEMR);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Next Phase Title
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Phase title dropdown + copy */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Title</Label>
            <div className="flex items-center gap-2">
              <Select
                value={safeNextPhaseDropdown}
                onValueChange={(v) => setNextPhaseDropdown(v)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.options.map((option) => (
                    <SelectItem
                      key={
                        option.dynamic === "mandatory"
                          ? `${option.value}-${mandatoryCount}`
                          : option.value
                      }
                      value={option.value}
                    >
                      {option.dynamic === "mandatory"
                        ? dynamicMandatoryLabel
                        : option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={copyTitle}
                className="shrink-0"
                disabled={!resolvedTitle}
              >
                <Copy className="h-4 w-4 mr-1" />
                {phaseCopied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Inline EMR selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <UserRound className="h-3 w-3" />
              EMR
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  value={details.emrName}
                  onValueChange={(v) => {
                    setDetails((prev) => ({
                      ...prev,
                      emrName: v,
                      emrNameManual: "",
                    }));
                    setEmrSearch("");
                  }}
                  onOpenChange={(open) => {
                    if (!open) setEmrSearch("");
                  }}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select EMR…" />
                  </SelectTrigger>
                  <SelectContent>
                    <div
                      className="p-2 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        placeholder="Search EMR…"
                        value={emrSearch}
                        onChange={(e) => setEmrSearch(e.target.value)}
                        className="mb-2"
                        autoFocus
                      />
                    </div>
                    {emrList
                      .filter((emr) =>
                        emr.EMR.toLowerCase().includes(
                          emrSearch.toLowerCase(),
                        ),
                      )
                      .map((emr, idx) => (
                        <SelectItem
                          key={`${emr.EMR}-${idx}`}
                          value={emr.EMR}
                        >
                          {emr.EMR}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {hasEMR && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setDetails((prev) => ({
                      ...prev,
                      emrName: "",
                      emrNameManual: "",
                    }))
                  }
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Clear EMR"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
            {/* Manual EMR entry - shown only when no EMR is selected via dropdown */}
            {!details.emrName && (
              <Input
                placeholder="Or type EMR name manually…"
                value={details.emrNameManual}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev,
                    emrNameManual: e.target.value,
                    emrName: "",
                  }))
                }
                className="bg-background text-xs"
              />
            )}
          </div>

          {/* Preview the full title that will be copied */}
          {resolvedTitle && (
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs">
              <span className="text-muted-foreground">Copies as: </span>
              <code className="text-foreground font-mono text-[11px]">
                {fullTitle}
              </code>
              {!hasEMR && (
                <span className="ml-2 text-amber-600 dark:text-amber-400">
                  (select an EMR above to include their name)
                </span>
              )}
            </div>
          )}

          {safeNextPhaseDropdown === "pending-mandatory" && (
            <div className="text-xs rounded-md border border-amber-300/20 dark:border-amber-500/20 bg-amber-500/5 px-3 py-2 text-amber-700 dark:text-amber-300">
              Go to the Next Session Focus Section and choose amount of
              Additional Mandatories they have to do.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
