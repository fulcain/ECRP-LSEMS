"use client";

import { useEffect, useState } from "react";
import { LogOut, MessageCircle, User as UserIcon } from "lucide-react";
import Link from "next/link";

interface MeResponseUser {
  discordId: string;
  username: string;
  globalName: string | null;
  nick: string | null;
  avatar: string | null;
  avatarUrl: string | null;
  roles: string[];
}

export function UserMenu() {
  const [user, setUser] = useState<MeResponseUser | null | undefined>(
    undefined,
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (user === undefined) {
    return <div className="h-9 w-9 rounded-full bg-slate-700 animate-pulse" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#5865F2] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4752c4]"
        title="Sign in with Discord"
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">Sign in</span>
      </Link>
    );
  }

  const displayName = user.nick ?? user.globalName ?? user.username;

  return (
    <div className="flex w-full min-w-0 flex-col gap-2.5">
      {/* The name owns its own row: sharing one with the Sign out button left it
          roughly 80px of a 236px column, so anything longer than a short
          nickname was clipped. It is also sized off the sidebar's own width,
          never a viewport breakpoint - the column is a fixed 256px and the
          mobile sheet 320px, so `sm:` hid the name at exactly those sizes. */}
      <div className="flex w-full min-w-0 items-center gap-2.5">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={displayName}
            className="h-9 w-9 shrink-0 rounded-full ring-2 ring-slate-700"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700">
            <UserIcon className="h-4 w-4 text-slate-300" />
          </div>
        )}
        <span
          className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-tight text-white"
          title={displayName}
        >
          {displayName}
        </span>
      </div>
      <form action="/api/auth/logout" method="post" className="w-full">
        <button
          type="submit"
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          title="Sign out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">Sign out</span>
        </button>
      </form>
    </div>
  );
}
