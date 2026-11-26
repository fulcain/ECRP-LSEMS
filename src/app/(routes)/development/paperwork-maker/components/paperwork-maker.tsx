"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronsUpDown,
  FileCode2,
  GripVertical,
  Plus,
  Redo2,
  Trash2,
  Undo2,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useMedic } from "@/app/context/MedicContext";
import { directorTitleForDivisionKeyOrLabel } from "@/app/constants/general/directorRoles";
import {
  DIVISION_ICON_NAMES,
  divisionIcon,
} from "@/components/layout/header/configs/division-icons";
import { DIVISION_ENTRIES } from "@/configs/roles";
import { GENERATED_PAPERWORK } from "@/app/constants/paperwork/generated";
import { FIELD_TYPES } from "@/lib/paperwork/fields";
import { renderTemplate } from "@/lib/paperwork/placeholders";
import { INPUT_LIMITS } from "@/lib/validation";
import {
  BUILTIN_PLACEHOLDERS,
  allFormats,
  copyOpenField,
  createEmptyPaperworkConfig,
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

type EditorSnapshot = {
  config: PaperworkConfig;
  selectedKey: string;
  selectedSlot: FormatSlot | null;
  pageIndex: number;
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
const DRAFT_KEY = "paperwork-maker-config-v3";

/**
 * Every value the Staff Page already holds, ready to drop into a format. They
 * are inputs like any other, but nobody types them: the renderer seeds them from
 * the signed-in member, so `{{staffName}}` is filled in when the page opens.
 */
/**
 * What each built-in placeholder is, in the maker's own words. The Staff Page
 * values are placeholders the renderer fills in, so they need no input of their
 * own - this is the list that says which is which, with the member's value.
 */
const PLACEHOLDER_NOTES: Record<string, string> = {
  "staff.name": "your name",
  "staff.rank": "your Staff Page rank",
  "staff.signature": "your signature image",
  "staff.director": "your director post, on a division it covers",
  "division.rank": "your rank in this division",
  "division.label": "this division's name",
  "utc.date": "today, UTC",
  "utc.time": "now, UTC",
};

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
 * pressed.
 */
/**
 * What a page starts its scopes from. There is deliberately no default scope:
 * an auto-made "Documents" is one nobody asked for, and an empty one is a
 * validation error the author gets blamed for.
 */
const NEW_SCOPE = "New scope";

export function PaperworkMaker({
  initial,
  productionStore = false,
  databaseUnavailable = false,
}: {
  initial: PaperworkConfig;
  productionStore?: boolean;
  databaseUnavailable?: boolean;
}) {
  const [config, setConfig] = useLocalStorage<PaperworkConfig>(
    DRAFT_KEY,
    initial,
  );
  const initialFormat = allFormats(initial)[0];
  const [selectedKey, setSelectedKey] = useState<string>(
    initialFormat?.key ?? "",
  );
  const [selectedSlot, setSelectedSlot] = useState<FormatSlot | null>(
    initialFormat ? slotOf(initial, initialFormat.key) : null,
  );
  const [formatPickerOpen, setFormatPickerOpen] = useState(false);
  const [formatSearch, setFormatSearch] = useState("");
  const [formatToDelete, setFormatToDelete] = useState<{
    pageIndex: number;
    groupIndex: number;
    formatIndex: number;
    key: string;
    label: string;
  } | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [busy, setBusy] = useState<"plan" | "generate" | null>(null);
  const [written, setWritten] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placeholderSearch, setPlaceholderSearch] = useState("");
  const [fieldSearch, setFieldSearch] = useState("");
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);
  const [dragTargetFieldIndex, setDragTargetFieldIndex] = useState<number | null>(null);
  const [saved, setSaved] = useState<PaperworkConfig[]>([]);
  const history = useRef<{ undo: EditorSnapshot[]; redo: EditorSnapshot[] }>({
    undo: [],
    redo: [],
  });
  const [, setHistoryRevision] = useState(0);
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
    resetHistory();
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

  const snapshot = (): EditorSnapshot => ({
    config: clone(config),
    selectedKey,
    selectedSlot: selectedSlot ? { ...selectedSlot } : null,
    pageIndex,
  });

  const resetHistory = () => {
    history.current = { undo: [], redo: [] };
    setHistoryRevision((revision) => revision + 1);
  };

  const restoreSnapshot = (entry: EditorSnapshot) => {
    setConfig(clone(entry.config));
    setSelectedKey(entry.selectedKey);
    setSelectedSlot(entry.selectedSlot ? { ...entry.selectedSlot } : null);
    setPageIndex(entry.pageIndex);
    setPlan(null);
    setWritten(null);
    setHistoryRevision((revision) => revision + 1);
  };

  const undo = () => {
    const previous = history.current.undo.pop();
    if (!previous) return;
    history.current.redo.push(snapshot());
    restoreSnapshot(previous);
  };

  const redo = () => {
    const next = history.current.redo.pop();
    if (!next) return;
    history.current.undo.push(snapshot());
    restoreSnapshot(next);
  };

  const update = (mutate: (draft: PaperworkConfig) => void) => {
    history.current.undo.push(snapshot());
    if (history.current.undo.length > 100) history.current.undo.shift();
    history.current.redo = [];
    setHistoryRevision((revision) => revision + 1);
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
  const renameField = (index: number, next: string, label?: string) => {
    updateFormat((format) => {
      const field = format.fields[index];
      if (!field) return;
      if (label !== undefined) field.label = label;
      if (field.key === next) return;
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

  const updateFieldOption = (
    fieldIndex: number,
    optionIndex: number,
    patch: Partial<NonNullable<PaperworkField["options"]>[number]>,
  ) => {
    const field = placed?.format.fields[fieldIndex];
    if (!field) return;
    updateField(fieldIndex, {
      options: (field.options ?? []).map((option, index) =>
        index === optionIndex ? { ...option, ...patch } : option,
      ),
    });
  };

  /** Inserts at the caret, so a chip or a snippet lands where the cursor is. */
  const insertText = (text: string) => {
    const textarea = templateRef.current;
    const currentTemplate = placed?.format.template ?? "";
    const start = textarea?.selectionStart ?? currentTemplate.length;
    const end = textarea?.selectionEnd ?? start;
    updateFormat((format) => {
      if (!textarea) {
        format.template += text;
        return;
      }
      format.template =
        format.template.slice(0, start) + text + format.template.slice(end);
    });
    requestAnimationFrame(() => {
      textarea?.focus({ preventScroll: true });
      textarea?.setSelectionRange(start + text.length, start + text.length);
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
        label: format.label,
        pageLabel: entry.label,
        scopeLabel: group.label,
      })),
    ),
  );
  const selectedFormatOption = formatOptions.find(
    (option) => option.value === placed?.format.key,
  );
  const normalizedFormatSearch = formatSearch.trim().toLocaleLowerCase();
  const filteredFormatGroups = pages
    .flatMap((entry) =>
      entry.groups.map((group) => ({
        pageLabel: entry.label,
        scopeLabel: group.label,
        formats: group.formats.filter((format) =>
          `${format.label} ${format.key} ${entry.label} ${group.label}`
            .toLocaleLowerCase()
            .includes(normalizedFormatSearch),
        ),
      })),
    )
    .filter((group) => group.formats.length > 0);
  const filteredFormatCount = filteredFormatGroups.reduce(
    (count, group) => count + group.formats.length,
    0,
  );

  const placeholderChips = [
    ...(placed?.format.fields.map((field) => field.key) ?? []),
    ...BUILTIN_PLACEHOLDERS,
  ];

  // What each built-in placeholder writes today, rendered by the same engine the
  // page uses - so the maker never promises a value the member cannot see.
  const staffPreview = {
    name: medicCredentials.name,
    rank: medicCredentials.rank,
    signature: medicCredentials.signature,
    director:
      directorTitleForDivisionKeyOrLabel(
        medicCredentials.directorRole,
        config.division.key,
        config.division.label,
      ) ?? "",
  };
  const placeholderSamples = BUILTIN_PLACEHOLDERS.map((name) => ({
    name,
    note: PLACEHOLDER_NOTES[name] ?? "",
    value: renderTemplate(`{{${name}}}`, {
      values: {},
      staff: staffPreview,
      divisionLabel: config.division.label,
      divisionRank: divisionRanks[config.division.label] || "",
    }).text,
  }));
  const normalizedPlaceholderSearch = placeholderSearch.trim().toLocaleLowerCase();
  const filteredPlaceholderChips = placeholderChips.filter((name) => {
    if (!normalizedPlaceholderSearch) return true;
    const field = placed?.format.fields.find((entry) => entry.key === name);
    const sample = placeholderSamples.find((entry) => entry.name === name);
    return [name, field?.label, sample?.value, sample?.note].some((value) =>
      value?.toLocaleLowerCase().includes(normalizedPlaceholderSearch),
    );
  });
  const normalizedFieldSearch = fieldSearch.trim().toLocaleLowerCase();
  const filteredFields = (placed?.format.fields ?? [])
    .map((field, index) => ({ field, index }))
    .filter(({ field }) =>
      [field.label, field.key, field.type, field.hint ?? "", field.placeholder ?? "", field.source ?? ""]
        .some((value) => value.toLocaleLowerCase().includes(normalizedFieldSearch)),
    );

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
  const canonicalWorkspace = GENERATED_PAPERWORK.some(
    (entry) => entry.division.key === config.division.key,
  );

  const targetRoute = config.division.key
    ? existingDivision?.[1].route && !canonicalWorkspace
      ? `/divisions/database/${divisionSlug(config.division.key)}`
      : existingDivision?.[1].route
        ? existingDivision[1].route.replace(/\/+$/, "")
      : `/divisions/${divisionSlug(config.division.key)}`
    : "";

  const chooseDivision = (value: string) => {
    if (value === "new") {
      resetHistory();
      setConfig(createEmptyPaperworkConfig());
      setPageIndex(0);
      setSelectedKey("");
      setSelectedSlot(null);
      return;
    }
    const entry = DIVISION_ENTRIES.find(([key]) => key === value);
    if (!entry) return;
    const draft = createEmptyPaperworkConfig();
    draft.division = {
      ...draft.division,
      key: value,
      label: entry[1].label,
      icon: entry[1].icon,
      description: `${entry[1].label} paperwork formats.`,
    };
    resetHistory();
    setConfig(draft);
    setPageIndex(0);
    setSelectedKey("");
    setSelectedSlot(null);
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
    // A format lives in a scope, so a page has to have one before it can hold a
    // format - the author writes the heading rather than inheriting "Documents".
    if (!page || page.groups.length === 0) return;
    const existing = new Set(formatOptions.map((option) => option.value));
    let index = 1;
    while (existing.has(`format${index}`)) index += 1;
    const key = `format${index}`;
    const groupIndex = 0;
    const formatIndex = page.groups[0].formats.length;
    update((draft) => {
      const target = draft.division.pages[activePageIndex];
      if (!target) return;
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

  const requestFormatRemoval = () => {
    if (!placed) return;
    setFormatToDelete({
      pageIndex: placedPageIndex,
      groupIndex: placed.groupIndex,
      formatIndex: placed.formatIndex,
      key: placed.format.key,
      label: placed.format.label || placed.format.key,
    });
  };

  const removeFormat = () => {
    if (!formatToDelete) return;
    update((draft) => {
      draft.division.pages[formatToDelete.pageIndex]?.groups[
        formatToDelete.groupIndex
      ]?.formats.splice(
        formatToDelete.formatIndex,
        1,
      );
    });
    setSelectedKey("");
    setSelectedSlot(null);
    setFormatToDelete(null);
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
        formatPage.groups.push({ label: NEW_SCOPE, hint: "", formats: [moved] });
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
      let name = NEW_SCOPE;
      let index = 2;
      while (target.groups.some((group) => group.label === name)) {
        name = `${NEW_SCOPE} ${index}`;
        index += 1;
      }
      target.groups.push({ label: name, hint: "", formats: [] });
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
      {databaseUnavailable && (
        <div role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          The database could not be reached. The AMU backup is loaded; database saves will work once the connection is restored.
        </div>
      )}
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
          {productionStore
          ? "Database editing - saving updates the shared division formats immediately."
            : "Development only - Generate writes files in this checkout. Review, commit, deploy."}
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
              resetHistory();
              setConfig(clone(initial));
              setPageIndex(0);
              setSelectedKey("");
              setPlan(null);
              setWritten(null);
            }}
          >
            Clear draft
          </Button>
          {!productionStore && <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={planFiles}
            disabled={busy !== null || !validation.ok}
          >
            <Wand2 className="h-4 w-4" />
            {busy === "plan" ? "Planning…" : "Plan files"}
          </Button>}
          <Button
            type="button"
            size="sm"
            onClick={generate}
            disabled={busy !== null || !validation.ok || (!productionStore && !plan?.ok)}
          >
            <Check className="h-4 w-4" />
            {busy === "generate"
              ? productionStore ? "Saving…" : "Generating…"
              : productionStore ? "Save division formats" : "Generate files"}
          </Button>
        </div>
      </section>

      {config.division.pages.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-surface/60 p-4 text-xs text-muted-foreground">
          Name the division, then add a page, a scope and a format. Nothing is
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
          {productionStore ? "Saved to the shared database: " : `Wrote ${written.length} file${written.length === 1 ? "" : "s"}: `}
          {written.join(", ")}
          {productionStore && targetRoute && (
            <a href={targetRoute} className="ml-2 underline underline-offset-4">
              Open division page
            </a>
          )}
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
                  {DIVISION_ENTRIES.filter(([key]) => key !== "cru" && !saved.some((entry) => entry.division.key === key)).map(([key, division]) => (
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
                    ? `Database paperwork for ${existingDivision[1].label} is available at ${targetRoute}.`
                    : `Database division page: ${targetRoute}. New divisions can be opened directly at this address.`}
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
                        No scopes yet. Add one and give it a title - a format
                        is written under a scope, so this page needs one first.
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

          <section className="space-y-3 rounded-2xl border border-border bg-surface/90 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Division header links</h2>
                <p className="text-xs text-muted-foreground">These open as buttons beside the division page heading.</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => update((draft) => { draft.division.quickLinks ??= []; draft.division.quickLinks.push({ name: "", url: "" }); })}>
                <Plus className="h-3.5 w-3.5" /> Add link
              </Button>
            </div>
            {(config.division.quickLinks ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">No header links configured.</p>
            ) : (
              <div className="space-y-2">
                {(config.division.quickLinks ?? []).map((link, index) => (
                  <div key={`header-link-${index}`} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(10rem,0.8fr)_minmax(14rem,1.5fr)_auto]">
                    <Input aria-label={`Header link ${index + 1} name`} value={link.name} maxLength={INPUT_LIMITS.text} placeholder="Button name" onChange={(event) => update((draft) => { if (draft.division.quickLinks?.[index]) draft.division.quickLinks[index].name = event.target.value; })} />
                    <Input aria-label={`Header link ${index + 1} URL`} value={link.url} maxLength={INPUT_LIMITS.url} placeholder="https://…" onChange={(event) => update((draft) => { if (draft.division.quickLinks?.[index]) draft.division.quickLinks[index].url = event.target.value; })} />
                    <Button type="button" size="icon" variant="ghost" aria-label={`Remove header link ${index + 1}`} onClick={() => update((draft) => { draft.division.quickLinks?.splice(index, 1); })}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-surface/90 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">Format</h2>
              <div className="w-full sm:w-[min(30rem,calc(100vw-6rem))]">
                <Popover
                  open={formatPickerOpen}
                  onOpenChange={setFormatPickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      role="combobox"
                      aria-expanded={formatPickerOpen}
                      className="h-auto min-h-9 w-full justify-between py-2 text-left font-normal"
                    >
                      <span className="flex min-w-0 flex-1 flex-col items-start">
                        <span className="w-full break-words font-medium text-foreground">
                          {selectedFormatOption?.label ?? "Choose a format"}
                        </span>
                        {selectedFormatOption && (
                          <span className="w-full break-words text-[10px] text-muted-foreground">
                            {selectedFormatOption.pageLabel} / {selectedFormatOption.scopeLabel}
                          </span>
                        )}
                      </span>
                      <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-[min(38rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] p-3"
                  >
                    <Input
                      autoFocus
                      value={formatSearch}
                      onChange={(event) => setFormatSearch(event.target.value)}
                      placeholder="Search formats or scopes…"
                      aria-label="Search formats"
                      className="h-8 text-xs"
                    />
                    <div
                      role="listbox"
                      aria-label="Formats"
                      className="mt-2 max-h-[min(70vh,32rem)] space-y-3 overflow-y-auto"
                    >
                      {filteredFormatGroups.map((group) => (
                        <div
                          key={`${group.pageLabel}-${group.scopeLabel}`}
                          className="space-y-1"
                        >
                          <p className="sticky top-0 z-10 rounded-md bg-popover/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
                            {group.pageLabel} <span aria-hidden="true">›</span> {group.scopeLabel}
                          </p>
                          <div className="space-y-1">
                            {group.formats.map((format) => {
                              const selected = format.key === placed?.format.key;
                              return (
                                <Button
                                  key={format.key}
                                  type="button"
                                  size="sm"
                                  variant={selected ? "secondary" : "ghost"}
                                  role="option"
                                  aria-selected={selected}
                                  className="h-auto min-h-9 w-full justify-start gap-2 whitespace-normal py-2 text-left font-normal"
                                  onClick={() => {
                                    selectFormat(format.key);
                                    setFormatPickerOpen(false);
                                    setFormatSearch("");
                                  }}
                                >
                                  <Check
                                    className={`h-3.5 w-3.5 shrink-0 ${selected ? "opacity-100" : "opacity-0"}`}
                                  />
                                  <span className="min-w-0 break-words">{format.label}</span>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {filteredFormatCount === 0 && (
                        <p className="px-2 py-3 text-xs text-muted-foreground">
                          No formats match that search.
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addFormat}
                disabled={!page || page.groups.length === 0}
                title={
                  page && page.groups.length === 0
                    ? "Add a scope to this page first"
                    : undefined
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add format
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={requestFormatRemoval}
                disabled={!placed}
                title={placed ? "Delete the selected format" : "Choose a format to delete"}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete format
              </Button>
            </div>

            {!placed && (
              <p className="text-xs text-muted-foreground">
                {!page
                  ? "Add a page first, then a scope, then a format."
                  : page.groups.length === 0
                    ? "This page has no scope yet. Add one in the Scopes list above - the format goes under it."
                    : "No format yet - press Add format to write the first one."}
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
                          <SelectValue placeholder="Choose a scope" />
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
                        placeholder={NEW_SCOPE}
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
                  </div>

                  <Input
                    type="search"
                    value={fieldSearch}
                    onChange={(event) => setFieldSearch(event.target.value)}
                    placeholder="Search inputs by name, placeholder, type, or hint"
                    aria-label="Search inputs"
                  />

                  <div className="space-y-3">
                    {filteredFields.map(({ field, index }) => (
                      <div
                        key={index}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDragTargetFieldIndex(index);
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const from = Number(event.dataTransfer.getData("text/plain"));
                          if (
                            Number.isInteger(from) &&
                            from >= 0 &&
                            from < placed.format.fields.length &&
                            from !== index
                          ) {
                            updateFormat((format) => {
                              const [moved] = format.fields.splice(from, 1);
                              if (moved) format.fields.splice(index, 0, moved);
                            });
                          }
                          setDraggedFieldIndex(null);
                          setDragTargetFieldIndex(null);
                        }}
                        onDragLeave={(event) => {
                          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                            setDragTargetFieldIndex(null);
                          }
                        }}
                        className={`space-y-3 rounded-xl border bg-surface/60 p-4 transition-colors ${
                          dragTargetFieldIndex === index && draggedFieldIndex !== index
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border"
                        } ${draggedFieldIndex === index ? "opacity-50" : ""}`}
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
                            <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              Move to
                              <Input
                                key={`${field.key}-${index}`}
                                type="number"
                                min={1}
                                max={placed.format.fields.length}
                                defaultValue={index + 1}
                                aria-label={`Move ${field.label || "input"} to position`}
                                className="h-8 w-16 px-2 text-center text-xs"
                                onBlur={(event) => {
                                  const requested = Number(event.currentTarget.value);
                                  if (!Number.isInteger(requested)) {
                                    event.currentTarget.value = String(index + 1);
                                    return;
                                  }
                                  const destination = Math.max(
                                    0,
                                    Math.min(placed.format.fields.length - 1, requested - 1),
                                  );
                                  if (destination !== index) {
                                    updateFormat((format) => {
                                      const [moved] = format.fields.splice(index, 1);
                                      if (moved) format.fields.splice(destination, 0, moved);
                                    });
                                  }
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") event.currentTarget.blur();
                                }}
                              />
                            </label>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label={`Drag to reorder ${field.label || "input"}`}
                              title="Drag to reorder"
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.effectAllowed = "move";
                                event.dataTransfer.setData("text/plain", String(index));
                                setDraggedFieldIndex(index);
                              }}
                              onDragEnd={() => {
                                setDraggedFieldIndex(null);
                                setDragTargetFieldIndex(null);
                              }}
                            >
                              <GripVertical className="h-4 w-4" />
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
                              onChange={(event) => {
                                const label = event.target.value;
                                const words = label.match(/[a-zA-Z0-9]+/g) ?? [];
                                const key = words
                                  .map((word, wordIndex) =>
                                    wordIndex === 0
                                      ? word.toLocaleLowerCase()
                                      : word[0].toLocaleUpperCase() + word.slice(1).toLocaleLowerCase(),
                                  )
                                  .join("");
                                if (key) renameField(index, key, label);
                                else updateField(index, { label });
                              }}
                              placeholder="Patient name"
                            />
                            <p className="text-[10px] text-muted-foreground">
                              The template placeholder updates automatically in camelCase.
                            </p>
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
                          {(field.type === "date" || field.type === "time") && (
                            <label className="flex items-start gap-2 rounded-lg border border-border bg-background/40 p-3 sm:col-span-2">
                              <Checkbox
                                checked={field.showNowButton !== false}
                                onCheckedChange={(checked) =>
                                  updateField(index, {
                                    showNowButton: checked === true,
                                  })
                                }
                                aria-label={`Show quick-fill button for ${field.label || field.type} field`}
                              />
                              <span className="space-y-0.5">
                                <span className="block text-xs font-medium text-foreground">
                                  Show “{field.type === "date" ? "Now" : "Copy now"}” button
                                </span>
                                <span className="block text-[10px] text-muted-foreground">
                                  {field.type === "date"
                                    ? "Fills in today's UTC date."
                                    : "Fills in and copies the current UTC time."}
                                </span>
                              </span>
                            </label>
                          )}
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
                        {(field.type === "radio" || field.type === "select") && (
                          <div className="space-y-2 rounded-lg border border-border/70 bg-background/30 p-3 sm:col-span-2">
                            <div>
                              <p className="text-xs font-medium text-foreground">
                                {field.type === "radio" ? "Radio choices" : "Dropdown choices"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {field.type === "radio"
                                  ? "Set each radio label and the text written into the template when it is selected."
                                  : "Set the choices the member can select."}
                              </p>
                            </div>
                            {(field.options ?? []).map((option, optionIndex) => (
                              <div
                                key={`${option.value}-${optionIndex}`}
                                className={`grid gap-2 ${field.type === "radio" ? "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]" : "sm:grid-cols-[1fr_1fr_auto]"}`}
                              >
                                <Input
                                  value={option.label}
                                  maxLength={INPUT_LIMITS.short}
                                  aria-label={`Choice ${optionIndex + 1} label`}
                                  onChange={(event) =>
                                    updateFieldOption(index, optionIndex, {
                                      label: event.target.value,
                                    })
                                  }
                                  placeholder={field.type === "radio" ? "Radio label" : "Choice label"}
                                />
                                {field.type !== "radio" && (
                                  <Input
                                  value={option.value}
                                  maxLength={INPUT_LIMITS.short}
                                  aria-label={`Choice ${optionIndex + 1} selection value`}
                                  onChange={(event) =>
                                    updateFieldOption(index, optionIndex, {
                                      value: event.target.value,
                                    })
                                  }
                                  placeholder="Selection value"
                                  className="font-mono"
                                  />
                                )}
                                {field.type === "radio" && (
                                  <Input
                                    value={option.output ?? ""}
                                    maxLength={INPUT_LIMITS.short}
                                    aria-label={`Choice ${optionIndex + 1} template output`}
                                    onChange={(event) =>
                                      updateFieldOption(index, optionIndex, {
                                        output: event.target.value,
                                      })
                                    }
                                    placeholder="Template output, e.g. X"
                                    className="font-mono"
                                  />
                                )}
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  aria-label={`Remove choice ${optionIndex + 1}`}
                                  onClick={() =>
                                    updateField(index, {
                                      options: (field.options ?? []).filter(
                                        (_, itemIndex) => itemIndex !== optionIndex,
                                      ),
                                    })
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            {(field.options ?? []).length === 0 && (
                              <p className="text-[10px] text-amber-700 dark:text-amber-300">
                                This field has no choices yet. Add at least one to make it usable.
                              </p>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const optionNumber = (field.options?.length ?? 0) + 1;
                                const label = `Option ${optionNumber}`;
                                updateField(index, {
                                  options: [
                                    ...(field.options ?? []),
                                    {
                                      label,
                                      value: `option_${optionNumber}`,
                                      ...(field.type === "radio" ? { output: "" } : {}),
                                    },
                                  ],
                                });
                              }}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add choice
                            </Button>
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
                    {placed.format.fields.length > 0 && filteredFields.length === 0 && (
                      <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                        <p>No inputs match that search.</p>
                        <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => setFieldSearch("")}>
                          Clear search
                        </Button>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto min-h-14 w-full justify-start border-dashed px-4 py-3 text-left hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => {
                        setFieldSearch("");
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
                        });
                      }}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Plus className="h-4 w-4" />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {placed.format.fields.length === 0
                            ? "Add your first input"
                            : "Add another input"}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                          Create a value the member can fill in on the form.
                        </span>
                      </span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="rounded-xl border border-border bg-background/40 p-3">
                    <p className="text-[10px] text-muted-foreground">
                      Current values from your Staff Page and this division
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
                          <span className="ml-auto shrink-0 text-muted-foreground">
                            {sample.note}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sticky top-16 z-20 space-y-2 rounded-xl border border-border bg-background/95 p-3 shadow-md backdrop-blur">
                    <Label className="text-xs text-muted-foreground">
                      BBCode template · click a placeholder to insert it
                    </Label>
                    <Input
                      type="search"
                      value={placeholderSearch}
                      onChange={(event) => setPlaceholderSearch(event.target.value)}
                      placeholder="Search inputs or current values"
                      aria-label="Search BBCode template inputs"
                      className="h-8 text-xs"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {filteredPlaceholderChips.map((name) => (
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
                      {filteredPlaceholderChips.length === 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          No inputs or placeholders match that search.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface/60 p-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        insertText(
                          "{{#if staff.director}}\n\n{{else}}\n\n{{/if}}",
                        )
                      }
                    >
                      Insert director if / else
                    </Button>
                    <p className="text-[10px] text-muted-foreground">
                      The first block appears when the value is set; the else
                      block appears when it is empty. You can use any input or
                      built-in placeholder.
                    </p>
                  </div>
                  <details className="group rounded-xl border border-border bg-surface/60 p-3 text-xs">
                    <summary className="cursor-pointer font-medium text-foreground">
                      How conditional blocks work
                    </summary>
                    <div className="mt-2 space-y-2 text-muted-foreground">
                      <p>
                        Put the content to show when a value exists between
                        <code className="mx-1 font-mono text-foreground">{"{{#if staff.director}}"}</code>
                        and
                        <code className="mx-1 font-mono text-foreground">{"{{else}}"}</code>.
                        Put the fallback after <code className="font-mono text-foreground">{"{{else}}"}</code>;
                        it appears when the value is empty. The else block is optional.
                      </p>
                      <pre className="overflow-x-auto rounded-lg bg-background/80 p-3 font-mono text-[11px] text-foreground">{`{{#if staff.director}}
{{staff.director}}
{{else}}
[Fallback signature or text]
{{/if}}`}</pre>
                      <p>
                        Replace <code className="font-mono text-foreground">staff.director</code> with any built-in value or input name.
                        You can nest conditional blocks; each opening if needs a matching
                        <code className="mx-1 font-mono text-foreground">{"{{/if}}"}</code>.
                      </p>
                    </div>
                  </details>
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
      <Dialog
        open={formatToDelete !== null}
        onOpenChange={(open) => !open && setFormatToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete format?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete “{formatToDelete?.label}”? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormatToDelete(null)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={removeFormat}>
              Delete format
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[4.25rem] z-[60] flex gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={undo}
          disabled={history.current.undo.length === 0}
          aria-label="Undo paperwork change"
          title="Undo paperwork change"
          className="rounded-full bg-background/90 shadow-lg backdrop-blur-sm"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={redo}
          disabled={history.current.redo.length === 0}
          aria-label="Redo paperwork change"
          title="Redo paperwork change"
          className="rounded-full bg-background/90 shadow-lg backdrop-blur-sm"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
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
