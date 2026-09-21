"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  getText: () => string;
  label?: string;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "ghost" | "gradient";
  className?: string;
};

export function CopyButton({
  getText,
  label = "Copy",
  size = "sm",
  variant = "default",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // silently fail
    }
  }, [getText]);

  return (
    <Button
      size={size}
      variant={copied ? "ghost" : variant}
      onClick={handleCopy}
      className={cn(
        "transition-all duration-200",
        copied && "text-emerald-600 dark:text-emerald-400 hover:text-emerald-300",
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}