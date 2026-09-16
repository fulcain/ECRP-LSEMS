"use client";

import * as React from "react";
import {
  BookOpen,
  Check,
  Copy,
  Eraser,
  MessageSquareText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { TabBar, type Tab } from "@/components/ui/tab-bar";

type NotesMode = "guide" | "script";

/** Guide (teaching guide) vs Script (paste-ready transcript) toggle. */
const NOTES_MODES: Tab<NotesMode>[] = [
  { value: "guide", label: "Guide", icon: BookOpen },
  { value: "script", label: "Script", icon: MessageSquareText },
];

/** Matches (( ... )) segments so they render with the OOC tag instead of raw brackets. */
const OOC_RE = /\(\(([\s\S]*?)\)\)/g;

/** Matches || ... || segments so they render as a styled note instead of raw pipes. */
const NOTE_RE = /\|\|([\s\S]*?)\|\|/g;

/** Matches {{ ... }} segments so they render as an RP line instead of raw braces. */
const RP_RE = /\{\{([\s\S]*?)\}\}/g;

/** Styling for the (( and )) badges that tag OOC text in Script mode. */
const OOC_BADGE_CLS =
  "inline-block rounded border border-blue-600/30 px-1 py-[1px] align-baseline text-[9px] font-semibold uppercase tracking-wide not-italic text-blue-600/70 dark:border-sky-400/30 dark:text-sky-400/70";

/** Styling for the Note badge that tags || ... || text in Script mode. */
const NOTE_BADGE_CLS =
  "inline-block rounded border border-amber-600/30 px-1 py-[1px] align-baseline text-[9px] font-semibold uppercase tracking-wide not-italic text-amber-700/80 dark:border-amber-400/30 dark:text-amber-300/80";

/** Styling for the {{ and }} badges that tag RP lines in Script mode. */
const RP_BADGE_CLS =
  "inline-block rounded border border-violet-600/30 px-1 py-[1px] align-baseline text-[9px] font-semibold uppercase tracking-wide not-italic text-violet-600/70 dark:border-violet-400/30 dark:text-violet-400/70";

/** Copy text to the clipboard, falling back to execCommand on insecure contexts. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path.
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Plain text for a line's main content: strip markup and drop any (( ... ))
 * OOC notes, || ... || notes, {{ ... }} RP lines, and slash commands
 * entirely - they copy separately.
 */
function lineToPlainText(paragraph: string): string {
  // Headings display and copy in lowercase.
  const text = paragraph.startsWith("## ")
    ? paragraph.toLowerCase()
    : paragraph;
  return text
    .replace(/^## /, "")
    .replace(/\s*\(\([\s\S]*?\)\)/g, "")
    .replace(/\s*\|\|[\s\S]*?\|\|/g, "")
    .replace(/\s*\{\{[\s\S]*?\}\}/g, "")
    .replace(/\s*`\/[^`]*`/g, "")
    .replace(/`/g, "")
    .trim();
}

/** Slash-commands in a paragraph's main text, e.g. `/setcall` in "use `/setcall`". */
function extractCommands(paragraph: string): string[] {
  const commands: string[] = [];
  for (const match of paragraph.match(/`\/[^`]*`/g) ?? []) {
    commands.push(match.slice(1, -1).trim());
  }
  return commands;
}

/** The copyable /b form of a paragraph's OOC notes, e.g. "/b text". */
function oocToBCopy(paragraph: string): string {
  const parts = paragraph.split(OOC_RE);
  const notes: string[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const note = parts[i].replace(/`/g, "").trim();
    if (note) notes.push(note);
  }
  return notes.length ? `/b ${notes.join(" ")}` : "";
}

/** The plain-text form of a paragraph's || ... || notes, markers stripped. */
function notesToPlainCopy(paragraph: string): string {
  const parts = paragraph.split(NOTE_RE);
  const notes: string[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const note = parts[i].replace(/`/g, "").trim();
    if (note) notes.push(note);
  }
  return notes.join(" ");
}

/** The plain copyable form of a paragraph's {{ ... }} RP lines, markers stripped. */
function rpToPlainCopy(paragraph: string): string {
  const parts = paragraph.split(RP_RE);
  const lines: string[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const line = parts[i].replace(/`/g, "").trim();
    if (line) lines.push(line);
  }
  return lines.join(" ");
}

