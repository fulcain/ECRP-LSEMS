"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableDataType } from "@/lib/types";

/**
 * Per-row callback hookup for the (optional, Command+ only) Actions
 * column. `onEdit` and `onDelete` are called with the full row,
 * mirroring the `CurrentEMRColumns` factory pattern. Pass
 * `onDelete` to surface a Delete menu item alongside Edit.
 */
export interface AllDataColumnOptions {
  onEdit: (row: TableDataType) => void;
  /** Optional - when provided, the dropdown shows a Delete item. */
  onDelete?: (row: TableDataType) => void;
  /** When true, the Actions column is appended; otherwise hidden. */
  canEdit: boolean;
  /** Complete All Data history grouped by instructor name. */
  sessionsByInstructor: ReadonlyMap<string, TableDataType[]>;
}

/**
 * Column defs for the "All Data" history table.
 *
 * Returns a factory rather than a module-level const so the trailing
 * Actions column can pull `onEdit`/`onDelete` from <AllDataTable>.
 * `canEdit` is the gate the server-rendered <AppPage> computes from
 * `hasSessionEditAccess(...)` - when false, the column is fully
 * omitted (no empty header / empty cells) instead of every row
 * being a non-functional button.
 */
export function createAllDataColumns(
  options: AllDataColumnOptions,
): ColumnDef<TableDataType>[] {
  const baseColumns: ColumnDef<TableDataType>[] = [
    {
      accessorKey: "Date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
          className="flex items-center"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.getValue("Date") as string;
        const dateB = rowB.getValue("Date") as string;

        const finishA = rowA.getValue("Time Finish") as string;
        const finishB = rowB.getValue("Time Finish") as string;

        const tsA = new Date(`${dateA} ${finishA}`).getTime();
        const tsB = new Date(`${dateB} ${finishB}`).getTime();

        return tsA - tsB;
      },
    },
    {
      accessorKey: "Your Name",
      header: "Instructor's Name",
      cell: ({ row }) => {
        const instructorName = String(row.original["Your Name"] ?? "").trim();
        if (!instructorName) return "—";

        const sessions = options.sessionsByInstructor.get(
          instructorName.toLowerCase(),
        ) ?? [];
        const visibleSessions = sessions.filter(
          (session) =>
            String(session["EMR's Name"] ?? "").trim() ||
            String(session["Session Conducted"] ?? "").trim(),
        );

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="link"
                className="h-auto p-0 text-left font-normal"
                aria-label={`View sessions conducted by ${instructorName}`}
              >
                {instructorName}
                <ChevronDown aria-hidden="true" className="ml-1 size-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="max-h-96 w-[min(24rem,calc(100vw-2rem))] overflow-y-auto p-0"
            >
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">{instructorName}</p>
                <p className="text-xs text-muted-foreground">
                  Sessions conducted
                </p>
              </div>
              {visibleSessions.length > 0 ? (
                <div className="divide-y divide-border">
                  {visibleSessions.map((session, index) => (
                    <div
                      key={`${String(session["EMR's Name"] ?? "")}-${index}`}
                      className="space-y-1 px-4 py-3"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        EMR&apos;s Name
                      </p>
                      <p className="text-sm font-medium">
                        {String(session["EMR's Name"] ?? "").trim() || "—"}
                      </p>
                      <p className="pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Session Conducted
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {String(session["Session Conducted"] ?? "").trim() ||
                          "—"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  No session records found.
                </p>
              )}
            </PopoverContent>
          </Popover>
        );
      },
    },
    {
      accessorKey: "EMR's Name",
      header: "EMR's Name",
    },
    {
      accessorKey: "Session Conducted",
      header: "Session Conducted",
    },
    {
      accessorKey: "Time Start",
      header: "Time Start ((UTC))",
    },
    {
      accessorKey: "Time Finish",
      header: "Time Finish ((UTC))",
    },
    {
      accessorKey: "Timestamp",
      header: "Timestamp",
    },
  ];

  if (!options.canEdit) return baseColumns;

  return [
    ...baseColumns,
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const rowData = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                title="Row actions"
              >
                <Pencil />
                <span className="sr-only">Row actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Row actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => options.onEdit(rowData)}>
                <Pencil /> Edit session
              </DropdownMenuItem>
              {options.onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => options.onDelete?.(rowData)}
                  >
                    <Trash2 /> Delete session
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
