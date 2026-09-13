"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  AlignCenter,
  Bold,
  Code,
  EyeOff,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  Minus,
  Palette,
  Quote,
  Sparkles,
  Strikethrough,
  Type,
  Underline,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useRef, useState, type KeyboardEvent } from "react";

const COLORS = [
  { label: "White", value: "#FFFFFF" },
  { label: "Black", value: "#000000" },
  { label: "Grey", value: "#808080" },
  { label: "Red", value: "#FF0000" },
  { label: "Firebrick", value: "#B22222" },
  { label: "Orange", value: "#FFA500" },
  { label: "Green", value: "#008000" },
  { label: "Seagreen", value: "#2E8B57" },
  { label: "Blue", value: "#0000FF" },
  { label: "Purple", value: "#800080" },
];

const HIGHLIGHTS = [
  { label: "Yellow", value: "#FFFF00" },
  { label: "Lime", value: "#00FF00" },
  { label: "Cyan", value: "#00FFFF" },
  { label: "Magenta", value: "#FF00FF" },
  { label: "Orange", value: "#FFA500" },
  { label: "Pink", value: "#FFC0CB" },
];

const SHADOWS = [
  { label: "Black", value: "#000000" },
  { label: "Grey", value: "#808080" },
  { label: "Red", value: "#FF0000" },
  { label: "Blue", value: "#0000FF" },
  { label: "White", value: "#FFFFFF" },
];

const SIZES = ["85", "95", "100", "110", "115", "130", "150", "160"].map(
  (value) => ({ label: value, value }),
);

function ToolbarButton({
  icon: Icon,
  title,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="h-7 w-7 text-slate-300 hover:bg-slate-700/60 hover:text-white active:scale-95"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function ToolbarDivider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-slate-700" />;
}

function PresetPopover({
  icon: Icon,
  title,
  presets,
  swatch,
  customPlaceholder,
  customInputMode,
  onApply,
}: {
  icon: LucideIcon;
  title: string;
  presets: { label: string; value: string }[];
  swatch?: boolean;
  customPlaceholder: string;
  customInputMode?: "numeric" | "text";
  onApply: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  const apply = (value: string) => {
    onApply(value);
    setOpen(false);
    setCustom("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          title={title}
          aria-label={title}
          className="h-7 w-7 text-slate-300 hover:bg-slate-700/60 hover:text-white active:scale-95"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 border-slate-700 bg-slate-900 p-3 text-slate-200"
      >
        <p className="mb-2 text-xs font-medium text-slate-300">{title}</p>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) =>
            swatch ? (
              <button
                key={preset.value}
                type="button"
                title={preset.label}
                aria-label={preset.label}
                onClick={() => apply(preset.value)}
                className="h-6 w-6 cursor-pointer rounded border border-white/20 transition-transform hover:scale-110"
                style={{ backgroundColor: preset.value }}
              />
            ) : (
              <button
                key={preset.value}
                type="button"
                onClick={() => apply(preset.value)}
                className="cursor-pointer rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 transition-colors hover:border-sky-500/40 hover:text-white"
              >
                {preset.label}
              </button>
            ),
          )}
        </div>
        <form
          className="mt-3 flex gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            if (custom.trim()) apply(custom.trim());
          }}
        >
          <Input
            value={custom}
            inputMode={customInputMode ?? "text"}
            onChange={(event) => setCustom(event.target.value)}
            placeholder={customPlaceholder}
            className="h-7 border-slate-700 bg-slate-800 text-xs text-white placeholder:text-slate-500"
          />
          <Button
            type="submit"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={!custom.trim()}
          >
            Apply
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

