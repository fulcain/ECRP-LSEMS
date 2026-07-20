import type React from "react";

export type MeetingType = "supervisor" | "divisional";

export type MeetingAgendaContext = {
  meetingDate: string;
  meetingTime: string;
  urlDate: string;
  hours: string;
  minutes: string;
  medicName: string;
  medicRank: string;
  medicSignature: string;
};

export type MeetingAgendaDefinition = {
  value: MeetingType;
  label: string;
  accent: string;
  border: string;
  badge: string;
  forumUrl: string;
  renderSubject: (date: string) => string;
  renderBody: (context: MeetingAgendaContext) => string;
  steps: React.ReactNode[];
};
