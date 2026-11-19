#!/usr/bin/env node
/**
 * Show (or write) the files a paperwork config produces.
 *
 * The maker's Plan button and this command ask the same function, so what a
 * member previews in the browser is what the terminal prints:
 *
 *   npm run paperwork:plan -- --config path/to/config.json
 *   npm run paperwork:plan -- --config path/to/config.json --write
 *
 * `--write` is the only way this command changes anything, and it only touches
 * the generated paths the planner declared. Review the diff, then commit.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { planDivision, writePlan } from "@/lib/paperwork/generate";
import type { PaperworkConfig } from "@/lib/paperwork/schema";

const args = process.argv.slice(2);
const configIndex = args.indexOf("--config");
const configPath = configIndex >= 0 ? args[configIndex + 1] : undefined;

if (!configPath) {
  console.log(
    "\nUsage: npm run paperwork:plan -- --config <config.json> [--write]\n",
  );
  process.exitCode = 1;
} else {
  const config = JSON.parse(
    await readFile(path.resolve(configPath), "utf8"),
  ) as PaperworkConfig;

  const plan = await planDivision(config);

  if (!plan.ok) {
    console.log("\nThe config cannot be generated:\n");
    for (const problem of plan.problems) console.log(`  - ${problem}`);
    process.exitCode = 1;
  } else {
    console.log(`\nPaperwork plan for ${config.division.label || config.division.key}\n`);

    for (const file of plan.files) {
      const status = file.action.toUpperCase().padEnd(9);
      const bytes = Buffer.byteLength(file.content, "utf8");
      console.log(`  ${status} ${file.path}  (${bytes} bytes)`);
    }

    console.log("\nOne-time wiring (hand-edited once, never per division):\n");
    for (const item of plan.integration) console.log(`  - ${item}`);

    if (args.includes("--write")) {
      const result = await writePlan(plan);
      console.log(
        "\nWritten:",
        result.written.length ? result.written.join(", ") : "nothing",
      );
      if (result.unchanged.length) {
        console.log("Already current:", result.unchanged.join(", "));
      }
      if (result.refused.length) {
        console.log("Refused:", result.refused.join(", "));
        process.exitCode = 1;
      }
    } else {
      console.log("\nDry run - pass --write to create the files.\n");
    }
  }
}
