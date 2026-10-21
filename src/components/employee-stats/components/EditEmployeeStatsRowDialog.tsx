"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { TableDataType } from "@/lib/types";
import { FieldError } from "@/components/ui/field-error";
import {
  INPUT_LIMITS,
  validateName,
  validationMessage,
} from "@/lib/validation";

export interface EditEmployeeStatsRowDialogProps {
  row: TableDataType | null;
  /** 1-based sheet row number. Apps Script locates the row positionally. */
  originalSheetRow: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful edit so the parent can patch the row in local
   *  state (optimistic update). The four ribbon booleans are passed so the
   *  parent doesn't need to refetch - important because the upstream
   *  Google Sheets published CSV can be ~5 min stale. */
  onEdited?: (
    newName: string,
    r15: boolean,
    r40: boolean,
    r100: boolean,
    r165: boolean,
  ) => void;
}


export function EditEmployeeStatsRowDialog({
  row,
  originalSheetRow,
  open,
  onOpenChange,
  onEdited,
}: EditEmployeeStatsRowDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [r15, setR15] = useState(false);
  const [r40, setR40] = useState(false);
  const [r100, setR100] = useState(false);
  const [r165, setR165] = useState(false);


  useEffect(() => {
    if (!open || !row) return;
    setName(String(row["Names"] ?? ""));
    setError(undefined);
    setR15(String(row["_3"] ?? "") === "TRUE");
    setR40(String(row["_4"] ?? "") === "TRUE");
    setR100(String(row["_5"] ?? "") === "TRUE");
    setR165(String(row["_6"] ?? "") === "TRUE");
  }, [row, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!row) return;

    const nameError = validationMessage(validateName(name, "Name"));
    if (nameError) {
      setError(nameError);
      toast.error(nameError);
      return;
    }
    setError(undefined);
    const trimmed = name.trim();

    if (originalSheetRow == null) {
      toast.error(
        "Missing sheet row identifier - reload the page so the row index re-syncs."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/employee-stats-row/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalRowNumber: String(originalSheetRow),
          originalName: String(row["Names"] ?? "").trim(),
          name: trimmed,
          r15,
          r40,
          r100,
          r165,
        }),
      });
      const result = await res.json();

      if (result.success) {
        toast.success(`Saved "${trimmed}".`);
        onOpenChange(false);
        onEdited?.(trimmed, r15, r40, r100, r165);
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

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee Stats Row</DialogTitle>
            <DialogDescription>
              Update the Name and the four session-ribbon cells. Changes
              are saved atomically to the Employee Stats sheet.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-row-name">Name</Label>
              <Input
                id="edit-row-name"
                value={name}
                maxLength={INPUT_LIMITS.name}
                aria-invalid={Boolean(error) || undefined}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(undefined);
                }}
                placeholder="Fname Lname"
                autoFocus
              />
              <FieldError message={error} />
            </div>

            {/* Ribbon checkboxes - 15 / 40 / 100 / 165. The four
                columns on the sheet (E..H) hold the session-ribbon
                eligibility, written as "TRUE" / "FALSE" strings. */}
            <div className="grid grid-cols-1 gap-3 rounded-md sm:grid-cols-2 border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="r15"
                  checked={r15}
                  onCheckedChange={(c) => setR15(!!c)}
                  disabled={submitting}
                />
                <Label htmlFor="r15" className="cursor-pointer">
                  15 Session Ribbons
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="r40"
                  checked={r40}
                  onCheckedChange={(c) => setR40(!!c)}
                  disabled={submitting}
                />
                <Label htmlFor="r40" className="cursor-pointer">
                  40 Session Ribbon
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="r100"
                  checked={r100}
                  onCheckedChange={(c) => setR100(!!c)}
                  disabled={submitting}
                />
                <Label htmlFor="r100" className="cursor-pointer">
                  100 Session Ribbons
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="r165"
                  checked={r165}
                  onCheckedChange={(c) => setR165(!!c)}
                  disabled={submitting}
                />
                <Label htmlFor="r165" className="cursor-pointer">
                  165 Session Ribbons
                </Label>
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
              <Button type="submit" loading={submitting}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
