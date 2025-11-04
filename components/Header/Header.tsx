"use client";

import { HeaderDesktop } from "@/components/Header/components/HeaderDesktop";
import { HeaderMobile } from "@/components/Header/components/HeaderMobile";
import { headerLinks } from "@/components/Header/configs/HeaderLinks";
import Link from "next/link";
import React from "react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-slate-800 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-semibold text-white transition-colors hover:text-slate-300"
        >
          LSEMS
        </Link>
        <HeaderDesktop headerLinks={headerLinks} />
        <HeaderMobile headerLinks={headerLinks} />
      </div>
    </header>
  );
}
