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

export type QuickLinkDivision = {
  label: string;
  image: string;
  divisionName: string;
  links: QuickLinkEntry[];
};

export type QuickLinkHit = {
  entry: QuickLinkEntry;
  division: QuickLinkDivision;
  /** True when the division itself matched, so every link in it is a hit. */
  divisionMatch: boolean;
  score: number;
};

export function linkId(divisionLabel: string, url: string): string {
  return `${divisionLabel}::${url}`;
}

/** Lower-cased, punctuation collapsed - so "f-r" and "F&R" compare equal. */
export function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function termsOf(query: string): string[] {
  return normalize(query).split(" ").filter(Boolean);
}

/** Acronyms people actually type: "Field Training" -> ft, "... Division" -> ftd. */
export function acronymsOf(division: QuickLinkDivision): string[] {
  return [division.label, division.divisionName]
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
 * Ranked hits for a query, plus the divisions whose own name matched.
 *
 * A query naming a division returns that whole division's links, because
 * "BLS" almost always means "show me the BLS links".
 */
export function searchQuickLinks(
  divisions: QuickLinkDivision[],
  query: string,
): { hits: QuickLinkHit[]; divisions: QuickLinkDivision[] } {
  const terms = termsOf(query);
  if (terms.length === 0) return { hits: [], divisions: [] };

  const compact = terms.join("");
  const matchedDivisions: QuickLinkDivision[] = [];
  const hits: QuickLinkHit[] = [];

  for (const division of divisions) {
    const haystack = normalize(`${division.label} ${division.divisionName}`);
    const divisionMatch =
      terms.every((term) => haystack.includes(term)) ||
      acronymsOf(division).includes(compact);

    if (divisionMatch) matchedDivisions.push(division);

    for (const entry of division.links) {
      const linkScore = scoreLink(entry.name, terms);
      if (!divisionMatch && linkScore === 0) continue;

      hits.push({
        entry,
        division,
        divisionMatch,
        score: divisionMatch ? 100 + linkScore : linkScore,
      });
    }
  }

  hits.sort(
    (a, b) =>
      b.score - a.score ||
      a.entry.name.length - b.entry.name.length ||
      a.entry.name.localeCompare(b.entry.name),
  );

  return { hits, divisions: matchedDivisions };
}

/** Resolves stored ids (pins, recents) back to a link and the division it is in. */
export function linkById(
  divisions: QuickLinkDivision[],
): Map<string, { division: QuickLinkDivision; entry: QuickLinkEntry }> {
  const map = new Map<string, { division: QuickLinkDivision; entry: QuickLinkEntry }>();
  for (const division of divisions) {
    for (const entry of division.links) {
      map.set(entry.id, { division, entry });
    }
  }
  return map;
}
