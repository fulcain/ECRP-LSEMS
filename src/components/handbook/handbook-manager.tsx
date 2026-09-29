"use client";

import { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ClipboardPaste,
  Copy,
  Download,
  FileCode2,
  Loader2,
  RotateCcw,
  Save,
  Terminal,
  Variable,
  X,
} from "lucide-react";

import {
  HANDBOOK_VARIABLES,
  sectionHeading,
  splitHandbookDocument,
} from "@/app/constants/divisions/ftd/handbook";
import { Button } from "@/components/ui/button";
import { BBCodeEditor } from "@/components/ui/bbcode-editor";
import { cn } from "@/lib/utils";

/**
 * The one thing to know before touching this page: it writes files in the
 * checkout the app is running from, so it only does anything on a local
 * development server. A deployed build says so in `writable` rather than leaving
 * the member to discover it when Publish hands them a section to apply by hand.
 */
function LocalOnlyNote({ writable }: { writable?: boolean }) {
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
              ? "Publishing writes the section's file under docs/handbook/, so the change is a commit you push like any other."
              : "This deployment cannot write its own files, so publishing hands you the section to apply under docs/handbook/ and commit yourself."}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * FTD's handbook, edited where the members who maintain it already are.
 *
 * The handbook is a set of files in the repository - `docs/handbook/**`, one
 * file per section, declared in `app/constants/divisions/ftd/handbook.ts` - so
 * this page is a file editor, not a content database: it reads a section with
 * `GET /api/handbook`, writes one back with `POST /api/handbook`, and a published
 * change becomes a git diff the member commits like any other. Nothing is stored
 * anywhere else, which is why the page says plainly when a deployment cannot
 * write and hands over the file instead.
 *
 * The shape of the page is the shape of the job: the formats and their sections
 * down the left, the one you picked on the right, and publishing behind a
 * confirmation because it is the one button that changes the repository.
 *
 * The profile itself is usually written somewhere else - a document, the forum's
 * own editor - so a format can also be replaced whole: paste the finished profile
 * and it is cut back into its sections at their own headings, which is the one
 * edit nobody reads line by line before pressing the button.
 */

type SectionContent = {
  id: string;
  title: string;
  hint: string;
  format: string;
  formatLabel: string;
  file: string;
  mustKeep: readonly string[];
  content: string;
  available: boolean;
};

type FormatContent = {
  key: string;
  label: string;
  hint: string;
  sections: SectionContent[];
};

type HandbookPayload = {
  writable: boolean;
  formats: FormatContent[];
};

type Notice = {
  kind: "ok" | "warn" | "error";
  text: string;
  /** The file to apply by hand when a publish could not be written. */
  export?: { file: string; content: string } | null;
  warnings?: string[];
};

type HandbookRead =
  | { ok: true; payload: HandbookPayload }
  | { ok: false; error: string };

/** The sections, as the API serves them. */
async function fetchHandbook(): Promise<HandbookRead> {
  try {
    const response = await fetch("/api/handbook", { cache: "no-store" });
    const payload = (await response.json()) as HandbookPayload & {
      error?: string;
    };
    if (!response.ok) {
      return {
        ok: false,
        error: payload.error ?? "The handbook could not be read.",
      };
    }
    return { ok: true, payload };
  } catch {
    return { ok: false, error: "The handbook could not be read." };
  }
}

/**
 * Paste a finished profile in and have it cut back into its sections.
 *
 * The member writes the profile somewhere else - a document, the forum's own
 * editor - and brings the finished thing here, so this is the one control that
 * takes a whole document rather than a section. It splits the paste as it is
 * typed and names the heading it could not find, because a profile that has lost
 * a heading would otherwise land in the wrong files.
 */
