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
  /** Malformed conditional blocks, which prevent a template from being copied. */
  errors: string[];
};

type TemplateNode =
  | { type: "text"; value: string }
  | {
      type: "if";
      name: string;
      truthy: TemplateNode[];
      falsy: TemplateNode[];
      valid: boolean;
    };

type ParseResult = {
  nodes: TemplateNode[];
  cursor: number;
  stop?: "else" | "close";
};

function parseTemplate(template: string): { nodes: TemplateNode[]; errors: string[] } {
  const errors: string[] = [];

  const parseSequence = (start: number): ParseResult => {
    const nodes: TemplateNode[] = [];
    let cursor = start;

    while (cursor < template.length) {
      const open = template.indexOf("{{", cursor);
      if (open < 0) {
        if (cursor < template.length) {
          nodes.push({ type: "text", value: template.slice(cursor) });
        }
        return { nodes, cursor: template.length };
      }
      const close = template.indexOf("}}", open + 2);
      if (close < 0) {
        if (/^\{\{\s*(?:#|\/)/.test(template.slice(open))) {
          errors.push("A conditional directive is missing its closing }}.");
        }
        break;
      }

      const directive = template.slice(open + 2, close).trim();
      const after = close + 2;
      if (directive === "else" || directive === "/if") {
        if (open > cursor) {
          nodes.push({ type: "text", value: template.slice(cursor, open) });
        }
        return {
          nodes,
          cursor: after,
          stop: directive === "else" ? "else" : "close",
        };
      }

      if (directive.startsWith("#if")) {
        if (open > cursor) {
          nodes.push({ type: "text", value: template.slice(cursor, open) });
        }
        const match = /^#if\s+([a-zA-Z0-9_.]+)$/.exec(directive);
        if (!match) {
          errors.push("An if block needs a placeholder name, for example {{#if staff.director}}.");
          cursor = after;
          continue;
        }

        const truthy = parseSequence(after);
        let falsy: TemplateNode[] = [];
        let end = truthy.cursor;
        let valid = truthy.stop === "close";
        if (truthy.stop === "else") {
          const alternative = parseSequence(truthy.cursor);
          falsy = alternative.nodes;
          end = alternative.cursor;
          valid = alternative.stop === "close";
          if (!valid) {
            errors.push(`The if block for “${match[1]}” is missing {{/if}}.`);
          }
        } else if (!valid) {
          errors.push(`The if block for “${match[1]}” is missing {{/if}}.`);
        }
        nodes.push({
          type: "if",
          name: match[1],
          truthy: truthy.nodes,
          falsy,
          valid,
        });
        cursor = end;
        continue;
      }

      if (directive.startsWith("#") || directive.startsWith("/")) {
        errors.push(`Unknown template directive {{${directive}}}.`);
        if (open > cursor) {
          nodes.push({ type: "text", value: template.slice(cursor, open) });
        }
        cursor = after;
        continue;
      }
      if (directive.startsWith("else")) {
        errors.push(`Unknown template directive {{${directive}}}.`);
        if (open > cursor) {
          nodes.push({ type: "text", value: template.slice(cursor, open) });
        }
        cursor = after;
        continue;
      }
      if (open > cursor) {
        nodes.push({ type: "text", value: template.slice(cursor, open) });
      }
      nodes.push({ type: "text", value: template.slice(open, after) });
      cursor = after;
    }

    if (cursor < template.length) {
      nodes.push({ type: "text", value: template.slice(cursor) });
    }
    return { nodes, cursor: template.length };
  };

  const parsed = parseSequence(0);
  if (parsed.stop === "else") errors.push("{{else}} has no matching if block.");
  if (parsed.stop === "close") errors.push("{{/if}} has no matching if block.");
  return { nodes: parsed.nodes, errors: [...new Set(errors)] };
}

/** Conditional-template syntax errors, used by the Maker before a format saves. */
export function templateControlErrors(template: string): string[] {
  return parseTemplate(template).errors;
}

function conditionIsTrue(name: string, context: PlaceholderContext): boolean {
  const builtin = readBuiltin(name, context);
  const value =
    builtin !== null
      ? builtin
      : Object.prototype.hasOwnProperty.call(context.values, name)
        ? context.values[name]
        : undefined;
  if (typeof value === "boolean") return value;
  return typeof value === "string" && value.trim().length > 0;
}

function renderNodes(
  nodes: TemplateNode[],
  context: PlaceholderContext,
  missing: string[],
): string {
  return nodes
    .map((node) => {
      if (node.type === "if") {
        if (!node.valid) return "";
        return renderNodes(
          conditionIsTrue(node.name, context) ? node.truthy : node.falsy,
          context,
          missing,
        );
      }
      return node.value.replace(
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
    })
    .join("");
}

export function renderTemplate(
  template: string,
  context: PlaceholderContext,
): RenderedTemplate {
  const missing: string[] = [];
  const parsed = parseTemplate(template);
  return {
    text: renderNodes(parsed.nodes, context, missing),
    missing,
    errors: parsed.errors,
  };
}

/**
 * A URL template rendered the same way, or null when it is not yet a link -
 * a Copy & Open button with no page to open is disabled, not guessed at.
 */
export function renderUrlTemplate(
  template: string,
  context: PlaceholderContext,
): string | null {
  const { text, missing, errors } = renderTemplate(template, context);
  const trimmed = text.trim();
  if (missing.length > 0 || errors.length > 0 || !trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:"
      ? trimmed
      : null;
  } catch {
    return null;
  }
}
