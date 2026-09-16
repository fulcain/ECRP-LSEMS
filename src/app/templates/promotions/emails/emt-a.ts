import type { PromotionEmailDefinition } from "../types";

export const emtAEmailTemplate: PromotionEmailDefinition = {
  value: "emt-a",
  label: "EMT-A Email",
  rankLabel: "EMT-Advanced",
  accent: "from-purple-500/25 via-violet-500/15 to-transparent",
  border: "border-purple-400/30",
  badge: "bg-purple-500/20 text-purple-100 ring-1 ring-purple-400/40",
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
EMT-Advanced Details
[/font][/i][/center]
[hr]

[b][i]Dear ${title} ${displayName}
[/i][/b]

Congratulations once more on the EMT-Advanced promotion! Wear your new badge with pride, you deserve it! 

As an EMT-Advanced, you are now qualified to join new divisions and progress further in some of the previously available ones! This rank is special because it finally allows you to become a fully-fledged Firefighter, amongst other roles.

 
You can preview the available job listings [url=https://gov.eclipse-rp.net/viewforum.php?f=1057]right here[/url]. 

As an EMT-A, you should be getting better at paperwork in general as well as understanding BBCode and its more intricate use cases. However, asking for help is far from a bad thing. If you wish to learn better ways, or more ways, of utilizing BBCode, feel free to reach out to more experienced members of the Department, as they have touched BBCode plenty of times!

Should you be unsure who to ask, just go for any of the Supervisors, but anyone above is also more than happy to help!

[hr]
[b]You can find the Staff Roster here:[/b]
[url=https://gov.eclipse-rp.net/viewtopic.php?f=597&t=9497]Staff Roster[/url]
[hr]

[b]Make sure you have a proper signature! You can make a signature for your paperwork here:[/b]
[url=https://fontmeme.com/signature-fonts/]Signatures[/url]

[hr]
[b]Thank you for reading through this! Keep up the great work![/b]
 
Sincerely,

${signatureImg}
[size=130][b]${nameLine}[/b][/size]
[size=110][b]${rankLine}[/b][/size]
[i][b]Los Santos Emergency Medical Services[/b][/i]
[/divbox]
[lsemsfooter][/lsemsfooter]`;
  },
};
