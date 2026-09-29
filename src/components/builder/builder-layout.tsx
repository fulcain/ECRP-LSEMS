import * as React from "react";
import { AlertTriangle, Copy, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * The one shape every builder in the app shares, taken from the LOA form the
 * supervisor and the templates page both use: what you are filling in on the
 * left, what it will post on the right.
 *
 * The look lives here and nowhere else. A builder that paints its own panels,
 * fills its own copy button with a brand colour or lays its preview out its own
 * way is what made two divisions' paperwork read as two different apps - so a
 * builder picks a section, a field, an output block and an action row from this
 * file instead of writing the markup again.
 */

/** A lucide icon, or an element when the caller already sized its own. */
type BuilderIcon = React.ReactNode | React.ComponentType<{ className?: string }>;

function BuilderIconSlot({ icon }: { icon?: BuilderIcon }) {
  if (!icon) return null;
  if (React.isValidElement(icon)) return <>{icon}</>;
  const Icon = icon as React.ComponentType<{ className?: string }>;
  return <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

/**
 * The two columns: what you are filling in on the left, the post it produces on
 * the right. A builder whose output is copied from somewhere else renders the
 * form column on its own instead.
 */
export function BuilderShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {children}
    </div>
  );
}

/** The left column: one card per question, in the order they are asked. */
export function BuilderForm({ children }: { children: React.ReactNode }) {
  return <div className="space-y-5">{children}</div>;
}

/**
 * One card of the form, with the question it answers as its heading. The hint
 * sits under the heading rather than under the fields, where it is read before
 * the member starts filling them in.
 */
export function BuilderSection({
  icon,
  title,
  hint,
  actions,
  children,
  className,
}: {
  icon?: BuilderIcon;
  title: string;
  hint?: string;
  /** Small controls right of the heading, e.g. a reset button. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface/90 p-5",
        className,
      )}
    >
      <div className={cn("flex items-center gap-2", hint ? "mb-2" : "mb-4")}>
        <BuilderIconSlot icon={icon} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {actions && <div className="ml-auto">{actions}</div>}
      </div>
      {hint && (
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** A label, its field, and the line explaining the field. */
export function BuilderField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  /** How the field is filled in - a format, a unit, where the value is used. */
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && (
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

/** The right-hand column: the post as it will be written, and its actions. */
export function BuilderPreview({
  icon,
  title = "Post Preview",
  badge,
  children,
  actions,
  note,
}: {
  icon?: BuilderIcon;
  title?: string;
  /** The document's own name, e.g. the format this post is written to. */
  badge?: React.ReactNode;
  children: React.ReactNode;
  /** The buttons that copy or open the post, in a row under the body. */
  actions?: React.ReactNode;
  /** One line under the actions saying what they do. */
  note?: React.ReactNode;
}) {
  return (
    <div className="h-fit rounded-2xl border border-border bg-surface/90">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <BuilderIconSlot icon={icon} />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {badge && (
          <span className="chip rounded-lg px-2.5 py-1 text-[10px] font-medium">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-4 p-5">
        {children}
        {actions && (
          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            {actions}
          </div>
        )}
        {note && (
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * The thread title the post will carry, with the button that copies it on its
 * own - a GOV post takes the title and the body as two separate fields.
 */
export function BuilderTitleRow({
  label = "Post Title",
  value,
  onCopy,
  copyLabel = "Copy title",
  disabled,
}: {
  label?: string;
  value: string;
  onCopy?: () => void;
  copyLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {onCopy && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCopy}
            disabled={disabled}
            className="h-7 px-2 text-[10px]"
          >
            <Copy className="h-3 w-3" />
            {copyLabel}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-hover/50 px-3 py-2.5">
        <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate font-mono text-xs text-foreground">
          {value}
        </span>
      </div>
    </div>
  );
}

/** The generated BBCode, shown as it will be pasted. */
export function BuilderOutput({
  label = "Template Body",
  value,
  className,
}: {
  label?: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <Label className="mb-2 block text-xs text-muted-foreground">
        {label}
      </Label>
      <pre
        className={cn(
          "max-h-[600px] min-h-[320px] overflow-auto rounded-xl border border-border bg-background/50 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground",
          className,
        )}
      >
        {value}
      </pre>
    </div>
  );
}

/**
 * Why the copy buttons are disabled. Every builder that requires something
 * before it can generate says so in the same place, in the same words.
 */
export function BuilderRequirement({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] text-amber-600/90 dark:text-amber-400/90">
      <AlertTriangle className="h-3 w-3 shrink-0" />
      {children}
    </p>
  );
}
