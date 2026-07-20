import React from "react";
import { MeetingAgendaDefinition } from "./types";

const SUPERVISOR_BANNER = "https://i.ibb.co/rfydfzJh/9u-Gi-Pq-F.png";
const SUPERVISOR_LOGO = "https://i.ibb.co/7xZXVvcW/r-LIJt-NZ.png";
export const SUPERVISOR_AGENDA_URL =
  process.env.NEXT_PUBLIC_SUPERVISOR_AGENDA_URL

export const supervisorMeetingTemplate: MeetingAgendaDefinition = {
  value: "supervisor",
  label: "Supervisor Meeting",
  accent: "from-blue-500/25 via-indigo-500/15 to-transparent",
  border: "border-blue-400/30",
  badge: "bg-blue-500/20 text-blue-100 ring-1 ring-blue-400/40",
  forumUrl: "https://gov.eclipse-rp.net/posting.php?mode=post&f=1932",
  renderSubject: (date: string) => `Supervisor Meeting | ${date}`,
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

    return `[img]${SUPERVISOR_LOGO}[/img]

[divbox=white][img]${SUPERVISOR_BANNER}[/img][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]Los Santos Emergency Medical Services[/size][/b]
[size=115]Supervisor Meeting [/size]
[/right][/aligntable]
[hr]
[b]WHAT:[/b]
Los Santos Emergency Medical Services' bi-weekly Supervisory Team Meeting

[b]WHEN:[/b]
${meetingDate} at ${meetingTime} [ooc]UTC[/ooc]

[ooc][img]https://www.inyourowntime.zone/${urlDate}_${hours}.${minutes}_UTC.png[/img][/ooc]

[b]WHERE:[/b]
Pillbox Ward D

[b]WHO:[/b]
High Command
Command
Supervisor

[b]DETAILS:[/b]
[list]
[*] Please look over the [url=${SUPERVISOR_AGENDA_URL}]agenda[/url] and add any topics which you want to cover.
[*] As a reminder, we would like to keep these meetings to [b]1 hour[/b] to be respectful of everyone's time. During the meeting please be mindful of getting off-topic that way we can keep on schedule.
[*] Attendance is mandatory. Please respond below if you are unable to attend the meeting
[/list]

[hr][/hr]

Regards,

${signatureImg}
[size=130][b]${nameLine}[/b][/size]
[size=110][b]${rankLine}[/b][/size]
[i][b]Los Santos Emergency Medical Services[/b][/i]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`;
  },
  steps: [
    "Enter the meeting date and time (UTC)",
    "Click 'Generate' to create the BBCode, then 'Copy Subject Line' and paste as the topic subject",
    "Click 'Copy BBCode to Clipboard' and paste into the main meeting notes area",
    <>
      <a
        href={SUPERVISOR_AGENDA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-400 underline hover:text-indigo-300"
      >
       Agenda Document
      </a>
    </>,
    "You can also click 'Copy BBCode & Open Forum' to directly open the topic you have to post under",
    "Identify EMTs eligible for promotion based on time in rank per promotion guidelines",
    "Copy/Paste or document the eligible employees for the past 4 weeks onto the notes",
  ],
};
