"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  History,
  UserPlus,
  Trash2,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

import {
  fetchFullEmployeeStats,
  toSheetRow,
  EmployeeStatsSourceRow,
} from "@/components/employee-stats/fetchEmployeeStats";

import { FtoCreationCard } from "@/components/employee-stats/components/FtoCreationCard";
import { AddFtoDialog } from "@/components/employee-stats/components/AddFtoDialog";
import { ReinstateFtoDialog } from "@/components/employee-stats/components/ReinstateFtoDialog";
import { EditEmployeeStatsRowDialog } from "@/components/employee-stats/components/EditEmployeeStatsRowDialog";
import { RemoveFtoDialog } from "@/components/employee-stats/components/RemoveFtoDialog";

type SortDir = "asc" | "desc";

/**
 * Parse the published-CSV "Total Sessions" cell into a sortable number.
 * Sheet values arrive as strings and occasionally as comma-grouped
 * numbers (e.g. "1,234"), so we strip thousands-separators before
 * `Number(...)`. Anything non-finite (empty / NaN sentinel) sorts as 0.
 */
function getSessionCount(row: EmployeeStatsSourceRow): number {
  const raw = row["_1"];
  if (raw == null || raw === "") return 0;
  const n = Number(String(raw).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}


export function FtoManagementCard() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [active, setActive] = useState<EmployeeStatsSourceRow[]>([]);
  const [exFtos, setExFtos] = useState<EmployeeStatsSourceRow[]>([]);

  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const toggleSort = () =>
    setSortDir(sortDir === "desc" ? "asc" : "desc");

  const [addOpen, setAddOpen] = useState(false);
  const [reinstateOpen, setReinstateOpen] = useState(false);

  // Edit / Remove dialog state - scoped to the active-FTO list since
  // both actions are only meaningful for active rows.
  const [editRow, setEditRow] = useState<EmployeeStatsSourceRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [removeRow, setRemoveRow] = useState<EmployeeStatsSourceRow | null>(
    null,
  );
  const [removeOpen, setRemoveOpen] = useState(false);

  const resync = useCallback(async () => {
    setLoading(true);
    try {
      const { active, exFtos } = await fetchFullEmployeeStats();
      setActive(active);
      setExFtos(exFtos);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    resync();
  }, [resync]);

  const handleEdit = (row: EmployeeStatsSourceRow) => {
    setEditRow(row);
    setEditOpen(true);
  };

  const handleRemove = (row: EmployeeStatsSourceRow) => {
    setRemoveRow(row);
    setRemoveOpen(true);
  };

  // `fetchFullEmployeeStats` already returns only `kind === "active"`
  // rows in `active`, so no further kind filter is needed.
  const filtered = useMemo(() => {
    const matched = active.filter((r) =>
      String(r["Names"] ?? "")
        .toLowerCase()
        .includes(filter.toLowerCase()),
    );

    return [...matched].sort(
      (a: EmployeeStatsSourceRow, b: EmployeeStatsSourceRow) => {
        const diff =
          sortDir === "desc"
            ? getSessionCount(b) - getSessionCount(a)
            : getSessionCount(a) - getSessionCount(b);
        return diff !== 0 ? diff : a.index - b.index;
      },
    );
  }, [active, filter, sortDir]);

  return (
    <div className="space-y-6">
      {/* ── Section 1: FTO Creation (BBCode) ── */}
      <FtoCreationCard onRefresh={resync} />

      {/* ── Section 2: Employee Stats management ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            Employee Stats - Roster Management
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg border border-border/40 bg-surface-hover/30 p-3 flex flex-wrap gap-2 justify-center md:justify-start">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setAddOpen(true)}
              className="px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add FTO
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setReinstateOpen(true)}
              className="px-6"
              disabled={exFtos.length === 0}
            >
              <History className="h-4 w-4 mr-2" />
              Reinstate FTO
              {exFtos.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({exFtos.length})
                </span>
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Input
                placeholder="Filter active FTOs…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-full sm:max-w-sm"
                disabled={loading}
              />
            </div>

              {loading ? (
                <Skeleton className="h-72 w-full rounded-b" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="w-16"
                        title="Display position (1 = first row in the visible, sorted list)"
                      >
                        #
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center w-24">
                        {/* Toolbar-style sort button: nested <button>
                            so the sort affordance is keyboard-operable
                            (Tab focus + Enter/Space activation) and
                            announced as a button by screen readers,
                            instead of a clickable <th> which would be
                            invisible to keyboard / SR users. */}
                        <button
                          type="button"
                          onClick={toggleSort}
                          aria-label={
                            sortDir === "desc"
                              ? "Sorted by sessions descending. Click to sort ascending."
                              : "Sorted by sessions ascending. Click to sort descending."
                          }
                          className="inline-flex w-full items-center justify-center gap-1 cursor-pointer hover:text-foreground/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        >
                          Sessions
                          {sortDir === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUp className="h-3 w-3" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-center w-20">
                        <span title="15 Session Ribbons">15</span>
                      </TableHead>
                      <TableHead className="text-center w-20">
                        <span title="40 Session Ribbon">40</span>
                      </TableHead>
                      <TableHead className="text-center w-20">
                        <span title="100 Session Ribbons">100</span>
                      </TableHead>
                      <TableHead className="text-center w-20">
                        <span title="165 Session Ribbons">165</span>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="h-24 text-center text-sm text-muted-foreground"
                        >
                          {active.length === 0
                            ? "No active FTOs found."
                            : "No FTOs match your filter."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((row, i) => {
                        // Ribbon state - read from the same keys the
                        // read-only EmployeeStatsTable uses (_3.._6,
                        // per mapEmployeeData in columns.tsx).
                        const r15 = String(row["_3"] ?? "") === "TRUE";
                        const r40 = String(row["_4"] ?? "") === "TRUE";
                        const r100 = String(row["_5"] ?? "") === "TRUE";
                        const r165 = String(row["_6"] ?? "") === "TRUE";
                        const sessions = getSessionCount(row);
                        return (
                          <TableRow
                            key={`${row.__csvIndex}-${row["Names"]}`}
                          >
  
                            <TableCell className="font-mono text-muted-foreground">
                              {i + 1}
                            </TableCell>
                            <TableCell>
                              {String(row["Names"] ?? "").trim() || "-"}
                            </TableCell>
                            <TableCell className="text-center tabular-nums font-medium">
                              {sessions.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={r15}
                                disabled
                                aria-label="15 Session Ribbons"
                                title={
                                  r15
                                    ? "15 Session Ribbons: Earned"
                                    : "15 Session Ribbons: Not earned"
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={r40}
                                disabled
                                aria-label="40 Session Ribbon"
                                title={
                                  r40
                                    ? "40 Session Ribbon: Earned"
                                    : "40 Session Ribbon: Not earned"
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={r100}
                                disabled
                                aria-label="100 Session Ribbons"
                                title={
                                  r100
                                    ? "100 Session Ribbons: Earned"
                                    : "100 Session Ribbons: Not earned"
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={r165}
                                disabled
                                aria-label="165 Session Ribbons"
                                title={
                                  r165
                                    ? "165 Session Ribbons: Earned"
                                    : "165 Session Ribbons: Not earned"
                                }
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Edit Name & Ribbons"
                                  onClick={() => handleEdit(row)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Remove FTO (moves below the Ex FTOs sentinel)"
                                  onClick={() => handleRemove(row)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
          </div>
        </CardContent>
      </Card>

      <AddFtoDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={(name) => {
          setActive((prev) => [
            ...prev,
            {
              "Names": name,
              "_1": "0",
              "_2": "",
              "_3": "FALSE",
              "_4": "FALSE",
              "_5": "FALSE",
              "_6": "FALSE",
              __csvIndex: Number.NaN,
              index: prev.length + 1,
              kind: "active",
            } as EmployeeStatsSourceRow,
          ]);
        }}
      />
      <ReinstateFtoDialog
        open={reinstateOpen}
        onOpenChange={setReinstateOpen}
        exFtos={exFtos}
        onReinstated={(name) => {
          const trimmed = name.trim().toLowerCase();
          const sourceRow = exFtos.find(
            (r) =>
              String(r["Names"] ?? "").trim().toLowerCase() === trimmed,
          );
          if (!sourceRow) return;
          setExFtos((prev) =>
            prev.filter(
              (r) =>
                String(r["Names"] ?? "").trim().toLowerCase() !== trimmed,
            ),
          );
          setActive((prev) => [
            ...prev,
            {
              ...sourceRow,
              kind: "active",
              index: prev.length + 1,
            },
          ]);
        }}
      />
      <EditEmployeeStatsRowDialog
        row={editRow}
        originalSheetRow={editRow ? toSheetRow(editRow) : null}
        open={editOpen}
        onOpenChange={setEditOpen}
        onEdited={(newName, r15, r40, r100, r165) => {
          setActive((prev) =>
            prev.map((r) =>
              r.__csvIndex === editRow?.__csvIndex
                ? {
                    ...r,
                    "Names": newName,
                    "_3": r15 ? "TRUE" : "FALSE",
                    "_4": r40 ? "TRUE" : "FALSE",
                    "_5": r100 ? "TRUE" : "FALSE",
                    "_6": r165 ? "TRUE" : "FALSE",
                  }
                : r,
            ),
          );
        }}
      />
      <RemoveFtoDialog
        row={removeRow}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        onRemoved={(name) => {
          const trimmed = name.trim().toLowerCase();
          setActive((prev) =>
            prev.filter(
              (r) =>
                String(r["Names"] ?? "").trim().toLowerCase() !== trimmed,
            ),
          );
          if (removeRow) {
            setExFtos((prev) => [
              ...prev,
              {
                ...removeRow,
                kind: "exFto",
                index: prev.length + 1,
              },
            ]);
          }
        }}
      />
    </div>
  );
}
