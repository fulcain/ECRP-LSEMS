"use client";

import { HeaderMobile } from "./components/header-mobile";
import { HeaderDesktop } from "./components/header-desktop";
import { headerLinks } from "@/components/layout/header/configs/HeaderLinks";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-gradient-header bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 pointer-events-none" />
      
      {/* Subtle glow line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px animate-border-glow bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      
      {/* Main content */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <HeaderDesktop headerLinks={headerLinks} />
        <HeaderMobile headerLinks={headerLinks} />
        
        {/* Logo with floating animation and glow */}
        <Link
          href="/"
          className="group relative flex items-center gap-3"
        >
          {/* Pulse ring behind logo */}
          <div className="absolute -inset-2 rounded-full bg-blue-500/20 animate-pulse-ring" />
          
          {/* Logo with float and glow */}
          <div className="relative animate-logo-float">
            <Image
              src="https://i.ibb.co/hFgqLTmk/General.png"
              alt="LSEMS Logo"
              width={50}
              height={50}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          
          {/* Brand text with shimmer effect */}
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold animate-shimmer-text">
              LSEMS
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 transition-colors group-hover:text-slate-300">
              Emergency Medical Services
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
