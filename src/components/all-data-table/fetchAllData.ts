import Papa from "papaparse";
import { TableDataType } from "@/lib/types";

export async function fetchAllData(): Promise<TableDataType[]> {
  try {
    const res = await fetch("/api/all-data", { cache: "no-store" });
    const csvText = await res.text();
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    return (parsed.data as TableDataType[]).map((row, i) => ({
      ...row,
      __csvIndex: i,
    }));
  } catch (error) {
    console.error("Error fetching all data:", error);
    return [];
  }
}
