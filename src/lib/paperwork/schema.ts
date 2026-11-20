/**
 * The data model a division's paperwork is written in.
 *
 * It is deliberately data and not code: a generated format is a template string
 * plus the fields it names, so nothing a member types in the Paperwork Maker can
 * ever become JavaScript that a deployment executes.
 */

export const PAPERWORK_CONFIG_VERSION = 1;

export type PaperworkFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "time"
  | "url"
  | "select"
  | "radio"
  | "checkbox"
  /** A value the Staff Page already holds - name, rank or signature image. */
  | "staff";

export type PaperworkFieldOption = {
  value: string;
  label: string;
};

export type PaperworkField = {
  /** The placeholder name: `{{key}}`, and the draft's storage key. */
  key: string;
  type: PaperworkFieldType;
  label: string;
  hint?: string;
  placeholder?: string;
  defaultValue?: string | boolean;
  required?: boolean;
  /** Required for `select` and `radio`. */
  options?: PaperworkFieldOption[];
  width?: "full" | "half";
  /** Character limit; defaults to `INPUT_LIMITS.text` in the registry. */
  max?: number;
  /** For `staff` fields - which Staff Page value seeds it. */
  source?: "name" | "rank" | "signature" | "director";
};

export type PaperworkActionKind =
  /** The format's rendered template. */
  | "copy_template"
  /** The format's rendered subject line. */
  | "copy_subject"
  /** `content`, rendered as a template. */
  | "copy_text"
  /**
   * `content`, rendered as a URL, copied and opened with the post handed over.
   * The page is either the format's own (`https://…`) or one the member pastes
   * into an input (`{{govLink}}`).
   */
  | "copy_open"
  /** Fills `target` with today's UTC date. */
  | "insert_utc_date"
  /** Fills `target` with the current UTC time. */
  | "insert_utc_time"
  | "reset";

export type PaperworkAction = {
  id: string;
  kind: PaperworkActionKind;
  label: string;
  /** A template or a URL template, depending on `kind`. */
  content?: string;
  /** The field an insert action writes to. */
  target?: string;
  /** Copy buttons stay disabled until the field named here is filled in. */
  requiresField?: string;
  variant?: "primary" | "outline";
};

export type PaperworkFormat = {
  key: string;
  label: string;
  /** One plain line: when to write this. */
  hint: string;
  subject?: string;
  template: string;
  fields: PaperworkField[];
  actions: PaperworkAction[];
};

export type PaperworkGroup = {
  label: string;
  hint?: string;
  formats: PaperworkFormat[];
};

/** A tab in the division's workspace. One page renders no tab row at all. */
export type PaperworkPage = {
  key: string;
  label: string;
  purpose: string;
  groups: PaperworkGroup[];
};

export type PaperworkDivisionRole = {
  /** The alias used in `ROLES` and `DIVISIONS`. */
  alias: string;
  /** The Discord snowflake, or null when the guild has no such role yet. */
  id?: string | null;
  name: string;
};

export type PaperworkDivision = {
  /** The `DIVISIONS` key, camelCase. */
  key: string;
  label: string;
  /** One sentence for the division page header. */
  description: string;
  emblem?: string;
  /** The sidebar icon, by name in `DIVISION_ICONS`; absent means the file icon. */
  icon?: string;
  imageSize?: string;
  image?: string;
  membership?: PaperworkDivisionRole;
  ranks?: PaperworkDivisionRole[];
  quickLinks?: { name: string; url: string }[];
  pages: PaperworkPage[];
};

export type PaperworkConfig = {
  version: number;
  division: PaperworkDivision;
};

/**
 * A division with nothing written yet - what the maker opens on.
 *
 * There is deliberately no sample division: a new division starts from its own
 * name and formats, not from an example somebody has to delete first.
 */
export function createEmptyPaperworkConfig(): PaperworkConfig {
  return {
    version: PAPERWORK_CONFIG_VERSION,
    division: { key: "", label: "", description: "", pages: [] },
  };
}

