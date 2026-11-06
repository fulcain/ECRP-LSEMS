"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type MonthlySessionDetail = {
  emrName: string;
  sessionConducted: string;
};

export type MonthlySessionStatsRow = {
  "Your Name": string;
  Sessions: string;
  sessionDetails: MonthlySessionDetail[];
};

export const monthlySessionStatsColumns: ColumnDef<MonthlySessionStatsRow>[] = [
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
    cell: ({ row }) => {
      const instructorName = row.original["Your Name"];
      const sessions = row.original.sessionDetails;

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="link"
              className="h-auto p-0 text-left font-normal"
              aria-label={`View ${row.original.Sessions} sessions conducted by ${instructorName}`}
            >
              {row.original.Sessions}
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
                {row.original.Sessions} sessions this month
              </p>
            </div>
            {sessions.length > 0 ? (
              <div className="divide-y divide-border">
                {sessions.map((session, index) => (
                  <div
                    key={`${session.emrName}-${session.sessionConducted}-${index}`}
                    className="space-y-1 px-4 py-3"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      EMR&apos;s Name
                    </p>
                    <p className="text-sm font-medium">
                      {session.emrName || "—"}
                    </p>
                    <p className="pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Session Conducted
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.sessionConducted || "—"}
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
    enableSorting: true,
    sortingFn: "alphanumericCaseSensitive",
  },
];
