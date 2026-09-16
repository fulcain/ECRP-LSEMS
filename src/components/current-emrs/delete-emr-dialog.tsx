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

interface DeleteEMRDialogProps {
  row: TableDataType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setData: React.Dispatch<React.SetStateAction<TableDataType[]>>;
}

/**
 * Confirmation dialog for deleting an EMR row. Posts the row's EMR name to
 * /api/delete-emr, then refetches.
 */
export function DeleteEMRDialog({
  row,
  open,
  onOpenChange,
  setData,
}: DeleteEMRDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!row) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/delete-emr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emr: String(row["EMR"] ?? "") }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("EMR record deleted", { theme: "dark" });
        // Remove the row from local state immediately so the table
        // updates right away (the published CSV can be cached for minutes).
        setData((prev) =>
          prev.filter(
            (r) => String(r["EMR"] ?? "").trim().toLowerCase() !== String(row["EMR"] ?? "").trim().toLowerCase(),
          ),
        );
        onOpenChange(false);
      } else {
        toast.error(
          `Something went wrong: ${result.error ?? result.raw ?? JSON.stringify(result)}`,
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
            <DialogTitle>Delete EMR Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the record for{" "}
              <span className="font-semibold text-foreground">
                {String(row?.["EMR"] ?? "")}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

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
