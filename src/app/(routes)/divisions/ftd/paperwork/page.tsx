"use client";
import { PaperworkTypeSelector } from "@/app/(routes)/divisions/ftd/paperwork/components/PaperworkTypeSelector";

/** Content only: the FTD section layout owns the container and the heading. */
export default function Home() {
  return (
    <div className="space-y-6">
      <blockquote className="border-l-2 border-primary/40 pl-4 text-sm italic text-muted-foreground">
        <p>"Ignorance is curable through education, but stupid lasts forever."</p>
        <footer className="mt-1 text-xs not-italic">- Carter Bulfinch · 14/OCT/2026</footer>
      </blockquote>
      <PaperworkTypeSelector />
    </div>
  );
}
