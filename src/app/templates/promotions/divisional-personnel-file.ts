import type { DivisionalPersonnelFileDefinition } from "./types";

export const divisionalPersonnelFileTemplate: DivisionalPersonnelFileDefinition =
  {
    renderBody: ({ personnelName, dateHired }) =>
      `[img]https://i.ibb.co/mVmsYFGM/z2vasuu.png[/img]
[lsemssubtitle]EMPLOYEE DETAILS[/lsemssubtitle]
[divbox=white]
[b]Full Name:[/b] ${personnelName || "Fname Lname"}
[b]Date hired:[/b] ${dateHired || "DD/MON/YYYY"}
[/divbox]

[lsemssubtitle]DIVISIONAL RANKS[/lsemssubtitle]
[divbox=white]
[color=#800000][b]Air and Rescue:[/b][/color] RANK
Date:

[color=#800000][b]AMU:[/b][/color] RANK
Date:

[color=#800000][b]BLS:[/b][/color] RANK
Date:

[color=#800000][b]Fire and Rescue:[/b][/color] RANK
Date:

[color=#800000][b]Forensics:[/b][/color] RANK
Date:

[color=#800000][b]FTD:[/b][/color] RANK
Date:

[color=#800000][b]PR:[/b][/color] RANK
Date:

[color=#800000][b]RED:[/b][/color] RANK
Date:

[/divbox][LSEMSfooter][/LSEMSfooter]`,
  };
