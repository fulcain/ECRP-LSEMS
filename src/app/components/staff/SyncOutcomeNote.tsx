"use client";

import type { GuildIdentityRead } from "@/app/hooks/useGuildIdentity";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * What a press of "Sync from Discord" / "Re-read from Discord" actually did.
 *
 * A refresh that *can't* happen is the one thing these panels must not hide.
 * The session cookie lives for a hundred years, so a member whose sign-in
 * predates the app storing a Discord refresh token - or whose stored token
 * Discord has retired - would press the button for the rest of their session,
 * watch nothing change, and have no way to find out why - which is exactly what
 * "the button doesn't work" was. Every outcome says itself now, and the ones a
 * member can act on come with the action.
 */
/**
 * A session that can't re-read its own roles, with the one action that fixes
 * it.
 *
 * The link goes through the OAuth route rather than `/login`: the authorize URL
 * asks Discord with `prompt=none`, so a member still signed into Discord comes
 * straight back with a fresh session and a new refresh token without seeing a
 * sign-in screen at all. It is a plain `<a>` on purpose - this is a redirect
 * dance through Discord and two API routes, not a client-side navigation - and
 * the wording says in as many words that nobody has been signed out, because
 * "your sign-in cannot be re-read" reads as "you were logged out" otherwise.
 */
function ReconnectNotice({
  shell,
  message,
  action,
  returnTo,
}: {
  shell: string;
  message: string;
  action: string;
  returnTo: string;
}) {
  return (
    <p className={`${shell} border-amber-400/25 bg-amber-500/10 text-amber-200`}>
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span>
        {message} You are still signed in - only this re-read needs one.
      </span>
      <a
        href={`/api/auth/discord/login?returnTo=${encodeURIComponent(returnTo)}`}
        className="font-semibold underline underline-offset-2 hover:text-amber-100"
      >
        Reconnect
      </a>
      <span>{action}</span>
    </p>
  );
}

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

  if (outcome.refreshed && outcome.carried) {
    // The session survived but Discord was not read, so claiming a re-read here
    // would be the same lie as a silent failure: say what actually happened.
    return (
      <p className={`${shell} border-amber-400/25 bg-amber-500/10 text-amber-200`}>
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        Your session was renewed, but Discord could not be read this time, so
        the details below are the last ones it answered with.
      </p>
    );
  }

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
      <ReconnectNotice
        shell={shell}
        message="Your sign-in is older than this feature, so Discord cannot be asked for your roles yet."
        action="to enable it."
        returnTo={returnTo}
      />
    );
  }

  // A retired refresh token is permanent for this session, exactly like the
  // missing one above - so it gets the same way out rather than "try again".
  if (outcome.reason === "session-expired") {
    return (
      <ReconnectNotice
        shell={shell}
        message="Discord has retired this sign-in's token, so your roles cannot be re-read any more."
        action="to renew it."
        returnTo={returnTo}
      />
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
