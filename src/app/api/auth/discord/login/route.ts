import { NextResponse, type NextRequest } from "next/server";
import { buildDiscordAuthorizeUrl } from "@/lib/discord";
import { signOAuthState, readRequiredEnv } from "@/app/api/auth/_helpers";
import { DEFAULT_RETURN_TO } from "@/lib/cookies";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/discord/login?returnTo=<path>
 *
 * 1. Validates that DISCORD_CLIENT_ID + DISCORD_REDIRECT_URI are set.
 * 2. Builds a CSRF `state` token (HMAC-signed JSON containing returnTo +
 *    nonce + timestamp) and stashes it in a short-lived cookie so the
 *    callback can verify it.
 * 3. 302-redirects the browser to Discord's authorize URL.
 *
 * If `returnTo` is missing or not a same-origin path, we default to
 * `DEFAULT_RETURN_TO`.
 */
export async function GET(req: NextRequest) {
  try {
    const clientId = readRequiredEnv("DISCORD_CLIENT_ID");
    const redirectUri = readRequiredEnv("DISCORD_REDIRECT_URI");
    const guildId = readRequiredEnv("DISCORD_GUILD_ID");

    const requestedReturn =
      req.nextUrl.searchParams.get("returnTo") ?? DEFAULT_RETURN_TO;
    const safeReturnTo =
      requestedReturn.startsWith("/") &&
      !requestedReturn.startsWith("//")
        ? requestedReturn
        : DEFAULT_RETURN_TO;

    const stateToken = await signOAuthState({
      returnTo: safeReturnTo,
      guildId,
    });

    const authorizeUrl = buildDiscordAuthorizeUrl({
      clientId,
      redirectUri,
      state: stateToken,
    });

    const res = NextResponse.redirect(authorizeUrl);

    // Short-lived cookie used by the callback for CSRF checks.
    res.cookies.set("ftd_oauth_state", stateToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10, // 10 minutes - enough to complete the OAuth bounce
    });

    return res;
  } catch (err) {
    console.error("[discord/login]", err);
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("error", "config");
    return NextResponse.redirect(url);
  }
}
