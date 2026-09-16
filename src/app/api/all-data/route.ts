import { NextResponse } from "next/server";

/**
 * GET /api/all-data
 *
 * Proxies the FT-Sessions published CSV. Same caching story as
 * `/api/employee-stats`: force-dynamic + no-store + aggressive
 * Cache-Control so updates surface as quickly as the upstream
 * published-CSV cache allows.
 *
 * NOTE: still subject to Google's published-CSV staleness (~5 min).
 */

// Run on every request - without this Next.js treats the route as
// static and freezes the first response forever.
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.ALL_DATA_STATS_CSV_URL;
  if (!url)
    return NextResponse.json({ error: "Sheet URL not set" }, { status: 500 });

  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/csv",
      // `no-store` subsumes `no-cache`, `must-revalidate`, `max-age=0`,
      // `Pragma`, and `Expires` - listing all five signals confusion
      // and adds no behavior for HTTP/1.1+ browsers.
      "Cache-Control": "no-store",
    },
  });
}
