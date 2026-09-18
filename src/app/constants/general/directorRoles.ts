/**
 * Department-wide director roles.
 *
 * Titles and snowflakes come from the role registry (`src/configs/roles.ts`) -
 * this file only decides the order they are listed in, and which divisions
 * each director covers.
 */
import {
  DIVISION_ENTRIES,
  DIVISIONS,
  ROLES,
  type DivisionKey,
} from "@/configs/roles";

export type DirectorEntry = {
  title: string;
  id: string | null;
};

export const directors = [
  {
    title: ROLES.DirectorOfOperations.name,
    id: ROLES.DirectorOfOperations.id,
  },
  {
    title: ROLES.DirectorOfAdministration.name,
    id: ROLES.DirectorOfAdministration.id,
  },
  {
    title: ROLES.DirectorOfSpecialOperations.name,
    id: ROLES.DirectorOfSpecialOperations.id,
  },
] as const satisfies readonly DirectorEntry[];

/** Every director title, in declaration order. */
export const directorRoleTitles: readonly DirectorRoleTitle[] = directors.map(
  (director) => director.title,
);

export type DirectorRoleTitle = (typeof directors)[number]["title"];

/** Discord role id for a director title, or `null` when it isn't synced yet. */
export function directorRoleId(title: DirectorRoleTitle): string | null {
  return directors.find((director) => director.title === title)?.id ?? null;
}

/**
 * The divisions a director title covers.
 *
 * Read from `DIVISIONS`: a division names the directors that look after it
 * (`directors: [...]` on its entry) and this is the same fact the other way
 * round. One declaration, so a division can't be handed to another director in
 * one place and still be signed off by the old one in another - and it is the
 * same entry that opens that director's access to the division.
 */
function coveredDivisions(title: DirectorRoleTitle): string[] {
  return DIVISION_ENTRIES.filter(([, division]) =>
    (division.directors ?? []).some((alias) => ROLES[alias].name === title),
  ).map(([, division]) => division.label);
}

export const directorResponsibility: Record<DirectorRoleTitle, string[]> = {
  "Director of Operations": coveredDivisions("Director of Operations"),
  "Director of Administration": coveredDivisions("Director of Administration"),
  "Director of Special Operations": coveredDivisions(
    "Director of Special Operations",
  ),
};

/**
 * The divisions a title looks after, or an empty list when the string is not a
 * director title at all. The lookup is what tells a director which sections
 * their role actually opens.
 */
export function divisionsForDirector(
  title: string | null | undefined,
): readonly string[] {
  if (!title) return [];
  return directorResponsibility[title as DirectorRoleTitle] ?? [];
}

export type DirectorRole = {
  enabled: boolean;
  title: string;
};

export const defaultDirectorRole: DirectorRole = {
  enabled: false,
  title: "",
};

export type DirectorGuard = DirectorRole | null | undefined;

/**
 * The director title covering a division, from the title the member holds.
 *
 * Keyed by the division's key rather than its label so a caller doesn't write
 * the label by hand: the coverage lookup compares against the label, and a
 * tool that spells it a little differently would silently lose the override.
 */
export function directorTitleForDivisionKey(
  directorRole: DirectorGuard,
  divisionKey: DivisionKey,
): string | null {
  return getDirectorTitleForDivision(directorRole, DIVISIONS[divisionKey].label);
}

// Returns the director title whenever the user holds one, regardless of which
// division is selected (used for department-wide templates).
export const getDirectorTitle = (directorRole: DirectorGuard): string | null => {
  if (!directorRole?.enabled || !directorRole.title) return null;
  return directorRole.title;
};

// Returns the director title when the user holds one AND that director covers
// the given division. Otherwise returns null so the caller falls back to the
// regular divisional rank.
export const getDirectorTitleForDivision = (
  directorRole: DirectorGuard,
  divisionLabel: string | null | undefined,
): string | null => {
  if (!directorRole?.enabled || !divisionLabel) return null;
  const title = directorRole.title;
  if (!title) return null;
  const responsibility = directorResponsibility[title as DirectorRoleTitle];
  if (!responsibility) return null;

  const normalizedDivision = divisionLabel.trim().toLowerCase();
  return responsibility.some((division) => {
    const normalizedResponsibility = division.toLowerCase();
    return (
      normalizedDivision === normalizedResponsibility ||
      normalizedDivision.startsWith(`${normalizedResponsibility} `) ||
      normalizedDivision.includes(` ${normalizedResponsibility} `) ||
      normalizedDivision.endsWith(` ${normalizedResponsibility}`)
    );
  })
    ? title
    : null;
};
