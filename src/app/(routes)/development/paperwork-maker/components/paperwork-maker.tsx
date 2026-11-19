"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  FileCode2,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { PaperworkWorkspace } from "@/components/paperwork/paperwork-workspace";
import { DIVISION_ENTRIES } from "@/configs/roles";
import { FIELD_TYPES } from "@/lib/paperwork/fields";
import {
  BUILTIN_PLACEHOLDERS,
  divisionSlug,
  validatePaperworkConfig,
  type PaperworkAction,
  type PaperworkConfig,
  type PaperworkField,
  type PaperworkFieldType,
  type PaperworkFormat,
} from "@/lib/paperwork/schema";

type PlacedFormat = {
  format: PaperworkFormat;
  groupIndex: number;
  formatIndex: number;
};

type FormatSlot = {
  pageIndex: number;
  groupIndex: number;
  formatIndex: number;
};

type PlannedFile = {
  path: string;
  content: string;
  action: "create" | "update" | "unchanged";
};

type PlanResponse = {
  ok: boolean;
  problems: string[];
  files: PlannedFile[];
  integration: string[];
};

// Bumped with the sample removal: a draft saved against the old sample must not
// open as this division's paperwork.
const DRAFT_KEY = "paperwork-maker-config-v2";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function locate(config: PaperworkConfig, key: string): PlacedFormat | null {
  for (const page of config.division.pages) {
    for (const [groupIndex, group] of page.groups.entries()) {
      for (const [formatIndex, format] of group.formats.entries()) {
        if (format.key === key) return { format, groupIndex, formatIndex };
      }
    }
  }
  return null;
}

function slotOf(config: PaperworkConfig, key: string): FormatSlot | null {
  for (const [pageIndex, page] of config.division.pages.entries()) {
    for (const [groupIndex, group] of page.groups.entries()) {
      for (const [formatIndex, format] of group.formats.entries()) {
        if (format.key === key) return { pageIndex, groupIndex, formatIndex };
      }
    }
  }
  return null;
}

/**
 * The selected format by position rather than by key. A key is editable, so it
 * cannot be the only way back to the format being edited: while it is half typed
 * (or empty) the editor still has to know what it is editing.
 */
function placedAt(
  config: PaperworkConfig,
  slot: FormatSlot,
): PlacedFormat | null {
  const page = config.division.pages[slot.pageIndex];
  const format = page?.groups[slot.groupIndex]?.formats[slot.formatIndex];
  if (!format) return null;
  return {
    format,
    groupIndex: slot.groupIndex,
    formatIndex: slot.formatIndex,
  };
}

/**
 * The visual editor for a division's paperwork.
 *
 * It edits one config object and asks the server what that config would write -
 * the plan is the only path to a file, and it is shown before Generate can be
 * pressed. The preview is `PaperworkWorkspace`, the very component a generated
 * page renders, so "it looked fine in the maker" cannot mean something else.
 */
