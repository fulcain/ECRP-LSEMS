import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * BBCode as it will look on the forum, rendered as React rather than injected
 * HTML - a handbook section is edited by hand, and `dangerouslySetInnerHTML` on
 * someone else's markup is how a preview becomes the whole app's problem.
 *
 * This is a preview, not a forum: it covers the tags the handbook's own formats
 * use (headings, spoilers, boxes, lists, checkboxes, images, links, colour and
 * size) and shows any tag it does not know as the text it is, so nothing is
 * silently swallowed.
 */

type Node = string | { tag: string; arg: string; children: Node[] };

/** Tags that stand alone: they never wrap anything. */
const VOID_TAGS = new Set(["hr", "cb", "cbc", "*", "lsemsfooter"]);

function parse(source: string): Node[] {
  const root: Node[] = [];
  const stack: { tag: string; arg: string; children: Node[] }[] = [];
  const pattern = /\[(\/?)([a-zA-Z*]+)(?:=([^\]]*))?\]/g;
  let cursor = 0;
  let match = pattern.exec(source);

  const push = (node: Node) => {
    const top = stack[stack.length - 1];
    if (top) top.children.push(node);
    else root.push(node);
  };

  while (match) {
    if (match.index > cursor) push(source.slice(cursor, match.index));
    const [, closing, rawTag, arg] = match;
    const tag = rawTag.toLowerCase();
    cursor = match.index + match[0].length;

    if (VOID_TAGS.has(tag)) {
      push({ tag, arg: arg ?? "", children: [] });
    } else if (closing) {
      const open = stack.pop();
      if (open && open.tag === tag) push(open);
      else push(match[0]);
    } else {
      stack.push({ tag, arg: arg ?? "", children: [] });
    }
    match = pattern.exec(source);
  }
  if (cursor < source.length) push(source.slice(cursor));
  while (stack.length > 0) push(stack.pop()!);
  return root;
}

function textOf(nodes: Node[]): string {
  return nodes
    .map((node) => (typeof node === "string" ? node : textOf(node.children)))
    .join("");
}

let key = 0;
const nextKey = () => `bb-${(key += 1)}`;

function render(nodes: Node[]): React.ReactNode {
  return nodes.map((node) => {
    if (typeof node === "string") return node;
    const { tag, arg, children } = node;
    const inner = render(children);
    const k = nextKey();
    switch (tag) {
      case "b":
        return <strong key={k}>{inner}</strong>;
      case "i":
        return <em key={k}>{inner}</em>;
      case "u":
        return (
          <span key={k} className="underline underline-offset-2">
            {inner}
          </span>
        );
      case "s":
        return <s key={k}>{inner}</s>;
      case "color":
        // `transparent` is the formats' spacer: a line that takes up room and
        // shows nothing, which is what a preview should do too.
        if (arg.toLowerCase() === "transparent") {
          return (
            <span key={k} className="block h-4" aria-hidden>
              {null}
            </span>
          );
        }
        return (
          <span key={k} style={{ color: arg || undefined }}>
            {inner}
          </span>
        );
      case "highlight":
        return (
          <mark key={k} style={{ backgroundColor: arg || undefined }}>
            {inner}
          </mark>
        );
      case "shadow":
        return (
          <span key={k} style={{ textShadow: arg ? `0 1px 2px ${arg}` : undefined }}>
            {inner}
          </span>
        );
      case "size":
        return (
          <span key={k} style={{ fontSize: `${Number(arg) || 100}%` }}>
            {inner}
          </span>
        );
      case "font":
        return (
          <span key={k} style={{ fontFamily: arg || undefined }}>
            {inner}
          </span>
        );
      case "center":
        return (
          <div key={k} className="text-center">
            {inner}
          </div>
        );
      case "hr":
        return <hr key={k} className="my-3 border-border" />;
      case "url":
        return (
          <a
            key={k}
            href={arg || textOf(children)}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-2"
          >
            {inner}
          </a>
        );
      case "img":
        return arg === "SIGNATURE" ? (
          <span
            key={k}
            className="inline-block rounded border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground"
          >
            your saved signature
          </span>
        ) : (
          // Externally hosted, so a plain <img>: the forum is the real renderer.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={k}
            src={arg || textOf(children)}
            alt=""
            className="my-2 max-w-full rounded-md border border-border"
          />
        );
      case "list": {
        const none = arg.toLowerCase() === "none";
        const ordered = arg === "1";
        const items = render(
          children.map((child) =>
            typeof child === "string"
              ? child
              : child.tag === "*"
                ? { tag: "li", arg: "", children: child.children }
                : child,
          ),
        );
        if (ordered) return <ol key={k} className="my-1 list-decimal pl-6">{items}</ol>;
        return (
          <ul key={k} className={cn("my-1", none ? "list-none pl-0" : "list-disc pl-6")}>
            {items}
          </ul>
        );
      }
      case "li":
        return <li key={k}>{inner}</li>;
      case "*":
        return <li key={k}>{inner}</li>;
      case "spoiler":
        return (
          <details
            key={k}
            className="my-2 rounded-md border border-border bg-muted/30 px-3 py-2"
          >
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
              {arg || "Show reference"}
            </summary>
            <div className="mt-2">{inner}</div>
          </details>
        );
      case "divbox":
        return (
          <div
            key={k}
            className="my-2 rounded-md border border-border bg-background/70 px-3 py-2"
          >
            {inner}
          </div>
        );
      case "code":
        return (
          <pre
            key={k}
            className="my-2 overflow-x-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-[11px] whitespace-pre-wrap"
          >
            {inner}
          </pre>
        );
      case "quote":
        return (
          <blockquote
            key={k}
            className="my-2 border-l-2 border-border pl-3 text-muted-foreground"
          >
            {inner}
          </blockquote>
        );
      case "lsemssubtitle":
        return (
          <p
            key={k}
            className="mt-3 mb-1 text-sm font-semibold tracking-wide text-[#800000] uppercase dark:text-rose-300"
          >
            {inner}
          </p>
        );
      case "lsemsfooter":
        return null;
      case "cb":
        return (
          <span key={k} className="mr-1 font-mono text-muted-foreground">
            [ ]
          </span>
        );
      case "cbc":
        return (
          <span key={k} className="mr-1 font-mono text-emerald-600">
            [✓]
          </span>
        );
      case "aligntable":
        return <span key={k}>{inner}</span>;
      default:
        // Unknown to the preview: shown as written, so nothing disappears.
        return (
          <span key={k} className="font-mono text-[11px] text-muted-foreground">
            [{tag}
            {arg ? `=${arg}` : ""}]{inner}[/{tag}]
          </span>
        );
    }
  });
}

export function BbcodePreview({
  bbcode,
  className,
}: {
  bbcode: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-h-[520px] overflow-auto rounded-lg border border-border bg-background/60 p-4 text-sm leading-relaxed",
        className,
      )}
    >
      {bbcode.trim() ? (
        render(parse(bbcode))
      ) : (
        <p className="text-xs text-muted-foreground">
          Nothing to preview yet - the section is empty.
        </p>
      )}
    </div>
  );
}
