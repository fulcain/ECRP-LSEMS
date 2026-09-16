import {
  DIVISION_ENTRIES,
  membershipForDivision,
  type DivisionKey,
  type RoleRef,
} from "@/configs/roles";
import { AMU } from "./amu";
import { BLS } from "./bls";
import { CRU } from "./cru";
import { FR } from "./f-r";
import { FOR } from "./for";
import { FS } from "./fs";
import { FT } from "./ft";
import { General } from "./general";
import { IA } from "./ia";
import { LIFEGUARD } from "./lifeguard";
import { MOUNTAIN_RESCUE } from "./mountain-rescue";
import { PILOT } from "./pilot";
import { PR } from "./pr";
import { RED } from "./red";

/**
 * What a division module declares: everything except the key, which the module
 * can't know and `divisions` attaches below.
 */
export type DivisionPage = {
  label: string;
  image: string;
  data: DivisionData;
};

export type Divisions = DivisionPage & {
  /** The division's key in `DIVISIONS` (`src/configs/roles.ts`). */
  key: DivisionKey;
};

/**
 * A divisional rank - its display name and the Discord role it maps to, both
 * read from the role registry (`src/configs/roles.ts`).
 *
 * No division file spells a rank out: it only points at its entry in
 * `DIVISIONS` (see the note at the top of `roles.ts`).
 */
export type DivisionRankEntry = RoleRef;

export type DivisionData = {
  image: string;
  imageSize: string;
  divisionName: string;
  /** Divisional ranks, highest first. */
  ranks: readonly DivisionRankEntry[];
  /**
   * The role every member of the division holds, when the guild has one - the
   * difference between "is in this division" and "holds a rank in it". Read
   * from the registry, so the profile and the route gate can't disagree about
   * which role marks membership.
   */
  membership?: DivisionRankEntry;
  quickLinks: QuickLink[];
};

export type QuickLink = {
  name: string;
  url: string;
};

/**
 * Division key -> the module that renders it.
 *
 * The key is the division's name in `DIVISIONS` (`src/configs/roles.ts`), which
 * is where the division's ranks and, when it has one, its route and its route
 * gate are declared. This map holds only what a route can't describe: the
 * artwork and the division's forum links.
 *
 * Typed as a full `Record`, so declaring a division in `DIVISIONS` without a
 * module here is a compile error rather than a page that silently goes missing.
 */
const DIVISION_PAGES: Record<DivisionKey, DivisionPage> = {
  general: General,
  bls: BLS,
  amu: AMU,
  ftd: FT,
  red: RED,
  for: FOR,
  fr: FR,
  fs: FS,
  pr: PR,
  mountainRescue: MOUNTAIN_RESCUE,
  pilot: PILOT,
  lifeguard: LIFEGUARD,
  ia: IA,
  cru: CRU,
};

/**
 * Every live division, in `DIVISIONS` order - the division selector, the
 * quick-links page and the staff page all render this list, so a division is
 * added or reordered in one place.
 *
 * A division marked `dormant` in the registry keeps its ranks declared but
 * stays out of the app (CRU today).
 *
 * The key and the membership role are attached here rather than in each
 * division module: neither is something a module can know, and taking them
 * from the registry is what stops a module's copy of a rank list from drifting
 * away from the one the middleware gates the route on.
 */
export const divisions: Divisions[] = DIVISION_ENTRIES.filter(
  ([, division]) => !division.dormant,
).map(([key]) => {
  const page = DIVISION_PAGES[key];
  const membership = membershipForDivision(key);
  return {
    ...page,
    key,
    data: membership ? { ...page.data, membership } : page.data,
  };
});
