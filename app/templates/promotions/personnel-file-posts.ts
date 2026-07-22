import type { PersonnelFilePostDefinition, PersonnelFilePostContext } from "./types";

const personnelFilePostDefs: PersonnelFilePostDefinition[] = [
  {
    rank: "emt-b",
    label: "EMT-B",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/JwycCL0R/Gkqft-MR.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to EMT-Basic![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
  {
    rank: "emt-i",
    label: "EMT-I",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/xKgJRkXY/t-SAH1l-A.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to EMT-Intermediate![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
  {
    rank: "emt-a",
    label: "EMT-A",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/gLrjjWg8/Dquo0MQ.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to EMT-Advanced![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
  {
    rank: "master-emt",
    label: "Master EMT",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/8L8c8JJs/z3k86ji.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to Master EMT![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
  {
    rank: "junior-paramedic",
    label: "Junior Paramedic",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/8L8c8JJs/z3k86ji.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to Junior Paramedic![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
  {
    rank: "paramedic",
    label: "Paramedic",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/ycVchNSX/y-JZHa-Kg.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to Paramedic![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
  {
    rank: "senior-paramedic",
    label: "Senior Paramedic",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/rKrkg2WS/Yra8DDl.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to Senior Paramedic![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
  {
    rank: "lead-paramedic",
    label: "Lead Paramedic",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/spQXxzc6/I9A66xq.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to Lead Paramedic![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
  {
    rank: "lieutenant",
    label: "Lieutenant",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/qLfcBLdL/nz-CBN57.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to Lieutenant![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
  {
    rank: "captain",
    label: "Captain",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/Kp7gP9Kh/KVQAs-B8.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to Captain![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
  {
    rank: "commander",
    label: "Commander",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/Jj1KMcYB/d-QEQ620.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to Commander![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
  {
    rank: "deputy-chief",
    label: "Deputy Chief",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/1tR7dDsL/7tg-Puo5.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to Deputy Chief![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
  {
    rank: "assistant-chief",
    label: "Assistant Chief",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/S8MPKhD/e-Pr6kg-C.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to Assistant Chief![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
  {
    rank: "chief",
    label: "Chief",
    renderBody: ({ personnelName, date, promotedByName, promotedByRank }) =>
      `[center][img]https://i.ibb.co/4nJ9vHKy/GRe-HLv-T.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.ibb.co/RTX88nSv/o-XLXC5Z.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]${personnelName || "Fname Lname"} has been promoted to Chief![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]${date || "DD/MMM/YYYY"}[/size][/u][/b][/center]
[center][b][size=110]Promoted by: ${promotedByRank || "Rank"} ${promotedByName || "Fname Lname"}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.ibb.co/C3nkQ79w/7a-QSs-Ns.png[/img][/center]`,
  },
];

export { personnelFilePostDefs };
