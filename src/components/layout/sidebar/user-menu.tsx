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
        className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-[#5865F2] hover:bg-[#4752c4] text-white text-sm font-semibold px-3 py-2 transition-colors"
        title="Sign in with Discord"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    );
  }

  const displayName = user.nick ?? user.globalName ?? user.username;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={displayName}
            className="h-9 w-9 rounded-full ring-2 ring-slate-700"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-slate-300" />
          </div>
        )}
        <div className="hidden sm:flex flex-col leading-tight">
          <span className="text-sm font-semibold text-white">
            {displayName}
          </span>
        </div>
      </div>
      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-3 py-2 transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </form>
    </div>
  );
}