export function PaperworkMaker({ initial }: { initial: PaperworkConfig }) {
  const [config, setConfig] = useLocalStorage<PaperworkConfig>(
    DRAFT_KEY,
    initial,
  );
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<FormatSlot | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  // "new" builds a division; any other value is a division the app already has.
  const [divisionChoice, setDivisionChoice] = useState<string>(() =>
    DIVISION_ENTRIES.some(([key]) => key === config.division.key)
      ? config.division.key
      : "new",
  );
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [busy, setBusy] = useState<"plan" | "generate" | null>(null);
  const [written, setWritten] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<PaperworkConfig[]>([]);
  const templateRef = useRef<HTMLTextAreaElement>(null);

  const refreshSaved = useCallback(async () => {
    try {
      const response = await fetch("/api/paperwork-maker");
      if (!response.ok) return;
      const body = (await response.json()) as { configs?: PaperworkConfig[] };
      setSaved(body.configs ?? []);
    } catch {
      // The list is a shortcut; the editor works without it.
    }
  }, []);

  useEffect(() => {
    void refreshSaved();
  }, [refreshSaved]);

  /** Reopens a config that was generated earlier, so its formats stay editable. */
  const editSaved = (key: string) => {
    const found = saved.find((entry) => entry.division.key === key);
    if (!found) return;
    setConfig(clone(found));
    setDivisionChoice(
      DIVISION_ENTRIES.some(([entryKey]) => entryKey === key) ? key : "new",
    );
    setPageIndex(0);
    const first = found.division.pages[0]?.groups[0]?.formats[0];
    setSelectedKey(first?.key ?? "");
    setSelectedSlot(
      first ? { pageIndex: 0, groupIndex: 0, formatIndex: 0 } : null,
    );
    setPlan(null);
    setWritten(null);
  };

  const placed =
    locate(config, selectedKey) ??
    (selectedSlot ? placedAt(config, selectedSlot) : null);
  const validation = useMemo(() => validatePaperworkConfig(config), [config]);

  const update = (mutate: (draft: PaperworkConfig) => void) => {
    setConfig((prev) => {
      const next = clone(prev);
      mutate(next);
      return next;
    });
    setPlan(null);
    setWritten(null);
  };

  const updateFormat = (mutate: (format: PaperworkFormat) => void) => {
    update((draft) => {
      const target =
        locate(draft, selectedKey) ??
        (selectedSlot ? placedAt(draft, selectedSlot) : null);
      if (target) mutate(target.format);
    });
  };

  const selectFormat = (key: string) => {
    setSelectedKey(key);
    setSelectedSlot(slotOf(config, key));
  };

  /** Renames the format and keeps it selected, so the editor never goes blank. */
  const renameFormat = (previous: string, next: string) => {
    if (next === previous) return;
    const slot = slotOf(config, previous);
    update((draft) => {
      const target = locate(draft, previous);
      if (target) target.format.key = next;
    });
    setSelectedKey(next);
    if (slot) setSelectedSlot(slot);
  };

  /**
   * Renames a field key and follows it through everything that names it: the
   * template, the subject, the copy actions and the insert targets. A chip is
   * derived from the field, so it follows on its own.
   */
  const renameField = (index: number, next: string) => {
    updateFormat((format) => {
      const field = format.fields[index];
      if (!field || field.key === next) return;
      const previous = field.key;
      field.key = next;
      if (!previous) return;

      const token = `{{${previous}}}`;
      const replacement = `{{${next}}}`;
      const rename = (value: string | undefined) =>
        value === undefined ? undefined : value.split(token).join(replacement);

      format.template = rename(format.template) ?? "";
      format.subject = rename(format.subject);
      for (const action of format.actions) {
        action.content = rename(action.content);
        if (action.target === previous) action.target = next;
        if (action.requiresField === previous) action.requiresField = next;
      }
    });
  };

  const updateField = (index: number, patch: Partial<PaperworkField>) => {
    updateFormat((format) => {
      format.fields[index] = { ...format.fields[index], ...patch };
    });
  };

  const insertPlaceholder = (name: string) => {
    const token = `{{${name}}}`;
    const textarea = templateRef.current;
    updateFormat((format) => {
      if (!textarea) {
        format.template += token;
        return;
      }
      const start = textarea.selectionStart ?? format.template.length;
      const end = textarea.selectionEnd ?? start;
      format.template =
        format.template.slice(0, start) + token + format.template.slice(end);
    });
    requestAnimationFrame(() => {
      textarea?.focus();
    });
  };

  const planFiles = async () => {
    setBusy("plan");
    setError(null);
    setWritten(null);
    try {
      const response = await fetch("/api/paperwork-maker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "plan", config }),
      });
      const body = (await response.json()) as {
        success?: boolean;
        plan?: PlanResponse;
        error?: string;
      };
      if (!response.ok || !body.plan) {
        setError(body.error ?? "The plan could not be built.");
        return;
      }
      setPlan(body.plan);
    } catch {
      setError("The plan request failed.");
    } finally {
      setBusy(null);
    }
  };

  const generate = async () => {
    setBusy("generate");
    setError(null);
    try {
      const response = await fetch("/api/paperwork-maker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "generate", config }),
      });
      const body = (await response.json()) as {
        success?: boolean;
        written?: string[];
        refused?: string[];
        plan?: PlanResponse;
        problems?: string[];
        error?: string;
      };
      if (body.plan) setPlan(body.plan);
      if (!response.ok || !body.success) {
        setError(
          body.error ??
            body.problems?.[0] ??
            `Nothing was written${body.refused?.length ? `: ${body.refused.join(", ")}` : "."}`,
        );
        return;
      }
      setWritten(body.written ?? []);
      void refreshSaved();
    } catch {
      setError("The generate request failed.");
    } finally {
      setBusy(null);
    }
  };

  const pages = config.division.pages;
  const activePageIndex = Math.min(pageIndex, Math.max(pages.length - 1, 0));
  const page = pages[activePageIndex];
  const formatOptions = pages.flatMap((entry) =>
    entry.groups.flatMap((group) =>
      group.formats.map((format) => ({
        value: format.key,
        label: `${entry.label} / ${group.label} / ${format.label}`,
      })),
    ),
  );

  const placeholderChips = [
    ...(placed?.format.fields.map((field) => field.key) ?? []),
    ...BUILTIN_PLACEHOLDERS,
  ];

  const existingDivision =
    divisionChoice === "new"
      ? undefined
      : DIVISION_ENTRIES.find(([key]) => key === divisionChoice);

  const targetRoute = config.division.key
    ? existingDivision?.[1].route
      ? `${existingDivision[1].route.replace(/\/+$/, "")}/paperwork`
      : `/divisions/${divisionSlug(config.division.key)}`
    : "";

  const chooseDivision = (value: string) => {
    setDivisionChoice(value);
    if (value === "new") {
      update((draft) => {
        draft.division.key = "";
        draft.division.label = "";
      });
      return;
    }
    const entry = DIVISION_ENTRIES.find(([key]) => key === value);
    if (!entry) return;
    update((draft) => {
      draft.division.key = value;
      draft.division.label = entry[1].label;
    });
  };

  const addPage = () => {
    update((draft) => {
      draft.division.pages.push({
        key: `page${draft.division.pages.length + 1}`,
        label: "New page",
        purpose: "",
        groups: [{ label: "Documents", hint: "", formats: [] }],
      });
    });
    setPageIndex(pages.length);
    setSelectedKey("");
    setSelectedSlot(null);
  };

  const addFormat = () => {
    if (!page) return;
    const existing = new Set(formatOptions.map((option) => option.value));
    let index = 1;
    while (existing.has(`format${index}`)) index += 1;
    const key = `format${index}`;
    update((draft) => {
      const target = draft.division.pages[activePageIndex];
      if (!target) return;
      if (target.groups.length === 0) {
        target.groups.push({ label: "Documents", hint: "", formats: [] });
      }
      target.groups[0].formats.push({
        key,
        label: "New format",
        hint: "",
        template: "",
        fields: [],
        actions: [],
      });
    });
    setSelectedKey(key);
    setSelectedSlot({
      pageIndex: activePageIndex,
      groupIndex: 0,
      formatIndex: page.groups[0]?.formats.length ?? 0,
    });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface/90 p-4">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileCode2 className="h-4 w-4" />
          {validation.ok ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              Config valid
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400">
              {validation.problems.length} problem
              {validation.problems.length === 1 ? "" : "s"} to fix
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          Development only - Generate writes files in this checkout. Review, commit, deploy.
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {saved.length > 0 && (
            <div className="w-56">
              <Select value="" onValueChange={editSaved}>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Edit saved paperwork…" />
                </SelectTrigger>
                <SelectContent>
                  {saved.map((entry) => (
                    <SelectItem
                      key={entry.division.key}
                      value={entry.division.key}
                    >
                      {entry.division.label || entry.division.key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setConfig(clone(initial));
              setPageIndex(0);
              setSelectedKey("");
              setPlan(null);
              setWritten(null);
            }}
          >
            Clear draft
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={planFiles}
            disabled={busy !== null || !validation.ok}
          >
            <Wand2 className="h-4 w-4" />
            {busy === "plan" ? "Planning…" : "Plan files"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={generate}
            disabled={busy !== null || !plan?.ok}
          >
            <Check className="h-4 w-4" />
            {busy === "generate" ? "Generating…" : "Generate files"}
          </Button>
        </div>
      </section>

      {config.division.pages.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-surface/60 p-4 text-xs text-muted-foreground">
          Name the division, then add a page and a format. Nothing is
          pre-filled - enter the paperwork this division actually uses.
        </p>
      )}

      {!validation.ok && config.division.pages.length > 0 && (
        <ul className="space-y-1 rounded-2xl border border-amber-300/30 bg-amber-50/60 p-4 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          {validation.problems.map((problem) => (
            <li key={problem} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              {problem}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="rounded-2xl border border-red-300/30 bg-red-50/60 p-4 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      {written && (
        <p className="rounded-2xl border border-emerald-300/30 bg-emerald-50/60 p-4 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          Wrote {written.length} file{written.length === 1 ? "" : "s"}:{" "}
          {written.join(", ")}
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <div className="space-y-5">
          <section className="space-y-4 rounded-2xl border border-border bg-surface/90 p-5">
            <h2 className="text-sm font-semibold text-foreground">Division</h2>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Division</Label>
              <Select value={divisionChoice} onValueChange={chooseDivision}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New division…</SelectItem>
                  {DIVISION_ENTRIES.map(([key, division]) => (
                    <SelectItem key={key} value={key}>
                      {division.label}
                      {division.route ? " (has its own page)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {config.division.key && (
                <p className="text-xs text-muted-foreground">
                  {existingDivision
                    ? `Adds paperwork to ${existingDivision[1].label} at ${targetRoute}, with its own entry under Divisions.`
                    : `New division: its page is ${targetRoute}, and it is added under Divisions.`}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {!existingDivision && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Key</Label>
                    <Input
                      value={config.division.key}
                      onChange={(event) =>
                        update((draft) => {
                          draft.division.key = event.target.value;
                        })
                      }
                      placeholder="paperworkDemo"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input
                      value={config.division.label}
                      onChange={(event) =>
                        update((draft) => {
                          draft.division.label = event.target.value;
                        })
                      }
                    />
                  </div>
                </>
              )}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs text-muted-foreground">
                  Description (the division page header)
                </Label>
                <Textarea
                  value={config.division.description}
                  onChange={(event) =>
                    update((draft) => {
                      draft.division.description = event.target.value;
                    })
                  }
                  rows={2}
                  className="resize-y"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Emblem (optional)
                </Label>
                <Input
                  value={config.division.emblem ?? ""}
                  onChange={(event) =>
                    update((draft) => {
                      draft.division.emblem = event.target.value;
                    })
                  }
                  placeholder="/Division/BLS.png"
                />
              </div>
              {page && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Page name
                    </Label>
                    <Input
                      value={page.label}
                      onChange={(event) =>
                        update((draft) => {
                          draft.division.pages[activePageIndex].label =
                            event.target.value;
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      What this page is for
                    </Label>
                    <Input
                      value={page.purpose}
                      onChange={(event) =>
                        update((draft) => {
                          draft.division.pages[activePageIndex].purpose =
                            event.target.value;
                        })
                      }
                      placeholder="One sentence, shown under the page title"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {pages.map((entry, index) => (
                <Button
                  key={`${entry.key}-${index}`}
                  type="button"
                  size="sm"
                  variant={index === activePageIndex ? "default" : "outline"}
                  onClick={() => {
                    setPageIndex(index);
                    setSelectedKey("");
                    setSelectedSlot(null);
                  }}
                >
                  {entry.label || `Page ${index + 1}`}
                </Button>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={addPage}>
                <Plus className="h-3.5 w-3.5" />
                Add page
              </Button>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-surface/90 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">Format</h2>
              <div className="w-64">
                <Select
                  value={selectedKey}
                  onValueChange={selectFormat}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Choose a format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addFormat}
                disabled={!page}
              >
                <Plus className="h-3.5 w-3.5" />
                Add format
              </Button>
            </div>

            {!placed && (
              <p className="text-xs text-muted-foreground">
                {page
                  ? "No format yet - press Add format to write the first one."
                  : "Add a page first, then a format."}
              </p>
            )}

            {placed && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Key</Label>
                    <Input
                      value={placed.format.key}
                      onChange={(event) =>
                        renameFormat(placed.format.key, event.target.value)
                      }
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input
                      value={placed.format.label}
                      onChange={(event) =>
                        updateFormat((format) => {
                          format.label = event.target.value;
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Subject template
                    </Label>
                    <Input
                      value={placed.format.subject ?? ""}
                      onChange={(event) =>
                        updateFormat((format) => {
                          format.subject = event.target.value;
                        })
                      }
                      placeholder="{{field_key}} | {{another_field}}"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      When to use it
                    </Label>
                    <Input
                      value={placed.format.hint}
                      onChange={(event) =>
                        updateFormat((format) => {
                          format.hint = event.target.value;
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-foreground">
                      Fields
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateFormat((format) => {
                          let index = 1;
                          while (
                            format.fields.some(
                              (field) => field.key === `field_${index}`,
                            )
                          ) {
                            index += 1;
                          }
                          format.fields.push({
                            key: `field_${index}`,
                            type: "text",
                            label: `Field ${index}`,
                            required: true,
                          });
                        })
                      }
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add field
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {placed.format.fields.map((field, index) => (
                      <div
                        key={index}
                        className="space-y-3 rounded-xl border border-border bg-background/40 p-3"
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              Key (placeholder)
                            </Label>
                            <Input
                              value={field.key}
                              onChange={(event) =>
                                renameField(index, event.target.value)
                              }
                              className="font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              Label
                            </Label>
                            <Input
                              value={field.label}
                              onChange={(event) =>
                                updateField(index, {
                                  label: event.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="flex items-end gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label="Move field up"
                              disabled={index === 0}
                              onClick={() =>
                                updateFormat((format) => {
                                  const [moved] = format.fields.splice(index, 1);
                                  format.fields.splice(index - 1, 0, moved);
                                })
                              }
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label="Move field down"
                              disabled={index === placed.format.fields.length - 1}
                              onClick={() =>
                                updateFormat((format) => {
                                  const [moved] = format.fields.splice(index, 1);
                                  format.fields.splice(index + 1, 0, moved);
                                })
                              }
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label="Remove field"
                              onClick={() =>
                                updateFormat((format) => {
                                  format.fields.splice(index, 1);
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              Type
                            </Label>
                            <Select
                              value={field.type}
                              onValueChange={(value) =>
                                updateField(index, {
                                  type: value as PaperworkFieldType,
                                })
                              }
                            >
                              <SelectTrigger size="sm" className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_TYPES.map((type) => (
                                  <SelectItem key={type.type} value={type.type}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              Placeholder
                            </Label>
                            <Input
                              value={field.placeholder ?? ""}
                              onChange={(event) =>
                                updateField(index, {
                                  placeholder: event.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              Required
                            </Label>
                            <Select
                              value={field.required === false ? "no" : "yes"}
                              onValueChange={(value) =>
                                updateField(index, {
                                  required: value === "yes",
                                })
                              }
                            >
                              <SelectTrigger size="sm" className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Required</SelectItem>
                                <SelectItem value="no">Optional</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    BBCode template
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {placeholderChips.map((name) => (
                      <Button
                        key={name}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 font-mono text-[10px]"
                        onClick={() => insertPlaceholder(name)}
                      >
                        {`{{${name}}}`}
                      </Button>
                    ))}
                  </div>
                  <Textarea
                    ref={templateRef}
                    value={placed.format.template}
                    onChange={(event) =>
                      updateFormat((format) => {
                        format.template = event.target.value;
                      })
                    }
                    rows={12}
                    className="resize-y font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-foreground">
                    Buttons
                  </h3>
                  {placed.format.actions.map((action, index) => (
                    <div
                      key={`${action.id}-${index}`}
                      className="flex items-center gap-2 rounded-xl border border-border bg-background/40 p-2"
                    >
                      <span className="w-40 shrink-0 font-mono text-[10px] text-muted-foreground">
                        {action.kind}
                      </span>
                      <Input
                        value={action.label}
                        onChange={(event) =>
                          updateFormat((format) => {
                            format.actions[index] = {
                              ...format.actions[index],
                              label: event.target.value,
                            };
                          })
                        }
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Remove action"
                        onClick={() =>
                          updateFormat((format) => {
                            format.actions.splice(index, 1);
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2">
                    <AddAction
                      label="Copy template"
                      onAdd={() =>
                        updateFormat((format) => {
                          format.actions.push({
                            id: nextActionId(format, "copyTemplate"),
                            kind: "copy_template",
                            label: "Copy Template",
                            variant: "outline",
                          });
                        })
                      }
                    />
                    <AddAction
                      label="Copy title"
                      onAdd={() =>
                        updateFormat((format) => {
                          format.actions.push({
                            id: nextActionId(format, "copyTitle"),
                            kind: "copy_subject",
                            label: "Copy Title",
                            variant: "outline",
                          });
                        })
                      }
                    />
                    <AddAction
                      label="Reset"
                      onAdd={() =>
                        updateFormat((format) => {
                          format.actions.push({
                            id: nextActionId(format, "reset"),
                            kind: "reset",
                            label: "Reset",
                            variant: "outline",
                          });
                        })
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-surface/90 p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Live preview
            </h2>
            {placed ? (
              <PaperworkWorkspace config={config} />
            ) : (
              <p className="text-xs text-muted-foreground">
                Pick a format to preview it.
              </p>
            )}
          </section>

          {plan && (
            <section className="space-y-4 rounded-2xl border border-border bg-surface/90 p-5">
              <h2 className="text-sm font-semibold text-foreground">
                Files this config writes
              </h2>
              {!plan.ok && (
                <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                  {plan.problems.map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              )}
              {plan.files.map((file) => (
                <details
                  key={file.path}
                  className="rounded-xl border border-border bg-background/40 p-3"
                >
                  <summary className="cursor-pointer text-xs">
                    <span className="mr-2 rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                      {file.action}
                    </span>
                    <span className="font-mono text-foreground">
                      {file.path}
                    </span>
                  </summary>
                  <pre className="mt-3 max-h-80 overflow-auto font-mono text-[10px] leading-relaxed whitespace-pre-wrap text-foreground">
                    {file.content}
                  </pre>
                </details>
              ))}
              {plan.integration.length > 0 && (
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <p className="font-semibold uppercase tracking-wide">
                    One-time wiring
                  </p>
                  <ul className="list-disc pl-4">
                    {plan.integration.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function AddAction({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <Button type="button" size="sm" variant="outline" onClick={onAdd}>
      <Plus className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

function nextActionId(format: PaperworkFormat, base: string): string {
  let id = base;
  let index = 2;
  while (format.actions.some((action) => action.id === id)) {
    id = `${base}${index}`;
    index += 1;
  }
  return id;
}

// Kept for the next slice: the action kinds the editor will offer, so the
// registry and the UI cannot drift apart.
export const ACTION_KINDS: readonly PaperworkAction["kind"][] = [
  "copy_template",
  "copy_subject",
  "copy_text",
  "copy_open",
  "insert_utc_date",
  "insert_utc_time",
  "reset",
];
