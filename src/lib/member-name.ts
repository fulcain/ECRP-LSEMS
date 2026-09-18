/**
 * How a Discord name becomes a name the app shows or prints.
 *
 * Its own module, and not part of the identity resolution, because the sidebar
 * uses it on every page: importing the role/division registry just to render a
 * nickname would drag it into the shared bundle.
 */

/** The bits of a Discord profile a name can be read from. */
export type DiscordNameSource = {
  nick?: string | null;
  globalName?: string | null;
  username?: string | null;
};

/**
 * The name to show for a member: their Discord nickname, then their global
 * name, then the account name.
 *
 * One precedence, cleaned the same way everywhere, so the name in the sidebar
 * and the name on a generated document can't disagree.
 */
export function memberDisplayName(
  user: DiscordNameSource | null | undefined,
): string | null {
  if (!user) return null;
  const raw = user.nick ?? user.globalName ?? user.username;
  return raw ? cleanMemberName(raw) : null;
}

/**
 * A member's name with the decoration removed.
 *
 * Discord nicknames routinely carry a nickname or callsign in quotes - the
 * name itself is what belongs on a screen or a document, so a quoted run is
 * dropped along with the quotes around it. A quote inside a word is left
 * alone: O'Brien and D'Angelo are names, not nicknames.
 */
export function cleanMemberName(raw: string): string {
  const name = raw.trim();

  // A name that is quoted as a whole is just the name - unwrapped before the
  // rules below, which would otherwise delete its contents as a nickname.
  const wholeQuoted = name.match(/^(["“”'‘’])([\s\S]*)\1$/);
  if (wholeQuoted) return collapseSpaces(wholeQuoted[2]);

  return collapseSpaces(
    name
      // "Dima" and “Dima”
      .replace(/["“”][^"“”]*["“”]/g, " ")
      // 'Dima', but only standing as its own word
      .replace(/\s['‘’][^'‘’]+['‘’](?=\s|$)/g, " ")
      // Any double quote left has no partner: it is decoration.
      .replace(/["“”]/g, ""),
  );
}

function collapseSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
