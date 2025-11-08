import { MedicCredentials } from "@/app/(routes)/email-templates/components/MedicCredentials";

export const generateSignature = ({
  medicCredentials,
  selectedRank,
}: {
  medicCredentials: MedicCredentials;
  selectedRank: string;
}) => {
  const rankLine = selectedRank
    ? `[b]${medicCredentials.rank} / ${selectedRank}[/b]`
    : `[b]${medicCredentials.rank}[/b]`;

  return `[img]${medicCredentials.signature}[/img]
[i]${medicCredentials.name}[/i]
${rankLine}
`;
};
