/**
 * The one place user input is judged.
 *
 * A value is validated where it enters the app - a server route before it
 * reaches Apps Script or a store, a form before it generates a document - so
 * the same rule answers the same question everywhere. These functions are pure
 * and return a message meant to be shown to the member, not a boolean: a
 * refusal that cannot say what is wrong is indistinguishable from a broken
 * field.
 */

import { parseDate } from "@/lib/format-date";

export const INPUT_LIMITS = {
  /** Forum names, roster names and rank lines. */
  name: 64,
  /** Callsigns, rank abbreviations and other short labels. */
  short: 32,
  /** Free text that ends up in a sheet cell or a document line. */
  text: 500,
  /** Pasted notes and descriptions. */
  notes: 2000,
  /** Pasted URLs, including very long image/forum links. */
  url: 500,
} as const;

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string };

const VALID: ValidationResult = { ok: true };

function fail(error: string): ValidationResult {
  return { ok: false, error };
}

/** Anything that is not a string is treated as empty input. */
export function inputText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function isBlank(value: unknown): boolean {
  return inputText(value).trim() === "";
}

/** Control characters, excluding tab and newline where they are allowed. */
function hasControlCharacters(value: string, multiline: boolean): boolean {
  const pattern = multiline
    ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/
    : /[\u0000-\u001F\u007F]/;
  return pattern.test(value);
}

/** The characters that could change how text is read in a BBCode post. */
function hasMarkupCharacters(value: string): boolean {
  return /[<>\[\]]/.test(value);
}

export function combineValidation(
  ...results: ValidationResult[]
): ValidationResult {
  const invalid = results.find((result) => !result.ok);
  return invalid ?? VALID;
}

/**
 * A person's name or a roster-style label.
 *
 * It must contain a letter, cannot be only punctuation, and cannot carry the
 * characters that would break out of a BBCode post. Apostrophes, hyphens,
 * periods and ampersands are ordinary in RP names and ranks.
 */
export function validateName(
  value: unknown,
  label = "Name",
  options: { required?: boolean; max?: number } = {},
): ValidationResult {
  const { required = true, max = INPUT_LIMITS.name } = options;
  const trimmed = inputText(value).trim();

  if (!trimmed) {
    return required ? fail(`${label} is required.`) : VALID;
  }
  if (trimmed.length > max) {
    return fail(`${label} must be ${max} characters or fewer.`);
  }
  if (hasControlCharacters(trimmed, false)) {
    return fail(`${label} contains characters that are not allowed.`);
  }
  if (hasMarkupCharacters(trimmed)) {
    return fail(`${label} cannot contain <, >, [ or ].`);
  }
  if (!/\p{L}/u.test(trimmed)) {
    return fail(`${label} must include at least one letter.`);
  }
  return VALID;
}

export function validateText(
  value: unknown,
  label: string,
  options: {
    required?: boolean;
    max?: number;
    multiline?: boolean;
    allowMarkup?: boolean;
  } = {},
): ValidationResult {
  const {
    required = true,
    max = INPUT_LIMITS.text,
    multiline = false,
    allowMarkup = false,
  } = options;
  const raw = inputText(value);
  const trimmed = raw.trim();

  if (!trimmed) {
    return required ? fail(`${label} is required.`) : VALID;
  }
  if (trimmed.length > max) {
    return fail(`${label} must be ${max} characters or fewer.`);
  }
  if (hasControlCharacters(raw, multiline)) {
    return fail(`${label} contains characters that are not allowed.`);
  }
  if (!multiline && /[\r\n]/.test(raw)) {
    return fail(`${label} must be a single line.`);
  }
  if (!allowMarkup && hasMarkupCharacters(raw)) {
    return fail(`${label} cannot contain <, >, [ or ].`);
  }
  return VALID;
}

export function validateUrl(
  value: unknown,
  label = "Link",
  options: { required?: boolean } = {},
): ValidationResult {
  const { required = true } = options;
  const trimmed = inputText(value).trim();

  if (!trimmed) {
    return required ? fail(`${label} is required.`) : VALID;
  }
  if (trimmed.length > INPUT_LIMITS.url) {
    return fail(`${label} must be ${INPUT_LIMITS.url} characters or fewer.`);
  }
  if (/\s/.test(trimmed)) {
    return fail(`${label} must be a single URL with no spaces.`);
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return fail(`${label} must be a full URL starting with https://.`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return fail(`${label} must start with http:// or https://.`);
  }
  return VALID;
}

/**
 * A date the app can read, in any of the shapes the date helpers accept.
 * A year outside the app's lifetime is a typo rather than a date.
 */
export function validateDateString(
  value: unknown,
  label = "Date",
  options: { required?: boolean } = {},
): ValidationResult {
  const { required = true } = options;
  const trimmed = inputText(value).trim();

  if (!trimmed) {
    return required ? fail(`${label} is required.`) : VALID;
  }
  if (trimmed.length > INPUT_LIMITS.short) {
    return fail(`${label} is not a valid date.`);
  }

  const parsed = parseDate(trimmed);
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return fail(`${label} must be a real date (for example DD/MMM/YYYY).`);
  }
  if (parsed.getFullYear() < 2000 || parsed.getFullYear() > 2100) {
    return fail(`${label} must be a date between 2000 and 2100.`);
  }
  return VALID;
}

/**
 * A 24-hour or 12-hour clock time. The session card types `HH:MM` and the sheet
 * stores `h:mm:ss AM/PM`, so both spellings are read as the same input.
 */
export function validateTimeString(
  value: unknown,
  label = "Time",
  options: { required?: boolean } = {},
): ValidationResult {
  const { required = true } = options;
  const trimmed = inputText(value).trim();

  if (!trimmed) {
    return required ? fail(`${label} is required.`) : VALID;
  }
  const match = trimmed.match(
    /^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\s*(AM|PM)?$/i,
  );
  if (!match) {
    return fail(`${label} must be a real time, for example 14:30.`);
  }

  const hour = Number(match[1]);
  const meridiem = match[4]?.toUpperCase();
  if (meridiem && (hour < 1 || hour > 12)) {
    return fail(`${label} must use an hour between 1 and 12 with AM/PM.`);
  }
  return VALID;
}

/** A whole number, given as a number or a numeric string. */
export function validateInteger(
  value: unknown,
  label: string,
  options: { min?: number; max?: number } = {},
): ValidationResult {
  const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } =
    options;
  const number =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value.trim())
        : Number.NaN;

  if (!Number.isFinite(number) || !Number.isInteger(number)) {
    return fail(`${label} must be a whole number.`);
  }
  if (number < min || number > max) {
    return fail(`${label} must be between ${min} and ${max}.`);
  }
  return VALID;
}

/** A 1-based sheet row. Row 1 is the header and is never an editable row. */
export function validateRowNumber(value: unknown): ValidationResult {
  return validateInteger(value, "Sheet row", { min: 2, max: 1_000_000 });
}

/** `undefined` means "not supplied"; anything else must be a boolean. */
export function validateOptionalBoolean(
  value: unknown,
  label: string,
): ValidationResult {
  if (value === undefined || value === null) return VALID;
  if (typeof value === "boolean") return VALID;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "false") return VALID;
  }
  return fail(`${label} must be true or false.`);
}

/** The message from an invalid result, or `undefined` when it is valid. */
export function validationMessage(result: ValidationResult): string | undefined {
  return result.ok ? undefined : result.error;
}
