import type { RevokeAccessContext } from "./types";

export const revokeAccessTemplate = {
  renderBody: ({ employeeName }: RevokeAccessContext) =>
    `/me logs into the LSEMS database and revokes all department-issued keys and access cards of ${employeeName || "Fname Lname"}.`,
};
