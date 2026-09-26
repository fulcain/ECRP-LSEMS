import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/jwt";
import { readAuthCookie, AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/cookies";
import { refreshSessionIfStale } from "@/lib/session-refresh";
import { readAccessMatrix } from "@/lib/access-matrix-store";
import {
  userHasAccess,
  divisionForRoute,
  landingRouteFor,
} from "@/lib/role-config";
import { ENTRY_ROUTE } from "@/configs/routes";

/**
 * Paths that should NEVER go through Discord auth: OAuth flow itself,
 * public sign-in / denied pages, and the Next.js internals.
 *
 * We deliberately use exact-match (`===`) rather than prefix-match here
 * so that any future `/login/<something>` or `/unauthorized/<something>`
 * page stays protected by default.
 */
function isPublicPath(pathname: string): boolean {
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname === "/login" ||
    pathname === "/unauthorized"
  ) {
    return true;
  }
  return false;
}

/**
 * True for a real page load (a navigation or a reload), as opposed to a
 * prefetch, an RSC fetch or a client's `fetch('/api/...')` - all of which
 * would otherwise be treated as one. Only document loads ask Discord to
 * confirm the member's roles: those are the ones a member is waiting on, and
 * the ones where a promotion should show up.
 */
function isDocumentLoad(req: NextRequest): boolean {
  if (req.headers.get("rsc") || req.headers.get("next-router-prefetch")) {
    return false;
  }
  return (req.headers.get("accept") ?? "").includes("text/html");
}

/** Replace the auth cookie in a raw `Cookie:` header, keeping the rest. */
function replaceAuthCookie(header: string | null, token: string): string {
  const kept = (header ?? "")
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !part.startsWith(`${AUTH_COOKIE_NAME}=`));
  return [...kept, `${AUTH_COOKIE_NAME}=${token}`].join("; ");
}

/**
 * Edge-runtime middleware. Reads the `ftd_auth` cookie, verifies the JWT, and
 * checks the user's Discord role IDs against the permission matrix, redirecting
 * to /login or /unauthorized as appropriate. `/api/auth/*` is explicitly allowed
 * through so the OAuth flow works.
 *
 * The matrix is read **here**, because this is the one place that enforces a
 * route: a matrix only the sidebar honoured would hide a tab and still serve the
 * page behind it. A page with no stored row opens to every employee, so an
 * unreadable store widens access rather than closing the app.
 *
 * A page load also catches the session up with Discord before anything is
 * decided: roles granted since the last visit are in the payload this request
 * is authorized with, the refreshed cookie is set on the response, and the
 * sidebar, the gates and the Staff Page all read the same current roles - so a
 * new rank shows up on the next reload instead of at the next sign-in.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = readAuthCookie(req);
  if (!token) return redirectToLogin(req);

  const verified = await verifySessionToken(token);
  if (!verified) return redirectToLogin(req, /* expired */ true);

  // Throttled in `session-refresh.ts`; a document load uses the short window
  // (so a reload genuinely re-reads Discord), background fetches the long one.
  const outcome = await refreshSessionIfStale(token, verified, {
    force: isDocumentLoad(req),
  });
  const refreshed = outcome.ok ? outcome : null;
  const payload = refreshed?.payload ?? verified;

  // `null` whenever the store is unset or unreachable, which means "no rows" -
  // every page then opens to every employee. A store outage must never be what
  // closes a page.
  const overrides = await readAccessMatrix();

  /** Carry the re-signed cookie on whatever this request answers with. */
  const respond = <T extends NextResponse>(res: T): T => {
    if (refreshed) {
      res.cookies.set({ ...authCookieOptions(), value: refreshed.token });
    }
    return res;
  };

  /**
   * Continue to the page. A refreshed session is forwarded in the request
   * headers too, because the page reads the cookie off the *request* - without
   * that the sidebar (and every server component on this render) would still
   * see the roles from before the refresh, and the new ones would only land on
   * the next navigation.
   */
  const continueToPage = (): NextResponse => {
    if (!refreshed) return NextResponse.next();
    const headers = new Headers(req.headers);
    headers.set(
      "cookie",
      replaceAuthCookie(req.headers.get("cookie"), refreshed.token),
    );
    return NextResponse.next({ request: { headers } });
  };

  // The entry point has no page of its own - no single page suits every
  // member. Send each one to the first page their own roles open, which is
  // also where login lands when it has nothing better to go on.
  if (pathname === ENTRY_ROUTE) {
    const destination = landingRouteFor(
      payload.roles,
      payload.discordId,
      overrides,
    );
    return respond(NextResponse.redirect(new URL(destination, req.url)));
  }

  if (!userHasAccess(pathname, payload.roles, payload.discordId, overrides)) {
    const url = req.nextUrl.clone();
    url.pathname = "/unauthorized";
    url.searchParams.set("path", pathname);
    // Every page here is decided by roles, so a refusal is always about them.
    url.searchParams.set("hint", "role");
    // Name the division so the denied page can say which members the page is
    // for - "RED is for Recruitment and Employment Division members".
    const division = divisionForRoute(pathname);
    if (division) url.searchParams.set("division", division.label);
    return respond(NextResponse.redirect(url));
  }

  // We deliberately do NOT forward `x-ftd-*` headers to downstream handlers
  // - those would be a trust boundary issue, since the headers are just
  // mirror of the JWT contents and any API route that needs identity
  // should re-verify the cookie itself.
  return respond(continueToPage());
}

function redirectToLogin(req: NextRequest, expired = false): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("returnTo", req.nextUrl.pathname + req.nextUrl.search);
  if (expired) url.searchParams.set("reason", "expired");
  return NextResponse.redirect(url);
}

/**
 * Limit middleware to non-static paths. Next.js auto-applies this matcher
 * and skips `_next/*`, `favicon.ico`, and common static extensions.
 */
export const config = {
  matcher: [
    /*
     * Match everything EXCEPT:
     *  - _next/static, _next/image (static assets)
     *  - favicon.ico / other files with extensions in the regex
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};

// Re-export so the cookie name lives next to the matcher for clarity.
export { AUTH_COOKIE_NAME };
