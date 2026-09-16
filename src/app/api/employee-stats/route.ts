import { NextResponse } from "next/server";

/**
 * GET /api/employee-stats
 *
 * Proxies the published Employee-Stats CSV. This proxy exists so the
 * client doesn't have to know the published-CSV URL or deal with
 * Google's redirect-DNS dance directly. We force the route to be
 * dynamic and opt every layer out of caching so an edit through
 * `/api/employee-stats-row/*` shows up here as fast as the upstream
 * Google Sheets "Publish to Web" cache will allow.
 *
 * NOTE: this still respects Google's published-CSV cache (~5 min lag
 * is typical). The fully-fresh path is to add a live-sheet Apps
 * Script `doGet` and point this proxy at it.
 */

// Run on every request - without this Next.js would treat the route
// as static and freeze the first response forever.
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.EMPLOYEE_STATS_CSV_URL;
  if (!url)
    return NextResponse.json({ error: "Sheet URL not set" }, { status: 500 });

  // `cache: "no-store"` opts out of the Next.js Data Cache and the
  // browser HTTP cache for this server-side fetch.
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/csv",
      // Tell the browser not to cache at all - the data is mutable
      // and the upstream staleness is already the floor on freshness.
      // `no-store` subsumes `no-cache`, `must-revalidate`, `max-age=0`,
      // `Pragma`, and `Expires` - listing all five signals confusion
      // and adds no behavior for HTTP/1.1+ browsers.
      "Cache-Control": "no-store",
    },
  });
}
