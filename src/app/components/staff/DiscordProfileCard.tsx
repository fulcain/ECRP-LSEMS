"use client";

import { Button } from "@/components/ui/button";
import { SyncOutcomeNote } from "@/app/components/staff/SyncOutcomeNote";
import {
  useGuildIdentity,
  type GuildIdentityRead,
} from "@/app/hooks/useGuildIdentity";
import { ROUTES } from "@/configs/routes";
import { heldRoles, type HeldRole } from "@/lib/member-identity";
import { BadgeCheck, Crown, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

/** One label/value line in the profile summary. */
function Fact({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 flex min-w-0 items-center gap-2 text-sm font-medium text-white">
        {icon}
        <span className="truncate">{value}</span>
      </p>
    </div>
  );
}

/** A small rounded tag for a Discord role the member holds. */
function RoleTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-100">
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
      <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
        {label}
        <span className="rounded-full border border-white/10 bg-slate-900/70 px-2 py-0.5 text-[11px] font-medium tracking-normal text-slate-400 normal-case">
          {roles.length}
        </span>
      </p>
      {roles.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500">{emptyNote}</p>
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
 * load, so the tab costs no extra Discord call. The two halves answer
 * different questions: what the app calls them (rank and director title) and
 * which of their Discord roles it recognised to get there - with the
 * divisional roles split out, since those are the ones that say which
 * divisions the member is in.
 */
export function DiscordProfileCard() {
  const { user, identity, isLoading, error, refresh } = useGuildIdentity();
  const [syncing, setSyncing] = useState(false);
  /** What the last press of Re-read produced, or null before it is used. */
  const [syncOutcome, setSyncOutcome] = useState<GuildIdentityRead | null>(null);

  const roles = useMemo(() => heldRoles(user?.roles ?? []), [user]);

  const displayName = user
    ? (user.nick ?? user.globalName ?? user.username)
    : null;

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

  const shell =
    "relative overflow-hidden rounded-[2rem] border border-indigo-500/20 bg-slate-950/80 shadow-2xl shadow-indigo-950/30";

  const backdrop = (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(88,101,242,0.10),_transparent_36%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsla(0,0%,100%,0.1) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
    </>
  );

  if (isLoading && !user) {
    return (
      <div className={shell}>
        {backdrop}
        <div className="relative space-y-4 p-5 lg:p-8">
          <div className="h-16 w-16 animate-pulse rounded-full bg-slate-800" />
          <div className="h-4 w-48 animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-32 animate-pulse rounded bg-slate-800/70" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={shell}>
        {backdrop}
        <div className="relative flex flex-col items-start gap-4 p-5 lg:p-8">
          <h2 className="text-xl font-semibold text-white">
            Discord Profile
          </h2>
          <p className="max-w-xl text-sm text-slate-400">
            {error
              ? "Your Discord profile could not be read. Signing in again usually fixes it."
              : "Sign in with Discord to see the account and roles this page reads your rank from."}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-md bg-[#5865F2] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4752c4]"
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
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-slate-300 ring-2 ring-indigo-400/20">
                {(displayName ?? user.username).slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-white">
                {displayName}
              </h2>
              <p className="truncate text-sm text-slate-400">
                @{user.username}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncing}
            className="whitespace-nowrap border-indigo-400/30 bg-slate-900/40 text-indigo-200 transition-all duration-200 hover:scale-[1.02] hover:border-indigo-300/50 hover:bg-indigo-950/30 active:scale-95 disabled:opacity-60"
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
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <BadgeCheck className="h-4 w-4 text-indigo-300" />
            What the app reads from your roles
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            The same values the Staff Settings tab fills in for you. Which
            divisions those roles put you in is split out below.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Fact
              label="Rank"
              value={identity.rankLabel ?? "No rank detected"}
            />
            <Fact
              label="Director"
              value={identity.directorTitle ?? "Not a director"}
              icon={
                identity.directorTitle ? (
                  <Crown className="h-3.5 w-3.5 text-violet-300" />
                ) : undefined
              }
            />
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-indigo-300" />
            Roles the app recognises
            <span className="rounded-full border border-white/10 bg-slate-900/70 px-2 py-0.5 text-[11px] font-medium text-slate-400">
              {roles.length}
            </span>
          </h3>
          {roles.length === 0 ? (
            <p className="mt-2 text-xs text-slate-400">
              None of your Discord roles are in the registry yet.
            </p>
          ) : (
            <div className="mt-3 space-y-4">
              <RoleGroup
                label="Department"
                roles={departmentRoles}
                emptyNote="No department roles on your account."
              />
              <hr className="border-white/10" />
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
