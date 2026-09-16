import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie } from "@/app/api/auth/_helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/logout
 *
 * Clears the `ftd_auth` cookie and redirects to /login?loggedOut=1.
 *
 * We deliberately do NOT export a GET handler here - logouts should
 * require intent (button/form submit) so that any third-party request
 * (e.g. an <img> tag pointing at this URL) can't accidentally sign users
 * out.
 */
export async function POST(req: NextRequest) {
  await clearSessionCookie();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("loggedOut", "1");
  return NextResponse.redirect(url);
}