interface BBCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function BBCodeEditor({
  value,
  onChange,
  placeholder,
  rows = 12,
}: BBCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // The textarea is controlled, so the new value (and therefore the caret) can
  // only be restored once React has painted it.
  const write = useCallback(
    (next: string, start: number, end: number) => {
      onChange(next);
      requestAnimationFrame(() => {
        const element = textareaRef.current;
        if (!element) return;
        element.focus();
        element.setSelectionRange(start, end);
      });
    },
    [onChange],
  );

  const wrap = useCallback(
    (before: string, after: string) => {
      const element = textareaRef.current;
      if (!element) return;
      const { selectionStart, selectionEnd, value: current } = element;
      const selected = current.slice(selectionStart, selectionEnd);
      write(
        current.slice(0, selectionStart) +
          before +
          selected +
          after +
          current.slice(selectionEnd),
        selectionStart + before.length,
        selectionStart + before.length + selected.length,
      );
    },
    [write],
  );

  // Standalone tag on its own line (e.g. [hr]).
  const insertBlock = useCallback(
    (tag: string) => {
      const element = textareaRef.current;
      if (!element) return;
      const { selectionStart, selectionEnd, value: current } = element;
      const needsNewline = selectionStart > 0 && current[selectionStart - 1] !== "\n";
      const text = `${needsNewline ? "\n" : ""}${tag}\n`;
      const caret = selectionStart + text.length;
      write(
        current.slice(0, selectionStart) + text + current.slice(selectionEnd),
        caret,
        caret,
      );
    },
    [write],
  );

  // Select the text first, then paste the link over the highlighted "url=".
  const insertLink = useCallback(() => {
    const element = textareaRef.current;
    if (!element) return;
    const { selectionStart, selectionEnd, value: current } = element;
    const selected = current.slice(selectionStart, selectionEnd);
    const tag = `[url=]${selected}[/url]`;
    const caret = selectionStart + 5;
    write(
      current.slice(0, selectionStart) + tag + current.slice(selectionEnd),
      caret,
      caret,
    );
  }, [write]);

  const insertList = useCallback(() => {
    const element = textareaRef.current;
    if (!element) return;
    const { selectionStart, selectionEnd, value: current } = element;
    const selected = current.slice(selectionStart, selectionEnd);
    const hasItems = selected.trim().length > 0;
    const body = hasItems
      ? selected
          .split("\n")
          .map((line) => `[*] ${line}`)
          .join("\n")
      : "[*] \n[*] ";
    const tag = `[list]\n${body}\n[/list]`;
    // Empty list: land the caret on the first item.
    const caret = hasItems
      ? selectionStart + tag.length
      : selectionStart + "[list]\n[*] ".length;
    write(
      current.slice(0, selectionStart) + tag + current.slice(selectionEnd),
      caret,
      caret,
    );
  }, [write]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;
    const key = event.key.toLowerCase();
    if (key === "b") wrap("[b]", "[/b]");
    else if (key === "i") wrap("[i]", "[/i]");
    else if (key === "u") wrap("[u]", "[/u]");
    else if (key === "s" && event.shiftKey) wrap("[s]", "[/s]");
    else return;
    event.preventDefault();
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 border-slate-700 bg-slate-900/80 px-1.5 py-1">
        <ToolbarButton
          icon={Bold}
          title="Bold (Ctrl+B)"
          onClick={() => wrap("[b]", "[/b]")}
        />
        <ToolbarButton
          icon={Italic}
          title="Italic (Ctrl+I)"
          onClick={() => wrap("[i]", "[/i]")}
        />
        <ToolbarButton
          icon={Underline}
          title="Underline (Ctrl+U)"
          onClick={() => wrap("[u]", "[/u]")}
        />
        <ToolbarButton
          icon={Strikethrough}
          title="Strikethrough (Ctrl+Shift+S)"
          onClick={() => wrap("[s]", "[/s]")}
        />

        <ToolbarDivider />

        <PresetPopover
          icon={Type}
          title="Text size (50-200)"
          presets={SIZES}
          customPlaceholder="e.g. 140"
          customInputMode="numeric"
          onApply={(size) => wrap(`[size=${size}]`, "[/size]")}
        />
        <PresetPopover
          icon={Palette}
          title="Text colour"
          presets={COLORS}
          swatch
          customPlaceholder="e.g. #ff8800 or Seagreen"
          onApply={(color) => wrap(`[color=${color}]`, "[/color]")}
        />
        <PresetPopover
          icon={Highlighter}
          title="Highlight"
          presets={HIGHLIGHTS}
          swatch
          customPlaceholder="e.g. #ff8800"
          onApply={(color) => wrap(`[highlight=${color}]`, "[/highlight]")}
        />
        <PresetPopover
          icon={Sparkles}
          title="Text shadow"
          presets={SHADOWS}
          swatch
          customPlaceholder="e.g. #ff8800"
          onApply={(color) => wrap(`[shadow=${color}]`, "[/shadow]")}
        />

        <ToolbarDivider />

        <ToolbarButton
          icon={LinkIcon}
          title="Link — select text first, then paste the URL"
          onClick={insertLink}
        />
        <ToolbarButton
          icon={ImageIcon}
          title="Image"
          onClick={() => wrap("[img]", "[/img]")}
        />
        <ToolbarButton
          icon={Quote}
          title="Quote"
          onClick={() => wrap("[quote]", "[/quote]")}
        />
        <ToolbarButton
          icon={Code}
          title="Code"
          onClick={() => wrap("[code]", "[/code]")}
        />

        <ToolbarDivider />

        <ToolbarButton icon={List} title="List" onClick={insertList} />
        <ToolbarButton
          icon={AlignCenter}
          title="Centre"
          onClick={() => wrap("[center]", "[/center]")}
        />
        <ToolbarButton
          icon={EyeOff}
          title="Spoiler"
          onClick={() => wrap("[spoiler]", "[/spoiler]")}
        />
        <ToolbarButton
          icon={Minus}
          title="Horizontal rule"
          onClick={() => insertBlock("[hr]")}
        />
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-y rounded-t-none border-t-0 border-slate-700 bg-slate-800 font-mono text-xs text-slate-200 placeholder:text-slate-500 transition-all duration-200 hover:border-slate-500 focus-visible:ring-2"
      />
    </div>
  );
}
