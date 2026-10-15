"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
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
import { ArrowUpDown } from "lucide-react";

const StatusBox = ({ value }: { value: string }) => {
  const isTrue = value === "TRUE";
  return (
    <div
      className={`w-4 h-4 rounded-full ${isTrue ? "bg-green-500" : "bg-red-500"}`}
      title={isTrue ? "Yes" : "No"}
    />
  );
};

export function mapEmployeeDataRaw(rawData: TableDataType[]): TableDataType[] {
  return rawData;
}

export interface CurrentEMRColumnOptions {
  onEdit: (row: TableDataType) => void;
  onDelete: (row: TableDataType) => void;
  onViewNote?: (note: string) => void;
}

/**
 * Column defs factory for the Current EMRs table.
 *
 * Returned by a factory (not a module-level constant) so the trailing
 * Actions column reaches back into `<CurrentEMRsTable>` via the
 * `onEdit` / `onDelete` callbacks passed in.
 */
export function createCurrentEMRColumns(
  options: CurrentEMRColumnOptions,
): ColumnDef<TableDataType>[] {
  const MONTH_MAP: Record<string, number> = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  };

  function parseDayMonth(val: unknown): number {
    if (typeof val !== "string") return 0;
    const [dayStr, monthStr] = val.trim().split("/");
    const day = parseInt(dayStr, 10);
    const month = MONTH_MAP[monthStr?.toLowerCase() ?? ""];

    if (!day || !month) return 0;
    return month * 100 + day;
  }

  return [
    {
      accessorKey: "EMR",
      header: "EMR",
      cell: (info) => info.getValue(),
      enableSorting: true,
    },
    {
      accessorKey: "Start Date",
      sortingFn: (rowA, rowB, columnId) => {
        const a = parseDayMonth(rowA.getValue(columnId));
        const b = parseDayMonth(rowB.getValue(columnId));
        return a - b;
      },
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Start Date</span>
            <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
          </Button>
        );
      },
    },
    {
      accessorKey: "Training Reminder Date",
      header: "Training Reminder Date",
      cell: (info) => info.getValue(),
      enableSorting: true,
    },
    {
      accessorKey: "4 Weeks",
      header: "4 Weeks",
      cell: (info) => info.getValue(),
      enableSorting: true,
    },
    {
      accessorKey: "Reminder Sent?",
      header: "Reminder Sent?",
      cell: (info) => <StatusBox value={info.getValue() as string} />,
    },
    {
      accessorKey: "Reinstatee?",
      header: "Reinstatee?",
      cell: (info) => <StatusBox value={info.getValue() as string} />,
    },
    {
      accessorKey: "LOA?",
      header: "LOA?",
      cell: (info) => <StatusBox value={info.getValue() as string} />,
    },
    {
      accessorKey: "Notes",
      header: "Notes",
      cell: ({ row }) => {
        const note = (row.getValue("Notes") as string) || "";
        if (!note.trim())
          return <span className="text-muted-foreground">-</span>;

        return (
          <button
            type="button"
            onClick={() => options.onViewNote?.(note)}
            title="Click to view full note"
            className="block max-w-[120px] truncate text-left text-sm hover:underline cursor-pointer text-foreground"
          >
            {note}
          </button>
        );
      },
    },
    {
      accessorKey: "Profile Link",
      header: "Profile Link",
      cell: (info) => {
        const url = info.getValue() as string;

        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Open Profile
          </a>
        );
      },
    },
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
                title="Edit row"
              >
                <Pencil />
                <span className="sr-only">Edit row</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Row actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => options.onEdit(rowData)}>
                <Pencil /> Edit row
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => options.onDelete(rowData)}
              >
                <Trash2 /> Delete row
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
