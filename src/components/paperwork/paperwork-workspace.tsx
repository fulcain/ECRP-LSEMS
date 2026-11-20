"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Check, Copy, ExternalLink, RotateCcw, RotateCw } from "lucide-react";
import { toast } from "react-toastify";

import { copyBBCode } from "@/app/helpers/copyBBCode";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import { useMedic } from "@/app/context/MedicContext";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { directorTitleForDivisionKeyOrLabel } from "@/app/constants/general/directorRoles";
import { DivisionHeader } from "@/components/division/division-header";
import { DocumentPicker } from "@/components/division/document-picker";
import {
  BuilderField,
  BuilderForm,
  BuilderOutput,
  BuilderPreview,
  BuilderRequirement,
  BuilderSection,
  BuilderShell,
  BuilderTitleRow,
} from "@/components/builder/builder-layout";
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
  defaultValueForField,
  fieldError,
  type PaperworkFieldValue,
} from "@/lib/paperwork/fields";
import {
  formatUtcDate,
  formatUtcTime,
  renderTemplate,
  renderUrlTemplate,
  type PlaceholderContext,
} from "@/lib/paperwork/placeholders";
import type {
  PaperworkAction,
  PaperworkConfig,
  PaperworkField,
} from "@/lib/paperwork/schema";

type Drafts = Record<string, Record<string, PaperworkFieldValue>>;

function iconFor(action: PaperworkAction) {
  if (action.kind === "copy_open") return ExternalLink;
  if (action.kind === "reset") return RotateCcw;
  if (action.kind === "insert_utc_date" || action.kind === "insert_utc_time") {
    return RotateCw;
  }
  return Copy;
}

/**
 * The one renderer generated division paperwork uses.
 *
 * Everything it draws comes from the config - the picker, the fields, the
 * template, the buttons - so the Paperwork Maker's preview and the real page are
 * the same component reading the same data. It never evaluates a template as
 * code: placeholders are substituted as text.
 */
