import type { PromotionEmailDefinition } from "../types";

export const masterEMTEmailTemplate: PromotionEmailDefinition = {
  value: "master-emt",
  label: "Master EMT Email",
  rankLabel: "Master EMT",
  accent: "from-amber-500/25 via-yellow-500/15 to-transparent",
  border: "border-amber-400/30",
  badge: "bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/40",
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
Master EMT Details
[/font][/i][/center]
[hr]

[b][i]Dear ${title} ${displayName}
[/i][/b]

Congratulations once more on the Master EMT promotion! Wear your new badge with pride, you deserve it! 

As a Master EMT, you have reached the top EMT rank. As such, it is expected of you to be the best an EMT can be, guiding the ones striving to progress while maintaining a good track record yourself. You are eligible to join basically every division and progress through it at this point! Always strive to increase the number of things you can do within the Department, especially when it comes to Instructor positions in Divisions, as this is something that you have the capacity to do, and should strive to do.

 
You can preview the available job listings [url=https://gov.eclipse-rp.net/viewforum.php?f=1057]right here[/url]. 


Should you wish to have more guidance towards anything, please do feel free to ask any of your Supervisor+, as anyone will be more than willing to help you out!

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
