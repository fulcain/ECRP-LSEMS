import { MedicCredentials } from "@/app/(routes)/email-templates/components/MedicCredentials";
import {
  getDirectorTitle,
  getDirectorTitleForDivision,
} from "@/app/constants/general/directorRoles";

export const generateSignature = ({
  medicCredentials,
  selectedRank,
  selectedDivisionLabel,
}: {
  medicCredentials: MedicCredentials;
  selectedRank: string;
  selectedDivisionLabel?: string | null;
}) => {
  const isGeneralDivision =
    selectedDivisionLabel?.trim().toLowerCase() === "general";

  // Department-wide signature: always show the held director title. Division
  // signatures only show it when the director covers that division.
  const directorTitle = isGeneralDivision
    ? getDirectorTitle(medicCredentials.directorRole)
    : getDirectorTitleForDivision(
        medicCredentials.directorRole,
        selectedDivisionLabel,
      );

  const rankLine = directorTitle
    ? `[b]${directorTitle} / ${medicCredentials.rank}[/b]`
    : selectedRank
      ? `[b]${selectedRank} / ${medicCredentials.rank}[/b]`
      : `[b]${medicCredentials.rank}[/b]`;

  return `[img]${medicCredentials.signature}[/img]
[i]${medicCredentials.name}[/i]
${rankLine}
`;
};
