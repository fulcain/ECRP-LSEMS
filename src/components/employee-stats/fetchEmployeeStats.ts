import Papa from "papaparse";
import { TableDataType } from "@/lib/types";


export interface EmployeeStatsSourceRow extends TableDataType {
  __csvIndex: number;
  index: number;
  kind: "active" | "exFto";
}

export interface FullEmployeeStatsPayload {
  active: EmployeeStatsSourceRow[];
  exFtos: EmployeeStatsSourceRow[];
}

/**
 * Fetches and parses employee stats data from /api/employee-stats
 */
export async function fetchEmployeeStats(): Promise<TableDataType[]> {
  try {
    const res = await fetch("/api/employee-stats", { cache: "no-store" });
    const csvText = await res.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const rawData: TableDataType[] = parsed.data as TableDataType[];

    const stopIndex = rawData.findIndex((obj) => obj["Names"] === "Ex FTOs");

    let sliced =
      stopIndex > -1 ? rawData.slice(1, stopIndex) : rawData.slice(1);

    if (
      sliced.length &&
      Object.values(sliced[sliced.length - 1]).every((v) => !v)
    ) {
      sliced = sliced.slice(0, -1);
    }

    return sliced;
  } catch (error) {
    console.error("Error fetching employee stats:", error);
    return [];
  }
}

export async function fetchFullEmployeeStats(): Promise<FullEmployeeStatsPayload> {
  const empty: FullEmployeeStatsPayload = {
    active: [],
    exFtos: [],
  };
  try {
    // See note in fetchEmployeeStats above - the same
    // cache-busting rationale applies to fetchFullEmployeeStats too.
    const res = await fetch("/api/employee-stats", { cache: "no-store" });
    const csvText = await res.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const rawData = (parsed.data as TableDataType[]) ?? [];

    const sentinelPos = rawData.findIndex(
      (obj) => String(obj["Names"] ?? "").trim() === "Ex FTOs",
    );

    const active: EmployeeStatsSourceRow[] = [];
    const exFtos: EmployeeStatsSourceRow[] = [];

    rawData.forEach((row, i) => {
      if (i === 0) return;

      // Skip the "Ex FTOs" sentinel row - it's a divider, not an FTO.
      if (sentinelPos === i) return;

      const isExFto = sentinelPos !== -1 && i > sentinelPos;
      const enriched: EmployeeStatsSourceRow = {
        ...row,
        __csvIndex: i,
        kind: isExFto ? "exFto" : "active",
        index: (isExFto ? exFtos.length : active.length) + 1,
      };

      if (isExFto) exFtos.push(enriched);
      else active.push(enriched);
    });

    return { active, exFtos };
  } catch (error) {
    console.error("Error fetching full employee stats:", error);
    return empty;
  }
}

export function toSheetRow(row: EmployeeStatsSourceRow): number | null {
  const idx = row.__csvIndex;
  if (typeof idx !== "number" || !Number.isFinite(idx)) return null;
  return idx + 2;
}
