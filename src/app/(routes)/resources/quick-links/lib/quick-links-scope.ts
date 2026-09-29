/**
 * The scope a division's own quick links travel in.
 *
 * Deliberately its own module, and deliberately free of the divisions: the
 * button that opens a division's links renders on the client, and importing the
 * directory - which reads every division's declaration, links included - would
 * put the whole registry in the browser bundle to build one href.
 */

import { ROUTES } from "@/configs/routes";
import type { DivisionKey } from "@/configs/roles";

/** `/resources/quick-links?division=bls` - the directory, scoped to a division. */
export const QUICK_LINK_DIVISION_PARAM = "division";

export function divisionQuickLinksHref(key: DivisionKey): string {
  return `${ROUTES.resources.quickLinks}?${QUICK_LINK_DIVISION_PARAM}=${key}`;
}
