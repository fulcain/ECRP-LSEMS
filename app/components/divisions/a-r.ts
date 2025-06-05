export const AR = {
  label: "A&R",
  image: "/Division/A&R.png",
  onClick: (date: string) => {
    return `
[LSEMSfooter][/LSEMSfooter]
[divbox=white]
[fimg=235,150]https://i.imgur.com/6EvtIgR.png[/fimg][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]Air and Rescue Division[/size][/b]
[size=95]"One Team, One Mission, Saving Lives"[/size][/font]
[size=115]Subject[/size]
[size=95]${date}[/size]
[/right][/aligntable]

[hr]

[b]Dear [RANK, NAME][/b],

[hr]
[b]Kind regards,[/b]

[img]https://i.imgur.com/qLrboSu.png[/img]
[i]Dmitry Petrov[/i]
[b]EMT-I | Mountain and Rescue Operator[/b]
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]
`;
  },
};
