"use client";

import {
  emptyMemberIdentity,
  resolveMemberIdentity,
  type MemberIdentity,
} from "@/lib/member-identity";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/** Shape of /api/auth/me's `user` payload. */
export interface GuildUser {
  discordId: string;
  username: string;
  globalName: string | null;
  nick: string | null;
  avatar: string | null;
  avatarUrl: string | null;
  roles: string[];
}

/**
 * Why a read could not refresh the member's roles.
 *
 * "no-refresh-token" is the one a member can act on: their session was minted
 * before the app stored a Discord refresh token, so nothing will re-read their
 * roles until they sign in again.
 */
export type GuildRefreshFailureReason =
  | "no-refresh-token"
  | "throttled"
  | "not-configured"
  | "left-guild"
  | "discord-error"
  | "request-failed";

/**
 * What one read of the member's roles produced.
 *
 * A caller that wants to act on the answer - the Staff Page copying Discord's
 * values onto its saved credentials - reads it here rather than off the hook's
 * state, which only holds the value from the render it closed over.
 */
export interface GuildIdentityRead {
  /**
   * True only when Discord was actually asked and answered. False means the
   * read failed or the visitor is signed out, and the identity below is empty
   * - callers must not treat that as "the member has no roles".
   */
  answered: boolean;
  /** False when Discord could not be asked, so nothing new was learned. */
  refreshed: boolean;
  /** Why nothing new was learned, or null when the read succeeded. */
  reason: GuildRefreshFailureReason | null;
  /** The resolved identity for this read. */
  identity: MemberIdentity;
  /** The Discord profile this read carried, or null when there was none. */
  user: GuildUser | null;
}

export interface GuildIdentityState {
  /** Rank, division ranks and director title resolved from the member's roles. */
  identity: MemberIdentity;
  /**
   * The raw Discord profile the session carries - name, avatar, snowflake and
   * role ids - or null when signed out. The identity above is derived from it.
   */
  user: GuildUser | null;
  /** True until the first /api/auth/me request settles. */
  isLoading: boolean;
  /** Error from the fetch, or null on success. */
  error: Error | null;
  /**
   * Re-read the member's roles. `force` asks `/api/auth/refresh`, which asks
   * Discord on every call rather than answering from cache, so a role granted
   * - or removed - a moment ago is reflected immediately.
   */
  refresh: (options?: { force?: boolean }) => Promise<GuildIdentityRead>;
}

/**
 * The signed-in member's Discord roles, resolved into the app's own ranks.
 *
 * Roles ride in the session (`guilds.members.read` at login, refreshed by the
 * middleware on every page load), so this is one request and no Discord call
 * of its own. It asks for a current read (`?refresh=1`) rather than a recent
 * one: a rank added since the last visit should be visible when the page it
 * affects is opened, not after the background interval has passed.
 */
export function useGuildIdentity(): GuildIdentityState {
  const router = useRouter();

  const [state, setState] = useState<{
    identity: MemberIdentity;
    user: GuildUser | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    identity: emptyMemberIdentity,
    user: null,
    isLoading: true,
    error: null,
  });

  // Lets an in-flight request be abandoned when a newer one starts (a manual
  // refresh while the initial load is still going).
  const requestRef = useRef(0);

  // The roles the last answer carried, so a re-read can tell whether anything
  // actually moved and only pay for a re-render when it did.
  const rolesRef = useRef<string[] | null>(null);

  const load = useCallback(
    async (force: boolean): Promise<GuildIdentityRead> => {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      const failure = (
        reason: GuildRefreshFailureReason,
      ): GuildIdentityRead => ({
        answered: false,
        refreshed: false,
        reason,
        identity: emptyMemberIdentity,
        user: null,
      });

      const settle = (
        identity: MemberIdentity,
        user: GuildUser | null,
        error: Error | null,
      ): void => {
        if (requestRef.current !== requestId) return;
        setState({ identity, user, isLoading: false, error });
      };

      try {
        // A forced read goes through /api/auth/refresh, which re-fetches the
        // member from Discord before answering. The initial read asks
        // /api/auth/me for a current one (`?refresh=1`) instead of a recent one,
        // so opening a page picks up a role granted a moment ago. Both
        // endpoints return the same `user` shape.
        const res = force
          ? await fetch("/api/auth/refresh", { method: "POST" })
          : await fetch("/api/auth/me?refresh=1", { cache: "no-store" });
        if (!res.ok) {
          // 401 = signed out, anything else = unexpected. Either way we surface
          // "nothing detected" rather than throwing, so every tool that reads a
          // rank stays usable with hand-entered values.
          settle(emptyMemberIdentity, null, null);
          return failure("request-failed");
        }

        const data = (await res.json()) as {
          user: GuildUser | null;
          refreshed?: boolean;
          reason?: GuildRefreshFailureReason | null;
        };
        const user = data.user ?? null;
        const roles = user?.roles ?? [];
        rolesRef.current = roles;

        const identity = resolveMemberIdentity(roles);
        settle(identity, user, null);

        // The sidebar, the division tabs and the route gates are *server*
        // decisions, rendered from the cookie this call just re-signed - a
        // client state change cannot reach them. So a read that actually
        // happened re-renders the route; otherwise a section the member just
        // gained (or lost) stays wrong until they navigate or sign in again.
        //
        // Deliberately not conditional on the roles differing: a repaint is
        // what the member asked for, and "did anything change" is not the only
        // reason the server-rendered shell can be stale.
        if (force && data.refreshed) router.refresh();

        return {
          answered: user !== null,
          refreshed: data.refreshed ?? false,
          reason: data.refreshed ? null : (data.reason ?? "request-failed"),
          identity,
          user,
        };
      } catch (err) {
        settle(
          emptyMemberIdentity,
          null,
          err instanceof Error ? err : new Error(String(err)),
        );
        return failure("discord-error");
      }
    },
    [router],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  const refresh = useCallback(
    async (options?: { force?: boolean }) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      // A forced read is never answered from cache: `/api/auth/refresh` asks
      // Discord on every press, so a role removed a second ago is gone.
      return await load(Boolean(options?.force));
    },
    [load],
  );

  return { ...state, refresh };
}