/**
 * Render a text segment, turning `command` spans into click-to-copy chips.
 * Segments are only treated as commands when the backticks are balanced, so
 * a stray backtick degrades to plain text instead of swallowing the rest of
 * the paragraph. Slash commands (e.g. `/setcall`) copy as `/b <command>` -
 * like OOC notes, they copy separately.
 */
function renderInline(segment: string, keyBase: string): React.ReactNode {
  const parts = segment.split("`");
  const balanced = parts.length % 2 === 1;
  return parts.map((part, index) => {
    if (balanced && index % 2 === 1) {
      const command = part.trim();
      const isSlashCommand = command.startsWith("/");
      return (
        <button
          key={`${keyBase}-${index}`}
          type="button"
          onClick={() => {
            const copyValue = isSlashCommand ? `/b ${command}` : command;
            void copyText(copyValue).then((ok) => {
              if (ok)
                toast.success(
                  isSlashCommand ? "Copied as /b" : `Copied ${command}`,
                );
            });
          }}
          title={
            isSlashCommand ? `Copy as /b: ${command}` : `Copy ${command}`
          }
          aria-label={
            isSlashCommand ? `Copy as /b: ${command}` : `Copy ${command}`
          }
          className="inline-flex items-center rounded-md border border-emerald-700/30 bg-emerald-700/10 px-1.5 py-0.5 align-baseline font-mono text-[12px] whitespace-nowrap text-emerald-800 transition-colors hover:bg-emerald-700/20 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/20"
        >
          {command}
        </button>
      );
    }
    return <React.Fragment key={`${keyBase}-${index}`}>{part}</React.Fragment>;
  });
}

