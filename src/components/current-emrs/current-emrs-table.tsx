"use client";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createCurrentEMRColumns,
  mapEmployeeDataRaw,
} from "@/components/current-emrs/columns";
import { Pagination } from "@/components/pagination";
import { TableDataType } from "@/lib/types";
import { fetchCurrentEMRs } from "./fetchCurrentEMRs";
import { CreateNewEMR } from "@/components/create-new-emr/create-new-emr";
import { EditEMRDialog } from "@/components/current-emrs/edit-emr-dialog";
import { DeleteEMRDialog } from "@/components/current-emrs/delete-emr-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";

export function CurrentEMRsTable() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "Start Date", desc: false },
  ]);
  const [pageSizeInput, setPageSizeInput] = useState(10);
  const [nameFilter, setNameFilter] = useState("");
  const [data, setData] = useState<TableDataType[]>([]);
  const [loading, setLoading] = useState(true);

  const [editRow, setEditRow] = useState<TableDataType | null>(null);
  const [deleteRow, setDeleteRow] = useState<TableDataType | null>(null);
  const [viewNote, setViewNote] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const stats = await fetchCurrentEMRs();

      setData(stats);
      setLoading(false);
    };
    loadData();
  }, []);

  const tableData = useMemo(() => mapEmployeeDataRaw(data), [data]);

  const emrStats = useMemo(() => {
    const total = tableData.length;
    const reinstated = tableData.filter(
      (row) => (row["Reinstatee?"] as string)?.toUpperCase() === "TRUE",
    ).length;
    const normal = total - reinstated;
    return { total, normal, reinstated };
  }, [tableData]);

  const tableRows = useMemo(
    () =>
      tableData.filter((row) =>
        ((row as any)["EMR"] || "")
          .toLowerCase()
          .includes(nameFilter.toLowerCase()),
      ),
    [tableData, nameFilter],
  );

  const handleEdit = useCallback((row: TableDataType) => {
    setEditRow(row);
    setEditOpen(true);
  }, []);

  const handleDelete = useCallback((row: TableDataType) => {
    setDeleteRow(row);
    setDeleteOpen(true);
  }, []);

  const handleViewNote = useCallback((note: string) => {
    setViewNote(note);
  }, []);

  const columns = useMemo(
    () =>
      createCurrentEMRColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onViewNote: handleViewNote,
      }),
    [handleEdit, handleDelete, handleViewNote],
  );

  const table = useReactTable({
    data: tableRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageSize(Number(pageSizeInput) || 1);
  }, [pageSizeInput, table]);

  return (
    <div className="space-y-4">
      <CreateNewEMR setData={setData} />

      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        Current EMRs Table
      </h2>

      {/* === Stats === */}
      {!loading && (
        <div className="flex gap-4 text-sm">
          <span className="bg-secondary/50 rounded-md px-3 py-1.5">
            Total: <span className="font-semibold">{emrStats.total}</span>
          </span>
          <span className="bg-secondary/50 rounded-md px-3 py-1.5">
            Normal: <span className="font-semibold">{emrStats.normal}</span>
          </span>
          <span className="bg-secondary/50 rounded-md px-3 py-1.5">
            Reinstated:{" "}
            <span className="font-semibold">{emrStats.reinstated}</span>
          </span>
          <Button variant="outline" size="sm">
            <Link
              className="flex flex-row gap-2 items-center justify-center"
              target="_blank"
              href="https://gov.eclipse-rp.net/viewforum.php?f=615"
            >
              <ExternalLink />
              Active LOAs
            </Link>
          </Button>
        </div>
      )}

      {/* === Filters === */}
      <div className="flex flex-wrap items-center gap-3 py-4">
        {loading ? (
          <Skeleton className="h-10 w-full rounded" />
        ) : (
          <Input
            placeholder="Filter EMR..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="max-w-full sm:max-w-sm"
          />
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

      <EditEMRDialog
        row={editRow}
        open={editOpen}
        onOpenChange={setEditOpen}
        setData={setData}
      />
      <DeleteEMRDialog
        row={deleteRow}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        setData={setData}
      />

      {/* === Note Preview Modal === */}
      <Dialog
        open={!!viewNote}
        onOpenChange={(open) => !open && setViewNote(null)}
      >
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto border-border/50 bg-background/95 backdrop-blur-sm shadow-2xl">
          <DialogHeader className="space-y-1.5 pb-2 border-b border-border/40">
            <DialogTitle className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
              <div className="p-2 text-primary">
                <FileText className="w-4 h-4" />
              </div>
              Note Details
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <div className="relative rounded-xl bg-muted/50 p-4 border border-border/50">
              <span className="text-sm whitespace-pre-wrap break-words text-foreground/90 leading-relaxed font-sans pr-4">
                {viewNote}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
