import { MedicCredentials } from "@/app/(routes)/email-templates/components/MedicCredentials";
import { getDirectorTitleForDivision } from "@/app/constants/general/directorRoles";

export const generateSignature = ({
  medicCredentials,
  selectedRank,
  selectedDivisionLabel,
}: {
  medicCredentials: MedicCredentials;
  selectedRank: string;
  selectedDivisionLabel?: string | null;
}) => {
  const directorTitle = getDirectorTitleForDivision(
    medicCredentials.directorRole,
    selectedDivisionLabel,
  );

  const rankLine = directorTitle
    ? `[b]${medicCredentials.rank} / ${directorTitle}[/b]`
    : selectedRank
      ? `[b]${medicCredentials.rank} / ${selectedRank}[/b]`
      : `[b]${medicCredentials.rank}[/b]`;

  return `[img]${medicCredentials.signature}[/img]
[i]${medicCredentials.name}[/i]
${rankLine}
`;
};