/** A single (( ... )) OOC note: styled tag plus its own copy-as-/b button. */
function OocNote({
  oocKey,
  lineKey,
  text,
  copied,
  onCopy,
}: {
  oocKey: string;
  lineKey: string;
  text: string;
  copied: boolean;
  onCopy: (oocKey: string, lineKey: string, copyValue: string) => void;
}) {
  const copyValue = `/b ${text.replace(/`/g, "")}`;
  return (
    <span className="inline text-blue-700/80 dark:text-sky-300/85 italic">
      <span className={`mr-1 ${OOC_BADGE_CLS}`}>((</span>
      {renderInline(text, `${oocKey}-body`)}
      <span className={`ml-1 ${OOC_BADGE_CLS}`}>))</span>
      <button
        type="button"
        onClick={() => onCopy(oocKey, lineKey, copyValue)}
        title="Copy OOC as /b"
        aria-label={`Copy OOC as /b: ${text.slice(0, 40)}`}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded text-sky-700 transition-colors hover:bg-sky-500/15 dark:text-sky-300"
      >
        {copied ? (
          <Check className="h-3 w-3 text-sky-700 dark:text-sky-300" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </span>
  );
}

/** A single || ... || note: styled note tag, for reading rather than copying. */
function NoteNote({
  noteKey,
  text,
}: {
  noteKey: string;
  text: string;
}) {
  return (
    <span className="inline text-amber-800/90 dark:text-amber-200/90 italic">
      <span className={`mr-1 ${NOTE_BADGE_CLS}`}>Note</span>
      {renderInline(text, `${noteKey}-body`)}
    </span>
  );
}

/** A single {{ ... }} RP line: styled tag plus a copy button for normal chat. */
function RpNote({
  rpKey,
  lineKey,
  text,
  copied,
  onCopy,
}: {
  rpKey: string;
  lineKey: string;
  text: string;
  copied: boolean;
  onCopy: (
    rpKey: string,
    lineKey: string,
    copyValue: string,
    successMessage?: string,
  ) => void;
}) {
  const copyValue = text.replace(/`/g, "");
  return (
    <span className="inline text-violet-700/80 dark:text-violet-300/85 italic">
      <span className={`mr-1 ${RP_BADGE_CLS}`}>{"{{"}</span>
      {renderInline(text, `${rpKey}-body`)}
      <span className={`ml-1 ${RP_BADGE_CLS}`}>{"}}"}</span>
      <button
        type="button"
        onClick={() => onCopy(rpKey, lineKey, copyValue, "Copied")}
        title="Copy RP line"
        aria-label={`Copy RP line: ${text.slice(0, 40)}`}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded text-violet-700 transition-colors hover:bg-violet-500/15 dark:text-violet-300"
      >
        {copied ? (
          <Check className="h-3 w-3 text-violet-700 dark:text-violet-300" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </span>
  );
}

/** Plain text parts, splitting out {{ ... }} RP lines and || ... || notes. */
function renderTextParts(
  part: string,
  partKey: string,
  lineKey: string,
  handlers: NoteHandlers,
): React.ReactNode {
  const noteParts = part.split(NOTE_RE);
  return noteParts.map((segment, noteIndex) => {
    if (noteIndex % 2 === 1) {
      const noteKey = `${partKey}-note-${noteIndex}`;
      return (
        <NoteNote
          key={noteKey}
          noteKey={noteKey}
          text={segment.trim()}
        />
      );
    }
    const rpParts = segment.split(RP_RE);
    return rpParts.map((seg, rpIndex) => {
      if (rpIndex % 2 === 1) {
        const rpKey = `${partKey}-rp-${noteIndex}-${rpIndex}`;
        return (
          <RpNote
            key={rpKey}
            rpKey={rpKey}
            lineKey={lineKey}
            text={seg.trim()}
            copied={handlers.copiedBKey === rpKey}
            onCopy={handlers.onCopyB}
          />
        );
      }
      return (
        <React.Fragment key={`${partKey}-x-${noteIndex}-${rpIndex}`}>
          {renderInline(seg, `${partKey}-x-${noteIndex}-${rpIndex}`)}
        </React.Fragment>
      );
    });
  });
}

interface NoteHandlers {
  copiedBKey: string | null;
  onCopyB: (
    bKey: string,
    lineKey: string,
    copyValue: string,
    successMessage?: string,
  ) => void;
}

/**
 * Render a paragraph: (( ... )) as OOC tags, || ... || as notes. The parse is
 * two-level (OOC first, then notes within the plain parts), so nested markers
 * like a note inside (( ... )) render literally.
 */
function renderParagraphContent(
  paragraph: string,
  keyBase: string,
  lineKey: string,
  handlers: NoteHandlers,
): React.ReactNode {
  const oocParts = paragraph.split(OOC_RE);
  return oocParts.map((part, index) => {
    if (index % 2 === 1) {
      const oocKey = `${keyBase}-ooc-${index}`;
      return (
        <OocNote
          key={oocKey}
          oocKey={oocKey}
          lineKey={lineKey}
          text={part.trim()}
          copied={handlers.copiedBKey === oocKey}
          onCopy={handlers.onCopyB}
        />
      );
    }
    return (
      <React.Fragment key={`${keyBase}-t-${index}`}>
        {renderTextParts(part, `${keyBase}-t-${index}`, lineKey, handlers)}
      </React.Fragment>
    );
  });
}

/** A small rewind pill shown on lines that are already marked as told. */
function ToldPill({
  lineKey,
  label,
  onRewind,
}: {
  lineKey: string;
  label: string;
  onRewind: (lineKey: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onRewind(lineKey)}
      title="Rewind - mark as not told"
      aria-label={`Mark as not told: ${label.slice(0, 40)}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-700/40 bg-emerald-700/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 transition-colors hover:bg-emerald-700/20 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/20"
    >
      <Check className="h-3 w-3" />
      Told
    </button>
  );
}

function SpokenTranscript({
  text,
  toldKeys,
  onMarkTold,
  onRewindTold,
}: {
  text: string;
  toldKeys: ReadonlySet<string>;
  onMarkTold: (lineKey: string) => void;
  onRewindTold: (lineKey: string) => void;
}) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [copiedBKey, setCopiedBKey] = React.useState<string | null>(null);
  const copiedTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    },
    [],
  );

  // Reset the transient "copied" state when the transcript changes (phase
  // switches keep the panel mounted), so a check never lingers on a new line.
  React.useEffect(() => {
    setCopiedKey(null);
    setCopiedBKey(null);
  }, [text]);

  const resetCopiedState = React.useCallback(() => {
    setCopiedKey(null);
    setCopiedBKey(null);
  }, []);

  const handleCopyLine = async (key: string, paragraph: string) => {
    // Main content copies without asides; fully-aside lines fall back to
    // their OOC /b form, RP line, or plain note text.
    const plain =
      lineToPlainText(paragraph) ||
      oocToBCopy(paragraph) ||
      rpToPlainCopy(paragraph) ||
      notesToPlainCopy(paragraph);
    const ok = await copyText(plain);
    if (!ok) return;
    setCopiedKey(key);
    onMarkTold(key);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(resetCopiedState, 1400);
  };

  const handleCopyB = async (
    bKey: string,
    lineKey: string,
    copyValue: string,
    successMessage = "Copied as /b",
  ) => {
    const ok = await copyText(copyValue);
    if (!ok) return;
    setCopiedBKey(bKey);
    onMarkTold(lineKey);
    toast.success(successMessage);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(resetCopiedState, 1400);
  };

  const bHandlers: NoteHandlers = {
    copiedBKey,
    onCopyB: handleCopyB,
  };

  const paragraphs = text.split("\n\n");

  return (
    <div className="space-y-1.5">
      {paragraphs.map((paragraph, index) => {
        const isHeading = paragraph.startsWith("## ");
        const lineKey = isHeading ? `h-${index}` : `p-${index}`;
        const isCopied = copiedKey === lineKey;
        const isTold = toldKeys.has(lineKey);
        const lineLabel =
          lineToPlainText(paragraph) ||
          oocToBCopy(paragraph) ||
          rpToPlainCopy(paragraph) ||
          notesToPlainCopy(paragraph) ||
          "line";
        // Fully-aside lines (only OOC, RP or || content) rely on their own
        // copy buttons - skip the line button.
        const isOnlyAside =
          lineToPlainText(paragraph) === "" &&
          (oocToBCopy(paragraph) !== "" ||
            rpToPlainCopy(paragraph) !== "" ||
            notesToPlainCopy(paragraph) !== "" ||
            extractCommands(paragraph).length > 0);

        const copyButton = (
          <button
            type="button"
            onClick={() => handleCopyLine(lineKey, paragraph)}
            aria-label={
              isCopied
                ? `Line copied: ${lineLabel.slice(0, 40)}`
                : `Copy line: ${lineLabel.slice(0, 40)}`
            }
            title="Copy line"
            className="shrink-0 rounded p-1 text-muted-foreground/50 transition-colors hover:bg-emerald-700/10 hover:text-emerald-700 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-300"
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        );

        if (isHeading) {
          return (
            <div key={`line-${index}`} className="flex items-center gap-1.5 pt-1">
              <h5
                className={cn(
                  "text-[11px] font-semibold lowercase text-[#800000] dark:text-rose-300",
                  isTold && "opacity-50",
                )}
              >
                {renderParagraphContent(
                  paragraph.slice(3),
                  `h-${index}`,
                  lineKey,
                  bHandlers,
                )}
              </h5>
              {isOnlyAside ? null : copyButton}
              {isTold ? (
                <ToldPill
                  lineKey={lineKey}
                  label={lineLabel}
                  onRewind={onRewindTold}
                />
              ) : null}
            </div>
          );
        }

        return (
          <div
            key={`line-${index}`}
            className="flex items-start gap-1.5 rounded-sm"
          >
            <p
              className={cn(
                "text-[13.5px] leading-relaxed text-foreground/90",
                isTold && "opacity-55",
              )}
            >
              {renderParagraphContent(
                paragraph,
                `p-${index}`,
                lineKey,
                bHandlers,
              )}
            </p>
            {isOnlyAside ? null : copyButton}
            {isTold ? (
              <ToldPill
                lineKey={lineKey}
                label={lineLabel}
                onRewind={onRewindTold}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Renders phase notes with a Guide / Script toggle. Script mode shows a
 * first-person, paste-friendly transcript: every line copies on its own
 * (without its OOC, ||, {{ }} or slash-command asides), commands render
 * as click-to-copy chips, (( ... )) and slash commands copy separately as
 * /b, {{ ... }} RP lines copy to normal chat, || ... || renders as a
 * styled note, and copied lines are marked as "told" - persisted per
 * phase in localStorage so the trainer knows what they've already covered
 * after closing the browser. Both views are always available - the toggle
 * just switches between them.
 */
export function NotesPanel({
  spoken,
  storageKey,
  children,
}: {
  spoken: string;
  storageKey: string;
  children: React.ReactNode;
}) {
  const [mode, setMode] = React.useState<NotesMode>("guide");
  const [toldKeys, setToldKeys] = useLocalStorage<string[]>(
    `phase-notes-told:${storageKey}`,
    [],
  );

  // Guard against corrupted/foreign stored values.
  const toldArray = React.useMemo(
    () => (Array.isArray(toldKeys) ? toldKeys : []),
    [toldKeys],
  );

  // Only count marks that still map to a line in the current transcript, so
  // stale keys from an older revision don't inflate the counter.
  const lineKeys = React.useMemo(() => {
    const keys = new Set<string>();
    spoken.split("\n\n").forEach((paragraph, index) => {
      keys.add(paragraph.startsWith("## ") ? `h-${index}` : `p-${index}`);
    });
    return keys;
  }, [spoken]);

  const toldSet = React.useMemo(() => new Set(toldArray), [toldArray]);
  const toldCount = new Set(toldArray.filter((key) => lineKeys.has(key))).size;
  const totalLines = lineKeys.size;

  const markTold = React.useCallback(
    (lineKey: string) => {
      setToldKeys((prev) => {
        const base = Array.isArray(prev) ? prev : [];
        return base.includes(lineKey) ? base : [...base, lineKey];
      });
    },
    [setToldKeys],
  );

  const rewindTold = React.useCallback(
    (lineKey: string) => {
      setToldKeys((prev) => {
        const base = Array.isArray(prev) ? prev : [];
        return base.filter((key) => key !== lineKey);
      });
    },
    [setToldKeys],
  );

  const clearTold = React.useCallback(() => {
    setToldKeys([]);
  }, [setToldKeys]);

  return (
    <div className="space-y-3">
      <TabBar
        tabs={NOTES_MODES}
        active={mode}
        onChange={setMode}
        ariaLabel="Phase notes view"
        size="sm"
        divider={false}
        className="mb-0"
      />

      <div
        role="tabpanel"
        id="notes-panel-content"
        aria-label={mode === "guide" ? "Guide view" : "Script view"}
        className={cn(
          "max-h-[600px] overflow-y-auto rounded-md border px-4 py-4 transition-colors",
          mode === "script"
            ? "border-emerald-700/25 bg-emerald-700/[0.05] dark:border-emerald-400/20 dark:bg-emerald-400/[0.05]"
            : "border-border/40 bg-muted/30",
        )}
      >
        {mode === "guide" ? (
          <div key="guide" className="animate-in fade-in duration-200">
            {children}
          </div>
        ) : (
          <div key="script" className="animate-in fade-in duration-200">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MessageSquareText className="h-3 w-3 shrink-0" />
                <span>
                  Each line copies on its own - OOC notes and commands copy
                  separately as /b; RP lines copy to normal chat; amber notes
                  are for reading, not copying.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                  Told {toldCount}/{totalLines}
                </span>
                <button
                  type="button"
                  onClick={clearTold}
                  disabled={toldCount === 0}
                  className="inline-flex items-center gap-1 rounded-md border border-border/70 px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  <Eraser className="h-3 w-3" />
                  Clear all
                </button>
              </div>
            </div>

            <p className="mb-3 text-[11px] italic text-muted-foreground/80">
              Copied lines are marked as told and saved in your browser - tap
              the ✓ Told pill to rewind one, or Clear all to start over.
            </p>

            <SpokenTranscript
              text={spoken}
              toldKeys={toldSet}
              onMarkTold={markTold}
              onRewindTold={rewindTold}
            />
          </div>
        )}
      </div>
    </div>
  );
}
