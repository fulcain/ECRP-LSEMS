import type { PromotionEmailDefinition } from "../types";

export const emtBEmailTemplate: PromotionEmailDefinition = {
  value: "emt-b",
  label: "EMT-B Email",
  rankLabel: "EMT-Basic",
  accent: "from-emerald-500/25 via-green-500/15 to-transparent",
  border: "border-emerald-400/30",
  badge: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40",
  renderBody: ({ personnelName, title, medicName, medicRank, medicSignature }) => {
    const displayName = personnelName || "[i]NAME[/i]";
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Operational Rank";

    return `[lsemsfooter][/lsemsfooter]
[divbox=white]
[center][fpimg=40]https://i.ibb.co/4wZLh7Hj/C6b52lr.png[/fpimg]

[color=transparent]spacer[/color][/center][font=Arial]
[center][i][b]Los Santos Emergency Medical Services[/b][/center]
[hr]

[b][i]Dear ${title} ${displayName}
[/i][/b]
Congratulations on passing your certification, welcome to the EMT team! Below is a list of tools that every EMT uses eventually, please do read through them!

As an EMT-B, you are eligible to join divisions now. You can see the currently available [url=https://gov.eclipse-rp.net/viewforum.php?f=1057]job listings here (click).[/url]

[spoiler=Leave of Absence (LOA)]
A leave of absence is a time period that an employee can request if they need to be off work, during an LOA the hour requirement is not counted against you but you can still go on duty if you choose to!

[list]To request a leave of absence, use the template located [url=https://gov.eclipse-rp.net/viewtopic.php?f=613&t=31821]here[/url]. 
[*]Copy and paste the subject and blank format in a new post [url=https://gov.eclipse-rp.net/viewforum.php?f=613]here[/url]. 
[*]Before filling out a form, make sure to read the rules present above the blank format.
[*]Fill out the form accordingly, press preview to ensure everything is correct and looks good, then post and wait for Human Resources to accept it![/list] 

[center] [size=85][i][b]**An LOA can not be longer than 30 days without approval from High Command!**[/b][/i][/size] [/center] [/spoiler]

[spoiler=Duty Report]
Duty Reports are optional but are [b]highly [/b]encouraged. They help us, Supervisors, keep track of the work you do as well as any unique situation you may encounter while out on the field! Be creative, add as many details as possible!

[list]To create a duty report profile for yourself, use the format located[url=https://gov.eclipse-rp.net/viewtopic.php?f=755&t=10691] here[/url]. 
[*]Copy and paste the format in a new post [url=https://gov.eclipse-rp.net/viewforum.php?f=755]here[/url] and fill it out accordingly! The subject should be "[Duty Reports] Fname Lname".
[*]After creating the topic with your name, further Duty Reports will go [b]into the same topic[/b].
[/list] [/spoiler]

[spoiler=Email Format]
[img]https://i.ibb.co/cXr7XYkS/HNP4ks-W.png[/img]
[divbox=white]
[list][b]This is the [url=https://gov.eclipse-rp.net/viewtopic.php?t=106081#13.2.1]email format[/url] you [b][u]need [/u][/b]to use when writing someone an email on the government website![/b][/list]
[/spoiler]

[spoiler=IA Report]
You will have business with Internal Affairs (IA) when you encounter (or do) something on duty such as:
[list]
[*]Any type of harassment
[*]Any type of misconduct
[*]Any type of bullying
[*]Et cetera
[/list]
IA Reports can go both ways. You can report, or be reported for any of the above. IA Reports are handled with maximum privacy and should absolutely not be discussed as 'small talk' in any way shape or form. 
You can always file an IA report should you witness any of the above, once an IA report is submitted it will be investigated and handled by High Command. Once you submit a report, you need to be [b]patient[/b] and wait for a response. You will not be skipped, these things take time, please have patience!

To file an IA Report you should:
[list]Navigate to the [url=https://gov.eclipse-rp.net/viewtopic.php?f=580&t=39097]Internal Affairs[/url] page.
[*]Simply follow the steps found there and submit the report after carefully writing it out.[/list][/spoiler]

[spoiler=Resignation]
Unfortunately, resignations must also be a thing. Filing one is definitely something that nobody wants to do, especially early on in their career. We hope you won't be using this format any time soon, when you do, here's how:

[list]Use the format located [url=https://gov.eclipse-rp.net/viewtopic.php?f=614&t=31818]here[/url].
[*]Copy and paste the format into a new post, fill it out and say your goodbyes before heading out for the last time!
[/list]


[/spoiler]

Sincerely,

${signatureImg}
[size=130][b]${nameLine}[/b][/size]
[size=110][b]${rankLine}[/b][/size]
[i][b]Los Santos Emergency Medical Services[/b][/i]
[/divbox]
[lsemsfooter][/lsemsfooter]`;
  },
};
