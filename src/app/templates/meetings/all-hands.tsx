import { MeetingAgendaDefinition } from "./types";

const ALL_HANDS_BANNER = "https://i.ibb.co/rfydfzJh/9u-Gi-Pq-F.png";
const ALL_HANDS_LOGO = "https://i.ibb.co/7xZXVvcW/r-LIJt-NZ.png";
const ALL_HANDS_FOOTER = "https://i.ibb.co/8DqJghtt/7flpkan.png";

export const allHandsMeetingTemplate: MeetingAgendaDefinition = {
  value: "all-hands",
  label: "All Hands Meeting",
  accent: "from-emerald-500/25 via-teal-500/15 to-transparent",
  border: "border-emerald-400/30",
  badge: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40",
  forumUrl: "https://gov.eclipse-rp.net/posting.php?mode=post&f=1332",
  renderSubject: (date: string) => `All Hands Meeting | ${date}`,
  renderBody: ({
    meetingDate,
    meetingTime,
    urlDate,
    hours,
    minutes,
    medicName,
    medicRank,
    medicSignature,
  }) => {
    const signatureImg = medicSignature
      ? `[img]${medicSignature}[/img]`
      : `[img]${ALL_HANDS_FOOTER}[/img]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Operational Rank";

    return `[img]${ALL_HANDS_LOGO}[/img]
[divbox=white]
[img]${ALL_HANDS_BANNER}[/img][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]Los Santos Emergency Medical Services[/size][/b]
[size=95]"One Team, One Mission, Saving Lives"[/size][/font]
[size=115]All Hands Meeting | ${meetingDate}[/size]
[/right][/aligntable]
[hr]

[b]WHAT:[/b]
Los Santos Emergency Medical Services' All Hands Meeting

[b]WHEN:[/b]
${meetingDate} at ${meetingTime} [ooc]UTC[/ooc]

[b]WHERE:[/b]
Ward D

[b]WHO:[/b]
All Employees - please remain off duty for the interim. You will be paid for the time you are here immediately after the meeting along with your salary.

[ooc][img]https://www.inyourowntime.zone/${urlDate}_${hours}.${minutes}_UTC.png[/img][/ooc]

[hr][/hr]

See you all there!

${signatureImg}
[i]${nameLine}[/i]
[b]${rankLine}[/b]
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
  steps: [
    "Enter the meeting date and time (UTC)",
    "Click 'Generate' to create the BBCode, then 'Copy Subject Line' and paste as the topic subject",
    "Click 'Copy BBCode to Clipboard' and paste into the meeting notes area",
    "Post it",
    "(( Write a message in #announcements and ping the employee rank ))",
  ],
};