function PasteProfilePanel({
  format,
  writable,
  value,
  busy,
  onChange,
  onCancel,
  onReplace,
}: {
  format: FormatContent;
  writable: boolean;
  value: string;
  busy: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
  onReplace: () => void;
}) {
  const split = useMemo(
    () => (value.trim() ? splitHandbookDocument(format.sections, value) : null),
    [format, value],
  );
  const headings = format.sections
    .map((section) => sectionHeading(section.content))
    .filter((heading): heading is string => heading !== null);
  const lost =
    split?.ok === true
      ? format.sections.flatMap((section) => {
          const pasted = split.sections.find((entry) => entry.id === section.id);
          return (section.mustKeep ?? [])
            .filter((token) => !(pasted?.content ?? "").includes(token))
            .map((token) => `${section.title}: ${token}`);
        })
      : [];
  const ready = writable && lost.length === 0 && split?.ok === true;

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
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="mr-1.5 h-3.5 w-3.5" />
          Cancel
        </Button>
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

      <div className="mt-3">
        <BBCodeEditor
          value={value}
          onChange={onChange}
          rows={16}
          placeholder="Paste the whole profile here, exactly as it goes on the forum."
        />
      </div>

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
        <Button size="sm" disabled={!ready || busy} onClick={onReplace}>
          {busy ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <ClipboardPaste className="mr-1.5 h-3.5 w-3.5" />
          )}
          Replace all {format.sections.length} sections
        </Button>
      </div>

      {lost.length > 0 && (
        <ul className="mt-2 list-disc space-y-0.5 pl-6 text-[11px] text-amber-700 dark:text-amber-300">
          {lost.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HandbookManager() {
  const [data, setData] = useState<HandbookPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  // The whole-profile paste: which format is being replaced, and its text.
  const [pasting, setPasting] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const [replacing, setReplacing] = useState(false);

  useEffect(() => {
    let live = true;
    void (async () => {
      const read = await fetchHandbook();
      if (!live) return;
      if (read.ok) {
        setData(read.payload);
        setActiveId(read.payload.formats[0]?.sections[0]?.id ?? null);
      } else {
        setLoadError(read.error);
      }
      setLoading(false);
    })();
    return () => {
      live = false;
    };
  }, []);

  const sections = useMemo(
    () => data?.formats.flatMap((format) => format.sections) ?? [],
    [data],
  );
  const active = sections.find((section) => section.id === activeId) ?? null;
  const pastingFormat =
    data?.formats.find((format) => format.key === pasting) ?? null;
  const draft = active ? (drafts[active.id] ?? active.content) : "";
  const dirty = Boolean(active && draft !== active.content);
  const dirtyIds = sections
    .filter((section) => (drafts[section.id] ?? section.content) !== section.content)
    .map((section) => section.id);

  const setDraft = (value: string) => {
    if (!active) return;
    setDrafts((current) => ({ ...current, [active.id]: value }));
  };

  const publish = async () => {
    if (!active) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/handbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: active.id, content: draft }),
      });
      const payload = (await response.json()) as {
        written?: boolean;
        file?: string;
        reason?: string;
        content?: string;
        warnings?: string[];
        error?: string;
        problems?: string[];
      };

      if (response.ok && payload.written) {
        setData((current) =>
          current
            ? {
                ...current,
                formats: current.formats.map((format) => ({
                  ...format,
                  sections: format.sections.map((section) =>
                    section.id === active.id
                      ? { ...section, content: draft, available: true }
                      : section,
                  ),
                })),
              }
            : current,
        );
        setDrafts((current) => {
          const next = { ...current };
          delete next[active.id];
          return next;
        });
        setNotice({
          kind: "ok",
          text: `${active.title} was written to ${payload.file}. Commit it like any other change.`,
          warnings: payload.warnings,
        });
        toast.success("Section saved to the repository");
      } else if (response.status === 409 && payload.content) {
        // A deployment that cannot write: the change is real, the file is not
        // saved, and the honest answer is the file itself.
        setNotice({
          kind: "warn",
          text: `${
            payload.reason ??
            "This deployment cannot write to its own files, so the change was not saved."
          } Apply the text to that file, run \`npm run handbook:sync\`, and commit both - the profile the contract workflow hands out is built from this section.`,
          export: { file: payload.file ?? active.file, content: payload.content },
          warnings: payload.warnings,
        });
      } else {
        setNotice({
          kind: "error",
          text: payload.error ?? "The section was not published.",
          warnings: payload.problems,
        });
        toast.error(payload.error ?? "The section was not published");
      }
    } catch {
      setNotice({ kind: "error", text: "The publish request failed." });
    } finally {
      setSaving(false);
    }
  };

  const download = (file: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.split("/").pop() ?? "section.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const replaceFormat = async () => {
    if (!pastingFormat) return;
    const format = pastingFormat;
    setReplacing(true);
    setNotice(null);
    try {
      const response = await fetch("/api/handbook", {
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
      };

      if (response.ok && payload.written) {
        // The files are the source of truth now, so read them back rather than
        // patching several sections of local state by hand.
        const read = await fetchHandbook();
        setDrafts((current) => {
          const next = { ...current };
          for (const section of format.sections) delete next[section.id];
          return next;
        });
        if (read.ok) {
          setData(read.payload);
          setActiveId((current) =>
            read.payload.formats.some((entry) =>
              entry.sections.some((section) => section.id === current),
            )
              ? current
              : read.payload.formats[0]?.sections[0]?.id ?? null,
          );
        }
        setPasting(null);
        setPasted("");
        setNotice({
          kind: "ok",
          text: `All ${format.sections.length} sections of ${format.label} were rewritten. Commit them like any other change.`,
          warnings: payload.warnings,
        });
        toast.success(`${format.label} profile replaced`);
      } else {
        // A read-only deployment refuses a whole-profile replace outright, which
        // is worth saying plainly rather than as a failure.
        const refused = response.status === 409 && !payload.error;
        setNotice({
          kind: refused ? "warn" : "error",
          text:
            payload.error ?? payload.reason ?? "The profile was not replaced.",
          warnings: payload.problems,
        });
        toast.error(payload.error ?? "The profile was not replaced");
      }
    } catch {
      setNotice({ kind: "error", text: "The replace request failed." });
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
          Reading the handbook…
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
            {loadError ?? "The handbook could not be read."}
          </p>
          <p className="mt-1 text-amber-800/80 dark:text-amber-200/80">
            The sections live in <code className="font-mono">docs/handbook/</code> in
            the repository, and only a Discord admin listed in{" "}
            <code className="font-mono">DISCORD_ADMIN_IDS</code> can open them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />

      <LocalOnlyNote writable={data.writable} />

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-surface/60 p-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            The handbook is the repository
          </p>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            Every section below is one file under{" "}
            <code className="font-mono">docs/handbook/</code>. Publishing writes
            that file, so the change is a commit you push like any other - there is
            no second copy in a database to drift out of step.
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
          {data.writable
            ? "This deployment writes the source files"
            : "Read-only deployment - publish hands you the file"}
        </span>
      </div>

      {notice && (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            notice.kind === "ok" &&
              "border-emerald-300/40 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
            notice.kind === "warn" &&
              "border-amber-300/40 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
            notice.kind === "error" &&
              "border-red-300/40 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200",
          )}
        >
          <p className="flex items-start gap-2 font-medium">
            {notice.kind === "ok" ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{notice.text}</span>
          </p>
          {notice.warnings && notice.warnings.length > 0 && (
            <ul className="mt-1.5 list-disc space-y-0.5 pl-6 text-xs">
              {notice.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
          {notice.export && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <code className="rounded border border-border px-1.5 py-0.5 font-mono">
                {notice.export.file}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  notice.export &&
                  download(notice.export.file, notice.export.content)
                }
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download the file
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void navigator.clipboard.writeText(notice.export?.content ?? "");
                  toast.success("Section copied - paste it over the file");
                }}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy the file
              </Button>
            </div>
          )}
        </div>
      )}

      {pastingFormat && (
        <PasteProfilePanel
          format={pastingFormat}
          writable={data.writable}
          value={pasted}
          busy={replacing}
          onChange={setPasted}
          onCancel={() => {
            setPasting(null);
            setPasted("");
          }}
          onReplace={() => {
            const count = pastingFormat.sections.length;
            if (
              !window.confirm(
                `Replace all ${count} sections of ${pastingFormat.label}? This writes ${count} files in the repository, so it goes out with your next push.`,
              )
            ) {
              return;
            }
            void replaceFormat();
          }}
        />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        {/* ── The formats, then their sections ── */}
        <nav className="space-y-4">
          {data.formats.map((format) => (
            <section key={format.key} className="space-y-1.5">
              <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
                {format.label}
              </h3>
              <p className="text-[11px] leading-snug text-muted-foreground">
                {format.hint}
              </p>
              <ul className="space-y-1 pt-1">
                {format.sections.map((section) => {
                  const isActive = section.id === active?.id;
                  const isDirty = dirtyIds.includes(section.id);
                  return (
                    <li key={section.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveId(section.id);
                          setNotice(null);
                        }}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors",
                          isActive
                            ? "border-primary/50 bg-primary/10 text-foreground"
                            : "border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {section.title}
                        </span>
                        {!section.available && (
                          <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />
                        )}
                        {isDirty && (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                            title="Edited, not published"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <Button
                size="sm"
                variant="ghost"
                className="w-full justify-start text-[11px] text-muted-foreground"
                onClick={() => {
                  setPasting(format.key);
                  setPasted("");
                  setNotice(null);
                }}
              >
                <ClipboardPaste className="mr-1.5 h-3 w-3" />
                Paste a new {format.label} profile
              </Button>
            </section>
          ))}
        </nav>

        {/* ── The section you picked ── */}
        {active ? (
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground">
                  {active.title}
                  {dirty && (
                    <span className="ml-2 align-middle text-[11px] font-normal text-amber-600 dark:text-amber-400">
                      unsaved changes
                    </span>
                  )}
                </h2>
                <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
                  {active.hint}
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                  <FileCode2 className="h-3 w-3" />
                  {active.file}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!dirty}
                  onClick={() => {
                    setDrafts((current) => {
                      const next = { ...current };
                      delete next[active.id];
                      return next;
                    });
                    setNotice(null);
                  }}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Discard
                </Button>
                <Button
                  size="sm"
                  disabled={!dirty || saving}
                  onClick={() => {
                    if (
                      !window.confirm(
                        `Publish ${active.title}? This writes ${active.file} in the repository, so it goes out with your next push.`,
                      )
                    ) {
                      return;
                    }
                    void publish();
                  }}
                >
                  {saving ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Publish
                </Button>
              </div>
            </div>

            {active.mustKeep.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Variable className="h-3 w-3" />
                  Must stay in this section:
                </span>
                {active.mustKeep.map((token) => (
                  <code
                    key={token}
                    className="rounded border border-border px-1.5 py-0.5 font-mono"
                  >
                    {token}
                  </code>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>Insert a placeholder:</span>
              {HANDBOOK_VARIABLES.map((variable) => (
                <button
                  key={variable.token}
                  type="button"
                  title={variable.hint}
                  onClick={() => {
                    void navigator.clipboard.writeText(variable.token);
                    toast.success(`${variable.token} copied - paste it where it goes`);
                  }}
                  className="cursor-pointer rounded border border-border px-1.5 py-0.5 font-mono transition-colors hover:bg-surface-hover"
                >
                  {variable.token}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <BBCodeEditor
                value={draft}
                onChange={setDraft}
                rows={22}
                placeholder="The section's BBCode, exactly as the forum takes it."
              />
            </div>

            <p className="text-[11px] text-muted-foreground">
              Placeholders like{" "}
              <code className="font-mono">{"{{"}</code>{"applicantName"}
              <code className="font-mono">{"}}"}</code> are filled in when the post is
              used - leave them as they are, and publishing is refused if one goes
              missing.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Pick a section on the left.
          </p>
        )}
      </div>
    </div>
  );
}
