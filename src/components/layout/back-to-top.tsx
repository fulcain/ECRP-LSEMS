"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 320);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label="Go to top"
      title="Go to top"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-[60] rounded-full bg-background/90 shadow-lg backdrop-blur-sm"
      onClick={() => {
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth";
        window.scrollTo({ top: 0, behavior });
      }}
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
}
