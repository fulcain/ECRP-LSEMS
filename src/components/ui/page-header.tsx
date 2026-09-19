import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /** Small line above the title. Same wording on every page by default. */
  eyebrow?: string;
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
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="eyebrow mb-2 text-primary/80">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
