/**
 * The field registry: the one place a field type's default, validation and
 * layout exist. A builder never writes a validator of its own, and the Paperwork
 * Maker only offers what is registered here.
 */

import {
  INPUT_LIMITS,
  validateDateString,
  validateInteger,
  validateName,
  validateText,
  validateTimeString,
  validateUrl,
  validationMessage,
} from "@/lib/validation";
import type { PaperworkField, PaperworkFieldType } from "./schema";

export type PaperworkFieldValue = string | boolean;
export const PAPERWORK_REASON_LIMIT = 20;

export type FieldTypeDefinition = {
  type: PaperworkFieldType;
  label: string;
  /** One line for the maker's picker: what this type is for. */
  description: string;
  defaultMax: number;
};

export const FIELD_TYPES: readonly FieldTypeDefinition[] = [
  { type: "text", label: "Text", description: "A single line of text.", defaultMax: INPUT_LIMITS.text },
  { type: "textarea", label: "Textarea", description: "Several lines of text.", defaultMax: INPUT_LIMITS.notes },
  { type: "number", label: "Number", description: "A whole number.", defaultMax: INPUT_LIMITS.short },
  { type: "date", label: "Date", description: "A DD/MMM/YYYY date.", defaultMax: INPUT_LIMITS.short },
  { type: "time", label: "Time", description: "A 24-hour or AM/PM time.", defaultMax: INPUT_LIMITS.short },
  { type: "url", label: "URL", description: "A link, with a Copy & Open target.", defaultMax: INPUT_LIMITS.url },
  { type: "select", label: "Select", description: "One option from a dropdown.", defaultMax: INPUT_LIMITS.short },
  { type: "radio", label: "Radio", description: "One option, shown as a row of choices.", defaultMax: INPUT_LIMITS.short },
  { type: "checkbox", label: "Checkbox", description: "Yes when ticked, No when not.", defaultMax: INPUT_LIMITS.short },
  { type: "reasons", label: "Reasons", description: "Several text inputs rendered as one BBCode list.", defaultMax: INPUT_LIMITS.notes },
  { type: "staff", label: "Staff page value", description: "Name, rank or signature from the Staff Page.", defaultMax: INPUT_LIMITS.url },
];

export function defaultValueFor(field: PaperworkField): PaperworkFieldValue {
  if (field.type === "checkbox") return field.defaultValue === true;
  return typeof field.defaultValue === "string" ? field.defaultValue : "";
}

export function defaultValueForField(
  field: PaperworkField,
  staff: { name: string; rank: string; signature: string; director: string },
): PaperworkFieldValue {
  if (field.type !== "staff") return defaultValueFor(field);
  if (field.source === "name") return staff.name;
  if (field.source === "rank") return staff.rank;
  if (field.source === "signature") return staff.signature;
  if (field.source === "director") return staff.director;
  return "";
}

/** The message for an invalid field, or `undefined` when it is fine. */
export function fieldError(
  field: PaperworkField,
  value: PaperworkFieldValue,
): string | undefined {
  const required = field.required !== false;
  const max = field.max ?? maxFor(field.type);

  switch (field.type) {
    case "checkbox":
      return undefined;
    case "reasons": {
      const reasons = String(value ?? "").split(/\r?\n/).map((reason) => reason.trim()).filter(Boolean);
      if (required && reasons.length === 0) return `${field.label} needs at least one reason.`;
      if (reasons.length > PAPERWORK_REASON_LIMIT) return `${field.label} can have at most ${PAPERWORK_REASON_LIMIT} reasons.`;
      for (const [index, reason] of reasons.entries()) {
        const error = validationMessage(validateText(reason, `${field.label} ${index + 1}`, { required: true, max, allowMarkup: false }));
        if (error) return error;
      }
      return undefined;
    }
    case "number": {
      if (required && String(value).trim() === "") return `${field.label} is required.`;
      if (!required && String(value).trim() === "") return undefined;
      return validationMessage(
        validateInteger(value, field.label, { min: 0, max: 1_000_000 }),
      );
    }
    case "date":
      return validationMessage(
        validateDateString(value, field.label, { required, minYear: 1900 }),
      );
    case "time":
      return validationMessage(
        validateTimeString(value, field.label, { required }),
      );
    case "url":
      return validationMessage(validateUrl(value, field.label, { required }));
    case "select":
    case "radio": {
      const text = String(value ?? "").trim();
      if (!text) return required ? `${field.label} is required.` : undefined;
      const allowed = (field.options ?? []).some((option) => option.value === text);
      return allowed ? undefined : `${field.label} must be one of its options.`;
    }
    case "staff": {
      if (field.source === "signature") {
        return validationMessage(validateUrl(value, field.label, { required }));
      }
      return validationMessage(
        validateName(value, field.label, { required, max }),
      );
    }
    case "textarea":
      return validationMessage(
        validateText(value, field.label, { required, max, multiline: true }),
      );
    case "text":
    default:
      return validationMessage(
        validateText(value, field.label, {
          required,
          max,
          allowMarkup: false,
        }),
      );
  }
}

/** Each entered reason becomes a BBCode list item inside the template's list. */
export function templateValueForField(field: PaperworkField, value: PaperworkFieldValue): PaperworkFieldValue {
  if (field.type !== "reasons") return value;
  return String(value ?? "").split(/\r?\n/).map((reason) => reason.trim()).filter(Boolean).map((reason) => `[*] ${reason}`).join("\n");
}

export function maxFor(type: PaperworkFieldType): number {
  return FIELD_TYPES.find((entry) => entry.type === type)?.defaultMax ?? INPUT_LIMITS.text;
}

/** Keeps a stored draft to the keys this format actually has. */
export function pruneValues(
  format: { fields: PaperworkField[] },
  values: Record<string, PaperworkFieldValue>,
  staff: { name: string; rank: string; signature: string; director: string },
): Record<string, PaperworkFieldValue> {
  const next: Record<string, PaperworkFieldValue> = {};
  for (const field of format.fields) {
    const value = values[field.key];
    next[field.key] =
      value === undefined ? defaultValueForField(field, staff) : value;
  }
  return next;
}
