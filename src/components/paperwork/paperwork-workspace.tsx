"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Calendar as CalendarIcon, CalendarClock, Check, Copy, ExternalLink, RotateCcw, RotateCw } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { parseDate } from "@/lib/format-date";
import { validateName, validationMessage } from "@/lib/validation";
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
  templateValueForField,
  PAPERWORK_REASON_LIMIT,
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
  PaperworkFormat,
} from "@/lib/paperwork/schema";

type Drafts = Record<string, Record<string, PaperworkFieldValue>>;

const MONTH_ABBREVIATIONS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function paperworkDateValue(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}/${MONTH_ABBREVIATIONS[date.getMonth()]}/${date.getFullYear()}`;
}

function timePickerValue(value: string): string {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i.exec(value.trim());
  if (!match) return "";
  let hour = Number(match[1]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem) hour = (hour % 12) + (meridiem === "PM" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
}

function courseListingOutput(
  format: PaperworkFormat,
  values: Record<string, PaperworkFieldValue>,
): { text: string; missing: string[]; errors: string[] } | null {
  const generator = format.generator;
  if (generator?.kind !== "course_listing") return null;
  const action = String(values[generator.actionField] ?? "new");
  const dateText = String(values[generator.dateField] ?? "").trim();
  const timeText = String(values[generator.timeField] ?? "").trim();
  const instructor = String(values[generator.instructorField] ?? "").trim();
  const previousDateText = String(values[generator.previousDateField] ?? "").trim();
  const previousTimeText = String(values[generator.previousTimeField] ?? "").trim();
  const missing: string[] = [];
  if (!dateText) missing.push(generator.dateField);
  if (!timeText) missing.push(generator.timeField);
  if (!instructor) missing.push(generator.instructorField);
  if (action === "reschedule") {
    if (!previousDateText) missing.push(generator.previousDateField);
    if (!previousTimeText) missing.push(generator.previousTimeField);
  }
  const instructorError = validationMessage(validateName(instructor, "Instructor name", { required: false }));
  const dateInfo = listingDateInfo(dateText, timeText);
  const previousInfo = action === "reschedule" ? listingDateInfo(previousDateText, previousTimeText) : null;
  const errors = [instructorError, dateText && timeText && !dateInfo ? "Course date or time is invalid." : undefined,
    action === "reschedule" && previousDateText && previousTimeText && !previousInfo ? "Previous date or time is invalid." : undefined]
    .filter((entry): entry is string => Boolean(entry));
  if (missing.length || errors.length || !dateInfo || (action === "reschedule" && !previousInfo)) {
    return { text: "", missing, errors };
  }
  const body = action === "cancelled"
    ? `[b][size=112][color=red]Class cancelled[/color][/size][/b]\n[b][s]${dateInfo.formatted} - ${instructor}[/s][/b]`
    : action === "reschedule"
      ? `[b][size=112][color=darkorange]Class rescheduled[/color][/size][/b]\n[b][s]${previousInfo!.formatted} - ${instructor}[/s][/b]\n[b]${dateInfo.formatted} - ${instructor}[/b]`
      : `[b]${dateInfo.formatted} - ${instructor}[/b]`;
  return { text: `[hr][/hr]\n${body}\n[img]https://www.inyourowntime.zone/${dateInfo.urlDate}_${dateInfo.hours}.${dateInfo.minutes}_UTC.png[/img]\n[hr][/hr]`, missing, errors };
}

function isFieldVisible(
  field: PaperworkField,
  values: Record<string, PaperworkFieldValue>,
  format: PaperworkFormat,
): boolean {
  if (format.generator?.kind === "course_listing" && field.key === format.generator.outputField) return false;
  return !field.visibleWhen || String(values[field.visibleWhen.field] ?? "") === field.visibleWhen.equals;
}

