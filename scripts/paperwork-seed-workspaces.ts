import { readFile } from "node:fs/promises";

import { DIVISION_ENTRIES } from "@/configs/roles";
import { closePaperworkStore, ensurePaperworkWorkspaces, readAllPaperworkConfigs } from "@/lib/paperwork/amu-store";
import type { PaperworkConfig } from "@/lib/paperwork/schema";

const sourceKeys = ["amu", "ar", "bls", "red"];
const sourceConfigs = await Promise.all(sourceKeys.map(async (key) =>
  JSON.parse(await readFile(`src/app/constants/paperwork/generated/${key}.json`, "utf8")) as PaperworkConfig,
));
const knownKeys = new Set(sourceKeys);
const emptyConfigs: PaperworkConfig[] = DIVISION_ENTRIES
  .filter(([key]) => key !== "cru" && !knownKeys.has(key))
  .map(([key, division]) => ({
    version: 1,
    division: {
      key,
      label: division.label,
      description: `${division.label} paperwork formats.`,
      pages: [{
        key: "paperwork",
        label: "Paperwork",
        purpose: `Create and organize ${division.label} paperwork.`,
        groups: [{ label: "Formats", formats: [] }],
      }],
    },
  }));

try {
  const inserted = await ensurePaperworkWorkspaces([...sourceConfigs, ...emptyConfigs]);
  const configs = await readAllPaperworkConfigs();
  console.log(JSON.stringify({ inserted, total: configs.length, excluded: "cru" }, null, 2));
} finally {
  await closePaperworkStore();
}
