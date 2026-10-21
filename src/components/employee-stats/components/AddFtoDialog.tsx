"use client";

import { useState } from "react";
import { toast } from "react-toastify";
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
import { FieldError } from "@/components/ui/field-error";
import {
  INPUT_LIMITS,
  validateName,
  validationMessage,
} from "@/lib/validation";

export interface AddFtoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful add so the parent can re-sync fresh row IDs. */
  onAdded?: (insertedName: string) => void;
}

export function AddFtoDialog({ open, onOpenChange, onAdded }: AddFtoDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();

  const canSubmit = !validationMessage(validateName(name, "FTO name"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameError = validationMessage(validateName(name, "FTO name"));
    if (nameError) {
      setError(nameError);
      toast.error(nameError);
      return;
    }
    setError(undefined);
    const trimmed = name.trim();

    setSubmitting(true);
    try {
      const res = await fetch("/api/employee-stats-row/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const result = await res.json();

      if (result.success) {
        toast.success(`FTO "${trimmed}" added.`);
        setName("");
        onOpenChange(false);
        onAdded?.(trimmed);
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
            <DialogTitle>Add FTO</DialogTitle>
            <DialogDescription>
              Adds a new FTO.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-fto-name">FTO Name</Label>
              <Input
                id="add-fto-name"
                placeholder="Fname Lname"
                value={name}
                maxLength={INPUT_LIMITS.name}
                aria-invalid={Boolean(error) || undefined}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(undefined);
                }}
                autoFocus
              />
              <FieldError message={error} />
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
              <Button type="submit" loading={submitting} disabled={!canSubmit}>
                Add FTO
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
