import { cn } from "@/lib/utils";
import Image from "next/image";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /**
   * Small line above the title. Same wording on every page by default; a
   * division workspace passes its emblem and name instead of a string.
   */
  eyebrow?: React.ReactNode;
  /** Department or division mark shown beside the heading. */
  mark?: React.ReactNode;
  /**
   * Primary page actions, rendered on the right on wide screens and stacked
   * under the title otherwise. A page-level action belongs here rather than
   * floating somewhere in the body, so it is always in the same place.
   */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * The one page heading in the app: every route renders exactly one of these,
 * directly inside `PageContainer` and above anything else on the page (tabs
 * included), so a title always sits in the same place at the same size.
 *
 * Left-aligned on purpose - it lines up with the page content and the tab rows
 * beneath it, which a centred heading cannot do.
 */
export function PageHeader({
  title,
  subtitle,
  eyebrow = "LSEMS Operations",
  mark = (
    <Image
      src="/General.png"
      alt=""
      width={40}
      height={40}
      className="h-9 w-9 object-contain"
      priority
    />
  ),
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "relative isolate mb-6 flex flex-col gap-4 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-surface/95 via-surface/80 to-surface-raised/70 p-4 shadow-[0_18px_48px_-38px_color-mix(in_oklch,var(--primary)_48%,transparent)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between sm:p-5",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#a43e38] via-primary/80 to-[#c5a05f]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-24 z-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
      />
      <div className="relative z-10 flex min-w-0 items-start gap-3.5 sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#a43e38]/20 bg-[#a43e38]/[0.06] shadow-inner sm:h-14 sm:w-14">
          {mark}
        </div>
        <div className="min-w-0">
          <p className="eyebrow mb-1.5 text-primary/80">{eyebrow}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="relative z-10 flex shrink-0 flex-wrap items-center gap-2 sm:pl-4">
          {actions}
        </div>
      )}
    </header>
  );
}