function listingDateInfo(dateText: string, timeText: string) {
  const date = parseDate(dateText);
  const time = timePickerValue(timeText);
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!date || !match) return null;
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hours = match[1];
  const minutes = match[2];
  const ordinal = day > 5 && day < 21 ? `${day}th` : `${day}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[day % 10] ?? "th"}`;
  const utcDate = new Date(Date.UTC(year, month, day));
  const weekday = utcDate.toLocaleString("en-GB", { weekday: "long", timeZone: "UTC" });
  const monthName = utcDate.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  return { formatted: `${weekday}, ${ordinal} ${monthName} ${year} @ ${hours}:${minutes} [ooc]UTC[/ooc]`, urlDate: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`, hours, minutes };
}

function iconFor(action: PaperworkAction) {
  if (action.kind === "copy_open") return ExternalLink;
  if (action.kind === "reset") return RotateCcw;
  if (action.kind === "insert_utc_date" || action.kind === "insert_utc_time") {
    return RotateCw;
  }
  if (action.kind === "generate_course_listing") return CalendarClock;
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
  showHeader = true,
}: {
  config: PaperworkConfig;
  /**
   * Whether typed values are kept as a draft. The Paperwork Maker previews with
   * this off: what somebody types while editing a format is not paperwork they
   * are writing, so it is never saved.
   */
  persist?: boolean;
  showHeader?: boolean;
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

  const templateValues = { ...values };
  for (const field of format?.fields ?? []) {
    if (field.type === "radio") {
      const selected = field.options?.find(
        (option) => option.value === String(values[field.key] ?? ""),
      );
      if (selected) templateValues[field.key] = selected.output ?? selected.value;
    } else {
      templateValues[field.key] = templateValueForField(field, values[field.key]);
    }
  }
  const generatedCandidate = format ? courseListingOutput(format, values) : null;
  const generatedOutput = format?.generator?.kind === "course_listing"
    ? draft[format.key]?.__generated === true
      ? generatedCandidate
      : { text: "", missing: ["__generate"], errors: [] }
    : null;

  const setValue = (fieldKey: string, value: PaperworkFieldValue) => {
    if (!format) return;
    setDraft((prev) => ({
      ...prev,
      [format.key]: {
        ...(prev[format.key] ?? {}),
        [fieldKey]: value,
        ...(format.generator?.kind === "course_listing" && fieldKey !== "__generated"
          ? { __generated: false }
          : {}),
      },
    }));
  };

  const context: PlaceholderContext = {
    values: templateValues,
    staff,
    divisionLabel: division.label,
    divisionRank: divisionRanks[division.label] || "",
  };

  const output = format
    ? generatedOutput ?? renderTemplate(format.template, context)
    : { text: "", missing: [], errors: [] };
  const subject = format?.subject
    ? renderTemplate(format.subject, context)
    : { text: "", missing: [], errors: [] };

  const errors = format
    ? format.fields
        .filter((field) => isFieldVisible(field, values, format))
        .map((field) => ({ field, message: fieldError(field, values[field.key]) }))
        .filter(
          (entry): entry is { field: PaperworkField; message: string } =>
            Boolean(entry.message),
        )
    : [];
  const complete =
    errors.length === 0 &&
    output.missing.length === 0 &&
    output.errors.length === 0 &&
    subject.missing.length === 0 &&
    subject.errors.length === 0;

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
    : output.errors[0] ??
      subject.errors[0] ??
      (output.missing.length > 0
        ? `Complete ${output.missing.map((name) => format?.fields.find((field) => field.key === name)?.label ?? name).join(", ")}.`
        : subject.missing.length > 0
          ? `The subject asks for ${subject.missing.map((name) => `{{${name}}}`).join(", ")}, which nothing provides.`
          : null);

  const disabledFor = (action: PaperworkAction): boolean => {
    if (action.kind === "reset") return false;
    if (action.kind === "generate_course_listing") return false;
    if (action.kind === "insert_utc_date" || action.kind === "insert_utc_time") {
      return false;
    }
    if (action.kind === "copy_open") return !complete || !urlFor(action);
    if (action.kind === "copy_text" && action.content) {
      const rendered = renderTemplate(action.content, context);
      if (rendered.missing.length > 0 || rendered.errors.length > 0) return true;
    }
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
    if (action.kind === "generate_course_listing") {
      if (generatedCandidate?.missing.length) {
        toast.error(`Complete ${generatedCandidate.missing.map((name) => format.fields.find((field) => field.key === name)?.label ?? name).join(", ")}.`);
        return;
      }
      if (generatedCandidate?.errors.length) {
        toast.error(generatedCandidate.errors[0]);
        return;
      }
      setValue("__generated", true);
      toast.success("Course post generated successfully.");
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
  ).filter((action) =>
    action.kind !== "generate_course_listing" &&
    !(format?.generator?.kind === "course_listing" && action.kind === "reset"),
  );

  const formActions = format?.actions.filter((action) =>
    action.kind === "generate_course_listing" ||
    (format.generator?.kind === "course_listing" && action.kind === "reset"),
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
      {showHeader && (
        <DivisionHeader
          label={division.label}
          emblem={division.emblem}
          title={page?.label ?? "Paperwork"}
          purpose={page?.purpose}
          actions={division.quickLinks?.length ? (
            <div className="flex flex-wrap gap-2">
              {division.quickLinks.map((link) => (
                <Button key={`${link.name}-${link.url}`} asChild size="sm" variant="outline">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}<ExternalLink className="ml-1.5 h-3.5 w-3.5" /></a>
                </Button>
              ))}
            </div>
          ) : undefined}
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
      )}

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
                {format.fields.filter((field) => isFieldVisible(field, values, format)).map((field) => (
                  <div
                    key={field.key}
                    className={field.width === "half" ? undefined : "sm:col-span-2"}
                  >
                    <BuilderField
                      label={field.label}
                      hint={field.hint}
                      required={field.required !== false}
                    >
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
              {formActions?.length ? (
                <div className="flex flex-wrap gap-3 pt-1">
                  {formActions.map((action) => (
                    <Button key={action.id} type="button" variant={action.kind === "reset" ? "outline" : "default"} disabled={disabledFor(action)} onClick={() => void runAction(action)}>
                      {action.label}
                    </Button>
                  ))}
                </div>
              ) : null}
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
  const [calendarOpen, setCalendarOpen] = useState(false);

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
    const options = field.options ?? [];
    return (
      <RadioGroup
        value={String(value ?? "")}
        onValueChange={onChange}
        aria-label={field.label}
        dir={options.length === 1 ? "ltr" : undefined}
        className="flex flex-wrap gap-x-5 gap-y-2"
      >
        {options.map((option) => (
          <div
            key={option.value}
            className="inline-flex items-center gap-2 whitespace-nowrap"
          >
            <RadioGroupItem
              id={`${id}-${option.value}`}
              value={option.value}
              aria-label={options.length === 1 ? field.label : undefined}
              onClick={(event) => {
                if (value === option.value) {
                  event.preventDefault();
                  onChange("");
                }
              }}
            />
            {options.length > 1 && (
              <Label
                htmlFor={`${id}-${option.value}`}
                dir="auto"
                className="cursor-pointer text-sm text-foreground"
              >
                {option.label}
              </Label>
            )}
          </div>
        ))}
      </RadioGroup>
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

  if (field.type === "reasons") {
    const reasons = String(value ?? "").split(/\r?\n/);
    const updateReason = (index: number, next: string) => {
      reasons[index] = next;
      onChange(reasons.join("\n"));
    };
    return (
      <div className="space-y-2">
        {reasons.map((reason, index) => (
          <div key={`${field.key}-${index}`} className="flex gap-2">
            <Input
              id={index === 0 ? id : `${id}-${index + 1}`}
              aria-label={`${field.label} ${index + 1}`}
              value={reason}
              maxLength={field.max}
              placeholder={field.placeholder ?? `Reason ${index + 1}`}
              onChange={(event) => updateReason(index, event.target.value)}
            />
            <Button type="button" variant="outline" size="icon" aria-label={`Remove ${field.label} ${index + 1}`} disabled={reasons.length === 1} onClick={() => onChange(reasons.filter((_, i) => i !== index).join("\n"))}>
              <span aria-hidden="true">−</span>
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" disabled={reasons.length >= PAPERWORK_REASON_LIMIT} onClick={() => onChange([...reasons, ""].join("\n"))}>Add reason</Button>
      </div>
    );
  }

  // A date or time field carries its own "now": the format does not have to
  // declare an insert action for the one thing anyone ever types there.
  const moment =
    field.showNowButton === false
      ? undefined
      : field.type === "date"
      ? { label: "Now", value: () => formatUtcDate() }
      : field.type === "time"
        ? { label: "Copy now", value: () => formatUtcTime() }
        : undefined;

  if (field.type === "date") {
    const dateValue = String(value ?? "");
    const selectedDate = parseDate(dateValue) ?? undefined;
    return (
      <div className="space-y-1">
        <Label htmlFor={id} className="sr-only">{field.label}</Label>
        <div className="flex items-center gap-1.5">
          <Input
            id={id}
            type="text"
            value={dateValue}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.placeholder ?? "02/NOV/1998"}
            className="font-mono"
          />
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button type="button" size="icon" variant="outline" aria-label={`Choose ${field.label}`} title="Choose from calendar">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                startMonth={new Date(1900, 0)}
                endMonth={new Date(2100, 11)}
                selected={selectedDate}
                defaultMonth={selectedDate ?? new Date()}
                onSelect={(date) => {
                  if (date) onChange(paperworkDateValue(date));
                  setCalendarOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          {moment && (
            <Button type="button" size="sm" variant="secondary" className="shrink-0 text-xs" title="Fill in today's date and copy it (UTC)" onClick={async () => {
              const next = moment.value();
              onChange(next);
              try {
                await navigator.clipboard.writeText(next);
                toast.success(`Copied ${next} (UTC).`);
              } catch {
                toast.success(`Filled in ${next} (UTC).`);
              }
            }}>
              {moment.label}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="sr-only">
        {field.label}
      </Label>
      <div className="flex items-center gap-1.5">
        <Input
          id={id}
          type={field.type === "number" || field.type === "time" ? field.type : "text"}
          value={field.type === "time" ? timePickerValue(String(value ?? "")) : String(value ?? "")}
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
            title="Fill in the current UTC time and copy it"
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
