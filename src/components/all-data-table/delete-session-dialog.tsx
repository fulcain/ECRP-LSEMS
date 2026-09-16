"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
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

interface DeleteSessionDialogProps {
  row: TableDataType | null;
  /**
   * 1-based sheet row number, same provenance as the edit dialog
   * (computed by <AllDataTable> from the CSV index injected by
   * fetchAllData).
   */
  originalRowNumber: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setData: React.Dispatch<React.SetStateAction<TableDataType[]>>;
}

/**
 * Confirmation dialog that deletes a single FT session row.
 *
 * Uses the same rowNumber-based match strategy as the edit dialog;
 * one body field (`originalRowNumber`) is enough. `originalTimestamp`
 * is sent as an optional sanity check the Apps Script runs before
 * `sheet.deleteRow(...)`.
 *
 * On success we remove the row from local state by Timestamp
 * equality. Note: deleting row N from the live sheet shifts all
 * rows below it up by one, so the next edit/delete on a different
 * row should re-fetch the table to keep `__csvIndex + 2`
 * consistent with the live sheet. (See followup.)
 */
export function DeleteSessionDialog({
  row,
  originalRowNumber,
  open,
  onOpenChange,
  setData,
}: DeleteSessionDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!row) return;

    if (originalRowNumber == null) {
      toast.error(
        "Missing sheet row identifier - reload the table so the CSV index re-syncs.",
        { theme: "dark" },
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/delete-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Primary row identifier - same logic as the edit flow.
          originalRowNumber: String(originalRowNumber),
          // Optional sanity check.
          originalTimestamp: String(row["Timestamp"] ?? ""),
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("FT session deleted", { theme: "dark" });
        // Remove from local state by Timestamp equality. The row's
        // `__csvIndex` is irrelevant after this - it won't be sent
        // again because the row no longer renders in the table.
        setData((prev) =>
          prev.filter(
            (r) =>
              String(r["Timestamp"] ?? "") !== String(row["Timestamp"] ?? ""),
          ),
        );
        onOpenChange(false);
      } else {
        toast.error(
          `Something went wrong: ${result.error ?? result.raw ?? result.detail ?? JSON.stringify(result)}`,
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
            <DialogTitle>Delete FT Session</DialogTitle>
            <DialogDescription>
              This will permanently remove the row from the FT Sessions
              sheet. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 text-sm rounded-md border bg-muted/40 p-3">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Sheet row</span>
              <span className="font-mono">
                {originalRowNumber != null ? originalRowNumber : "-"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Filed at</span>
              <span>{String(row?.["Timestamp"] ?? "-")}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Instructor</span>
              <span className="font-medium">
                {String(row?.["Your Name"] ?? "-")}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Date</span>
              <span>{String(row?.["Date"] ?? "-")}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">EMR</span>
              <span>{String(row?.["EMR's Name"] ?? "-")}</span>
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
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
