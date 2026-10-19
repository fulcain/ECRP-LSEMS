"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EmployeeStatsSourceRow } from "@/components/employee-stats/fetchEmployeeStats";

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

  const visibleExFtos = exFtos.filter((row) =>
    String(row["Names"] ?? "")
      .toLowerCase()
      .includes(filterText.toLowerCase()),
  );

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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-4 w-4" /> Reinstate FTO
            </DialogTitle>
            <DialogDescription>
              Pick an ex-FTO to reinstate. Their
              full row (sessions / ribbons) is preserved.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reinstated-fto-filter">Filter ex-FTOs</Label>
              <input
                id="reinstated-fto-filter"
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Type to filter…"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="rounded-md border bg-muted/30 max-h-72 overflow-y-auto">
              {visibleExFtos.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  {exFtos.length === 0
                    ? "No ex-FTOs available."
                    : "No ex-FTOs match your filter."}
                </div>
              ) : (
                <ul className="divide-y">
                  {visibleExFtos.map((row) => {
                    const isSelected =
                      selectedRow?.__csvIndex === row.__csvIndex;
                    return (
                      <li
                        key={`${row.__csvIndex}-${row["Names"]}`}
                        className={`flex items-center justify-between gap-3 px-3 py-2 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary/15 border-l-2 border-primary"
                            : "hover:bg-muted/60"
                        }`}
                        onClick={() => setSelectedRow(row)}
                      >
                        <span className="font-medium">
                          {String(row["Names"] ?? "").trim()}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

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
