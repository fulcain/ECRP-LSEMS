"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { TableDataType } from "@/lib/types";

export function mappedMonthlySessionData(
  rawData: TableDataType[],
  month: string,
) {
  return rawData.map((row) => ({
    "Your Name": String(row["Your Name"] ?? ""),
    Sessions: String(row["Sessions"] ?? row[month] ?? row["_1"] ?? ""),
  }));
}

export const monthlySessionStatsColumns = (): ColumnDef<TableDataType>[] => [
  {
    accessorKey: "Your Name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center"
      >
        {"Instructor's Name"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "Sessions",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center"
      >
        Sessions
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    enableSorting: true,
    sortingFn: "alphanumericCaseSensitive",
  },
];