export function PaperworkWorkspace({
  config,
  persist = true,
}: {
  config: PaperworkConfig;
  /**
   * Whether typed values are kept as a draft. The Paperwork Maker previews with
   * this off: what somebody types while editing a format is not paperwork they
   * are writing, so it is never saved.
   */
  persist?: boolean;
}) {
  const division = config.division;
  const { medicCredentials, divisionRanks } = useMedic();

  const [pageKey, setPageKey] = useState(division.pages[0]?.key ?? "");
  const page = division.pages.find((entry) => entry.key === pageKey) ?? division.pages[0];

  // Nothing is picked until the member picks it: the cards first, the builder
  // once they have said what they are writing.
  const [formatKey, setFormatKey] = useState<string | null>(null);
  const [savedDraft, setSavedDraft] = useLocalStorage<Drafts>(
    `paperwork-draft:${division.key}`,
    {},
  );
  const [previewDraft, setPreviewDraft] = useState<Drafts>({});
  const draft = persist ? savedDraft : previewDraft;
  const setDraft: Dispatch<SetStateAction<Drafts>> = persist
    ? setSavedDraft
    : setPreviewDraft;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Two ranks, kept apart on purpose: `staff.rank` is the member's own rank on
  // the Staff Page, `division.rank` the rank they hold inside this division.
  const staff = {
    name: medicCredentials.name,
    rank: medicCredentials.rank,
    signature: medicCredentials.signature,
    // The post only where the member's director role covers this division - a
    // director signs their own divisions, and everybody else's line is empty.
    director:
      directorTitleForDivisionKeyOrLabel(
        medicCredentials.directorRole,
        division.key,
        division.label,
      ) ?? "",
  };

  useEffect(() => {
    if (!copiedId) return;
    const timer = window.setTimeout(() => setCopiedId(null), 1800);
    return () => window.clearTimeout(timer);
  }, [copiedId]);

  const format =
    page?.groups
      .flatMap((group) => group.formats)
      .find((entry) => entry.key === formatKey) ?? null;

  const values: Record<string, PaperworkFieldValue> = {};
  if (format) {
    const stored = draft[format.key] ?? {};
    for (const field of format.fields) {
      values[field.key] = stored[field.key] ?? defaultValueForField(field, staff);
    }
  }

  const setValue = (fieldKey: string, value: PaperworkFieldValue) => {
    if (!format) return;
    setDraft((prev) => ({
      ...prev,
      [format.key]: { ...(prev[format.key] ?? {}), [fieldKey]: value },
    }));
  };

  const context: PlaceholderContext = {
    values,
    staff,
    divisionLabel: division.label,
    divisionRank: divisionRanks[division.label] || "",
  };

  const output = format
    ? renderTemplate(format.template, context)
    : { text: "", missing: [] };
  const subject = format?.subject
    ? renderTemplate(format.subject, context)
    : { text: "", missing: [] };

  const errors = format
    ? format.fields
        .map((field) => ({ field, message: fieldError(field, values[field.key]) }))
        .filter(
          (entry): entry is { field: PaperworkField; message: string } =>
            Boolean(entry.message),
        )
    : [];
  const complete = errors.length === 0 && output.missing.length === 0;

  // Each Copy & Open button names its own page: one the format declares, or the
  // link the member pasted into an input. Two of them in one format are two
  // different destinations, so the page is resolved per button.
  const urlFor = (action: PaperworkAction): string | null =>
    action.kind === "copy_open" && action.content
      ? renderUrlTemplate(action.content, context)
      : null;
  const openUrl =
    (format?.actions ?? [])
      .map(urlFor)
      .find((url): url is string => Boolean(url)) ?? null;

  const requirement = errors[0]?.message
    ? errors[0].message
    : output.missing.length > 0
      ? `The template asks for ${output.missing.map((name) => `{{${name}}}`).join(", ")}, which nothing provides.`
      : null;

  const disabledFor = (action: PaperworkAction): boolean => {
    if (action.kind === "reset") return false;
    if (action.kind === "insert_utc_date" || action.kind === "insert_utc_time") {
      return false;
    }
    if (action.kind === "copy_open") return !complete || !urlFor(action);
    if (action.requiresField) {
      const value = values[action.requiresField];
      if (value === undefined || !String(value).trim()) return true;
    }
    return !complete;
  };

  const runAction = async (action: PaperworkAction) => {
    if (!format) return;
    if (disabledFor(action)) return;

    if (action.kind === "insert_utc_date" && action.target) {
      const now = new Date();
      setValue(action.target, formatUtcDate(now));
      toast.success("Filled in today's UTC date.");
      return;
    }
    if (action.kind === "insert_utc_time" && action.target) {
      setValue(action.target, formatUtcTime(new Date()));
      toast.success("Filled in the current UTC time.");
      return;
    }
    if (action.kind === "reset") {
      setDraft((prev) => {
        const next = { ...prev };
        delete next[format.key];
        return next;
      });
      toast.success("Cleared.");
      return;
    }
    if (action.kind === "copy_template") {
      copyBBCode({
        bbCodeText: output.text,
        post: {
          subject: subject.text || undefined,
          url: openUrl ?? undefined,
          feature: `${division.label} paperwork`,
        },
      });
      setCopiedId(action.id);
      return;
    }
    if (action.kind === "copy_subject") {
      copyBBCode({
        bbCodeText: subject.text,
        post: { subject: subject.text, bbcode: "" },
      });
      setCopiedId(action.id);
      return;
    }
    if (action.kind === "copy_text" && action.content) {
      copyBBCode({ bbCodeText: renderTemplate(action.content, context).text });
      setCopiedId(action.id);
      return;
    }
    const url = urlFor(action);
    if (action.kind === "copy_open" && url) {
      copyBBCodeAndOpen({
        bbCodeText: output.text,
        url,
        post: {
          subject: subject.text || undefined,
          url,
          feature: `${division.label} paperwork`,
        },
      });
      setCopiedId(action.id);
    }
  };

  const previewActions = format?.actions.filter(
    (action) =>
      action.kind !== "insert_utc_date" && action.kind !== "insert_utc_time",
  );

  const fieldActions = (fieldKey: string) =>
    (format?.actions ?? []).filter(
      (action) =>
        (action.kind === "insert_utc_date" ||
          action.kind === "insert_utc_time") &&
        action.target === fieldKey,
    );

  return (
    <>
      <DivisionHeader
        label={division.label}
        emblem={division.emblem}
        title={page?.label ?? "Paperwork"}
        purpose={page?.purpose}
        tabs={
          division.pages.length > 1
            ? division.pages.map((entry) => ({
                value: entry.key,
                label: entry.label,
              }))
            : undefined
        }
        active={page?.key}
        onChange={(value) => {
          setPageKey(value);
          setFormatKey(null);
        }}
      />

      <DocumentPicker
        groups={(page?.groups ?? []).map((group) => ({
          label: group.label,
          hint: group.hint,
          documents: group.formats.map((entry) => ({
            value: entry.key,
            label: entry.label,
            hint: entry.hint,
            icon: Copy,
          })),
        }))}
        value={formatKey}
        onChange={setFormatKey}
        legend="What are you writing?"
        className="mb-6"
      />

      {format && (
        <BuilderShell>
          <BuilderForm>
            <BuilderSection
              icon={Copy}
              title={format.label}
              hint={format.hint}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {format.fields.map((field) => (
                  <div
                    key={field.key}
                    className={field.width === "half" ? undefined : "sm:col-span-2"}
                  >
                    <BuilderField label={field.label} hint={field.hint}>
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <FieldControl
                            field={field}
                            value={values[field.key]}
                            onChange={(value) => setValue(field.key, value)}
                          />
                        </div>
                        {fieldActions(field.key).map((action) => (
                          <Button
                            key={action.id}
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="shrink-0 text-xs"
                            onClick={() => runAction(action)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </BuilderField>
                  </div>
                ))}
              </div>
            </BuilderSection>
          </BuilderForm>

          <BuilderPreview
            icon={Copy}
            title="Generated Output"
            badge={format.label}
            actions={
              <>
                {previewActions?.map((action) => {
                  const Icon = iconFor(action);
                  return (
                    <Button
                      key={action.id}
                      type="button"
                      size="lg"
                      variant={action.variant === "outline" ? "outline" : "default"}
                      disabled={disabledFor(action)}
                      onClick={() => runAction(action)}
                      className="w-full"
                    >
                      {copiedId === action.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      {copiedId === action.id ? "Copied!" : action.label}
                    </Button>
                  );
                })}
              </>
            }
            note="Copy & Open hands the post to the browser extension and opens its page with the body filled in — either the page the format declares, or the link you paste into the format's own input."
          >
            {format.subject && (
              <BuilderTitleRow
                label="Subject"
                value={subject.text}
                onCopy={() => {
                  const action = format.actions.find(
                    (entry) => entry.kind === "copy_subject",
                  );
                  if (action) void runAction(action);
                }}
                disabled={!complete}
              />
            )}

            <BuilderOutput label="BBCode" value={output.text} />

            {requirement && <BuilderRequirement>{requirement}</BuilderRequirement>}
          </BuilderPreview>
        </BuilderShell>
      )}
    </>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: PaperworkField;
  value: PaperworkFieldValue;
  onChange: (value: PaperworkFieldValue) => void;
}) {
  const id = `paperwork-${field.key}`;

  if (field.type === "checkbox") {
    return (
      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-background/40 p-3">
        <Checkbox
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked === true)}
          className="mt-0.5"
        />
        <span className="text-xs leading-relaxed text-foreground">
          {field.label}
          {field.hint && (
            <span className="mt-0.5 block text-[10px] text-muted-foreground">
              {field.hint}
            </span>
          )}
        </span>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <Select
        value={String(value ?? "")}
        onValueChange={(next) => onChange(next)}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={field.placeholder ?? "Choose one"} />
        </SelectTrigger>
        <SelectContent>
          {(field.options ?? []).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="flex flex-wrap gap-2">
        {(field.options ?? []).map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={value === option.value ? "default" : "outline"}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <Textarea
        id={id}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className="resize-y"
      />
    );
  }

  // A date or time field carries its own "now": the format does not have to
  // declare an insert action for the one thing anyone ever types there.
  const moment =
    field.type === "date"
      ? { label: "Now", value: () => formatUtcDate() }
      : field.type === "time"
        ? { label: "Copy now", value: () => formatUtcTime() }
        : undefined;

  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="sr-only">
        {field.label}
      </Label>
      <div className="flex items-center gap-1.5">
        <Input
          id={id}
          type={field.type === "number" ? "number" : "text"}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            field.placeholder ??
            (field.type === "staff"
              ? `{{staff.${field.source ?? "name"}}}`
              : undefined)
          }
          className={moment ? "font-mono" : undefined}
        />
        {moment && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="shrink-0 text-xs"
            title={
              field.type === "date"
                ? "Fill in today's date and copy it (UTC)"
                : "Fill in the current UTC time and copy it"
            }
            onClick={async () => {
              const next = moment.value();
              onChange(next);
              let copied = false;
              try {
                await navigator.clipboard.writeText(next);
                copied = true;
              } catch {
                copied = false;
              }
              toast.success(
                copied
                  ? `Copied ${next} (UTC).`
                  : `Filled in ${next} (UTC).`,
              );
            }}
          >
            {moment.label}
          </Button>
        )}
      </div>
    </div>
  );
}
