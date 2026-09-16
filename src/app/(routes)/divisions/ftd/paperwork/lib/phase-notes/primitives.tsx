"use client";

import { Button } from "@/components/ui/button";
import {
  AlertOctagon,
  AlertTriangle,
  ChevronDown,
  ClipboardList,
  Info,
  ChevronsRight,
  type LucideIcon,
  Copy,
} from "lucide-react";
import * as React from "react";
import { toast } from "react-toastify";

function getText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getText).join("");
  }

if (React.isValidElement(node)) {
  return getText((node.props as { children?: React.ReactNode }).children);
}

  return "";
}

export function EyebrowLabel({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-medium text-[#800000]/90 dark:text-rose-300/80">
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      <span>{children}</span>
    </div>
  );
}

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 mb-2 flex items-center gap-3 first:mt-0">
      <span
        aria-hidden
        className="h-5 w-1.5 rounded-sm bg-[#800000] dark:bg-rose-400"
      />
      <h4 className="text-sm font-semibold uppercase tracking-wider text-[#800000] dark:text-rose-300">
        {children}
      </h4>
    </div>
  );
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="text-sm font-medium text-foreground/90 mt-2 mb-1.5">
      {children}
    </h5>
  );
}

export function BulletList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="my-2 ml-0 list-none space-y-1.5 [&_ul]:mt-1.5 [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:list-none">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(
          child as React.ReactElement<{ markerIcon?: LucideIcon }>,
          { markerIcon: ChevronsRight  },
        );
      })}
    </ul>
  );
}

export function NumberedList({ children }: { children: React.ReactNode }) {
  return (
    <ol className="my-2 ml-1 space-y-1.5 pl-6 list-outside marker:font-semibold marker:text-[#800000] dark:marker:text-rose-300 [&_ul]:mt-1.5 [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:mt-1.5 [&_ol]:space-y-1 [&_ol]:pl-5">
      {children}
    </ol>
  );
}

export function ParagraphList({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 my-2 text-sm text-foreground/85">
      {children}
    </div>
  );
}

export function Item({
  children,
  markerIcon,
}: {
  children: React.ReactNode;
  markerIcon?: LucideIcon;
}) {
  if (!markerIcon) {
    return (
      <li className="text-sm leading-relaxed text-foreground/90">{children}</li>
    );
  }
  const Icon = markerIcon;
  return (
    <li className="text-sm leading-relaxed text-foreground/90 flex gap-2 items-start">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#800000] dark:text-rose-300" />
      <div className="flex-1 min-w-0">{children}</div>
    </li>
  );
}

