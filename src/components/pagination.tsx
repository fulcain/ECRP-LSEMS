"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaginationProps {
  table: any;
  pageSize: number;
  setPageSize: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  table,
  pageSize,
  setPageSize,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        First
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>

      <span className="text-sm text-muted-foreground">
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
      >
        Last
      </Button>

      <label className="ml-2 flex items-center gap-2 text-sm text-muted-foreground">
        Rows per page
        <Input
          type="number"
          min={1}
          value={pageSize}
          aria-label="Rows per page"
          onChange={(e) => {
            const next = Number(e.target.value);
            // An emptied or invalid box must not page to zero rows.
            if (Number.isFinite(next) && next > 0) setPageSize(next);
          }}
          className="h-8 w-20"
        />
      </label>
    </div>
  );
};
