"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
