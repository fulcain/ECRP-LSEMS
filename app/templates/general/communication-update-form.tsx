import { Divisions } from "@/app/constants/divisions";
import { getCurrentDateFormatted } from "@/app/helpers/getCurrentDateFormatted";
import { getCurrentUTCTime } from "@/app/helpers/timeUtils";

type CommunicationUpdateFormTypes = {
  medicCredentials: { name: string; signature: string; rank: string };
  selectedDivision: Divisions | null;
  selectedRank: string;
  patientName: string;
  contactType: string;
  contactDetails: string;
};

export const generateCommunicationUpdateForm = ({
  medicCredentials,
  selectedDivision,
  selectedRank,
  patientName,
  contactType,
  contactDetails,
}: CommunicationUpdateFormTypes): string => {
  if (!selectedDivision || !selectedRank) return "";

  const utcDate = getCurrentUTCTime();

  return `[img]https://i.imgur.com/Wxpv58D.png[/img]
[divbox=white]
[hr]
[b]Patient Name:[/b] ${patientName}
[hr]
[b]Date / Time:[/b] ${getCurrentDateFormatted()} - ${utcDate}
[hr]
[b]Contact Method:[/b] ${contactType}
[hr]
[b]Details:[/b] ${contactDetails}
[hr]
[/divbox]
[divbox=white]
[img]${medicCredentials.signature}[/img]
[i]${medicCredentials.name}[/i]
[b]${selectedRank} | ${medicCredentials.rank}[/b]
[b]Los Santos Emergency Medical Services[/b]
[/divbox][img]https://i.imgur.com/HNP4ksW.png[/img]`.trim();
};