/** The URL segment a division's key becomes: `fieldTraining` -> `field-training`. */
export function divisionSlug(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

export function divisionRoute(key: string): string {
  return `/divisions/${divisionSlug(key)}`;
}

export function allFormats(config: PaperworkConfig): PaperworkFormat[] {
  return config.division.pages.flatMap((page) =>
    page.groups.flatMap((group) => group.formats),
  );
}

const KEY_PATTERN = /^[a-z][a-zA-Z0-9]*$/;
// camelCase is allowed on purpose: a template people already write says
// `{{patientName}}`, and a key the field validator refuses is one the template
// can never be satisfied by.
const FIELD_KEY_PATTERN = /^[a-z][a-zA-Z0-9_]*$/;
const ACTION_ID_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

export type PaperworkValidation =
  | { ok: true; problems: [] }
  | { ok: false; problems: string[] };

/**
 * Everything a config must say before it can be saved or generated. Problems are
 * messages a member reads, not booleans: a refusal that cannot name the field is
 * indistinguishable from a broken builder.
 */
export function validatePaperworkConfig(
  config: PaperworkConfig,
): PaperworkValidation {
  const problems: string[] = [];
  const division = config.division;

  if (!division || typeof division !== "object") {
    return { ok: false, problems: ["The config names no division."] };
  }
  if (!KEY_PATTERN.test(division.key ?? "")) {
    problems.push(
      `Division key “${division.key ?? ""}” must be camelCase, starting with a letter.`,
    );
  }
  if (!division.label?.trim()) problems.push("The division needs a name.");
  if (!division.description?.trim()) {
    problems.push("The division needs a description for its page header.");
  }
  // Only the shape is checked here: the names live in the icon module, which is
  // a component file this engine must not pull into an API route.
  if (division.icon && !/^[A-Z][a-zA-Z0-9]*$/.test(division.icon)) {
    problems.push(
      `Sidebar icon “${division.icon}” must be an icon name such as FileText.`,
    );
  }
  if (!Array.isArray(division.pages) || division.pages.length === 0) {
    problems.push("The division needs at least one paperwork page.");
  }

  const pageKeys = new Set<string>();
  const formatKeys = new Set<string>();

  for (const page of division.pages ?? []) {
    if (!page.key?.trim()) problems.push("A page is missing its key.");
    if (pageKeys.has(page.key)) {
      problems.push(`Page key “${page.key}” is used twice.`);
    }
    pageKeys.add(page.key);
    if (!page.label?.trim()) problems.push(`Page “${page.key}” needs a name.`);
    if (!page.purpose?.trim()) {
      problems.push(`Page “${page.key}” needs one sentence saying what it is for.`);
    }
    // A page is one message, not one per empty group: an empty group is how a
    // page starts, and nagging about it before anything else is written says
    // nothing the page-level line does not already say.
    const groups = page.groups ?? [];
    const pageHasFormats = groups.some((group) => group.formats?.length > 0);
    if (!pageHasFormats) {
      problems.push(`Page “${page.key}” has no formats yet.`);
    }

    for (const group of groups) {
      if (!group.label?.trim()) {
        problems.push(`A group on “${page.key}” is missing its heading.`);
      }
      if (!group.formats?.length && pageHasFormats) {
        problems.push(`Group “${group.label}” has no formats.`);
      }

      for (const format of group.formats ?? []) {
        const where = `Format “${format.label || format.key}”`;
        if (!format.key?.trim()) problems.push(`${where} is missing its key.`);
        if (formatKeys.has(format.key)) {
          problems.push(`Format key “${format.key}” is used twice.`);
        }
        formatKeys.add(format.key);
        if (!format.label?.trim()) problems.push(`${where} needs a name.`);
        if (!format.hint?.trim()) {
          problems.push(`${where} needs one line saying when to use it.`);
        }
        if (!format.template?.trim()) problems.push(`${where} has no template.`);

        const fieldKeys = new Set<string>();
        for (const field of format.fields ?? []) {
          if (!FIELD_KEY_PATTERN.test(field.key ?? "")) {
            problems.push(
              `${where}: field key “${field.key ?? ""}” must start with a lowercase letter and use only letters, digits or underscores.`,
            );
          }
          if (fieldKeys.has(field.key)) {
            problems.push(`${where}: field “${field.key}” is declared twice.`);
          }
          fieldKeys.add(field.key);
          if (!field.label?.trim()) {
            problems.push(`${where}: field “${field.key}” needs a label.`);
          }
          if (field.type === "staff" && !field.source) {
            problems.push(
              `${where}: staff field “${field.key}” must name a Staff Page value.`,
            );
          }
          if (
            (field.type === "select" || field.type === "radio") &&
            !field.options?.length
          ) {
            problems.push(
              `${where}: “${field.label}” is a ${field.type} with no options.`,
            );
          }
        }

        const placeholders = templatePlaceholders(format.template);
        const known = new Set([
          ...fieldKeys,
          ...BUILTIN_PLACEHOLDERS,
        ]);
        for (const name of placeholders) {
          if (!known.has(name)) {
            problems.push(
              `${where}: the template uses {{${name}}}, but no field or built-in provides it.`,
            );
          }
        }

        const actionIds = new Set<string>();
        for (const action of format.actions ?? []) {
          if (!ACTION_ID_PATTERN.test(action.id ?? "")) {
            problems.push(`${where}: action id “${action.id}” must be camelCase.`);
          }
          if (actionIds.has(action.id)) {
            problems.push(`${where}: action “${action.id}” is declared twice.`);
          }
          actionIds.add(action.id);
          if (!action.label?.trim()) {
            problems.push(`${where}: an action is missing its label.`);
          }
          if (
            (action.kind === "insert_utc_date" ||
              action.kind === "insert_utc_time") &&
            (!action.target || !fieldKeys.has(action.target))
          ) {
            problems.push(
              `${where}: “${action.label}” must target a field that exists.`,
            );
          }
          if (action.kind === "copy_text" && !action.content?.trim()) {
            problems.push(`${where}: “${action.label}” has nothing to copy.`);
          }
          if (action.kind === "copy_open") {
            const content = action.content?.trim() ?? "";
            const field = copyOpenField(content);
            if (!content) {
              problems.push(`${where}: “${action.label}” has no page to open.`);
            } else if (field) {
              // The member supplies the link, so the input has to exist - a
              // button bound to nothing is one that can never be pressed.
              if (!fieldKeys.has(field)) {
                problems.push(
                  `${where}: “${action.label}” opens {{${field}}}, but no input provides it.`,
                );
              }
            } else if (!/^https?:\/\//i.test(content)) {
              problems.push(
                `${where}: “${action.label}” must open a URL or the input holding one.`,
              );
            }
          }
          if (action.requiresField && !fieldKeys.has(action.requiresField)) {
            problems.push(
              `${where}: “${action.label}” waits on “${action.requiresField}”, which is not a field.`,
            );
          }
          if (action.kind === "copy_text" && action.content) {
            for (const name of templatePlaceholders(action.content)) {
              if (!known.has(name)) {
                problems.push(
                  `${where}: “${action.label}” copies {{${name}}}, which nothing provides.`,
                );
              }
            }
          }
        }

        if (!format.actions?.length) {
          problems.push(`${where} has no buttons, so it cannot be copied.`);
        }
      }
    }
  }

  return problems.length === 0
    ? { ok: true, problems: [] }
    : { ok: false, problems };
}

/**
 * The input a Copy & Open button opens, when the member supplies the link.
 *
 * Copy & Open has two ways to name its page: a URL the format declares, and
 * `{{govLink}}` - a link the member pastes, which is only a button at all if
 * that input exists beside it.
 */
export function copyOpenField(content: string | undefined): string | null {
  const text = content?.trim() ?? "";
  if (!/^\{\{\s*[a-zA-Z0-9_.]+\s*\}\}$/.test(text)) return null;
  return text.replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
}

/** Placeholder names in a template, deduped, in first-seen order. */
export function templatePlaceholders(template: string): string[] {
  const names: string[] = [];
  for (const match of template.matchAll(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g)) {
    if (!names.includes(match[1])) names.push(match[1]);
  }
  return names;
}

/** Values the engine resolves without a field of their own. */
export const BUILTIN_PLACEHOLDERS: readonly string[] = [
  "staff.name",
  "staff.rank",
  "staff.signature",
  "staff.director",
  "utc.date",
  "utc.time",
  "division.label",
];
