import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * Shared JWT TTL + issuer/audience. Centralized so cookie expiry, token
 * expiry, and the trust bound can't drift apart.
 */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 365 * 100;
const ISSUER = "ftd-app";
const AUDIENCE = "ftd-app-web";

export interface FtdJwtPayload extends JWTPayload {
  discordId: string;
  username: string;
  globalName?: string;
  nick?: string;
  avatar: string | null;
  roles: string[];
  /**
   * Discord OAuth refresh token, minted at login and reused to silently
   * re-fetch the user's profile/roles when the session goes stale. It
   * rides inside the same httpOnly cookie as the rest of the JWT, so it
   * inherits the cookie's protection. Optional because sessions signed
   * before this field existed must still verify.
   */
  refreshToken?: string;
}

const ALG = "HS256";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET env var is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  payload: Omit<FtdJwtPayload, "iat" | "exp">,
): Promise<string> {
  return await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: ALG })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<FtdJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [ALG],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (
      typeof payload.discordId === "string" &&
      typeof payload.username === "string" &&
      Array.isArray(payload.roles)
    ) {
      return payload as FtdJwtPayload;
    }
    return null;
  } catch {
    return null;
  }
}
