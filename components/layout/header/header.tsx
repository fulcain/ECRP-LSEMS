"use client";

import { HeaderMobile } from "./components/header-mobile";
import { HeaderDesktop } from "./components/header-desktop";
import { headerLinks } from "@/components/layout/header/configs/HeaderLinks";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <HeaderDesktop headerLinks={headerLinks} />
        <HeaderMobile headerLinks={headerLinks} />

        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <Image
            src="https://i.ibb.co/hFgqLTmk/General.png"
            alt="LSEMS home"
            width={34}
            height={34}
            className="rounded-lg object-contain transition-transform group-hover:scale-105"
          />
          <span className="hidden text-sm font-semibold tracking-wide text-slate-200 sm:block">LSEMS</span>
        </Link>
      </div>
    </header>
  );
}
