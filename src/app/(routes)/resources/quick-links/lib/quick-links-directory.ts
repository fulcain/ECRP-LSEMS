/**
 * The Quick Links directory's own view model.
 *
 * Divisions declare their links (`app/constants/divisions/*.ts`); supervisor
 * links belong only to this directory. This is the only thing that turns them
 * into what the browser renders.
 *
 * The full directory includes the Supervisors group. A division's own section
 * links here scoped to its links (see `quick-links-scope.ts`).
 */

import { divisions, type Divisions } from "@/app/constants/divisions";
import { linkId, type QuickLinkGroup } from "./quick-links-search";
import { supervisorQuickLinks } from "./supervisor-quick-links";

/**
 * What the browser needs from a division, and nothing else: the label and
 * emblem it shows, and its links. Ranks, membership roles and the rest of the
 * declaration would be dead weight in the payload.
 */
export function toQuickLinkGroup(division: Divisions): QuickLinkGroup {
  return {
    label: division.label,
    image: division.image,
    description: division.data.divisionName,
    links: division.data.quickLinks.map((link) => ({
      // The id names the group as well as the link for stable pins and recents.
      id: linkId(division.label, link.url),
      name: link.name,
      url: link.url,
    })),
  };
}

/** Full directory, or the divisions handed in for a scoped view. */
export function quickLinksDirectory(
  list?: readonly Divisions[],
): QuickLinkGroup[] {
  const divisionGroups = (list ?? divisions).map(toQuickLinkGroup);
  if (list) return divisionGroups;

  return [
    ...divisionGroups,
    {
      label: supervisorQuickLinks.label,
      image: supervisorQuickLinks.image,
      description: supervisorQuickLinks.description,
      links: supervisorQuickLinks.links.map((link) => ({
        id: linkId(supervisorQuickLinks.label, link.url),
        name: link.name,
        url: link.url,
      })),
    },
  ];
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
