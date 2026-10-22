"use client";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  History,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmployeeStatsSourceRow } from "@/components/employee-stats/fetchEmployeeStats";
import {
  EMPLOYEE_STATS_SHEET_URL,
  manualSessionCount,
  reportedSessionCount,
  totalSessionCount,
} from "@/components/employee-stats/lib/employee-stats-sheet";
import { cn } from "@/lib/utils";

export interface ReinstateFtoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exFtos: EmployeeStatsSourceRow[];
  onReinstated?: (reinstatedName: string) => void;
}

export function ReinstateFtoDialog({
  open,
  onOpenChange,
  exFtos,
  onReinstated,
}: ReinstateFtoDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [selectedRow, setSelectedRow] =
    useState<EmployeeStatsSourceRow | null>(null);
  const [filterText, setFilterText] = useState("");

  // Reset transient state when the dialog opens / closes so a stale
  // selection doesn't carry across sessions.
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedRow(null);
      setFilterText("");
    }
    onOpenChange(next);
  };

  const visibleExFtos = useMemo(() => {
    const needle = filterText.trim().toLowerCase();
    if (!needle) return exFtos;
    return exFtos.filter((row) =>
      String(row["Names"] ?? "")
        .toLowerCase()
        .includes(needle),
    );
  }, [exFtos, filterText]);

  const selectedName = String(selectedRow?.["Names"] ?? "").trim();
  const selectedTotal = selectedRow ? totalSessionCount(selectedRow) : 0;
  const selectedManual = selectedRow ? manualSessionCount(selectedRow) : 0;
  const selectedReported = selectedRow
    ? reportedSessionCount(selectedRow)
    : 0;

  const handleSubmit = async () => {
    if (!selectedRow) {
      toast.error("Pick an ex-FTO to reinstate");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/employee-stats-row/reinstate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(selectedRow["Names"] ?? "").trim(),
        }),
      });
      const result = await res.json();

      if (result.success) {
        toast.success(
          `Reinstated "${String(selectedRow["Names"] ?? "").trim()}"`
        );
        const chosenName = String(selectedRow["Names"] ?? "").trim();
        setSelectedRow(null);
        setFilterText("");
        onOpenChange(false);
        onReinstated?.(chosenName);
      } else {
        toast.error(
          `Something went wrong: ${
            result.error ?? result.raw ?? JSON.stringify(result)
          }`
        );
      }
    } catch (err) {
      toast.error("Network error or Apps Script blocked");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-4 w-4" /> Reinstate FTO
            </DialogTitle>
            <DialogDescription>
              Pick an ex-FTO to move back above the Ex FTOs sentinel. Their
              full row (sessions / ribbons) is preserved.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-2.5 rounded-xl border border-amber-300/30 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-amber-700 dark:text-amber-300">
                  Check their sessions before reinstating
                </p>
                <p className="mt-1">
                  Old sessions are not in the FT Sessions form, so they are
                  added to the sheet by hand. Open the sheet and make sure
                  every session this FTO ran is counted.
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <a
                  href={EMPLOYEE_STATS_SHEET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink />
                  Open Employee Stats sheet
                </a>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reinstated-fto-filter" className="sr-only">
              Filter ex-FTOs
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reinstated-fto-filter"
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Search ex-FTOs…"
                maxLength={100}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              <span>
                {visibleExFtos.length} ex-FTO
                {visibleExFtos.length === 1 ? "" : "s"}
              </span>
              <span>Sessions</span>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-md border bg-muted/30">
              {visibleExFtos.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {exFtos.length === 0
                    ? "No ex-FTOs available."
                    : "No ex-FTOs match your search."}
                </div>
              ) : (
                <ul className="divide-y">
                  {visibleExFtos.map((row) => {
                    const name = String(row["Names"] ?? "").trim();
                    const sessions = totalSessionCount(row);
                    const isSelected =
                      selectedRow?.__csvIndex === row.__csvIndex;
                    return (
                      <li key={`${row.__csvIndex}-${name}`}>
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setSelectedRow(row)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
                            isSelected
                              ? "bg-primary/10"
                              : "hover:bg-muted/60",
                          )}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-full border",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border text-transparent",
                              )}
                            >
                              <Check className="size-3" />
                            </span>
                            <span className="truncate font-medium">
                              {name}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-baseline gap-1.5">
                            <span className="text-sm font-semibold tabular-nums">
                              {sessions.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              sessions
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {selectedRow ? (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Reinstating</span>
                <span className="font-medium">{selectedName}</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Total sessions</span>
                <span className="font-semibold tabular-nums">
                  {selectedTotal.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedManual.toLocaleString()} added by hand +{" "}
                {selectedReported.toLocaleString()} from FT Sessions reports.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select an ex-FTO to reinstate.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              loading={submitting}
              disabled={!selectedRow}
            >
              Reinstate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
