/**
 * The `extension/` folder as data: what the download route zips and what the
 * installer page reports. Both read from disk, so the page can never advertise a
 * version or a file count the archive does not have.
 *
 * `extension/` is shipped with the deployment by `outputFileTracingIncludes` in
 * `next.config.ts` - a route or a page that reads it works in dev and finds
 * nothing once deployed without that entry.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

/** Unzipping produces one folder, which is the folder Chrome is pointed at. */
export const EXTENSION_ARCHIVE_NAME = "lsems-forum-poster";

/**
 * A store upload must have `manifest.json` at the archive root - the Web Store
 * rejects a nested folder, which is exactly the shape a member needs. So the
 * prefix is a parameter: the download route keeps the folder, the release script
 * flattens it.
 */
export type ExtensionPackOptions = {
  /** Path prefix for every entry; `""` puts `manifest.json` at the root. */
  prefix?: string;
  /** Drop the folder's own markdown: Chrome never loads a `.md`. */
  runtimeOnly?: boolean;
};

/**
 * Listing paperwork, not extension code - `extension/store/` holds the logo and
 * promo art a submission uploads by hand. It stays out of both archives: a
 * member does not need a 60 KB promo tile in the folder Chrome loads.
 */
const SKIP_DIRECTORIES = new Set(["store"]);

const EXTENSION_DIR = path.join(process.cwd(), "extension");

export type ExtensionFile = {
  /** Path inside the archive, already prefixed with the folder name. */
  name: string;
  data: Uint8Array;
};

async function walk(
  dir: string,
  prefix: string,
  options: ExtensionPackOptions,
  into: ExtensionFile[],
): Promise<void> {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    const name = `${prefix}${item.name}`;
    if (item.isDirectory()) {
      if (dir === EXTENSION_DIR && SKIP_DIRECTORIES.has(item.name)) continue;
      await walk(full, `${name}/`, options, into);
    } else if (!(options.runtimeOnly && item.name.endsWith(".md"))) {
      into.push({ name, data: await readFile(full) });
    }
  }
}

/** Every file, sorted - a fixed order keeps the archive byte-stable. */
export async function readExtensionFiles(
  options: ExtensionPackOptions = {},
): Promise<ExtensionFile[]> {
  const files: ExtensionFile[] = [];
  const prefix = options.prefix ?? `${EXTENSION_ARCHIVE_NAME}/`;
  await walk(EXTENSION_DIR, prefix, options, files);
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

/** The version the folder carries - the one number a release is bumped on. */
export async function readExtensionVersion(): Promise<string> {
  try {
    const manifest = await readFile(path.join(EXTENSION_DIR, "manifest.json"));
    const parsed = JSON.parse(manifest.toString("utf8")) as { version?: unknown };
    return typeof parsed.version === "string" ? parsed.version : "0.0.0";
  } catch (error) {
    console.error("[extension] could not read the manifest:", error);
    return "0.0.0";
  }
}

/** What the page shows: the version the archive carries and how big it is. */
export async function readExtensionSummary(): Promise<{
  version: string;
  fileCount: number;
} | null> {
  try {
    const files = await readExtensionFiles();
    const manifest = files.find((file) => file.name.endsWith("/manifest.json"));
    if (!manifest) return null;
    const parsed = JSON.parse(new TextDecoder().decode(manifest.data)) as {
      version?: unknown;
    };
    return {
      version: typeof parsed.version === "string" ? parsed.version : "1.0.0",
      fileCount: files.length,
    };
  } catch (error) {
    console.error("[extension] could not read the extension folder:", error);
    return null;
  }
}
