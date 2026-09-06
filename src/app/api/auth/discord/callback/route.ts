import { NextResponse, type NextRequest } from "next/server";
import {
  exchangeCodeForToken,
  fetchDiscordUser,
  fetchGuildMember,
} from "@/lib/discord";
import {
  verifyOAuthState,
  signAndSetSessionCookie,
  readRequiredEnv,
} from "@/app/api/auth/_helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/discord/callback?code=<…>&state=<…>
 *
 * Called by Discord after the user authorizes.
 *   1. Verify `state` matches the cookie we set in /login.
 *   2. Exchange `code` for an access_token.
 *   3. Fetch user (/users/@me).
 *   4. Fetch guild-member (/users/@me/guilds/{GUILD_ID}/member).
 *      — 404 here means the user is not in our guild → `/unauthorized`.
 *   5. Mint a JWT with the user's identity and roles.
 *   6. Set it as httpOnly `ftd_auth` cookie, redirect to `returnTo`.
 */
export async function GET(req: NextRequest) {
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";

  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const errorParam = req.nextUrl.searchParams.get("error");

    if (errorParam) {
      loginUrl.searchParams.set("error", errorParam);
      return redirectClearingState(loginUrl);
    }
    if (!code || !state) {
      loginUrl.searchParams.set("error", "missing_params");
      return redirectClearingState(loginUrl);
    }

    const clientId = readRequiredEnv("DISCORD_CLIENT_ID");
    const clientSecret = readRequiredEnv("DISCORD_CLIENT_SECRET");
    const redirectUri = readRequiredEnv("DISCORD_REDIRECT_URI");
    const guildId = readRequiredEnv("DISCORD_GUILD_ID");

    // 1. State check.
    const stateData = await verifyOAuthState(state);
    if (!stateData || stateData.guildId !== guildId) {
      loginUrl.searchParams.set("error", "bad_state");
      return redirectClearingState(loginUrl);
    }

    // 2. Exchange code.
    const tokenResp = await exchangeCodeForToken({
      clientId,
      clientSecret,
      redirectUri,
      code,
    });

    // 3 + 4. Fetch user and guild-member in parallel.
    const [user, member] = await Promise.all([
      fetchDiscordUser(tokenResp.access_token),
      fetchGuildMember(tokenResp.access_token, guildId),
    ]);

    if (!member) {
      const notInGuild = req.nextUrl.clone();
      notInGuild.pathname = "/unauthorized";
      notInGuild.search = "";
      notInGuild.searchParams.set("path", stateData.returnTo);
      notInGuild.searchParams.set("reason", "not_in_guild");
      return redirectClearingState(notInGuild);
    }

    // 5 + 6. Sign JWT cookie + redirect. The refresh token rides along
    // in the JWT so `/api/auth/me` can silently re-fetch profile/roles
    // when the session goes stale.
    await signAndSetSessionCookie({
      discordId: user.id,
      username: user.username,
      globalName: user.global_name ?? undefined,
      nick: member.nick ?? undefined,
      avatar: user.avatar,
      roles: member.roles,
      refreshToken: tokenResp.refresh_token,
    });

    const dest = req.nextUrl.clone();
    dest.pathname = stateData.returnTo.startsWith("/")
      ? stateData.returnTo
      : "/";
    dest.search = "";
    return redirectClearingState(dest);
  } catch (err) {
    console.error("[discord/callback]", err);
    loginUrl.searchParams.set("error", "callback_failed");
    return redirectClearingState(loginUrl);
  }
}

function redirectClearingState(dest: URL): NextResponse {
  const res = NextResponse.redirect(dest);
  res.cookies.set("ftd_oauth_state", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
