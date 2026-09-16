import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { TableDataType } from "@/lib/types";

/**
 * Re-keys the raw sheet row objects to the column-friendly names the
 * table expects. The published sheet puts the data under numeric keys
 * (_1, _3, ...) once PapaParse splits off the header.
 */
export function mapEmployeeData(rawData: TableDataType[]): TableDataType[] {
  return rawData.map((row) => ({
    "Employee Name": String(row["Names"] ?? ""),
    "Total Sessions": Number(row["_1"] ?? 0),
    "15 Session Ribbons": String(row["_3"] ?? ""),
    "40 Session Ribbon": String(row["_4"] ?? ""),
    "100 Session Ribbons": String(row["_5"] ?? ""),
    "165 Session Ribbons": String(row["_6"] ?? ""),
  }));
}

/** Tiny status pill - green if the sheet's TRUE/FALSE column says YES. */
const RibbonBox = ({ value }: { value: string }) => {
  const isTrue = value === "TRUE";
  return (
    <div
      className={`w-4 h-4 rounded-full ${isTrue ? "bg-green-500" : "bg-red-500"}`}
      title={isTrue ? "Completed" : "Not Completed"}
    />
  );
};

export const employeeColumns: ColumnDef<TableDataType>[] = [
  {
    accessorKey: "Employee Name",
    header: "Employee Name",
    cell: (info) => info.getValue(),
    enableSorting: true,
  },
  {
    accessorKey: "Total Sessions",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center"
      >
        Total Sessions
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (info) => info.getValue(),
    enableSorting: true,
    sortingFn: "basic",
  },
  {
    accessorKey: "15 Session Ribbons",
    header: "15 Session Ribbons",
    cell: (info) => <RibbonBox value={info.getValue() as string} />,
  },
  {
    accessorKey: "40 Session Ribbon",
    header: "40 Session Ribbon",
    cell: (info) => <RibbonBox value={info.getValue() as string} />,
  },
  {
    accessorKey: "100 Session Ribbons",
    header: "100 Session Ribbons",
    cell: (info) => <RibbonBox value={info.getValue() as string} />,
  },
  {
    accessorKey: "165 Session Ribbons",
    header: "165 Session Ribbons",
    cell: (info) => <RibbonBox value={info.getValue() as string} />,
  },
];
