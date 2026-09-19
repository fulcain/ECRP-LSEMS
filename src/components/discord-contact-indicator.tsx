import React from "react";
import { SUPPORT_CONTACT } from "@/configs/contact";
import { DiscordIcon } from "@/components/icons/discord-icon";

type DiscordContactIndicatorProps = {
  /** Defaults to the declared support contact - pass one only to override it. */
  handle?: string;
  variant?: "pill" | "icon";
  label?: string;
  iconClassName?: string;
  className?: string;
};

export function DiscordContactIndicator({
  handle = SUPPORT_CONTACT.handle,
  variant = "pill",
  label,
  iconClassName,
  className,
}: DiscordContactIndicatorProps) {
  const accessibleLabel =
    label ?? `Problems? DM ${handle} on Discord`;

  if (variant === "icon") {
    return (
      <div
        title={accessibleLabel}
        aria-label={accessibleLabel}
        className={
          "flex justify-center rounded-lg p-2 text-indigo-400/80 transition-colors hover:text-indigo-300" +
          (className ? ` ${className}` : "")
        }
      >
        <DiscordIcon className={iconClassName ?? "h-4 w-4"} />
      </div>
    );
  }

  return (
    <div
      className={
        "flex items-center gap-2.5 rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-[11px] text-muted-foreground transition-colors hover:border-indigo-500/20 hover:bg-indigo-500/5" +
        (className ? ` ${className}` : "")
      }
    >
      <DiscordIcon
        className={
          iconClassName ?? "h-3.5 w-3.5 shrink-0 text-indigo-400/80"
        }
      />
      <span className="truncate">
        <span className="font-medium text-muted-foreground">{handle}</span>
      </span>
    </div>
  );
}
