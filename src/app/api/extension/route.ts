/**
 * Serves `extension/` as a zip, built on the way out.
 *
 * It is built per request rather than served from `public/`, so the download
 * is always the code in this repo - a checked-in archive would silently drift
 * from the folder it came from.
 *
 * The route is static (no dynamic APIs) but left dynamic on purpose: zipping on
 * each request is what keeps a pushed extension change one deploy away instead
 * of one rebuild away. What it must never be is a static export: the build
 * snapshots this route once, and a later deploy that removes or moves the
 * `extension/` folder would leave a dead file serving a stale archive - or, on
 * hosts that snapshot 404s, an HTML error page under a `.zip` name, which is
 * exactly the "extension.txt says file wasn't available" symptom.
 */
import { createZip } from "@/lib/zip";
import {
  EXTENSION_ARCHIVE_NAME,
  readExtensionFiles,
} from "@/lib/extension-download";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // The member download targets Chrome/Edge: the manifest without the
    // Firefox-only keys, so Chrome's loader has nothing to warn about.
    const files = await readExtensionFiles({ chromium: true });
    if (files.length === 0) {
      // A zip of nothing downloads as a corrupt archive; say so instead.
      return new Response(
        "The extension folder is not available in this deployment.",
        { status: 503 },
      );
    }
    const archive = createZip(files);
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
      { status: 503 },
    );
  }
}
