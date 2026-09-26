import { createZip } from "@/lib/zip";
import {
  EXTENSION_ARCHIVE_NAME,
  readExtensionFiles,
} from "@/lib/extension-download";

/**
 * The browser extension in `extension/`, zipped on the way out.
 *
 * It is built per request rather than served from `public/`, so the download
 * is always the code in this repo - a checked-in archive would silently drift
 * from the folder it came from.
 */
export async function GET() {
  try {
    const archive = createZip(await readExtensionFiles());
    // A plain `ArrayBuffer` slice: `Response` wants a view built on an
    // ArrayBuffer, which the type of a typed array's backing store doesn't
    // guarantee.
    const body = archive.buffer.slice(
      archive.byteOffset,
      archive.byteOffset + archive.byteLength,
    ) as ArrayBuffer;
    return new Response(body, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${EXTENSION_ARCHIVE_NAME}.zip"`,
        "Content-Length": String(archive.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/extension] could not package the extension:", error);
    return new Response(
      "The extension folder is not available in this deployment.",
      { status: 500 },
    );
  }
}
