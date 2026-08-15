import type { PersonnelFileDischargeContext } from "./types";

export const personnelFileDischargeTemplate = {
  renderBody: ({
    date,
    dischargeType,
    dischargedBy,
    paperworkLink,
  }: PersonnelFileDischargeContext) => {
    const spoilerTitle = `${date || "DD/MMM/YYYY"} | ${dischargeType || "Honorable/Dishonorable"} | ${dischargedBy || "DISCHARGED BY"}`;
    const link = paperworkLink.trim();

    return `[spoiler=${spoilerTitle}]
[url=${link}]Paperwork link[/url][/spoiler]`;
  },
};
