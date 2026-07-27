"use client";

import { BodyAndMainTitle } from "@/components/layout/main-and-title";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <BodyAndMainTitle
      title="404 - Page Not Found"
      description="The page you are looking for does not exist or has been moved."
    >
      <div className="relative mx-auto max-w-md overflow-hidden rounded-[2rem] border border-red-500/20 bg-slate-950/80 shadow-2xl shadow-red-950/30">
        {/* Gradient orbs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.12),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(220,38,38,0.08),_transparent_34%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsla(0,0%,100%,0.1) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative flex flex-col items-center gap-6 p-8 text-center">
          {/* Large 404 */}
          <div className="select-none text-[6rem] font-black leading-none tracking-tighter text-white/10 sm:text-[8rem]">
            404
          </div>

          {/* Glitch-like secondary indicator */}
          <div className="-mt-14 text-sm font-semibold tracking-[0.3em] text-red-400/70 uppercase sm:text-base">
            Page Not Found
          </div>

          {/* Description */}
          <p className="max-w-xs text-sm leading-relaxed text-slate-400">
            The link you followed might be broken, or the page may have been
            removed.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/">
              <Button className="bg-red-600 text-white transition-all duration-200 hover:scale-[1.03] hover:bg-red-500 active:scale-95">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </BodyAndMainTitle>
  );
}
