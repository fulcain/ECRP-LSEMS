import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /** Small line above the title. Same wording on every page by default. */
  eyebrow?: string;
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
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-8 border-b border-slate-800/80 pb-6", className)}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">
        {eyebrow}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          {subtitle}
        </p>
      )}
    </header>
  );
}
