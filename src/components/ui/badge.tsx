import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "muted" | "accent" | "success" | "warning";
  className?: string;
};

const variants = {
  default: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20",
  muted: "bg-surface-hover text-muted-foreground ring-1 ring-inset ring-border/50",
  accent: "bg-accent/10 text-accent ring-1 ring-inset ring-accent/20",
  success: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-300/20 dark:ring-emerald-500/20",
  warning: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-300/20 dark:ring-amber-500/20",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}