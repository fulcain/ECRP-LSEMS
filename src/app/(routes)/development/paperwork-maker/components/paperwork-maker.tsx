"use client";

import Image from "next/image";
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
import { useMedic } from "@/app/context/MedicContext";
import { getDirectorTitle } from "@/app/constants/general/directorRoles";
import {
  DIVISION_ICON_NAMES,
  divisionIcon,
} from "@/components/layout/header/configs/division-icons";
import { PaperworkWorkspace } from "@/components/paperwork/paperwork-workspace";
import { DIVISION_ENTRIES } from "@/configs/roles";
import { FIELD_TYPES } from "@/lib/paperwork/fields";
import { renderTemplate } from "@/lib/paperwork/placeholders";
import {
  BUILTIN_PLACEHOLDERS,
  copyOpenField,
  divisionSlug,
  templatePlaceholders,
  validatePaperworkConfig,
  type PaperworkAction,
  type PaperworkConfig,
  type PaperworkField,
  type PaperworkFieldType,
  type PaperworkFormat,
} from "@/lib/paperwork/schema";
import { PAPERWORK_SNIPPETS } from "@/lib/paperwork/snippets";

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

/**
 * Every value the Staff Page already holds, ready to drop into a format. They
 * are inputs like any other, but nobody types them: the renderer seeds them from
 * the signed-in member, so `{{staffName}}` is filled in when the page opens.
 */
const STAFF_INPUTS = [
  { source: "name", key: "staffName", label: "Staff name" },
  { source: "rank", key: "staffRank", label: "Staff rank" },
  { source: "signature", key: "staffSignature", label: "Staff signature" },
  { source: "director", key: "staffDirector", label: "Director title" },
] as const;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** `/Division/AMU.png` -> `AMU`: the emblem's own name, which is what a maker types. */
function emblemName(path: string | undefined): string {
  if (!path) return "";
  return path.trim().replace(/^.*\//, "").replace(/\.[^./]+$/, "");
}

/**
 * `AMU` -> `/Division/AMU.png`. A name is what somebody knows about their
 * division's emblem - the path it lives at is the app's business.
 */
function emblemPath(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed)) return trimmed;
  return `/Division/${/\.[a-z0-9]+$/i.test(trimmed) ? trimmed : `${trimmed}.png`}`;
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
/**
 * The scope a page files a new format under, and the line that scope carries -
 * a scope is a heading with a description, so it is born with both.
 */
const DEFAULT_SCOPE = "Documents";
const DEFAULT_SCOPE_HINT = "Every other format for this page.";

