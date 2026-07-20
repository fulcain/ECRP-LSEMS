import React from "react";
import { MeetingAgendaDefinition } from "./types";

const DIVISIONAL_BANNER = "https://i.ibb.co/rfydfzJh/9u-Gi-Pq-F.png";
const DIVISIONAL_LOGO = "https://i.ibb.co/7xZXVvcW/r-LIJt-NZ.png";
export const DIVISIONAL_AGENDA_URL =
  process.env.NEXT_PUBLIC_DIVISIONAL_AGENDA_URL

export const divisionalMeetingTemplate: MeetingAgendaDefinition = {
  value: "divisional",
  label: "Divisional Meeting",
  accent: "from-purple-500/25 via-violet-500/15 to-transparent",
  border: "border-purple-400/30",
  badge: "bg-purple-500/20 text-purple-100 ring-1 ring-purple-400/40",
  forumUrl: "https://gov.eclipse-rp.net/posting.php?mode=post&f=1983",
  renderSubject: (date: string) => `Divisional Meeting | ${date}`,
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
      : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
    const nameLine = medicName || "[i]Your Name[/i]";
    const rankLine = medicRank || "Operational Rank";

    return `[img]${DIVISIONAL_LOGO}[/img]
[divbox=white]
[img]${DIVISIONAL_BANNER}[/img][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]Los Santos Emergency Medical Services[/size][/b]
[size=115]Divisional Command Meeting [/size]
[/right][/aligntable]
[hr]
[b]WHAT:[/b]
Los Santos Emergency Medical Services Divisional Command Meeting

[b]WHEN:[/b]
${meetingDate} at ${meetingTime} [ooc]UTC[/ooc]

[b]WHERE:[/b]
Ward D

[b]WHO:[/b]
All Divisional Heads
All Assistant Divisional Heads
All Directors
Command
High Command

[b]DETAILS:[/b]
[list]
[*] Please look over the [url=${DIVISIONAL_AGENDA_URL}]agenda[/url] and add any topics which you want to cover.
[*] Please fill out the sections you are in charge of at the very least, if you are not able to attend the meeting.
[/list]

[ooc][img]https://www.inyourowntime.zone/${urlDate}_${hours}.${minutes}_UTC.png[/img][/ooc]

[hr][/hr]

Kind regards,
${signatureImg}
${nameLine}
[i][b]${rankLine}[/b][/i]
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
  steps: [
    "Enter the meeting date and time (UTC)",
    "Click 'Generate' to create the BBCode, then 'Copy Subject Line' and paste as the topic subject",
    "Click 'Copy BBCode to Clipboard' and paste into the meeting notes area",
    <>
  
      <a
        href={DIVISIONAL_AGENDA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-400 underline hover:text-indigo-300"
      >
        Agenda Document
      </a>
    </>,
    "You can also click 'Copy BBCode & Open Forum' to directly open the topic you have to post under",
  ],
};
