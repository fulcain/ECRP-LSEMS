#!/usr/bin/env node
/**
 * Generates everything a store listing asks for, from the two files we own:
 * the LSEMS emblem (`public/General.png`) and whatever screenshots you dropped
 * in `extension/store/raw/`.
 *
 *   npm run extension:assets
 *
 * Why a script rather than committed hand-made art: the store wants several
 * fixed sizes, and a listing is re-uploaded every release. Size is the one thing
 * a store rejects on, so these are computed here instead of cropped by eye in an
 * editor. Re-running it is always safe.
 *
 * `sharp` comes in with Next (it is what `next/image` optimizes with), so
 * nothing is installed for this.
 *
 * Outputs, all under `extension/store/` - listing art is not part of the
 * extension's code, so it is kept out of both archives:
 *   store-logo-300x300.png     the listing's logo
 *   promo-tile-440x280.png     the small promotional tile
 *   screenshot-<n>-1280x800.png and -640x480.png, fitted from each raw capture
 */

import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error(
    "extension:assets needs sharp, which ships with Next. Run npm install first.",
  );
  process.exit(1);
}

const ROOT = process.cwd();
const EMBLEM = path.join(ROOT, "public", "General.png");
const STORE_DIR = path.join(ROOT, "extension", "store");
const RAW_DIR = path.join(STORE_DIR, "raw");

/** The app's dark surface, so the emblem's white ring reads on a white page. */
const SURFACE = { r: 20, g: 22, b: 26, alpha: 1 };

/** A backtick, written once - an escaped one would end a template literal. */
const BT = "`";

const done = [];

async function resize(from, to, size) {
  await sharp(from)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(to);
  done.push(path.relative(ROOT, to));
}

/** The emblem on a rounded dark plate, with an optional two-line caption. */
async function tile(to, width, height, inset, caption) {
  const emblem = await sharp(EMBLEM)
    .resize(inset, inset, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const plate = Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect width="${width}" height="${height}" rx="${Math.round(
        height * 0.12,
      )}" fill="#14161a"/></svg>`,
  );

  // With a caption the emblem sits above centred text, so the caption can never
  // run off the right edge - a side-by-side layout did, at every width tried.
  const top = caption
    ? Math.round(height * 0.09)
    : Math.round((height - inset) / 2);
  const layers = [
    { input: emblem, left: Math.round((width - inset) / 2), top },
  ];

  if (caption) {
    const [title, subtitle] = caption;
    const middle = Math.round(width / 2);
    const titleY = top + inset + Math.round(height * 0.13);
    const svg = Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">` +
        `<style>.t{font-family:"Segoe UI",Arial,sans-serif;fill:#f5f7fa;}` +
        `.s{font-family:"Segoe UI",Arial,sans-serif;fill:#9aa3b2;}</style>` +
        `<text class="t" x="${middle}" y="${titleY}" font-size="22" font-weight="600" text-anchor="middle">${title}</text>` +
        `<text class="s" x="${middle}" y="${
          titleY + 24
        }" font-size="14" text-anchor="middle">${subtitle}</text></svg>`,
    );
    layers.push({ input: svg, left: 0, top: 0 });
  }

  await sharp(plate).composite(layers).png({ compressionLevel: 9 }).toFile(to);
  done.push(path.relative(ROOT, to));
}

/** A raw capture becomes the exact sizes the stores accept. */
async function fit(from, to, width, height) {
  await sharp(from)
    .resize(width, height, { fit: "contain", background: SURFACE })
    .flatten({ background: SURFACE })
    .png({ compressionLevel: 9 })
    .toFile(to);
  done.push(path.relative(ROOT, to));
}

async function main() {
  await mkdir(STORE_DIR, { recursive: true });

  // Toolbar, extensions page and store listing icon, all from one emblem.
  for (const size of [16, 32, 48, 128]) {
    await resize(
      EMBLEM,
      path.join(ROOT, "extension", "icons", `icon-${size}.png`),
      size,
    );
  }

  await tile(path.join(STORE_DIR, "store-logo-300x300.png"), 300, 300, 210);
  await tile(
    path.join(STORE_DIR, "promo-tile-440x280.png"),
    440,
    280,
    150,
    ["LSEMS Forum Poster", "Fills GOV posts for you"],
  );

  let raw = [];
  try {
    raw = (await readdir(RAW_DIR))
      .filter((name) => /\.(png|jpe?g)$/i.test(name))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    raw = [];
  }

  for (const [index, name] of raw.entries()) {
    const stem = `screenshot-${index + 1}`;
    await fit(
      path.join(RAW_DIR, name),
      path.join(STORE_DIR, `${stem}-1280x800.png`),
      1280,
      800,
    );
    await fit(
      path.join(RAW_DIR, name),
      path.join(STORE_DIR, `${stem}-640x480.png`),
      640,
      480,
    );
  }

  const rows = [
    ["Extension icon (both stores)", `../icons/icon-128.png`, "128x128"],
    ["Store logo", `store-logo-300x300.png`, "300x300"],
    ["Small promo tile", `promo-tile-440x280.png`, "440x280"],
  ];
  for (const [index] of raw.entries()) {
    rows.push([
      `Screenshot ${index + 1}`,
      `screenshot-${index + 1}-1280x800.png`,
      "1280x800",
    ]);
    rows.push([
      `Screenshot ${index + 1} (smaller)`,
      `screenshot-${index + 1}-640x480.png`,
      "640x480",
    ]);
  }

  const readme = [
    "Generated by `npm run extension:assets` - safe to re-run.",
    "",
    "| Upload to | File | Size |",
    "| --- | --- | --- |",
    ...rows.map(([what, file, size]) => `| ${what} | ${BT}${file}${BT} | ${size} |`),
    "",
    "Screenshots need at least one, and must be 640x480 or 1280x800 for Edge",
    "(Chrome also accepts 640x400). Take them on the real GOV page with a post",
    "prepared, at any size - Windows+Shift+S is fine - and drop the files into",
    `${BT}raw/${BT}, then run the command again to fit them exactly.`,
    "",
    "These files are listing paperwork: both archives exclude `extension/store/`,",
    "so nothing here ends up in a member's download.",
    "",
  ].join("\n");

  await writeFile(path.join(STORE_DIR, "README.md"), readme);
  done.push("extension/store/README.md");
}

await main();
console.log(done.map((file) => `  ${file}`).join("\n"));
console.log(`${done.length} files written`);
if (process.argv.includes("--help")) {
  console.log("Put source screenshots in extension/store/raw/ first.");
}