export function PaperworkMaker({ initial }: { initial: PaperworkConfig }) {
  const [config, setConfig] = useLocalStorage<PaperworkConfig>(
    DRAFT_KEY,
    initial,
  );
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<FormatSlot | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [busy, setBusy] = useState<"plan" | "generate" | null>(null);
  const [written, setWritten] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<PaperworkConfig[]>([]);
  /** The emblems `public/Division` holds, by name - what the emblem box offers. */
  const [emblems, setEmblems] = useState<string[]>([]);
  const templateRef = useRef<HTMLTextAreaElement>(null);
  const { medicCredentials, divisionRanks } = useMedic();

  const refreshSaved = useCallback(async () => {
    try {
      const response = await fetch("/api/paperwork-maker");
      if (!response.ok) return;
      const body = (await response.json()) as {
        configs?: PaperworkConfig[];
        emblems?: string[];
      };
      setSaved(body.configs ?? []);
      setEmblems(body.emblems ?? []);
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
    setPageIndex(0);
    const first = found.division.pages[0]?.groups[0]?.formats[0];
    setSelectedKey(first?.key ?? "");
    setSelectedSlot(
      first ? { pageIndex: 0, groupIndex: 0, formatIndex: 0 } : null,
    );
    setPlan(null);
    setWritten(null);
  };

  /**
   * The format being edited. The slot is preferred over the key because a key can
   * be half typed or momentarily shared with another format - but only while the
   * slot still holds the selected key: once that format is gone, the format now
   * sitting at its index is a different one, and nothing is selected.
   */
  const resolvePlaced = (target: PaperworkConfig): PlacedFormat | null => {
    const atSlot = selectedSlot ? placedAt(target, selectedSlot) : null;
    if (atSlot && atSlot.format.key === selectedKey) return atSlot;
    return locate(target, selectedKey);
  };

  const placed = resolvePlaced(config);
  // `locate` finds a format anywhere in the config, so the page it sits on comes
  // from the slot lookup rather than the selection.
  const placedPageIndex =
    (placed ? slotOf(config, placed.format.key)?.pageIndex : undefined) ?? 0;
  const scopes = placed
    ? (config.division.pages[placedPageIndex]?.groups ?? [])
    : [];
  const scope = placed ? scopes[placed.groupIndex] : undefined;
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
      const target = resolvePlaced(draft);
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

  /** Inserts at the caret, so a chip or a snippet lands where the cursor is. */
  const insertText = (text: string) => {
    const textarea = templateRef.current;
    updateFormat((format) => {
      if (!textarea) {
        format.template += text;
        return;
      }
      const start = textarea.selectionStart ?? format.template.length;
      const end = textarea.selectionEnd ?? start;
      format.template =
        format.template.slice(0, start) + text + format.template.slice(end);
    });
    requestAnimationFrame(() => {
      textarea?.focus();
    });
  };

  const insertPlaceholder = (name: string) => insertText(`{{${name}}}`);

  /**
   * The input a template already names, made real in one click. A template that
   * says `{{patientName}}` with no such field is a validation error the maker
   * otherwise offers no way to fix.
   */
  const addInput = (key: string) => {
    updateFormat((format) => {
      if (format.fields.some((field) => field.key === key)) return;
      format.fields.push({
        key,
        type: /(?:url|link)$/i.test(key) ? "url" : "text",
        label: labelFromKey(key),
        required: true,
      });
    });
  };

  const updateAction = (index: number, patch: Partial<PaperworkAction>) => {
    updateFormat((format) => {
      format.actions[index] = { ...format.actions[index], ...patch };
    });
  };

  const addAction = (action: {
    idPrefix: string;
    kind: PaperworkAction["kind"];
    label: string;
    content?: string;
  }) => {
    updateFormat((format) => {
      format.actions.push({
        id: nextActionId(format, action.idPrefix),
        kind: action.kind,
        label: action.label,
        content: action.content,
        variant: "outline",
      });
    });
  };

  /** A Staff Page value as an input: known before the member types anything. */
  const addStaffInput = (source: (typeof STAFF_INPUTS)[number]["source"]) => {
    const preset = STAFF_INPUTS.find((entry) => entry.source === source);
    if (!preset) return;
    updateFormat((format) => {
      if (format.fields.some((field) => field.key === preset.key)) return;
      format.fields.push({
        key: preset.key,
        type: "staff",
        label: preset.label,
        hint: "Filled in from the Staff Page.",
        source,
        required: true,
      });
    });
  };

  /**
   * Copy & Open GOV, in either of its two shapes: a page the format declares, or
   * a link the member pastes. The second is only a button if an input exists for
   * it, so the input is made and bound here rather than left to be found as a
   * validation error.
   */
  const addGovAction = (mode: "fixed" | "member") => {
    updateFormat((format) => {
      format.actions.push({
        id: nextActionId(format, "copyOpenGov"),
        kind: "copy_open",
        label: "Copy & Open GOV",
        content: "",
        variant: "outline",
      });
      if (mode === "member") bindLinkField(format, format.actions.length - 1);
    });
  };

  /** Switches a Copy & Open button to the link the member pastes. */
  const chooseMemberLink = (index: number) => {
    updateFormat((format) => bindLinkField(format, index));
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

  // What each built-in placeholder writes today, rendered by the same engine the
  // page uses - so the maker never promises a value the member cannot see.
  const staffPreview = {
    name: medicCredentials.name,
    rank: divisionRanks[config.division.label] || medicCredentials.rank,
    signature: medicCredentials.signature,
    director: getDirectorTitle(medicCredentials.directorRole) ?? "",
  };
  const placeholderSamples = BUILTIN_PLACEHOLDERS.map((name) => ({
    name,
    value: renderTemplate(`{{${name}}}`, {
      values: {},
      staff: staffPreview,
      divisionLabel: config.division.label,
    }).text,
  }));

  // Everything the format writes that nothing provides yet - the one list a
  // member can act on, instead of a validation line naming a placeholder.
  const knownPlaceholders = new Set([
    ...(placed?.format.fields.map((field) => field.key) ?? []),
    ...BUILTIN_PLACEHOLDERS,
  ]);
  const missingPlaceholders = placed
    ? [
        ...templatePlaceholders(placed.format.template),
        ...templatePlaceholders(placed.format.subject ?? ""),
        ...placed.format.actions.flatMap((action) =>
          templatePlaceholders(action.content ?? ""),
        ),
      ].filter(
        (name, index, all) =>
          !knownPlaceholders.has(name) && all.indexOf(name) === index,
      )
    : [];

  /**
   * The division the app already declares, if this config is one. It is read from
   * the config rather than kept beside it: a remembered picker value that no
   * longer matches the draft hid the Key and Name inputs while the config held an
   * empty key, so the errors it showed could not be fixed from the screen.
   */
  const existingDivision = DIVISION_ENTRIES.find(
    ([key]) => key === config.division.key,
  );
  const divisionChoice = existingDivision ? config.division.key : "new";

  const targetRoute = config.division.key
    ? existingDivision?.[1].route
      ? `${existingDivision[1].route.replace(/\/+$/, "")}/paperwork`
      : `/divisions/${divisionSlug(config.division.key)}`
    : "";

  const chooseDivision = (value: string) => {
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
      draft.division.icon = entry[1].icon;
    });
  };

  const addPage = () => {
    update((draft) => {
      draft.division.pages.push({
        key: `page${draft.division.pages.length + 1}`,
        label: "New page",
        purpose: "",
        groups: [],
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
    // A new format goes under Documents, whatever scope happens to sit first.
    const found = page.groups.findIndex(
      (group) => group.label.trim().toLowerCase() === DEFAULT_SCOPE.toLowerCase(),
    );
    const groupIndex = found === -1 ? page.groups.length : found;
    const formatIndex = found === -1 ? 0 : page.groups[found].formats.length;
    update((draft) => {
      const target = draft.division.pages[activePageIndex];
      if (!target) return;
      if (found === -1) {
        target.groups.push({
          label: DEFAULT_SCOPE,
          hint: DEFAULT_SCOPE_HINT,
          formats: [],
        });
      }
      target.groups[groupIndex]?.formats.push({
        key,
        label: "New format",
        hint: "",
        template: "",
        fields: [],
        actions: [],
      });
    });
    setSelectedKey(key);
    setSelectedSlot({ pageIndex: activePageIndex, groupIndex, formatIndex });
  };

  /**
   * Files the selected format under one of its page's scopes, or under a new
   * one - a format is only ever reached through the heading it sits under, so
   * this is how it gets a heading of its own.
   */
  const moveFormatToScope = (value: string) => {
    if (!placed) return;
    const atPage = config.division.pages[placedPageIndex];
    if (!atPage) return;
    const create = value === "new";
    const groupIndex = create ? atPage.groups.length : Number(value);
    if (!Number.isInteger(groupIndex)) return;
    if (!create && groupIndex === placed.groupIndex) return;
    const formatIndex = create
      ? 0
      : (atPage.groups[groupIndex]?.formats.length ?? 0);
    update((draft) => {
      const formatPage = draft.division.pages[placedPageIndex];
      if (!formatPage) return;
      const source = formatPage.groups[placed.groupIndex];
      const moved = source?.formats.splice(placed.formatIndex, 1)[0];
      if (!moved) return;
      if (create) {
        formatPage.groups.push({ label: "New scope", hint: "", formats: [moved] });
        return;
      }
      formatPage.groups[groupIndex]?.formats.push(moved);
    });
    setSelectedSlot({ pageIndex: placedPageIndex, groupIndex, formatIndex });
  };

  /** Adds an empty scope, so one can exist before a format is filed under it. */
  const addScope = () => {
    update((draft) => {
      const target = draft.division.pages[activePageIndex];
      if (!target) return;
      target.groups.push({ label: "New scope", hint: "", formats: [] });
    });
  };

  /**
   * Removes a scope. One that still holds formats is left alone - they would go
   * with it, and where they belong instead is the author's call, not a guess.
   */
  const removeScope = (pageIndex: number, groupIndex: number) => {
    const target = config.division.pages[pageIndex]?.groups[groupIndex];
    if (!target || target.formats.length > 0) return;
    update((draft) => {
      draft.division.pages[pageIndex]?.groups.splice(groupIndex, 1);
    });
    setSelectedSlot(null);
  };

  /** Writes the heading and the one line that describe a scope. */
  const updateScope = (patch: { label?: string; hint?: string }) => {
    if (!placed) return;
    update((draft) => {
      const target =
        draft.division.pages[placedPageIndex]?.groups[placed.groupIndex];
      if (!target) return;
      if (patch.label !== undefined) target.label = patch.label;
      if (patch.hint !== undefined) target.hint = patch.hint;
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
                  Sidebar icon
                </Label>
                {(() => {
                  const name = config.division.icon ?? "";
                  const Icon = divisionIcon(name);
                  const known = (DIVISION_ICON_NAMES as readonly string[]).includes(
                    name,
                  );
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/40">
                          <Icon className="h-4 w-4" />
                        </span>
                        <Input
                          value={name}
                          list="division-icons"
                          onChange={(event) =>
                            update((draft) => {
                              draft.division.icon =
                                event.target.value || undefined;
                            })
                          }
                          placeholder="FileText"
                          className="font-mono"
                        />
                      </div>
                      <datalist id="division-icons">
                        {DIVISION_ICON_NAMES.map((icon) => (
                          <option key={icon} value={icon} />
                        ))}
                      </datalist>
                      {name && !known ? (
                        <p className="text-[10px] text-amber-700 dark:text-amber-300">
                          Not a declared icon - the sidebar falls back to
                          FileText. Pick one from the list.
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">
                          Type the icon name - {DIVISION_ICON_NAMES.length}{" "}
                          available - and it is used in the sidebar entry.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Emblem (optional)
                </Label>
                {(() => {
                  const name = emblemName(config.division.emblem);
                  const known = emblems.includes(name);
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        {name && known ? (
                          <Image
                            src={config.division.emblem ?? ""}
                            alt=""
                            width={36}
                            height={36}
                            className="h-9 w-9 shrink-0 object-contain"
                          />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-[10px] text-muted-foreground">
                            none
                          </span>
                        )}
                        <Input
                          value={name}
                          list="division-emblems"
                          onChange={(event) =>
                            update((draft) => {
                              draft.division.emblem =
                                emblemPath(event.target.value) || undefined;
                            })
                          }
                          placeholder="BLS"
                          className="font-mono"
                        />
                      </div>
                      <datalist id="division-emblems">
                        {emblems.map((emblem) => (
                          <option key={emblem} value={emblem} />
                        ))}
                      </datalist>
                      {name && !known ? (
                        <p className="text-[10px] text-amber-700 dark:text-amber-300">
                          No {`public/Division/${name}.png`} in this checkout -
                          the emblem file has to exist before the page can show
                          it.
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">
                          Type the emblem name - {emblems.length} in
                          public/Division - or a path of your own.
                        </p>
                      )}
                    </>
                  );
                })()}
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

                  <div className="space-y-2 rounded-xl border border-border bg-background/40 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-semibold text-foreground">
                          Scopes
                        </h3>
                        <p className="text-[10px] text-muted-foreground">
                          The headings the picker groups this page of formats
                          under. Each one is a title and a line about it.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addScope}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add scope
                      </Button>
                    </div>
                    {page.groups.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground">
                        No scopes yet - Add format starts the page off under
                        Documents.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {page.groups.map((group, index) => (
                          <div
                            key={`${group.label}-${index}`}
                            className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface/60 px-2.5 py-1.5"
                          >
                            <span className="text-xs font-medium text-foreground">
                              {group.label || `Scope ${index + 1}`}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {group.formats.length} format
                              {group.formats.length === 1 ? "" : "s"}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground">
                              {group.hint}
                            </span>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label={`Delete ${group.label || "scope"}`}
                              title={
                                group.formats.length > 0
                                  ? "Move its formats to another scope first"
                                  : "Delete this scope"
                              }
                              disabled={group.formats.length > 0}
                              onClick={() => removeScope(activePageIndex, index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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
                  value={placed ? placed.format.key : ""}
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

                <div className="space-y-3 rounded-xl border border-border bg-background/40 p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-xs font-semibold text-foreground">
                      Scope
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        The heading this format sits under, with one line about
                        it
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-600 dark:text-red-400"
                        title={
                          (scope?.formats.length ?? 0) > 0
                            ? "Move its formats to another scope first"
                            : "Delete this scope"
                        }
                        disabled={!scope || (scope.formats.length ?? 0) > 0}
                        onClick={() =>
                          removeScope(placedPageIndex, placed.groupIndex)
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete scope
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">
                        Where it sits
                      </Label>
                      <Select
                        value={String(placed.groupIndex)}
                        onValueChange={moveFormatToScope}
                      >
                        <SelectTrigger size="sm" className="w-full">
                          <SelectValue placeholder={DEFAULT_SCOPE} />
                        </SelectTrigger>
                        <SelectContent>
                          {scopes.map((group, index) => (
                            <SelectItem
                              key={`${group.label}-${index}`}
                              value={String(index)}
                            >
                              {group.label || `Scope ${index + 1}`}
                            </SelectItem>
                          ))}
                          <SelectItem value="new">New scope…</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">
                        Scope title
                      </Label>
                      <Input
                        value={scope?.label ?? ""}
                        onChange={(event) =>
                          updateScope({ label: event.target.value })
                        }
                        placeholder={DEFAULT_SCOPE}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-[10px] text-muted-foreground">
                        Scope description
                      </Label>
                      <Input
                        value={scope?.hint ?? ""}
                        onChange={(event) =>
                          updateScope({ hint: event.target.value })
                        }
                        placeholder="One line under the title, e.g. Where their application sits right now"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-semibold text-foreground">
                        Inputs
                        {placed.format.fields.length > 0 && (
                          <span className="ml-1.5 font-normal text-muted-foreground">
                            {placed.format.fields.length}
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        One input per thing the member fills in. Each one is a
                        placeholder the template writes.
                      </p>
                    </div>
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
                      Add input
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="w-full text-[10px] text-muted-foreground">
                      Staff Page values - already filled in whenever the
                      paperwork is written
                    </span>
                    {STAFF_INPUTS.map((entry) => {
                      const added = placed.format.fields.some(
                        (field) => field.key === entry.key,
                      );
                      return (
                        <Button
                          key={entry.key}
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-[10px]"
                          disabled={added}
                          title={`Adds an input that reads {{${entry.key}}} from the Staff Page`}
                          onClick={() => addStaffInput(entry.source)}
                        >
                          <Plus className="h-3 w-3" />
                          {entry.label}
                          <span className="font-mono text-muted-foreground">
                            {`{{${entry.key}}}`}
                          </span>
                        </Button>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    {placed.format.fields.map((field, index) => (
                      <div
                        key={index}
                        className="space-y-3 rounded-xl border border-border bg-surface/60 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                              {index + 1}
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              {field.label || "Untitled input"}
                            </span>
                            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                              {FIELD_TYPES.find(
                                (entry) => entry.type === field.type,
                              )?.label ?? field.type}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {`{{${field.key || "key"}}}`}
                            </span>
                            {field.required === false && (
                              <span className="rounded-full border border-amber-300/50 px-2 py-0.5 text-[10px] text-amber-700 dark:text-amber-300">
                                Optional
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
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

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              Name the member sees
                            </Label>
                            <Input
                              value={field.label}
                              onChange={(event) =>
                                updateField(index, {
                                  label: event.target.value,
                                })
                              }
                              placeholder="Patient name"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              Placeholder in the template
                            </Label>
                            <Input
                              value={field.key}
                              onChange={(event) =>
                                renameField(index, event.target.value)
                              }
                              className="font-mono"
                              placeholder="patientName"
                            />
                            <p className="text-[10px] text-muted-foreground">
                              The template writes{" "}
                              <span className="font-mono">{`{{${field.key || "key"}}}`}</span>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              Type
                            </Label>
                            <Select
                              value={field.type}
                              onValueChange={(value) =>
                                updateField(index, {
                                  type: value as PaperworkFieldType,
                                  ...(value === "staff" && !field.source
                                    ? { source: "name" as const }
                                    : {}),
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
                            <p className="text-[10px] text-muted-foreground">
                              {
                                FIELD_TYPES.find(
                                  (entry) => entry.type === field.type,
                                )?.description
                              }
                            </p>
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
                            <p className="text-[10px] text-muted-foreground">
                              An optional input can be left empty.
                            </p>
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-[10px] text-muted-foreground">
                              Grey hint in the empty input
                            </Label>
                            <Input
                              value={field.placeholder ?? ""}
                              onChange={(event) =>
                                updateField(index, {
                                  placeholder: event.target.value,
                                })
                              }
                              placeholder="Left empty, the input shows nothing"
                            />
                          </div>
                        </div>

                        {field.type === "staff" && (
                          <div className="space-y-1 rounded-lg bg-muted/40 p-2">
                            <Label className="text-[10px] text-muted-foreground">
                              Seeded from the Staff Page
                            </Label>
                            <Select
                              value={field.source ?? "name"}
                              onValueChange={(value) =>
                                updateField(index, {
                                  source: value as
                                    | "name"
                                    | "rank"
                                    | "signature"
                                    | "director",
                                })
                              }
                            >
                              <SelectTrigger size="sm" className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="rank">Rank</SelectItem>
                                <SelectItem value="signature">
                                  Signature image
                                </SelectItem>
                                <SelectItem value="director">
                                  Director title
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    ))}
                    {placed.format.fields.length === 0 && (
                      <p className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                        No inputs yet. Add one for every value the template
                        writes - the member sees them in the order they are
                        listed here.
                      </p>
                    )}
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
                  <div className="rounded-xl border border-border bg-background/40 p-3">
                    <p className="text-[10px] text-muted-foreground">
                      What these fill in - your Staff Page and this division, as
                      they stand now
                    </p>
                    <div className="mt-1.5 space-y-0.5">
                      {placeholderSamples.map((sample) => (
                        <div
                          key={sample.name}
                          className="flex items-baseline gap-2 text-[10px]"
                        >
                          <span className="shrink-0 font-mono text-muted-foreground">
                            {`{{${sample.name}}}`}
                          </span>
                          <span className="min-w-0 truncate text-foreground">
                            {sample.value || "Nothing set yet"}
                          </span>
                        </div>
                      ))}
                    </div>
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

                  {missingPlaceholders.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-amber-300/40 bg-amber-50/60 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                      <p className="text-[10px] text-amber-700 dark:text-amber-300">
                        The template asks for these, and no input provides them
                        yet. Press one to add its input.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {missingPlaceholders.map((name) => (
                          <Button
                            key={name}
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 font-mono text-[10px]"
                            onClick={() => addInput(name)}
                          >
                            <Plus className="h-3 w-3" />
                            {`{{${name}}}`}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs text-muted-foreground">
                      Insert a BBCode block
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {PAPERWORK_SNIPPETS.map((snippet) => (
                        <Button
                          key={snippet.id}
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-[10px]"
                          title={snippet.description}
                          onClick={() => insertText(snippet.bbcode)}
                        >
                          {snippet.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-foreground">
                    Buttons
                  </h3>
                  {placed.format.actions.map((action, index) => (
                    <div
                      key={`${action.id}-${index}`}
                      className="space-y-2 rounded-xl border border-border bg-background/40 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-32 shrink-0 font-mono text-[10px] text-muted-foreground">
                          {action.kind}
                        </span>
                        <Input
                          value={action.label}
                          onChange={(event) =>
                            updateAction(index, { label: event.target.value })
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

                      {action.kind === "copy_open" &&
                        (() => {
                          const linkField = copyOpenField(action.content);
                          const bound = linkField
                            ? placed.format.fields.find(
                                (field) => field.key === linkField,
                              )
                            : undefined;
                          return (
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">
                                Which page it opens
                              </Label>
                              <Select
                                value={linkField ? "member" : "fixed"}
                                onValueChange={(value) => {
                                  if (value === "member") {
                                    chooseMemberLink(index);
                                    return;
                                  }
                                  updateAction(index, {
                                    content: "",
                                    requiresField: undefined,
                                  });
                                }}
                              >
                                <SelectTrigger size="sm" className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fixed">
                                    A page the format always uses
                                  </SelectItem>
                                  <SelectItem value="member">
                                    The link the member pastes
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {linkField ? (
                                <p className="text-[10px] text-muted-foreground">
                                  Opens the input “{bound?.label ?? linkField}”,
                                  which the member fills in.
                                </p>
                              ) : (
                                <Input
                                  value={action.content ?? ""}
                                  onChange={(event) =>
                                    updateAction(index, {
                                      content: event.target.value,
                                    })
                                  }
                                  placeholder="https://gov.eclipse-rp.net/…"
                                  className="font-mono text-xs"
                                />
                              )}
                            </div>
                          );
                        })()}

                      {action.kind === "copy_text" && (
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">
                            BBCode this button copies
                          </Label>
                          <Textarea
                            value={action.content ?? ""}
                            onChange={(event) =>
                              updateAction(index, {
                                content: event.target.value,
                              })
                            }
                            rows={3}
                            className="resize-y font-mono text-xs"
                          />
                        </div>
                      )}

                      {(action.kind === "insert_utc_date" ||
                        action.kind === "insert_utc_time") &&
                        (placed.format.fields.length > 0 ? (
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              Fills the input
                            </Label>
                            <Select
                              value={action.target ?? ""}
                              onValueChange={(value) =>
                                updateAction(index, { target: value })
                              }
                            >
                              <SelectTrigger size="sm" className="w-full">
                                <SelectValue placeholder="Choose an input" />
                              </SelectTrigger>
                              <SelectContent>
                                {placed.format.fields.map((field) => (
                                  <SelectItem key={field.key} value={field.key}>
                                    {field.label || field.key}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground">
                            Add an input first, so the button has somewhere to
                            write.
                          </p>
                        ))}

                      {(action.kind === "copy_text" ||
                        action.kind === "copy_open") &&
                        placed.format.fields.length > 0 && (
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              Stays disabled until this input is filled
                            </Label>
                            <Select
                              value={action.requiresField ?? "none"}
                              onValueChange={(value) =>
                                updateAction(index, {
                                  requiresField:
                                    value === "none" ? undefined : value,
                                })
                              }
                            >
                              <SelectTrigger size="sm" className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nothing</SelectItem>
                                {placed.format.fields.map((field) => (
                                  <SelectItem key={field.key} value={field.key}>
                                    {field.label || field.key}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2">
                    <AddAction
                      label="Copy template"
                      onAdd={() =>
                        addAction({
                          idPrefix: "copyTemplate",
                          kind: "copy_template",
                          label: "Copy Template",
                        })
                      }
                    />
                    <AddAction
                      label="Copy title"
                      onAdd={() =>
                        addAction({
                          idPrefix: "copyTitle",
                          kind: "copy_subject",
                          label: "Copy Title",
                        })
                      }
                    />
                    <AddAction
                      label="Copy text"
                      onAdd={() =>
                        addAction({
                          idPrefix: "copyText",
                          kind: "copy_text",
                          label: "Copy Text",
                          content: "",
                        })
                      }
                    />
                    <AddAction
                      label="Copy & open"
                      onAdd={() =>
                        addAction({
                          idPrefix: "copyOpen",
                          kind: "copy_open",
                          label: "Copy & Open",
                          content: "",
                        })
                      }
                    />
                    <AddAction
                      label="Copy & open GOV"
                      onAdd={() => addGovAction("fixed")}
                    />
                    <AddAction
                      label="Copy & open GOV + link"
                      onAdd={() => addGovAction("member")}
                    />
                    <AddAction
                      label="Today (UTC)"
                      onAdd={() =>
                        addAction({
                          idPrefix: "insertDate",
                          kind: "insert_utc_date",
                          label: "Today",
                        })
                      }
                    />
                    <AddAction
                      label="Time (UTC)"
                      onAdd={() =>
                        addAction({
                          idPrefix: "insertTime",
                          kind: "insert_utc_time",
                          label: "Time",
                        })
                      }
                    />
                    <AddAction
                      label="Reset"
                      onAdd={() =>
                        addAction({
                          idPrefix: "reset",
                          kind: "reset",
                          label: "Reset",
                        })
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </section>

        <section className="space-y-3 rounded-2xl border border-border bg-surface/90 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Live preview
            </h2>
            <span className="text-[10px] text-muted-foreground">
              The division page as the member sees it - same header, same
              picker, same renderer
            </span>
          </div>
          {placed ? (
            <div className="mx-auto w-full max-w-6xl rounded-2xl border border-border bg-background px-4 pt-5 pb-6 sm:px-6">
              <PaperworkWorkspace config={config} persist={false} />
            </div>
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

/** `patientName` -> `Patient Name`, for an input added from a placeholder. */
function labelFromKey(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_.]+/g, " ")
    .trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "Input";
}

/**
 * Binds a Copy & Open button to the input the member pastes its link into,
 * making that input when the format has none. The button and the input are one
 * decision: a bound button with no input cannot be pressed, and an input no
 * button opens is a field the member fills in for nothing.
 */
function bindLinkField(format: PaperworkFormat, index: number): string | null {
  const action = format.actions[index];
  if (!action) return null;
  const existing = format.fields.find(
    (field) => field.type === "url" && /(?:link|url)$/i.test(field.key),
  );
  const key = existing?.key ?? createLinkField(format);
  format.actions[index] = {
    ...action,
    content: `{{${key}}}`,
    requiresField: key,
  };
  return key;
}

/** `govLink`, or `govLink2` when a format already has a `govLink`. */
function createLinkField(format: PaperworkFormat): string {
  let key = "govLink";
  let index = 2;
  while (format.fields.some((field) => field.key === key)) {
    key = `govLink${index}`;
    index += 1;
  }
  format.fields.push({
    key,
    type: "url",
    label: key === "govLink" ? "GOV Link" : labelFromKey(key),
    hint: "The GOV page this post belongs on.",
    required: true,
  });
  return key;
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

// Every action kind the renderer knows, so a kind that cannot be offered here
// is visible as a missing entry rather than a silent gap.
export const ACTION_KINDS: readonly PaperworkAction["kind"][] = [
  "copy_template",
  "copy_subject",
  "copy_text",
  "copy_open",
  "insert_utc_date",
  "insert_utc_time",
  "reset",
];