export function ParaItem({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-foreground/90">{children}</p>;
}

export function OOC({ children }: { children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="inline-flex h-auto p-0 hover:bg-transparent items-start justify-start text-left"
    >
      <span className="inline text-blue-700/80 dark:text-sky-300/85 italic">
        <span className="not-italic font-semibold tracking-wide text-[10px] uppercase mr-1 text-blue-600/70 dark:text-sky-400/70 border border-blue-600/30 dark:border-sky-400/30 rounded px-1 py-[1px]">
          ((
        </span>

        <span>{children}</span>

        <span className="not-italic font-semibold tracking-wide text-[10px] uppercase ml-1 text-blue-600/70 dark:text-sky-400/70 border border-blue-600/30 dark:border-sky-400/30 rounded px-1 py-[1px]">
          ))
        </span>
      </span>
    </Button>
  );
}

export function Command({ children }: { children: React.ReactNode }) {
  const handleCopy = async () => {
    const text = getText(children);
    const isSlashCommand = text.startsWith("/");
    // Slash commands copy as /b so they can be shown in OOC chat without
    // executing; keys like Q/E copy as-is.
    await navigator.clipboard.writeText(isSlashCommand ? `/b ${text}` : text);
    toast.success(isSlashCommand ? "Copied as /b" : "Copied!");
  };

  return (
    <span className="inline-flex items-center gap-1">
      <code className="px-1.5 py-0.5 rounded bg-zinc-900/85 dark:bg-zinc-800/85 text-emerald-300 font-mono text-[12px] border border-zinc-700/70 dark:border-zinc-700 whitespace-nowrap align-baseline">
        {children}
      </code>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="h-5 w-5 p-0"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </span>
  );
}

export function Aside({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-foreground/60 italic text-[12.5px]">{children}</span>
  );
}

export function Bold({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

export function Em({ children }: { children: React.ReactNode }) {
  return <em className="italic text-foreground/85">{children}</em>;
}

export function Underline({ children }: { children: React.ReactNode }) {
  return <span className="underline underline-offset-2">{children}</span>;
}

export function Span({ children }: { children: React.ReactNode }) {
  return <span className="text-foreground/90">{children}</span>;
}

export type Tone =
  | "red"
  | "green"
  | "blue"
  | "amber"
  | "maroon"
  | "muted";

const TONE_CLS: Record<Tone, string> = {
  red: "text-red-700 dark:text-red-400 font-semibold",
  green: "text-emerald-700 dark:text-emerald-400 font-semibold",
  blue: "text-sky-700 dark:text-sky-400",
  amber: "text-amber-700 dark:text-amber-400",
  maroon: "text-[#800000] dark:text-rose-300 font-semibold",
  muted: "text-foreground/70",
};

export function Tinted({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return <span className={TONE_CLS[tone]}>{children}</span>;
}

export function BbLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-[#800000] dark:text-rose-300 underline underline-offset-2 decoration-dotted decoration-[#800000]/40 hover:decoration-[#800000] hover:text-[#5d0000] dark:hover:text-rose-200 transition-colors"
    >
      {children}
    </a>
  );
}

export function Figure({
  src,
  alt,
  caption,
  width = 600,
  height = 400,
}: {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  const [errored, setErrored] = React.useState(false);
  if (errored) {
    return (
      <figure className="my-2 rounded-md border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-mono break-all">{src}</span>
        {caption ? (
          <span className="block mt-1 italic text-muted-foreground/80">
            {caption}
          </span>
        ) : null}
      </figure>
    );
  }
  return (
    <figure className="my-2 space-y-1.5">
      {/* Externally-hosted reference diagrams, so a plain <img> rather than next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? caption ?? "reference diagram"}
        loading="lazy"
        width={width}
        height={height}
        onError={() => setErrored(true)}
        className="max-w-full h-auto rounded-md border border-border/60 bg-muted"
      />
      {caption ? (
        <figcaption className="text-xs italic text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function WarningCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-3 rounded-md border border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/10 px-3.5 py-2.5 flex gap-2.5 items-start">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-700 dark:text-amber-400" />
      <div className="text-sm font-semibold text-amber-900 dark:text-amber-200 leading-snug">
        {children}
      </div>
    </div>
  );
}

export function CriticalCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-3 rounded-md border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 flex gap-2.5 items-start">
      <AlertOctagon className="h-4 w-4 mt-0.5 shrink-0 text-red-700 dark:text-red-400" />
      <div className="text-sm font-semibold text-red-800 dark:text-red-300 leading-snug">
        {children}
      </div>
    </div>
  );
}

export function ImportantNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-3 rounded-md border border-blue-500/30 bg-blue-500/5 px-3.5 py-2.5 flex gap-2.5 items-start">
      <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-700 dark:text-blue-400" />
      <div className="text-sm text-blue-900/90 dark:text-blue-200/90 leading-snug">
        {children}
      </div>
    </div>
  );
}

export function Spoiler({
  title,
  children,
  defaultOpen,
}: {
  title?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="my-3 group rounded-md border border-border/60 bg-muted/30 overflow-hidden"
    >
      <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-0 -rotate-90 text-muted-foreground" />
        <span>{title ?? "Show reference"}</span>
      </summary>
      <div className="px-3.5 py-3 border-t border-border/40 bg-background/60">
        {children}
      </div>
    </details>
  );
}

export function Divider() {
  return (
    <hr className="my-5 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  );
}

export function Stack({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2.5">{children}</div>;
}

export function RadioCallFormat({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/50 bg-background/70 px-3 py-2 my-1.5 font-mono text-[12.5px] leading-relaxed">
      {children}
    </div>
  );
}

export function SourceAnnotation({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] text-foreground/40 align-baseline">
      {children}
    </span>
  );
}

export function SourceCodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/40 bg-background/60 px-3 py-2">
      {children}
    </div>
  );
}

export function Category({
  title,
  children,
  ordered,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  ordered?: boolean;
}) {
  const ListTag = ordered ? NumberedList : BulletList;
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <div className="space-y-1">
      <SectionHeader>{title}</SectionHeader>
      {items.length > 0 ? <ListTag>{items}</ListTag> : null}
    </div>
  );
}

export function EmptyNotesState({
  title,
  message,
  tip,
}: {
  title: React.ReactNode;
  message: React.ReactNode;
  tip?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-dashed border-border/60 bg-muted/20 px-4 py-5 flex flex-col gap-2 items-start text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <ClipboardList className="h-4 w-4" />
        <span className="font-medium text-foreground">{title}</span>
      </div>
      <p className="text-foreground/85 text-[13.5px]">{message}</p>
      {tip ? (
        <p className="text-muted-foreground italic text-[12.5px]">{tip}</p>
      ) : null}
    </div>
  );
}
