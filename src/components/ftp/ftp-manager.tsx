"use client";

import { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ClipboardPaste,
  GitCommitHorizontal,
  History,
  Loader2,
  Terminal,
  Undo2,
} from "lucide-react";

import { sectionHeading } from "@/app/constants/divisions/ftd/ftp";
import { carriesPlaceholder } from "@/app/constants/profile-placeholders";
import {
  convertFtpBbcode,
  describeConversions,
} from "@/lib/ftp-bbcode";
import {
  compareFtpSection,
  describeTagRepair,
  readPastedSections,
} from "@/lib/ftp-markup";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BBCodeEditor } from "@/components/ui/bbcode-editor";

/**
 * What this deployment can do with an update, said before anything is pasted.
 *
 * Three answers, not two: a deployment with the GitHub token commits the update
 * itself; a local checkout writes its own files and the member commits by hand;
 * anything else cannot save a paste at all, and says so before the member
 * writes nine sections into a box that will drop them.
 */
function LocalOnlyNote({
  writable,
  commits,
}: {
  writable?: boolean;
  commits?: boolean;
}) {
  if (commits) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-emerald-300/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
        <GitCommitHorizontal className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="font-medium">
            Updates here commit straight to the repository.
          </p>
          <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-200/80">
            An accepted update is one commit on the FTP files, and the
            version history below is how you go back to an earlier one.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
      <Terminal className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <p className="font-medium">
          This page only works on a local development server.
        </p>
        {writable !== undefined && (
          <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
            {writable
              ? "Updating a profile writes the section files under docs/ftp/, so the change is a commit you push like any other."
              : "This deployment cannot write its own files, so an update has to be made on a local development server."}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * The version history: every commit that touched a section file, newest first,
 * each with the one thing this panel exists for - a way back.
 *
 * History is git's own, wherever it lives: GitHub answers on a deployment that
 * commits, and a checkout reads its local log. A restore is a whole-profile
 * update of the old text, so what it does is exactly what any update does -
 * one commit, authored by the member who pressed the button - and the version
 * it restored to is one more entry at the top of this list.
 */
function VersionHistoryPanel({
  onNotice,
  onRestored,
}: {
  onNotice: (notice: Notice) => void;
  onRestored: () => void;
}) {
  const [entries, setEntries] = useState<VersionEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const response = await fetch("/api/ftp?history=all", {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          history?: VersionEntry[];
          error?: string;
        };
        if (!live) return;
        if (!response.ok) {
          setError(payload.error ?? "The version history could not be read.");
        } else {
          setEntries(payload.history ?? []);
        }
      } catch {
        if (live) setError("The version history could not be read.");
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  const restore = async (sha: string) => {
    setRestoring(true);
    try {
      const response = await fetch("/api/ftp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore: true, commit: sha }),
      });
      const payload = (await response.json()) as {
        written?: boolean;
        restored?: { label: string; changed: string[]; commit?: string }[];
        error?: string;
        problems?: string[];
      };
      if (response.ok && payload.written) {
        const restored = payload.restored ?? [];
        const label = restored.map((entry) => entry.label).join(" and ");
        onNotice({
          kind: "ok",
          title: `Rolled ${label || "the FTP"} back`,
          detail:
            restored.length > 0 && restored[0].changed.length > 0
              ? `The sections that differed were put back the way they read at that version - ${restored
                  .flatMap((entry) => entry.changed)
                  .slice(0, 4)
                  .join(", ")}${
                  restored.reduce((sum, entry) => sum + entry.changed.length, 0) > 4
                    ? ", and more"
                    : ""
                }.`
              : "The sections that differed were put back the way they read at that version.",
          written: restored
            .map((entry) => entry.label)
            .filter((label): label is string => label.length > 0),
          commit: restored.find((entry) => entry.commit)?.commit,
        });
        onRestored();
        toast.success("Rolled back to the earlier version");
      } else {
        onNotice({
          kind: "error",
          title: "The version was not restored",
          detail:
            payload.error ?? "The restore could not be completed on this deployment.",
          warnings: payload.problems,
        });
        toast.error(payload.error ?? "The version was not restored");
      }
    } catch {
      onNotice({
        kind: "error",
        title: "The restore could not be sent",
        detail: "The request failed before the FTP was touched.",
      });
    } finally {
      setRestoring(false);
      setConfirming(null);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <History className="h-4 w-4 text-muted-foreground" />
            Version history
          </p>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            Every update is a commit, so going back is picking one. Restoring
            puts the sections that differ back the way they read at that
            version - as one more commit, so nothing is ever lost by going back.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">{error}</p>
      ) : entries === null ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Reading the history…
        </p>
      ) : entries.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          No FTP commits here yet. They appear once an update is accepted -
          on this deployment, or on the one that commits.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {entries.slice(0, 15).map((entry) => (
            <li key={entry.sha} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
              <code className="font-mono text-[11px] text-muted-foreground">
                {entry.sha.slice(0, 7)}
              </code>
              <span className="text-xs text-foreground">{entry.message}</span>
              <span className="text-[11px] text-muted-foreground">
                {entry.author} · {entry.date}
              </span>
              <span className="ml-auto flex items-center gap-2">
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-muted-foreground underline"
                >
                  view
                </a>
                {confirming === entry.sha ? (
                  <span className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={restoring}
                      onClick={() => setConfirming(null)}
                    >
                      Keep the current one
                    </Button>
                    <Button
                      size="sm"
                      disabled={restoring}
                      onClick={() => void restore(entry.sha)}
                    >
                      {restoring ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Undo2 className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Restore
                    </Button>
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirming(entry.sha)}
                  >
                    <Undo2 className="mr-1.5 h-3.5 w-3.5" />
                    Restore
                  </Button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * FTD's FTP, updated where the members who maintain it already are.
 *
 * The FTP is a set of files in the repository - `docs/ftp/**`, one
 * file per section, declared in `app/constants/divisions/ftd/ftp.ts` - and
 * the profile itself is written somewhere else: a document, the forum's own
 * editor. So this page does one thing per format: paste the finished profile and
 * let it be cut back into its sections at their own headings.
 *
 * There is deliberately no way to edit a section on its own. A profile is one
 * document that moves as a unit, and a section edited by itself is a section
 * that no longer agrees with the rest of the profile it belongs to - which is
 * the drift the paste exists to end.
 *
 * `POST /api/ftp` does the conversion, the split and the write, and this
 * page shows what it would do before it does it. Nothing is stored anywhere
 * else, which is why the page says plainly when a deployment cannot write.
 */

type SectionContent = {
  id: string;
  title: string;
  hint: string;
  format: string;
  formatLabel: string;
  file: string;
  mustKeep: readonly string[];
  /** An update may not rewrite it - the profile's own header. */
  protectedFromPaste: boolean;
  content: string;
  available: boolean;
};

type FormatContent = {
  key: string;
  label: string;
  hint: string;
  sections: SectionContent[];
};

type FtpPayload = {
  writable: boolean;
  /** True when this deployment commits updates through GitHub. */
  commits?: boolean;
  formats: FormatContent[];
};

type VersionEntry = {
  sha: string;
  date: string;
  author: string;
  message: string;
  url: string;
};

type Notice = {
  kind: "ok" | "warn" | "error";
  /** One line saying what happened, in the member's words rather than the code's. */
  title: string;
  detail: string;
  /** The sections an update wrote, by the name the tab gives them. */
  written?: string[];
  /** How many files were left alone, and how many were skipped as the header. */
  unchanged?: number;
  kept?: number;
  /**
   * How many phases had their Guide or Script rewritten, and what that added up
   * to on disk - an update that moved nothing writes nothing, which is worth
   * telling apart from an update that had no notes to write.
   */
  notes?: number;
  noteFiles?: number;
  /** What the paste had to be converted for, when it needed anything. */
  converted?: string;
  warnings?: string[];
  /** The commit that carries the update, when the deployment commits. */
  commit?: string;
};

type FtpRead =
  | { ok: true; payload: FtpPayload }
  | { ok: false; error: string };

/** The sections, as the API serves them. */
async function fetchFtp(): Promise<FtpRead> {
  try {
    const response = await fetch("/api/ftp", { cache: "no-store" });
    const payload = (await response.json()) as FtpPayload & {
      error?: string;
    };
    if (!response.ok) {
      return {
        ok: false,
        error: payload.error ?? "The FTP could not be read.",
      };
    }
    return { ok: true, payload };
  } catch {
    return { ok: false, error: "The FTP could not be read." };
  }
}

/**
 * Paste a finished profile in and have it cut back into its sections.
 *
 * The member writes the profile somewhere else - a document, the forum's own
 * editor - and brings the finished thing here, so this is the one control that
 * takes a whole document rather than a section. It converts the paste as it is
 * typed, splits it, and names the heading it could not find, because a profile
 * that has lost a heading would otherwise land in the wrong files.
 *
 * The conversion is the member's problem solved rather than passed along: what
 * arrives is phpBB's own flavour - its tag ids, `[/*]`, a quoted heading, HTML
 * from a copy off the rendered page - and what the files hold is not. The route
 * converts the same paste again on the way in, which changes nothing, so what
 * this panel shows is what will be written.
 */
function PasteProfilePanel({
  format,
  writable,
  value,
  busy,
  onChange,
  onReplace,
}: {
  format: FormatContent;
  writable: boolean;
  value: string;
  busy: boolean;
  onChange: (value: string) => void;
  onReplace: () => void;
}) {
  // Pressing the button is not the update: it opens the last look at what would
  // be written. A paste is the one edit nobody reads line by line, so the step
  // before it is a named list of the files, not a browser dialog nobody styles.
  const [confirming, setConfirming] = useState(false);
  const converted = useMemo(() => convertFtpBbcode(value), [value]);
  const text = converted.text;
  // Cutting the paste up also puts each section's own tags right, and that is
  // reported beside the conversion: a profile off the forum arrives with the tags
  // where phpBB left them, and without this the member is shown six sections
  // "changed" that say nothing different at all.
  const pastedSections = useMemo(
    () => (text.trim() ? readPastedSections(format.sections, text) : null),
    [format, text],
  );
  const split = pastedSections?.split ?? null;
  const conversions = useMemo(
    () =>
      pastedSections && pastedSections.repaired > 0
        ? [
            ...converted.conversions,
            {
              kind: "tag-order" as const,
              count: pastedSections.repaired,
              note: describeTagRepair(pastedSections.repaired),
            },
          ]
        : converted.conversions,
    [converted.conversions, pastedSections],
  );
  const headings = format.sections
    .map((section) => sectionHeading(section.content))
    .filter((heading): heading is string => heading !== null);
  // A protected section is never written, so a placeholder missing from its
  // paste is nothing to do with this update - refusing the whole thing over a
  // header nobody changed would be worse than the problem.
  const lost =
    split?.ok === true
      ? format.sections
          .filter((section) => !section.protectedFromPaste)
          .flatMap((section) => {
            const pasted = split.sections.find(
              (entry) => entry.id === section.id,
            );
            return (section.mustKeep ?? [])
              .filter((token) => !carriesPlaceholder(pasted?.content ?? "", token))
              .map((token) => `${section.title}: ${token}`);
          })
      : [];
  // The paste is compared against the files as they stand, so the member can see
  // what an update actually touches before it touches it - and so an update that
  // changed one phase leaves one file changed rather than nine.
  const diffs =
    split?.ok === true
      ? format.sections.map((section) => {
          const pasted = split.sections.find((entry) => entry.id === section.id);
          // A protected section is never written by an update, so whether the
          // paste agrees with it is not the member's problem - it is reported as
          // kept rather than as a change they cannot act on.
          if (section.protectedFromPaste) {
            return {
              section,
              changed: false,
              compared: false,
              reason: "An update never rewrites the profile's header.",
            };
          }
          const match = compareFtpSection(
            section.content,
            pasted?.content ?? "",
          );
          return {
            section,
            changed: !match.same,
            // "Identical" is the one answer not worth a line of its own.
            compared: match.kind !== "identical",
            reason: match.reason,
          };
        })
      : [];
  const changed = diffs.filter((entry) => entry.changed);
  const changedCount = changed.length;
  const changedTitles = changed.map((entry) => entry.section.title);
  const unchangedCount = diffs.filter(
    (entry) => !entry.changed && !entry.section.protectedFromPaste,
  ).length;
  const keptCount = format.sections.filter(
    (section) => section.protectedFromPaste,
  ).length;
  const ready = writable && lost.length === 0 && split?.ok === true;
  const files = `file${changedCount === 1 ? "" : "s"}`;

  const status = !writable
    ? "Replacing a whole profile rewrites every section file, so it only works on a local development server."
    : !value.trim()
      ? "Nothing pasted yet."
      : split && !split.ok
        ? split.reason
        : lost.length > 0
          ? "This paste would lose a placeholder a section has to keep."
          : `Recognised all ${format.sections.length} sections.`;

  return (
    <div className="rounded-xl border border-border bg-surface/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ClipboardPaste className="h-4 w-4 text-muted-foreground" />
            Replace the whole {format.label} profile
          </p>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            Paste the finished profile - the same text Copy & Open hands an FTO.
            It is cut back into these {format.sections.length} sections at their
            own headings, and every one of their files is rewritten at once.
            Whatever the paste was written in is converted first: the tags phpBB
            adds of its own, `[/*]`, a quoted heading and HTML off a rendered
            page all come in as they are.
          </p>
        </div>
        <p className="shrink-0 text-[11px] text-muted-foreground">
          Press Update {format.label} again to put this away.
        </p>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
        <span>Split at:</span>
        {headings.map((heading) => (
          <code
            key={heading}
            className="rounded border border-border px-1.5 py-0.5 font-mono"
          >
            {heading}
          </code>
        ))}
      </div>

      {/* A whole profile is hundreds of lines. The box is a window onto it
          rather than as tall as it is, so the diff list and the button stay on
          screen while the member reads the paste back. */}
      <div className="mt-3">
        <BBCodeEditor
          value={value}
          onChange={(next) => {
            setConfirming(false);
            onChange(next);
          }}
          rows={16}
          maxHeightClass="max-h-[45vh]"
          placeholder="Paste the whole profile here, exactly as it goes on the forum."
        />
      </div>

      {conversions.length > 0 && (
        <div className="mt-2 rounded-lg border border-sky-300/40 bg-sky-50/60 px-3 py-2 text-[11px] text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
          <p className="font-medium">
            Converted on the way in - {describeConversions(conversions)}.
          </p>
          <details className="mt-1">
            <summary className="cursor-pointer text-sky-800/80 dark:text-sky-200/80">
              See the markup that will be written
            </summary>
            <pre className="mt-1 max-h-40 overflow-auto rounded border border-sky-300/30 bg-background/70 p-2 font-mono text-[10px] whitespace-pre-wrap">
              {text}
            </pre>
          </details>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p
          className={cn(
            "text-xs",
            ready
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-amber-700 dark:text-amber-300",
          )}
        >
          {status}
        </p>
        {!confirming && (
          <Button size="sm" disabled={!ready || busy} onClick={() => setConfirming(true)}>
            <ClipboardPaste className="mr-1.5 h-3.5 w-3.5" />
            {/* An update that writes no section file is not an update that does
                nothing: the Guide and Script of every phase of this profile are
                rebuilt from the sections, which is what the button says when
                there is nothing else to say. */}
            {changedCount === 0
              ? `Rebuild the Guides for ${format.label}`
              : `Update ${changedCount} changed section${
                  changedCount === 1 ? "" : "s"
                }`}
          </Button>
        )}
      </div>

      {confirming && ready && (
        <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3.5">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <GitCommitHorizontal className="h-4 w-4 text-primary" />
            {changedCount === 0
              ? `Rebuild the Guides for ${format.label}?`
              : `Write ${changedCount} ${files} into ${format.label}?`}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {changedTitles.map((title) => (
              <Badge key={title} variant="warning">
                {title}
              </Badge>
            ))}
            {unchangedCount > 0 && (
              <Badge variant="muted">
                {unchangedCount} already identical
              </Badge>
            )}
            {keptCount > 0 && <Badge variant="muted">header kept</Badge>}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {changedCount === 0 ? (
              "No section file differs, so none is written. "
            ) : (
              <>
                Each one is a file under{" "}
                <code className="font-mono">docs/ftp/</code>, so the change
                is a commit you push like any other.{" "}
              </>
            )}
            The Guide and the Script of every phase this profile is read by are
            rebuilt from these sections, and only the ones that actually move are
            written. Nothing has been written yet.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              Look again
            </Button>
            <Button size="sm" disabled={busy} onClick={onReplace}>
              {busy ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="mr-1.5 h-3.5 w-3.5" />
              )}
              Write {changedCount} {files}
            </Button>
          </div>
        </div>
      )}

      {lost.length > 0 && (
        <ul className="mt-2 list-disc space-y-0.5 pl-6 text-[11px] text-amber-700 dark:text-amber-300">
          {lost.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      )}

      {diffs.length > 0 && (
        <div className="mt-3 rounded-lg border border-border p-3">
          <p className="text-xs font-medium text-foreground">
            What this paste changes
          </p>
          <ul className="mt-2 space-y-1 text-[11px]">
            {diffs.map(({ section, changed, compared, reason }) => (
              <li key={section.id}>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-16 shrink-0 rounded border px-1.5 py-0.5 text-center",
                      section.protectedFromPaste
                        ? "border-sky-300/50 text-sky-700 dark:text-sky-300"
                        : changed
                          ? "border-amber-300/50 text-amber-700 dark:text-amber-300"
                          : "border-border text-muted-foreground",
                    )}
                  >
                    {section.protectedFromPaste
                      ? "kept"
                      : changed
                        ? "changed"
                        : "same"}
                  </span>
                  <span
                    className={
                      changed ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {section.title}
                  </span>
                  <code className="truncate font-mono text-muted-foreground">
                    {section.file}
                  </code>
                </div>
                {/* Why, not just whether: a profile is long lines, and the one
                    word that differs sits at the far end of two that look the
                    same. */}
                {compared && (
                  <p className="mt-0.5 ml-18 text-[10px] text-muted-foreground">
                    {reason}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {changedCount === 0
              ? "No section file differs - but the Guides a trainer reads are drawn from these sections, and accepting is what rebuilds them."
              : `Only those ${changedCount} file${
                  changedCount === 1 ? "" : "s"
                } will be written; the rest are left exactly as they are.`}{" "}
            {keptCount > 0
              ? `The ${keptCount === 1 ? "" : `${keptCount} `}header section${
                  keptCount === 1 ? " is" : "s are"
                } ignored: a paste never rewrites the profile's own header.`
              : ""}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * What an update did, said the way a member reads it: which sections were
 * written, under the names the tab gives them, and what to do with them next.
 *
 * A paste can write nine files at once and a toast is gone in two seconds, so
 * the result stays on the page until the next update - and an update that changed
 * nothing says so plainly rather than looking like one that did.
 */
function NoticeCard({ notice }: { notice: Notice }) {
  const Icon = notice.kind === "ok" ? Check : AlertTriangle;
  const tone =
    notice.kind === "ok"
      ? {
          card: "border-emerald-300/40 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10",
          chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
          title: "text-emerald-900 dark:text-emerald-100",
          detail: "text-emerald-800/85 dark:text-emerald-200/85",
        }
      : notice.kind === "warn"
        ? {
            card: "border-amber-300/40 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10",
            chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
            title: "text-amber-900 dark:text-amber-100",
            detail: "text-amber-800/85 dark:text-amber-200/85",
          }
        : {
            card: "border-red-300/40 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10",
            chip: "bg-red-500/15 text-red-700 dark:text-red-300",
            title: "text-red-900 dark:text-red-100",
            detail: "text-red-800/85 dark:text-red-200/85",
          };
  const written = notice.written ?? [];

  return (
    <div className={cn("rounded-xl border px-4 py-3.5", tone.card)}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            tone.chip,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-semibold", tone.title)}>
            {notice.title}
          </p>
          <p className={cn("mt-0.5 text-xs leading-relaxed", tone.detail)}>
            {notice.detail}
          </p>

          {(written.length > 0 || notice.unchanged || notice.kept) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {written.map((title) => (
                <Badge key={title} variant="success">
                  {title}
                </Badge>
              ))}
              {notice.unchanged ? (
                <Badge variant="muted">
                  {notice.unchanged} already identical
                </Badge>
              ) : null}
              {notice.kept ? (
                <Badge variant="muted">header left as it is</Badge>
              ) : null}
            </div>
          )}

          {notice.notes ? (
            <p
              className={cn(
                "mt-2 flex items-center gap-1.5 text-[11px]",
                tone.detail,
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {notice.notes} phase guide{notice.notes === 1 ? "" : "s"} written
              from the FTP
              {notice.noteFiles
                ? ` (${notice.noteFiles} file${notice.noteFiles === 1 ? "" : "s"})`
                : ""}
            </p>
          ) : written.length > 0 ? (
            <p
              className={cn(
                "mt-2 flex items-center gap-1.5 text-[11px]",
                tone.detail,
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              The phase notes already said this, so none was rewritten
            </p>
          ) : null}

          {notice.converted ? (
            <p className={cn("mt-2 text-[11px]", tone.detail)}>
              {notice.converted}
            </p>
          ) : null}

          {notice.commit ? (
            <a
              href={notice.commit}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "mt-2.5 flex items-center gap-1.5 font-mono text-[11px] underline",
                tone.detail,
              )}
            >
              <GitCommitHorizontal className="h-3.5 w-3.5" />
              View the commit - the deployment goes live as it rolls out
            </a>
          ) : written.length > 0 && notice.kind === "ok" ? (
            <p
              className={cn(
                "mt-2.5 flex items-center gap-1.5 font-mono text-[11px]",
                tone.detail,
              )}
            >
              <GitCommitHorizontal className="h-3.5 w-3.5" />
              docs/ftp/ - commit it like any other change
            </p>
          ) : null}

          {notice.warnings && notice.warnings.length > 0 ? (
            <ul className={cn("mt-2 list-disc space-y-0.5 pl-5 text-xs", tone.detail)}>
              {notice.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FtpManager() {
  const [data, setData] = useState<FtpPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  // The whole-profile paste: which format is being replaced, and its text.
  const [pasting, setPasting] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const [replacing, setReplacing] = useState(false);
  // Bumped after a restore, so the sections re-read and the version history
  // picks up the commit the restore itself made.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let live = true;
    void (async () => {
      const read = await fetchFtp();
      if (!live) return;
      if (read.ok) {
        setData(read.payload);
      } else {
        setLoadError(read.error);
      }
      setLoading(false);
    })();
    return () => {
      live = false;
    };
  }, [version]);

  const pastingFormat =
    data?.formats.find((format) => format.key === pasting) ?? null;

  const replaceFormat = async () => {
    if (!pastingFormat) return;
    const format = pastingFormat;
    setReplacing(true);
    setNotice(null);
    try {
      const response = await fetch("/api/ftp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: format.key, content: pasted }),
      });
      const payload = (await response.json()) as {
        written?: boolean;
        warnings?: string[];
        error?: string;
        problems?: string[];
        reason?: string;
        changed?: string[];
        unchanged?: string[];
        kept?: string[];
        notes?: string[];
        notesPhases?: string[];
        notesSkipped?: { component: string; reason: string }[];
        conversions?: { kind: string; count: number; note: string }[];
        commit?: string;
      };

      if (response.ok && payload.written) {
        // The files are the source of truth now, so read them back rather than
        // patching local state by hand.
        const read = await fetchFtp();
        if (read.ok) setData(read.payload);
        setPasting(null);
        setPasted("");
        const changed = payload.changed ?? [];
        const titles = changed.map(
          (id) => format.sections.find((section) => section.id === id)?.title ?? id,
        );
        // The paperwork is the other half of an update, and an accepted paste
        // that wrote no section file at all can still have rebuilt every Guide
        // and Script - saying "already up to date" there is what made a member
        // think the update had not run.
        const phases = (payload.notesPhases ?? []).length;
        const rebuilt = `${phases} phase Guide${phases === 1 ? "" : "s"} rebuilt`;
        const outcome =
          changed.length > 0
            ? {
                title: `Updated ${changed.length} of ${format.sections.length} ${format.label} sections`,
                detail:
                  "The rest of the profile was already identical and was left exactly as it was.",
                toast: `${format.label} updated - ${changed.length} section${
                  changed.length === 1 ? "" : "s"
                } changed`,
              }
            : phases > 0
              ? {
                  title: `No profile file changed - ${rebuilt}`,
                  detail:
                    "Nothing you pasted differs from the section files. What moved is the paperwork drawn from them, which is the point of accepting it.",
                  toast: `${format.label} - ${rebuilt}`,
                }
              : {
                  title: `${format.label} was already up to date`,
                  detail:
                    "Nothing you pasted differs from the files, and the Guides already say what these sections say.",
                  toast: `${format.label} was already up to date`,
                };
        // The paste was converted on the way in, and what it had to be
        // converted for is worth saying: it is the difference between the text
        // the member pasted and the text the section files now hold.
        const converted =
          payload.conversions && payload.conversions.length > 0
            ? `Converted on the way in: ${payload.conversions
                .map((conversion) => conversion.note)
                .join("; ")}.`
            : undefined;
        setNotice({
          kind: "ok",
          title: outcome.title,
          detail: outcome.detail,
          written: titles,
          unchanged: payload.unchanged?.length ?? 0,
          kept: payload.kept?.length ?? 0,
          notes: (payload.notesPhases ?? []).length,
          noteFiles: payload.notes?.length ?? 0,
          converted,
          commit: payload.commit,
          // A phase that could not be rebuilt says so here rather than in a
          // console nobody reads: it is the one thing about an update that the
          // member can still fix.
          warnings: [
            ...(payload.warnings ?? []),
            ...(payload.notesSkipped ?? []).map(
              (skipped) => `${skipped.component}: ${skipped.reason}`,
            ),
          ],
        });
        toast.success(outcome.toast);
      } else {
        // A read-only deployment refuses a whole-profile replace outright, which
        // is worth saying plainly rather than as a failure.
        const refused = response.status === 409 && !payload.error;
        setNotice({
          kind: refused ? "warn" : "error",
          title: refused
            ? "An update has to happen on a local development server"
            : `${format.label} was not replaced`,
          detail:
            payload.error ?? payload.reason ?? "The profile was not replaced.",
          warnings: payload.problems,
        });
        toast.error(payload.error ?? "The profile was not replaced");
      }
    } catch {
      setNotice({
        kind: "error",
        title: "The update could not be sent",
        detail: "The request failed before the FTP was touched.",
      });
    } finally {
      setReplacing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <LocalOnlyNote />
        <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Reading the FTP…
        </div>
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="space-y-5">
        <LocalOnlyNote />
        <div className="rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-6 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            {loadError ?? "The FTP could not be read."}
          </p>
          <p className="mt-1 text-amber-800/80 dark:text-amber-200/80">
            The sections live in <code className="font-mono">docs/ftp/</code> in
            the repository, and the FTP tab is only shown to FTD Head,
            Assistant Head of FTD and Command+.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />

      <LocalOnlyNote writable={data.writable} commits={data.commits} />

      {/*
       * The job that brings a member here, and the only way it is done: the
       * profile is rewritten somewhere else and pasted in whole. One button per
       * format because the two profiles are updated by different people at
       * different times.
       */}
      <div className="grid gap-3 sm:grid-cols-2">
        {data.formats.map((format) => (
          <button
            key={format.key}
            type="button"
            onClick={() => {
              setPasting(pasting === format.key ? null : format.key);
              setPasted("");
              setNotice(null);
            }}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
              pasting === format.key
                ? "border-primary/50 bg-primary/10"
                : "border-border bg-surface/60 hover:bg-surface-hover",
            )}
          >
            <ClipboardPaste className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                Update {format.label}
              </span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                Paste the whole updated profile - only the sections that differ
                are written, and the profile header is left alone. Press it again
                to close the box.
              </span>
            </span>
          </button>
        ))}
      </div>

      {notice && <NoticeCard notice={notice} />}

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-surface/60 p-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            The FTP is the repository
          </p>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            Each section is one file under{" "}
            <code className="font-mono">docs/ftp/</code>, and an update
            writes them, so the change is a commit you push like any other -
            there is no second copy in a database to drift out of step.
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-lg border px-2.5 py-1 text-[11px]",
            data.writable
              ? "border-emerald-300/40 text-emerald-700 dark:text-emerald-300"
              : "border-amber-300/40 text-amber-700 dark:text-amber-300",
          )}
        >
          {data.commits
            ? "This deployment commits updates to GitHub"
            : data.writable
              ? "This deployment writes the source files"
              : "Read-only deployment - an update has to happen locally"}
        </span>
      </div>

      {pastingFormat && (
        <PasteProfilePanel
          format={pastingFormat}
          writable={data.writable}
          value={pasted}
          busy={replacing}
          onChange={setPasted}
          onReplace={() => void replaceFormat()}
        />
      )}

      <VersionHistoryPanel
        onNotice={setNotice}
        onRestored={() => setVersion((value) => value + 1)}
      />
    </div>
  );
}
