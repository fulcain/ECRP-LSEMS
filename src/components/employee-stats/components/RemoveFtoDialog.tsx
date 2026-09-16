"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableDataType } from "@/lib/types";

export interface RemoveFtoDialogProps {
  row: TableDataType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful remove so the parent can re-sync fresh row data. */
  onRemoved?: (removedName: string) => void;
}

export function RemoveFtoDialog({
  row,
  open,
  onOpenChange,
  onRemoved,
}: RemoveFtoDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const name = String(row?.["Names"] ?? "").trim();

  const handleConfirm = async () => {
    if (!row || !name) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/employee-stats-row/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await res.json();

      if (result.success) {
        toast.success(`Removed "${name}" to Ex FTOs.`, { theme: "dark" });
        onOpenChange(false);
        onRemoved?.(name);
      } else {
        toast.error(
          `Something went wrong: ${
            result.error ?? result.raw ?? JSON.stringify(result)
          }`,
          { theme: "dark" },
        );
      }
    } catch (err) {
      toast.error("Network error or Apps Script blocked", { theme: "dark" });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              Remove FTO
            </DialogTitle>
            <DialogDescription>
              Moves the FTO below the{" "}
              <span className="font-mono">&quot;Ex FTOs&quot;</span> sentinel.
              Their full row (sessions / ribbons) is preserved. You can
              reinstate them later from the Reinstate FTO dialog.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 text-sm rounded-md border bg-muted/40 p-3">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">FTO</span>
              <span className="font-medium">{name || "-"}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={submitting || !name}
            >
              {submitting ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
