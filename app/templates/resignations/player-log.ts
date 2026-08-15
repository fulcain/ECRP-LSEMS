import type { PlayerLogContext } from "./types";

export const playerLogTemplate = {
  renderBody: ({ date, employeeName, reason, rpLink }: PlayerLogContext) => {
    const message = `[${date || "DD/MM/YY"}] ${employeeName || "Fname Lname"} has been removed from the faction. Reason: ${reason || ""}`;
    return rpLink ? `${rpLink}\n${message}` : message;
  },
};
