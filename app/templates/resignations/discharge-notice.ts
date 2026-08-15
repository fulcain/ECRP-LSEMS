import type { DischargeNoticeContext } from "./types";

export const dischargeNoticeTemplate = {
  renderBody: ({
    employeeRank,
    employeeName,
    date,
    dischargeType,
    reason,
    processedByName,
    processedByRank,
  }: DischargeNoticeContext) => {
    const rankAndName =
      employeeRank || employeeName
        ? `${employeeRank || "Rank"} ${employeeName || "Fname Lname"}`.trim()
        : "Rank Fname Lname";
    const processedBy =
      processedByRank || processedByName
        ? `${processedByRank || "Rank"} ${processedByName || "Fname Lname"}`.trim()
        : "Rank Fname Lname";
    const typeLine =
      dischargeType === "Dishonorable"
        ? "[ ] Honorable | [✓] Dishonorable"
        : "[✓] Honorable | [ ] Dishonorable";

    return `[img]https://i.ibb.co/Pv0sPSRY/XCcuaus.png[/img]
[lsemssubtitle]DISCHARGE DETAILS[/lsemssubtitle]
[divbox=white]

[b]Employee Rank and Name:[/b] ${rankAndName}
[b]Date of Discharge:[/b] ${date || "DD/MM/YYYY"}
[b]Type of Discharge:[/b] ${typeLine}
[b]Discharge Reason:[/b] ${reason || "Reason"}

[b]Processed by:[/b] ${processedBy}
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
};
