import type { RankAdjustmentDefinition } from "./types";

export const rankAdjustmentTemplate: RankAdjustmentDefinition = {
  renderBody: ({ personnelName, previousRank, newRank, date, signature, medicName, medicRank }) => {
    const displayName = personnelName || "[b]NAME:[/b] Fname Lname";
    const prevRank = previousRank || "[b]PREVIOUS RANK:[/b] Rank";
    const assRank = newRank || "[b]ASSUMING RANK:[/b] Rank";
    const adjDate = date || "DD/MMM/YYYY";
    const sigImg = signature
      ? `[img]${signature}[/img]`
      : `[b]Signature[/b]`;
    const staffName = medicName || "[i]Your Name[/i]";
    const staffRank = medicRank || "[b]RANK[/b]";

    return `[img]https://i.ibb.co/7Nj9qvT5/Fim-Ceol.png[/img]
[divbox=white]

[b]NAME:[/b] ${displayName}
[b]PREVIOUS RANK:[/b] ${prevRank}

[b]ASSUMING RANK:[/b] ${assRank}
[b]DATE OF ADJUSTMENT:[/b] ${adjDate}
[hr][/hr]

${sigImg}
[i]${staffName}[/i]
[b]${staffRank}[/b]
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[lsemsfooter]`;
  },
};
