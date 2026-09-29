/**
 * The Quick Links directory's own view model.
 *
 * Every division declares its links (`app/constants/divisions/*.ts`), and this
 * is the only thing that turns them into what the browser renders. It lives in
 * this feature rather than in `constants/divisions` because it exists for this
 * view: the division selector and the staff page read the divisions themselves.
 *
 * The links are reached two ways and they are the same links: the directory
 * page lists every division, and a division's own section links here scoped to
 * it (see `quick-links-scope.ts`). A scoped view is a scope on the page, not a
 * second page - one search, one set of pins, nothing to keep in sync.
 */

import { divisions, type Divisions } from "@/app/constants/divisions";
import { linkId, type QuickLinkDivision } from "./quick-links-search";

/**
 * What the browser needs from a division, and nothing else: the label and
 * emblem it shows, and its links. Ranks, membership roles and the rest of the
 * declaration would be dead weight in the payload.
 */
export function toQuickLinkDivision(division: Divisions): QuickLinkDivision {
  return {
    label: division.label,
    image: division.image,
    divisionName: division.data.divisionName,
    links: division.data.quickLinks.map((link) => ({
      // The id is stable across sessions, which is what pinning and recents
      // are stored as - so it names the division as well as the link.
      id: linkId(division.label, link.url),
      name: link.name,
      url: link.url,
    })),
  };
}

/** Every division, or just the ones handed in (a scoped view is one of them). */
export function quickLinksDirectory(
  list: readonly Divisions[] = divisions,
): QuickLinkDivision[] {
  return list.map(toQuickLinkDivision);
}

/**
 * The division a `?division=` value names, or `null` when it names none.
 *
 * Untyped input, so an unknown or stale value falls back to the full directory
 * rather than rendering an empty page.
 */
export function divisionFromParam(value: string | undefined): Divisions | null {
  if (!value) return null;
  return divisions.find((division) => division.key === value) ?? null;
}
