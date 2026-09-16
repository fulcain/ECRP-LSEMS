"use client";

import type { GuildIdentityRead } from "@/app/hooks/useGuildIdentity";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

/**
 * What a press of "Sync from Discord" / "Re-read from Discord" actually did.
 *
 * A refresh that *can't* happen is the one thing these panels must not hide.
 * The session cookie lives for a hundred years, so a member whose sign-in
 * predates the app storing a Discord refresh token would press the button for
 * the rest of their session, watch nothing change, and have no way to find out
 * why - which is exactly what "the button doesn't work" was. Every outcome
 * says itself now, and the one a member can act on comes with the action.
 */
export function SyncOutcomeNote({
  outcome,
  returnTo,
}: {
  outcome: GuildIdentityRead;
  /** Where a re-sign-in should come back to. */
  returnTo: string;
}) {
  const shell =
    "mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border px-3 py-2 text-xs";

  if (outcome.refreshed) {
    return (
      <p
        className={`${shell} border-emerald-400/20 bg-emerald-500/10 text-emerald-200`}
      >
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Roles re-read from Discord just now.
      </p>
    );
  }

  if (outcome.reason === "no-refresh-token") {
    return (
      <p
        className={`${shell} border-amber-400/25 bg-amber-500/10 text-amber-200`}
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span>
          Your sign-in is older than this feature, so Discord cannot be asked
          for your roles yet.
        </span>
        <Link
          href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
          className="font-semibold underline underline-offset-2 hover:text-amber-100"
        >
          Sign in again
        </Link>
        <span>to enable it.</span>
      </p>
    );
  }

  const explanation =
    outcome.reason === "left-guild"
      ? "Discord no longer shows you as a member of the server."
      : outcome.reason === "not-configured"
        ? "Discord is not configured on this deployment."
        : "Discord could not be reached.";

  return (
    <p className={`${shell} border-rose-400/25 bg-rose-500/10 text-rose-200`}>
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      {explanation} Your saved details are unchanged - try again in a moment.
    </p>
  );
}
