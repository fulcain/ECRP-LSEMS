import { REDTemplateDefinition } from "./types";

export const discordInviteTemplate: REDTemplateDefinition = {
  value: "discord-invite",
  label: "(( Discord Invite ))",
  accent: "from-indigo-500/25 via-blue-500/15 to-transparent",
  border: "border-indigo-400/30",
  badge: "bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-400/40",
  renderBody: () =>
    `[lsemssubtitle][ooc]DISCORD INVITATION[/ooc][/lsemssubtitle]
[divbox=white][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]Los Santos Emergency Medical Services[/size][/b]
[size=115]((LSEMS Discord Invite))[/size][/font][/right][/aligntable]
[hr]
[b](([/b]Dear Applicant,

Kindly find linked below an invitation link to the LSEMS Discord. Once you join, change your nickname to your In Character name. You will be directly guided to the #Interview-Lobby where you will find information regarding the Out of Character Interview. Simply use the format provided in the channel to give your available times for an interview and a member or RED will be there to assist you. Remember to still respond to the IC topic with your availability in order to schedule the In Character portion of the Interview.

Discord Link: [url]https://discord.gg/3nysTssuMw[/url][b]))[/b]
[hr]
Sincerely,

[size=100]Recruitment and Employment Division[/size]
[i][b]Los Santos Emergency Medical Services[/b][/i]
[/divbox]
[LSEMSfooter][/LSEMSfooter]`,
};
