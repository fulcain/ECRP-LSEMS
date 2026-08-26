import { supervisorMeetingTemplate } from "./supervisor";
import { divisionalMeetingTemplate } from "./divisional";
import { allHandsMeetingTemplate } from "./all-hands";

export type { MeetingType, MeetingAgendaContext, MeetingAgendaDefinition } from "./types";

export const meetingTemplates = [
  supervisorMeetingTemplate,
  divisionalMeetingTemplate,
  allHandsMeetingTemplate,
];
