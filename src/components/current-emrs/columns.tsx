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
  return [
    {
      accessorKey: "EMR",
      header: "EMR",
      cell: (info) => info.getValue(),
      enableSorting: true,
    },
    {
      accessorKey: "Start Date",
      header: "Start Date",
      cell: (info) => info.getValue(),
      enableSorting: true,
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
    { accessorKey: "Notes", header: "Notes", cell: (info) => info.getValue() },
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
