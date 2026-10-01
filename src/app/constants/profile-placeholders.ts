/**
 * The blanks a profile carries, and the spellings a template may use for one.
 *
 * One declaration, because two things read it and they have to agree: the copy
 * flow, which replaces these with the name typed into the Applicant Info card,
 * and the handbook, which refuses to let a section file lose its name line.
 *
 * The primary, canonical token is `{{applicantName}}`. The older implicit tokens
 * (`FName LName` / `Fname Lname` / `First Last`) are still recognised - they are
 * what the live profile post has always said - so a pasted profile carrying one
 * is a name the app can fill, not a placeholder that was lost. They are listed
 * after the canonical token on purpose.
 *
 * `Lastname` alone is deliberately excluded: it appears inside radio-call
 * teaching examples ("EMR Lastname is requesting...") that describe a universal
 * radio format rather than a specific individual.
 */
export const NAME_SPELLINGS = [
  "{{applicantName}}",
  "FName LName",
  "Fname Lname",
  "Fname lname",
  "First Last",
] as const;

/** The canonical name token, as a section's `mustKeep` would write it. */
export const NAME_TOKEN = "{{applicantName}}";

/**
 * Every spelling that counts as `token`: the token itself, or a legacy
 * equivalent the app fills the same way.
 */
export function placeholderSpellings(token: string): readonly string[] {
  return token === NAME_TOKEN ? NAME_SPELLINGS : [token];
}

/**
 * The blanks the formats leave for whoever is reading them to type into.
 *
 * `[Callsign]`, `[Lastname]`, `[Location]` and a bare `[text]` are what the
 * profile is teaching with, not markup - so the renderer shows them as written
 * rather than trying to draw them. Declaring them is what lets the renderer,
 * and the check that holds it against the handbook, tell a blank from a tag the
 * app has not learned: a bracket token nobody claimed is markup it should be
 * drawing, and `npm run handbook:check` fails until it does.
 */
export const FILL_IN_MARKERS = [
  "call",
  "callsign",
  "lastname",
  "location",
  "name",
  "status",
  "text",
] as const;

/** Whether a bracketed token is one of the formats' blanks rather than a tag. */
export function isFillInMarker(token: string): boolean {
  return (FILL_IN_MARKERS as readonly string[]).includes(token.toLowerCase());
}

/**
 * Whether `content` still carries `token` in any spelling the app fills in.
 *
 * A section cannot lose its placeholders, but a member's own profile says
 * `Fname Lname` where the app's file says `{{applicantName}}` - the same line,
 * filled the same way - so a check that only knew the canonical spelling refused
 * the very paste an update exists for.
 */
export function carriesPlaceholder(content: string, token: string): boolean {
  return placeholderSpellings(token).some((spelling) =>
    content.includes(spelling),
  );
}
