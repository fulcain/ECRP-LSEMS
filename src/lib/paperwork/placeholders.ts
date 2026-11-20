/**
 * The placeholder engine: one pure answer to "what does this template say?".
 *
 * A template is text with `{{name}}` placeholders. Rendering never guesses: a
 * name nothing provides is reported, so a copy button can refuse instead of
 * posting `{{field_key}}` to the forum. Formatting is otherwise preserved
 * byte for byte - spacing, blank lines and every BBCode tag are the member's.
 */

export type PaperworkValue = string | boolean;

export type PlaceholderContext = {
  /** The form's values, keyed by field. */
  values: Record<string, PaperworkValue>;
  /** `director` is the title the member holds where it covers this division. */
  staff: { name: string; rank: string; signature: string; director: string };
  divisionLabel: string;
  /** The member's rank in this division, empty when the Staff Page has none. */
  divisionRank: string;
  /** Injected so the engine is pure and a preview can pin "now". */
  now?: Date;
};

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/** `19/AUG/2026` - the format every paperwork field in the app uses. */
export function formatUtcDate(now: Date = new Date()): string {
  return `${String(now.getUTCDate()).padStart(2, "0")}/${
    MONTHS[now.getUTCMonth()]
  }/${now.getUTCFullYear()}`;
}

/** `14:05` - 24-hour UTC, matching `getCurrentUTCTime`. */
export function formatUtcTime(now: Date = new Date()): string {
  return `${String(now.getUTCHours()).padStart(2, "0")}:${String(
    now.getUTCMinutes(),
  ).padStart(2, "0")}`;
}

function readBuiltin(name: string, context: PlaceholderContext): string | null {
  switch (name) {
    case "staff.name":
      return context.staff.name;
    case "staff.rank":
      return context.staff.rank;
    case "staff.signature":
      return context.staff.signature;
    case "staff.director":
      return context.staff.director;
    case "utc.date":
      return formatUtcDate(context.now);
    case "utc.time":
      return formatUtcTime(context.now);
    case "division.label":
      return context.divisionLabel;
    case "division.rank":
      return context.divisionRank;
    default:
      return null;
  }
}

function stringify(value: PaperworkValue | undefined): string {
  if (value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value;
}

export type RenderedTemplate = {
  text: string;
  /** Names the template asked for that nothing provides. */
  missing: string[];
};

export function renderTemplate(
  template: string,
  context: PlaceholderContext,
): RenderedTemplate {
  const missing: string[] = [];
  const text = template.replace(
    /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g,
    (_match, name: string) => {
      const builtin = readBuiltin(name, context);
      if (builtin !== null) return builtin;
      if (Object.prototype.hasOwnProperty.call(context.values, name)) {
        return stringify(context.values[name]);
      }
      if (!missing.includes(name)) missing.push(name);
      return "";
    },
  );
  return { text, missing };
}

/**
 * A URL template rendered the same way, or null when it is not yet a link -
 * a Copy & Open button with no page to open is disabled, not guessed at.
 */
export function renderUrlTemplate(
  template: string,
  context: PlaceholderContext,
): string | null {
  const { text, missing } = renderTemplate(template, context);
  const trimmed = text.trim();
  if (missing.length > 0 || !trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:"
      ? trimmed
      : null;
  } catch {
    return null;
  }
}
