import { readFile } from "node:fs/promises";
import { closePaperworkStore, syncCanonicalPaperworkTemplates } from "@/lib/paperwork/amu-store";
import type { PaperworkConfig } from "@/lib/paperwork/schema";

const keys = ["amu", "bls", "red", "ar"];
const sources = await Promise.all(keys.map(async (key) =>
  JSON.parse(await readFile(`src/app/constants/paperwork/generated/${key}.json`, "utf8")) as PaperworkConfig,
));

try {
  const result = await syncCanonicalPaperworkTemplates(sources);
  console.log(JSON.stringify({ synced: result }, null, 2));
} finally {
  await closePaperworkStore();
}
