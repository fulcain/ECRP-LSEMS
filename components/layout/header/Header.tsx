"use client";

import { HeaderDesktop } from "@/components/layout/header/components/HeaderDesktop";
import { HeaderMobile } from "@/components/layout/header/components/HeaderMobile";
import { headerLinks } from "@/components/layout/header/configs/HeaderLinks";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-slate-800 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <HeaderDesktop headerLinks={headerLinks} />
        <HeaderMobile headerLinks={headerLinks} />
        <Link
          href="/"
          className="text-lg font-semibold text-white transition-colors hover:text-slate-300"
        >
          <Image
            src="https://i.ibb.co/hFgqLTmk/General.png"
            alt="logo"
            width={50}
            height={50}
          />
        </Link>
      </div>
    </header>
  );
}
