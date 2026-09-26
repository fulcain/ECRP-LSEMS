"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EMRProfileLink } from "@/components/current-emrs/fetchCurrentEMRs";

type EmrNameSelectProps = {
  /** EMRs from the current-EMR sheet - the same list the paperwork searches. */
  emrs: EMRProfileLink[];
  /** The name picked from the list, or "" when the name was typed instead. */
  value: string;
  onValueChange: (value: string) => void;
  /** The typed name, for an EMR the sheet does not list. */
  manualValue: string;
  onManualChange: (value: string) => void;
  label?: string;
  manualPlaceholder?: string;
  /** Anything the caller shows under the fields, e.g. what the letter prints. */
  children?: React.ReactNode;
};

/**
 * The EMR picker both FTD cards name an EMR with: the sheet's list with a search
 * box, plus a typed fallback for someone it does not list. Picking from the list
 * clears the typed name and typing clears the pick, so whoever reads the field
 * only ever has one name to read.
 */
export function EmrNameSelect({
  emrs,
  value,
  onValueChange,
  manualValue,
  onManualChange,
  label = "EMR Name",
  manualPlaceholder = "Or type the name manually",
  children,
}: EmrNameSelectProps) {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Select
        value={value || undefined}
        onValueChange={(picked) => {
          onValueChange(picked);
          onManualChange("");
          setSearch("");
        }}
        onOpenChange={(open) => {
          if (!open) setSearch("");
        }}
      >
        <SelectTrigger className="cursor-pointer">
          <SelectValue placeholder="Select EMR" />
        </SelectTrigger>
        <SelectContent>
          {emrs.length === 0 ? (
            <div className="p-2 cursor-pointer">
              <Skeleton className="h-10 w-full rounded" />
            </div>
          ) : (
            <>
              <div
                className="p-2 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  placeholder="Search EMR..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mb-2"
                  autoFocus
                />
              </div>
              {emrs
                .filter((emr) =>
                  emr.EMR.toLowerCase().includes(search.toLowerCase()),
                )
                .map((emr, index) => (
                  <SelectItem key={`${emr.EMR}-${index}`} value={emr.EMR}>
                    {emr.EMR}
                  </SelectItem>
                ))}
            </>
          )}
        </SelectContent>
      </Select>
      <Input
        value={manualValue}
        onChange={(e) => {
          onManualChange(e.target.value);
          if (e.target.value) onValueChange("");
        }}
        placeholder={manualPlaceholder}
        className="text-xs"
      />
      {children}
    </div>
  );
}
