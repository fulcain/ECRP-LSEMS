"use client";

import { ExternalLink } from "lucide-react";
import type { ExternalLink as ExternalLinkItem } from "./types";

type QuickLinksPanelProps = {
  title: string;
  links: ExternalLinkItem[];
};

export function QuickLinksPanel({ title, links }: QuickLinksPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">{title}</h3>
      <ul className="divide-y divide-border">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-0.5 py-2.5 text-sm transition-colors hover:bg-surface-hover/40"
            >
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                {link.label}
              </span>
              <span className="break-all text-xs text-muted-foreground">
                {link.url}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
