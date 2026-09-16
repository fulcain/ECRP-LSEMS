import Papa from "papaparse";
import { TableDataType } from "@/lib/types";


export async function fetchCurrentEMRs(): Promise<TableDataType[]> {
  try {
    const res = await fetch("/api/current-emrs", { cache: "no-store" });
    const csvText = await res.text();

    const lines = csvText.split(/\r?\n/);
    let firstContent = 0;
    while (
      firstContent < lines.length &&
      (lines[firstContent].trim() === "" ||
        /^,*$/.test(lines[firstContent].trim()))
    ) {
      firstContent++;
    }
    const cleaned = lines.slice(firstContent).join("\n");

    const parsed = Papa.parse<TableDataType>(cleaned, {
      header: true,
      skipEmptyLines: true,
    });

    return parsed.data;
  } catch (error) {
    console.error("[fetchCurrentEMRs] error:", error);
    return [];
  }
}

export interface EMRProfileLink {
  EMR: string;
  profileLink: string;
}


export async function fetchEMRProfileLinks(): Promise<EMRProfileLink[]> {
  try {
    const res = await fetch("/api/current-emrs", { cache: "no-store" });
    const csvText = await res.text();

    const lines = csvText.split(/\r?\n/);
    let firstContent = 0;
    while (
      firstContent < lines.length &&
      (lines[firstContent].trim() === "" ||
        /^,*$/.test(lines[firstContent].trim()))
    ) {
      firstContent++;
    }
    const cleaned = lines.slice(firstContent).join("\n");

    const parsed = Papa.parse<string[]>(cleaned, {
      header: false,
      skipEmptyLines: true,
    });

    // Drop the header row (first row after cleaning leading blanks).
    const rows = parsed.data.slice(1);

    return rows
      .map((row) => ({
        EMR: (row[0] ?? "").trim(),
        profileLink: (row[8] ?? "").trim(), // column I = index 8
      }))
      .filter((entry) => entry.EMR !== "" || entry.profileLink !== "");
  } catch (error) {
    console.error("[fetchEMRProfileLinks] error:", error);
    return [];
  }
}