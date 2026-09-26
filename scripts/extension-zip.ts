#!/usr/bin/env node
/**
 * Builds the archive a store upload takes.
 *
 * There are two shapes of the same folder, and they differ in one way that
 * Chrome is strict about: a store upload must have `manifest.json` at the root,
 * while a member loading it by hand needs everything inside one folder. The
 * app's download route builds the second on the fly; this builds the first,
 * because a store listing is uploaded by hand (or by the Web Store API) and
 * can't be assembled on demand from the deployed app.
 *
 * Writes to `build/`, which is git-ignored, so the artifact never becomes a
 * second copy of the extension to keep in step:
 *
 *   npm run extension:zip
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  readExtensionFiles,
  readExtensionVersion,
} from "@/lib/extension-download";
import { createZip } from "@/lib/zip";

const ARCHIVE_NAME = "lsems-forum-poster";

async function main() {
  const version = await readExtensionVersion();
  // Flat, runtime-only, and Chromium-shaped: the store manifest carries no
  // Firefox-only keys, for the same reason the download route strips them.
  const files = await readExtensionFiles({
    prefix: "",
    runtimeOnly: true,
    chromium: true,
  });
  const names = files.map((file) => file.name);

  if (!names.includes("manifest.json")) {
    console.error(
      "extension:zip refusing to write an archive the Web Store would reject: " +
        "manifest.json is not at the root.",
    );
    process.exitCode = 1;
    return;
  }

  const archive = createZip(files);
  const outDir = path.join(process.cwd(), "build");
  await mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, `${ARCHIVE_NAME}-${version}.zip`);
  await writeFile(outFile, archive);

  console.log(`extension:zip ${ARCHIVE_NAME}-${version}.zip`);
  console.log(`  version  ${version}`);
  console.log(
    `  files    ${files.length} (${(archive.length / 1024).toFixed(1)} KB)`,
  );
  console.log(`  shape    manifest.json at the root, nothing in a folder`);
  console.log(`  wrote    ${path.relative(process.cwd(), outFile)}`);
  console.log("");
  console.log("  This is the store upload. For a member installing by hand,");
  console.log("  send them /api/extension instead - that archive is unzipped");
  console.log("  into the folder Chrome is pointed at.");
}

await main();
