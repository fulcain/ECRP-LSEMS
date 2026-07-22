import type { PromotionEmailDefinition } from "../types";

export const emtIEmailTemplate: PromotionEmailDefinition = {
  value: "emt-i",
  label: "EMT-I Email",
  rankLabel: "EMT-Intermediate",
  accent: "from-blue-500/25 via-indigo-500/15 to-transparent",
  border: "border-blue-400/30",
  badge: "bg-blue-500/20 text-blue-100 ring-1 ring-blue-400/40",
  renderBody: ({ personnelName, title, medicName, medicRank, medicSignature }) => {
    const displayName = personnelName || "[i]NAME[/i]";
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Operational Rank";

    return `[img]https://i.ibb.co/cXr7XYkS/HNP4ks-W.png[/img]
[divbox=white]
[center][fpimg=55]https://i.ibb.co/4wZLh7Hj/C6b52lr.png[/fpimg]
[color=transparent]spacer[/color][/center][font=Arial]
[center][i][b]Los Santos Emergency Medical Services[/b]
EMT-Intermediate Details
[/font][/i][/center]
[hr]

[b][i]Dear ${title} ${displayName}
[/i][/b]

Congratulations once more on the EMT-Intermediate promotion! Wear your new badge with pride, you deserve it! 

As an EMT-Intermediate, you are now qualified to join new divisions. Joining new divisions is an amazing way to improve your skillset as an EMT, and should be something you do as soon as possible. We highly suggest joining at least one new division, such as becoming a certified MEDEVAC pilot, as they contain many opportunities. 

 
You can preview the available job listings [url=https://gov.eclipse-rp.net/viewforum.php?f=1057]right here[/url]. 

One of the big parts of conducting any sort of divisional work is the paperwork evolved. Don't [color=#000000][color=#FF0000][b]stress[/b][/color][/color] - the person teaching you will walk you through how exactly to file the paperwork required as well as where you can find the templates that have been created to make the process easier for you. 

Should you still need some help with paperwork (or anything else), you can find a list of people who are related to the thing you need help with in the Staff Roster. Should you be unsure who to ask, just go for any of the Supervisors!!

[hr]
[b]You can find the Staff Roster here:[/b]
[url=https://gov.eclipse-rp.net/viewtopic.php?f=597&t=9497]Staff Roster[/url]
[hr]

[b]You can make a signature for your paperwork here:[/b]
[url=https://fontmeme.com/signature-fonts/]Signatures[/url]

[hr]
[b]Thank you for reading through this! If you did make it this far, you will be breezing on to the next rank in no time! Keep up the great work.[/b]
 
Sincerely,

${signatureImg}
[size=130][b]${nameLine}[/b][/size]
[size=110][b]${rankLine}[/b][/size]
[i][b]Los Santos Emergency Medical Services[/b][/i]
[/divbox]
[lsemsfooter][/lsemsfooter]`;
  },
};
