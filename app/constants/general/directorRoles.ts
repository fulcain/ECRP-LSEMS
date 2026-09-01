export const directorRoleTitles = [
  "Director of Operations",
  "Director of Administration",
  "Director of Special Operations",
] as const;

export type DirectorRoleTitle = (typeof directorRoleTitles)[number];


export const directorResponsibility: Record<DirectorRoleTitle, string[]> = {
  "Director of Operations": [
    "Pilot",
    "Mountain Rescue",
    "Fire & Rescue",
    "Fire Safety",
    "Field Training",
  ],
  "Director of Administration": [
    "Basic Life Support",
    "RED",
    "Public Relations",
  ],
  "Director of Special Operations": ["AMU", "Forensics"],
};

export type DirectorRole = {
  enabled: boolean;
  title: string;
};

export const defaultDirectorRole: DirectorRole = {
  enabled: false,
  title: "",
};

export type DirectorGuard = DirectorRole | null | undefined;

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
