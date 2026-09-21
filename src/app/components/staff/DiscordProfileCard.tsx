"use client";

import { Button } from "@/components/ui/button";
import { SyncOutcomeNote } from "@/app/components/staff/SyncOutcomeNote";
import {
  useGuildIdentity,
  type GuildIdentityRead,
} from "@/app/hooks/useGuildIdentity";
import { ROUTES } from "@/configs/routes";
import { heldRoles, type HeldRole } from "@/lib/member-identity";
import { memberDisplayName } from "@/lib/member-name";
import { BadgeCheck, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

/** A small rounded tag for a Discord role the member holds. */
function RoleTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-indigo-300/25 dark:border-indigo-400/25 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-100">
      {children}
    </span>
  );
}

/**
 * One labelled run of role tags. The divider between this and the next group
 * is drawn by the caller, so the two groups read as one list split in two.
 */
function RoleGroup({
  label,
  roles,
  emptyNote,
}: {
  label: string;
  roles: readonly HeldRole[];
  emptyNote: string;
}) {
  return (
    <div>
      <p className="eyebrow flex items-center gap-2 text-muted-foreground">
        {label}
        <span className="rounded-full border border-border bg-surface/70 px-2 py-0.5 text-[11px] font-medium tracking-normal text-muted-foreground normal-case">
          {roles.length}
        </span>
      </p>
      {roles.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{emptyNote}</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {roles.map((role) => (
            <RoleTag key={role.alias}>{role.name}</RoleTag>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The member's Discord identity, read from their session.
 *
 * Everything here comes from the roles the app already fetches on every page
 * load, so the tab costs no extra Discord call. The rank the app resolves for
 * them rides in the header, right under the name it comes from; the list below
 * is the other half - which of their Discord roles it recognised to get there -
 * with the divisional roles split out, since those are the ones that say which
 * divisions the member is in.
 */
export function DiscordProfileCard() {
  const { user, identity, isLoading, error, refresh } = useGuildIdentity();
  const [syncing, setSyncing] = useState(false);
  /** What the last press of Re-read produced, or null before it is used. */
  const [syncOutcome, setSyncOutcome] = useState<GuildIdentityRead | null>(null);

  const roles = useMemo(() => heldRoles(user?.roles ?? []), [user]);

  // Cleaned, so a quoted nickname never reaches the header; `@username` beside
  // it is the account handle and is shown exactly as Discord reports it.
  const displayName = memberDisplayName(user);

  // Division roles are listed apart: a division's membership role is held by
  // all of its people, so this is where a rank-and-file member's division
  // shows up at all.
  const departmentRoles = roles.filter((role) => !role.isDivision);
  const divisionRoles = roles.filter((role) => role.isDivision);

  const handleSync = async () => {
    setSyncing(true);
    setSyncOutcome(null);
    try {
      // The result is reported, not assumed: a read Discord refuses has to be
      // visible, or the button reads as broken.
      setSyncOutcome(await refresh({ force: true }));
    } finally {
      setSyncing(false);
    }
  };

  const shell = "panel relative overflow-hidden";

  /** The page accent, as one line rather than a wash behind the content. */
  const backdrop = (
    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />
  );

  if (isLoading && !user) {
    return (
      <div className={shell}>
        {backdrop}
        <div className="relative space-y-4 p-5 lg:p-8">
          <div className="h-16 w-16 animate-pulse rounded-full bg-surface-hover" />
          <div className="h-4 w-48 animate-pulse rounded bg-surface-hover" />
          <div className="h-3 w-32 animate-pulse rounded bg-surface-hover/70" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={shell}>
        {backdrop}
        <div className="relative flex flex-col items-start gap-4 p-5 lg:p-8">
          <h2 className="text-xl font-semibold text-foreground">
            Discord Profile
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            {error
              ? "Your Discord profile could not be read. Signing in again usually fixes it."
              : "Sign in with Discord to see the account and roles this page reads your rank from."}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-md bg-[#5865F2] px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-[#4752c4]"
          >
            Sign in with Discord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      {backdrop}
      <div className="relative space-y-6 p-5 lg:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={displayName ?? "Discord avatar"}
                className="h-16 w-16 shrink-0 rounded-full ring-2 ring-indigo-400/30"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface-hover text-lg font-semibold text-muted-foreground ring-2 ring-indigo-400/20">
                {(displayName ?? user.username).slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-foreground">
                {displayName}
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                @{user.username}
              </p>
              {/* The one value the app reads off the roles, so it belongs with
                  the name rather than in a section of its own. */}
              <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-indigo-300/25 dark:border-indigo-400/25 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-100">
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-indigo-700 dark:text-indigo-300" />
                <span className="min-w-0 truncate">
                  {identity.rankLabel ?? "No rank detected"}
                </span>
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncing}
            className="whitespace-nowrap border-indigo-300/30 dark:border-indigo-400/30 bg-surface/40 text-indigo-800 dark:text-indigo-200 transition-all duration-200 hover:scale-[1.02] hover:border-indigo-300/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 active:scale-[0.98] disabled:opacity-60"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Checking Discord" : "Re-read from Discord"}
          </Button>
        </div>

        {syncOutcome && (
          <SyncOutcomeNote outcome={syncOutcome} returnTo={ROUTES.workspace.staff} />
        )}

        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
            Roles the app recognises
            <span className="rounded-full border border-border bg-surface/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {roles.length}
            </span>
          </h3>
          {roles.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              None of your Discord roles are in the registry yet.
            </p>
          ) : (
            <div className="mt-3 space-y-4">
              <RoleGroup
                label="Department"
                roles={departmentRoles}
                emptyNote="No department roles on your account."
              />
              <hr className="border-border" />
              <RoleGroup
                label="Divisions"
                roles={divisionRoles}
                emptyNote="Not in a division."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
