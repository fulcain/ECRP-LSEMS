import { supervisorMeetingTemplate } from "./supervisor";
import { divisionalMeetingTemplate } from "./divisional";

export type { MeetingType, MeetingAgendaContext, MeetingAgendaDefinition } from "./types";

export const meetingTemplates = [supervisorMeetingTemplate, divisionalMeetingTemplate];
