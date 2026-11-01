/**
 * Search for the Quick Links page.
 *
 * Pure and React-free so the ranking can be reasoned about on its own. The
 * page used to carry two separate filters - one at the top and another inside
 * every division - with slightly different matching, which is how "no links
 * found" could appear in a division whose links the top search had just found.
 */

export type QuickLinkEntry = {
  /** Stable across sessions: it is what pinning and recents are stored as. */
  id: string;
  name: string;
  url: string;
};

export type QuickLinkGroup = {
  label: string;
  image: string;
  description: string;
  links: QuickLinkEntry[];
};

export type QuickLinkHit = {
  entry: QuickLinkEntry;
  group: QuickLinkGroup;
  /** True when the group itself matched, so every link in it is a hit. */
  groupMatch: boolean;
  score: number;
};

export function linkId(groupLabel: string, url: string): string {
  return `${groupLabel}::${url}`;
}

/** Lower-cased, punctuation collapsed - so "f-r" and "F&R" compare equal. */
export function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function termsOf(query: string): string[] {
  return normalize(query).split(" ").filter(Boolean);
}

/** Acronyms people actually type: "Field Training" -> ft, "... Division" -> ftd. */
export function acronymsOf(group: QuickLinkGroup): string[] {
  return [group.label, group.description]
    .map((value) =>
      normalize(value)
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join(""),
    )
    .filter((acronym) => acronym.length >= 2);
}

/** `(` `)` `[` `]` are real characters in these link names. */
function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Every term that appears in the text, as segments. Replaces the old matcher,
 * which compared a highlight candidate against the whole term list and so
 * missed any term containing a space.
 */
export function splitHighlight(
  text: string,
  terms: string[],
): { text: string; match: boolean }[] {
  const usable = terms.map((term) => term.trim()).filter(Boolean);
  if (usable.length === 0) return [{ text, match: false }];

  const pattern = new RegExp(`(${usable.map(escapeForRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts
    .filter((part) => part !== "")
    .map((part) => ({
      text: part,
      match: usable.some((term) => term.toLowerCase() === part.toLowerCase()),
    }));
}

function scoreLink(name: string, terms: string[]): number {
  if (terms.length === 0) return 0;
  const haystack = normalize(name);
  const first = terms[0];

  // Every term must appear, otherwise a two-word query matches far too much.
  if (!terms.every((term) => haystack.includes(term))) return 0;

  let score = terms.length * 10;
  if (haystack.startsWith(first)) score += 8;
  if (haystack === terms.join(" ")) score += 12;
  return score + Math.max(0, 20 - name.length / 4);
}

/**
 * Ranked hits for a query, plus the groups whose own name matched.
 *
 * A query naming a group returns that whole group's links, because "BLS"
 * almost always means "show me the BLS links".
 */
export function searchQuickLinks(
  groups: QuickLinkGroup[],
  query: string,
): { hits: QuickLinkHit[]; groups: QuickLinkGroup[] } {
  const terms = termsOf(query);
  if (terms.length === 0) return { hits: [], groups: [] };

  const compact = terms.join("");
  const matchedGroups: QuickLinkGroup[] = [];
  const hits: QuickLinkHit[] = [];

  for (const group of groups) {
    const haystack = normalize(`${group.label} ${group.description}`);
    const groupMatch =
      terms.every((term) => haystack.includes(term)) ||
      acronymsOf(group).includes(compact);

    if (groupMatch) matchedGroups.push(group);

    for (const entry of group.links) {
      const linkScore = scoreLink(entry.name, terms);
      if (!groupMatch && linkScore === 0) continue;

      hits.push({
        entry,
        group,
        groupMatch,
        score: groupMatch ? 100 + linkScore : linkScore,
      });
    }
  }

  hits.sort(
    (a, b) =>
      b.score - a.score ||
      a.entry.name.length - b.entry.name.length ||
      a.entry.name.localeCompare(b.entry.name),
  );

  return { hits, groups: matchedGroups };
}

/** Resolves stored ids (pins, recents) back to a link and its group. */
export function linkById(
  groups: QuickLinkGroup[],
): Map<string, { group: QuickLinkGroup; entry: QuickLinkEntry }> {
  const map = new Map<string, { group: QuickLinkGroup; entry: QuickLinkEntry }>();
  for (const group of groups) {
    for (const entry of group.links) {
      map.set(entry.id, { group, entry });
    }
  }
  return map;
}
