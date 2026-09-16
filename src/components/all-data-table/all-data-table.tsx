"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
import { format, isAfter, isBefore } from "date-fns";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import { Calendar } from "@/components/ui/calendar";
import { createAllDataColumns } from "@/components/all-data-table/columns";
import { fetchAllData } from "@/components/all-data-table/fetchAllData";
import { EditSessionDialog } from "@/components/all-data-table/edit-session-dialog";
import { DeleteSessionDialog } from "@/components/all-data-table/delete-session-dialog";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { TableDataType } from "@/lib/types";


export function AllDataTable({ canEditFT = false }: { canEditFT?: boolean }) {
  const [data, setData] = useState<TableDataType[]>([]);
  const [loading, setLoading] = useState(true);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageSizeInput, setPageSizeInput] = useState(10);

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  // Edit dialog state.
  const [editRow, setEditRow] = useState<TableDataType | null>(null);
  const [editRowNumber, setEditRowNumber] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Delete dialog state - same rowNumber provenance as edit.
  const [deleteRow, setDeleteRow] = useState<TableDataType | null>(null);
  const [deleteRowNumber, setDeleteRowNumber] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEdit = (row: TableDataType) => {
    setEditRow(row);
    const csvIndex = Number(row.__csvIndex);
    setEditRowNumber(
      Number.isFinite(csvIndex) && csvIndex >= 0 ? csvIndex + 2 : null,
    );
    setEditOpen(true);
  };

  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open);
    if (!open) {
      setEditRow(null);
      setEditRowNumber(null);
    }
  };

  const handleDelete = (row: TableDataType) => {
    setDeleteRow(row);
    const csvIndex = Number(row.__csvIndex);
    setDeleteRowNumber(
      Number.isFinite(csvIndex) && csvIndex >= 0 ? csvIndex + 2 : null,
    );
    setDeleteOpen(true);
  };

  const handleDeleteOpenChange = (open: boolean) => {
    setDeleteOpen(open);
    if (!open) {
      setDeleteRow(null);
      setDeleteRowNumber(null);
    }
  };

  const columns: ColumnDef<TableDataType>[] = createAllDataColumns({
    canEdit: canEditFT,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  const resync = useCallback(async () => {
    setLoading(true);
    try {
      const allData = await fetchAllData();
      setData(allData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    resync();
  }, [resync]);

  const filteredData = useMemo(() => {
    const getRowStartDate = (row: TableDataType) => {
      if (!row.Date || !row["Time Start"]) return new Date(0);

      const dateStr = String(row.Date);
      const timeStr = String(row["Time Start"]);

      const [month, day, year] = dateStr.split("/").map(Number);
      const [hour, minute] = timeStr.split(":").map(Number);

      return new Date(year, month - 1, day, hour, minute);
    };

    return data
      .filter((row) => {
        const rowStartDate = getRowStartDate(row);
        if (startDate && isBefore(rowStartDate, startDate)) return false;
        if (endDate && isAfter(rowStartDate, endDate)) return false;
        return true;
      })
      .sort((a, b) => {
        const aDate = getRowStartDate(a);
        const bDate = getRowStartDate(b);
        return bDate.getTime() - aDate.getTime(); // newest first
      });
  }, [data, startDate, endDate]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageSize(Number(pageSizeInput) || 1);
  }, [pageSizeInput, table]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Session Reports
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resync}
          disabled={loading}
          title="Re-sync from the live sheet"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* === Filters === */}
      <div className="flex flex-wrap items-center gap-3 py-4">
        {loading ? (
          <Skeleton className="h-10 w-full rounded" />
        ) : (
          <>
            <Input
              placeholder="Filter Your Name..."
              value={
                (table.getColumn("Your Name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("Your Name")?.setFilterValue(event.target.value)
              }
              className="max-w-full sm:max-w-sm"
            />

            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  data-empty={!startDate}
                  className="w-full sm:w-[180px] justify-between font-normal"
                >
                  {startDate ? format(startDate, "PPP") : "Start date"}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setStartOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>

            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  data-empty={!endDate}
                  className="w-full sm:w-[180px] justify-between font-normal"
                >
                  {endDate ? format(endDate, "PPP") : "End date"}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setEndOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>

            <span className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
              Total: <span className="font-semibold text-foreground">{table.getFilteredRowModel().rows.length}</span>
            </span>
          </>
        )}
      </div>

      {/* === Table === */}
        {loading ? (
          <Skeleton className="h-96 w-full rounded-b" />
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

      {/* === Pagination === */}
      {!loading && (
        <Pagination
          table={table}
          pageSize={pageSizeInput}
          setPageSize={setPageSizeInput}
        />
      )}

      <EditSessionDialog
        row={editRow}
        originalRowNumber={editRowNumber}
        open={editOpen}
        onOpenChange={handleEditOpenChange}
        setData={setData}
      />
      <DeleteSessionDialog
        row={deleteRow}
        originalRowNumber={deleteRowNumber}
        open={deleteOpen}
        onOpenChange={handleDeleteOpenChange}
        setData={setData}
      />
    </div>
  );
}
