import { writeFile } from "node:fs/promises";

import { AR } from "@/app/constants/divisions/ar";
import { BLS } from "@/app/constants/divisions/bls";
import { RED } from "@/app/constants/divisions/red";
import { divisions } from "@/app/constants/divisions";
import { DISCUSSION_BOARDS } from "@/app/constants/divisions/discussion-boards";
import { BLS_LISTING, BLS_PAPERWORK } from "@/app/(routes)/divisions/bls/components/paperwork-documents";
import { RED_PAPERWORK } from "@/app/(routes)/divisions/red/components/paperwork-documents";
import { AR_PAPERWORK } from "@/app/(routes)/divisions/ar/components/paperwork-documents";
import { UPCOMING_COURSES, UPCOMING_COURSES_LISTING } from "@/configs/bls-upcoming-courses";
import { blsTemplates } from "@/app/templates/bls-formats";
import { COURSE_REPORTS, renderCourseReport } from "@/app/templates/bls-formats/course-report";
import { redTemplates, OFFER_HOURS, OFFER_TIERS } from "@/app/templates/red-formats";
import { arTemplates } from "@/app/templates/ar-formats";
import { generateDiscussionBoardBody } from "@/app/templates/general/division-emails";
import type { PaperworkConfig, PaperworkField, PaperworkFormat, PaperworkGroup } from "@/lib/paperwork/schema";
import { validatePaperworkConfig } from "@/lib/paperwork/schema";
import { INPUT_LIMITS } from "@/lib/validation";

const builtins = new Set([
  "staff.name", "staff.rank", "staff.signature", "staff.director",
  "division.label", "division.rank", "utc.date", "utc.time",
]);

function labelFor(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}

function fieldsFor(template: string, required: readonly string[] = []): PaperworkField[] {
  const keys = [...template.matchAll(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g)]
    .map((match) => match[1])
    .filter((key, index, all) => !builtins.has(key) && all.indexOf(key) === index);
  return keys.map((key) => ({
    key,
    type: ["reasons", "information", "nextStep", "questions", "details", "listingOutput"].includes(key) ? "textarea" : "text",
    label: labelFor(key),
    required: required.includes(key),
    ...(key === "govLink" ? { type: "url" as const, required: false } : {}),
  }));
}

function actions(title?: string, open = true) {
  return [
    { id: "copyTemplate", kind: "copy_template" as const, label: "Copy Template", variant: "outline" as const },
    ...(title ? [{ id: "copyTitle", kind: "copy_subject" as const, label: "Copy Title", variant: "outline" as const }] : []),
    ...(open ? [{ id: "copyOpenGov", kind: "copy_open" as const, label: "Copy & Open GOV", content: "{{govLink}}", requiresField: "govLink", variant: "outline" as const }] : []),
  ];
}

function makeFormat(
  key: string,
  label: string,
  hint: string,
  template: string,
  options: { title?: string; fields?: PaperworkField[]; open?: boolean; subject?: string } = {},
): PaperworkFormat {
  const fields = options.fields ?? fieldsFor(template);
  if (options.open !== false && !fields.some((field) => field.key === "govLink")) {
    fields.unshift({ key: "govLink", type: "url", label: "GOV Link", required: false });
  }
  const title = options.title
    ? `${options.title}${template.includes("{{applicantName}}") ? " - {{applicantName}}" : ""}`
    : undefined;
  return {
    key,
    label,
    hint: hint || `${label}.`,
    ...(options.subject ?? title ? { subject: options.subject ?? title } : {}),
    template,
    fields,
    actions: actions(title, options.open !== false),
  };
}

function groupsFromPicker(
  picker: readonly { label: string; hint?: string; documents: readonly { value: string; label: string; hint: string }[] }[],
  formats: readonly { value: string; label: string; titleTag?: string; renderBody: (context: never) => string }[],
  extras: Record<string, string> = {},
  context: never = {} as never,
): PaperworkGroup[] {
  return picker.map((group) => ({
    label: group.label,
    ...(group.hint ? { hint: group.hint } : {}),
    formats: group.documents.map((doc) => {
      const source = formats.find((format) => format.value === doc.value);
      const template = extras[doc.value] ?? (source ? source.renderBody(context) : "{{builderOutput}}");
      return makeFormat(
        doc.value.replace(/-([a-z])/g, (_m, letter: string) => letter.toUpperCase()),
        doc.label,
        doc.hint,
        template,
        { title: source?.titleTag, open: doc.value !== "blsDiscussionBoard" && doc.value !== "blsSeniorInstructorBoard" && doc.value !== "redDiscussionBoard" },
      );
    }),
  }));
}

const blsTemplateContext = {
  applicant: "{{applicantName}}",
  reasons: ["{{reason1}}", "{{reason2}}"],
  medicName: "{{staff.name}}",
  medicRank: "{{staff.rank}} | {{division.rank}}",
  medicSignature: "{{staff.signature}}",
  cooldownDays: 7,
  reapplyDate: "{{reapplyDate}}",
  courseDate: "{{courseDate}}",
  courseTime: "{{courseTime}}",
};

const blsExtras: Record<string, string> = {
  [BLS_LISTING]: "{{listingOutput}}",
  blsDiscussionBoard: "{{boardPost}}",
  blsSeniorInstructorBoard: "{{boardPost}}",
};
for (const report of COURSE_REPORTS) {
  blsExtras[report.value] = renderCourseReport({
    type: report.value,
    date: "{{date}}",
    time: "{{time}}",
    instructors: ["{{instructors}}"],
    location: "{{location}}",
    graduates: ["{{graduates}}"],
    guideEmailSent: true,
    fundsObtained: "{{fundsObtained}}",
    moneyGivenToGovernment: true,
    receiptUrl: "{{receiptUrl}}",
    officers: ["{{officers}}"],
    students: ["{{students}}"],
    receiptWeazelUrl: "{{receiptWeazelUrl}}",
    medicName: "{{staff.name}}",
    medicRank: "{{staff.rank}} | {{division.rank}}",
    medicSignature: "{{staff.signature}}",
  });
}

const blsGroups = groupsFromPicker(BLS_PAPERWORK, blsTemplates, blsExtras, blsTemplateContext as never);
for (const group of blsGroups) {
  for (const format of group.formats) {
    if (format.key === "courseListing") {
      format.fields = [
        { key: "courseType", type: "select", label: "What are you doing?", hint: "Add a class, move one, or strike one off.", required: true, defaultValue: "new", options: UPCOMING_COURSES.map((entry) => ({ value: entry.value, label: entry.label })) },
        { key: "courseDate", type: "date", label: "Course date (UTC)", hint: "Used for the listing line and timezone image.", required: false },
        { key: "courseTime", type: "time", label: "Course time (UTC)", required: false, defaultValue: "12:00" },
        { key: "previousDate", type: "date", label: "Previous date (UTC)", hint: "The original slot, struck through when rescheduling.", required: false, visibleWhen: { field: "courseType", equals: "reschedule" } },
        { key: "previousTime", type: "time", label: "Previous time (UTC)", required: false, visibleWhen: { field: "courseType", equals: "reschedule" } },
        { key: "instructor", type: "text", label: "Instructor name", placeholder: "First Last", required: false, max: INPUT_LIMITS.name },
        { key: "listingOutput", type: "textarea", label: "Generated listing block", required: false },
      ];
      format.generator = {
        kind: "course_listing",
        actionField: "courseType",
        dateField: "courseDate",
        timeField: "courseTime",
        previousDateField: "previousDate",
        previousTimeField: "previousTime",
        instructorField: "instructor",
        outputField: "listingOutput",
      };
      format.actions = [
        { id: "generateListing", kind: "generate_course_listing", label: "Generate" },
        { id: "copyOpenListing", kind: "copy_open", label: "Copy & Open Listing", content: "https://gov.eclipse-rp.net/posting.php?mode=edit&p=55540", variant: "outline" },
        { id: "copyListingBlock", kind: "copy_template", label: "Copy BBCode" },
        { id: "resetListing", kind: "reset", label: "Clear", variant: "outline" },
      ];
    }
    if (["joint", "normal", "ots"].includes(format.key)) {
      format.fields.push(
        { key: "date", type: "date", label: "Course date", required: true },
        { key: "time", type: "time", label: "Course time", required: true, defaultValue: "12:00" },
        { key: "instructors", type: "textarea", label: "Instructors", required: true },
        { key: "graduates", type: "textarea", label: "Graduates", required: format.key !== "ots" },
        { key: "location", type: "select", label: "Location", required: true, defaultValue: "Pillbox MD", options: [{ value: "Pillbox MD", label: "Pillbox MD" }, { value: "Paleto MD", label: "Paleto MD" }] },
        { key: "fundsObtained", type: "number", label: "Funds obtained", required: format.key !== "joint" },
        { key: "receiptUrl", type: "url", label: "Funds receipt", required: false },
        { key: "guideEmailSent", type: "checkbox", label: "BLS Guide email sent", defaultValue: false },
        { key: "moneyGivenToGovernment", type: "checkbox", label: "Money given to Government", defaultValue: false },
        ...(format.key === "ots" ? [
          { key: "officers", type: "textarea" as const, label: "Officer(s)", required: true },
          { key: "students", type: "textarea" as const, label: "Students", required: true },
          { key: "receiptWeazelUrl", type: "url" as const, label: "Weazel receipt", required: false },
        ] : []),
      );
      format.actions = [
        { id: "copyReport", kind: "copy_template", label: "Copy Report", variant: "outline" },
        { id: "copyOpenReport", kind: "copy_open", label: "Copy & Open GOV", content: format.key === "joint" ? "https://gov.eclipse-rp.net/viewtopic.php?t=222067" : "https://gov.eclipse-rp.net/viewtopic.php?t=129042", variant: "outline" },
        { id: "resetReport", kind: "reset", label: "Reset", variant: "outline" },
      ];
    }
    if (format.key === "blsDiscussionBoard" || format.key === "blsSeniorInstructorBoard") {
      const boardKey = format.key as "blsDiscussionBoard" | "blsSeniorInstructorBoard";
      const board = DISCUSSION_BOARDS[boardKey];
      const division = divisions.find((entry) => entry.key === "bls");
      format.fields = [
        { key: "subject", type: "text", label: "Subject", required: true, max: 150 },
        { key: "boardPost", type: "textarea", label: "Post", required: true, max: 50000 },
      ];
      format.subject = "{{subject}}";
      format.template = generateDiscussionBoardBody({
        medicCredentials: { name: "{{staff.name}}", rank: "{{staff.rank}}", signature: "{{staff.signature}}", directorRole: undefined as never },
        division: division?.data,
        divisionLabel: division?.label,
        subject: "{{subject}}",
        date: "{{utc.date}}",
      }).replace("MESSAGE TEXT GOES HERE", "{{boardPost}}");
      format.actions = [
        { id: "copyBoard", kind: "copy_template", label: "Copy Post", variant: "outline" },
        { id: "openBoard", kind: "copy_open", label: "Copy & Open GOV", content: board.url, variant: "outline" },
        { id: "resetBoard", kind: "reset", label: "Reset", variant: "outline" },
      ];
    }
  }
}

const redContext = {
  applicant: "{{applicantName}}",
  reasons: ["{{reason1}}", "{{reason2}}"],
  medicName: "{{staff.name}}",
  medicRank: "{{staff.rank}} / {{division.rank}}",
  medicSignature: "{{staff.signature}}",
  denialType: "{{denialType}}" as "IC",
  applyOtherChar: "{{applyOtherChar}}" as "may",
  weeks: 2,
  employmentRank: "{{employmentRank}}",
  offerTier: "EMTs",
  interviewDate: "{{interviewDate}}",
  interviewTime: "{{interviewTime}}",
};
const redExtras: Record<string, string> = {
  redDiscussionBoard: "{{boardPost}}",
};
  for (const [tier, hours] of Object.entries(OFFER_HOURS)) {
  redExtras[`offerTier:${tier}`] = hours;
}
const redGroups = groupsFromPicker(RED_PAPERWORK, redTemplates, redExtras, redContext as never);
for (const group of redGroups) {
  for (const format of group.formats) {
    const source = redTemplates.find((entry) => entry.value.replace(/-([a-z])/g, (_m: string, c: string) => c.toUpperCase()) === format.key);
    if (source) {
      format.template = source.renderBody(redContext as never);
      if (format.key === "reinstatementOffer") {
        format.template = format.template.replace(OFFER_HOURS.EMTs, "{{offerHours}}");
      }
    }
    if (format.key === "redDiscussionBoard") {
      const board = DISCUSSION_BOARDS.redDiscussionBoard;
      const division = divisions.find((entry) => entry.key === "red");
      format.fields = [
        { key: "subject", type: "text", label: "Subject", required: true, max: 150 },
        { key: "boardPost", type: "textarea", label: "Post", required: true, max: 50000 },
      ];
      format.subject = "{{subject}}";
      format.template = generateDiscussionBoardBody({
        medicCredentials: { name: "{{staff.name}}", rank: "{{staff.rank}}", signature: "{{staff.signature}}", directorRole: undefined as never },
        division: division?.data,
        divisionLabel: division?.label,
        subject: "{{subject}}",
        date: "{{utc.date}}",
      }).replace("MESSAGE TEXT GOES HERE", "{{boardPost}}");
      format.actions = [
        { id: "copyBoard", kind: "copy_template", label: "Copy Post", variant: "outline" },
        { id: "openBoard", kind: "copy_open", label: "Copy & Open GOV", content: board.url, variant: "outline" },
        { id: "resetBoard", kind: "reset", label: "Reset", variant: "outline" },
      ];
    }
    if (format.key.startsWith("reinstatement")) {
      format.fields.push({ key: "offerTier", type: "select", label: "Employment tier", required: format.key === "reinstatementOffer", defaultValue: "EMTs", options: OFFER_TIERS.map((tier) => ({ value: tier, label: tier })) });
      format.fields.push({ key: "offerHours", type: "text", label: "Required hours", required: false, defaultValue: OFFER_HOURS.EMTs });
    }
    if (format.key === "feedbackRequest" || format.key === "frdFeedbackRequest") {
      format.fields.push({ key: "recipient", type: "text", label: "Recipient", required: true });
    }
  }
}

const pilotAnswers = ["radioCalls", "helipadInspection", "medevacLanding", "questions", "radioProtocolRating", "helicopterSafetyRating", "practicePerformance", "strengthsWeaknesses", "collisions", "basketRescue", "courseFlightSafety", "landings", "courseCollisions", "handling", "confidence", "courseTime", "trialTime", "trialComments", "finalThoughts", "status"];
const mrAnswers = ["kamachoDriving", "kamachoPolicies", "callsignBriefing", "securingRating", "hillsStruggle", "citySpeedLaws", "practiceRating", "offroadStruggle", "roadSituation", "roadsHandling", "summitTrek", "summitTime", "summitStalls", "summitHandling", "summitSpeed", "summitConfidence", "descentTrek", "descentStalls", "descentHandling", "descentConfidence", "finalComments", "result"];
function answerObject(keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, `{{${key}}}`]));
}
const arGroups = AR_PAPERWORK.map((group) => ({
  label: group.label,
  ...(group.hint ? { hint: group.hint } : {}),
  formats: group.documents.map((doc) => {
    const source = arTemplates.find((entry) => entry.value === doc.value)!;
    let template: string;
    let fields: PaperworkField[];
    if (doc.value === "certification") {
      template = source.renderBody({ studentName: "{{studentName}}", answers: answerObject(pilotAnswers) as never, instructorName: "{{staff.name}}", instructorRank: "{{division.rank}}", instructorSignature: "{{staff.signature}}" } as never);
      fields = [
        { key: "studentName", type: "text", label: "Student name", required: true },
        ...pilotAnswers.map((key) => ({ key, type: key === "finalThoughts" || key === "trialComments" || key === "strengthsWeaknesses" ? "textarea" as const : "text" as const, label: labelFor(key), required: true })),
      ];
    } else if (doc.value === "mr-certification") {
      template = source.renderBody({ studentName: "{{studentName}}", completionDate: "{{completionDate}}", answers: answerObject(mrAnswers) as never, instructorName: "{{staff.name}}", instructorRank: "{{division.rank}}", instructorSignature: "{{staff.signature}}" } as never);
      fields = [
        { key: "studentName", type: "text", label: "Student name", required: true },
        { key: "completionDate", type: "date", label: "Completion date", required: true },
        ...mrAnswers.map((key) => ({ key, type: key === "finalComments" ? "textarea" as const : "text" as const, label: labelFor(key), required: true })),
      ];
    } else if (doc.value.endsWith("certificate")) {
      template = source.renderBody({ studentName: "{{studentName}}", completionDate: "{{completionDate}}", certifiedBy: "{{certifiedBy}}" } as never);
      fields = [
        { key: "studentName", type: "text", label: "Student name", required: true },
        { key: "completionDate", type: "date", label: "Completion date", required: true },
        { key: "certifiedBy", type: "staff", label: "Certified by", source: "rank", required: true },
      ];
    } else {
      template = source.renderBody({ name: "{{staff.name}}", rank: "{{division.rank}}", date: "{{date}}", time: "{{time}}", information: "{{information}}", nextStep: "{{nextStep}}" } as never);
      fields = [
        { key: "date", type: "date", label: "Date", required: true },
        { key: "time", type: "time", label: "Time", required: true },
        { key: "information", type: "textarea", label: "Information", required: true },
        { key: "nextStep", type: "textarea", label: "What was the student instructed to do next", required: true },
      ];
    }
    fields.push({ key: "govLink", type: "url", label: "GOV Link", required: false });
    return makeFormat(doc.value.replace(/-([a-z])/g, (_m: string, c: string) => c.toUpperCase()), doc.label, doc.hint, template, {
      fields,
      open: true,
      subject: "{{studentName}}",
    });
  }),
}));

function configFor(
  key: string,
  label: string,
  description: string,
  emblem: string,
  icon: string,
  imageSize: string,
  image: string,
  quickLinks: readonly { name: string; url: string }[],
  ranks: readonly { name: string; id: string | null }[],
  groups: PaperworkGroup[],
): PaperworkConfig {
  const roleAliases: Record<string, string> = {
    "Head of BLS": "HeadOfBLS", "Assistant Head of BLS": "AssistantHeadOfBLS", "Senior BLS Instructor": "SeniorBLSInstructor",
    "Head of RED": "HeadOfRED", "Assistant Head of RED": "AssistantHeadOfRED", "Senior Handler": "SeniorHandler",
    "Head of AR": "HeadOfAR", "Assistant Head of AR": "AssistantHeadOfAR", "Senior Flight Instructor": "SeniorFlightInstructor", "Flight Instructor": "FlightInstructor", "Senior Pilot": "SeniorPilot", Pilot: "Pilot", "Student Pilot": "StudentPilot", "Senior Mountain Rescue Instructor": "SeniorMountainRescueInstructor", "Mountain Rescue Instructor": "MountainRescueInstructor",
  };
  return {
    version: 1,
    origin: "legacy-migration",
    division: {
      key,
      label,
      description,
      emblem,
      icon,
      imageSize,
      image,
      ranks: ranks.map((rank) => ({ alias: roleAliases[rank.name] ?? rank.name.replace(/[^A-Za-z0-9]/g, ""), ...rank })),
      quickLinks: [...quickLinks],
      pages: [{
        key: "paperwork",
        label: "Paperwork",
        purpose: "Pick what you are writing, fill it in, then copy it into GOV - the extension pastes it in for you.",
        groups,
      }],
    },
  };
}

const BLS_CONFIG = configFor("bls", BLS.label, "Basic Life Support Division paperwork.", BLS.image, "BookOpen", BLS.data.imageSize, BLS.data.image, BLS.data.quickLinks, BLS.data.ranks, blsGroups);
const RED_CONFIG = configFor("red", RED.label, "Recruitment and Employment Division paperwork.", RED.image, "UsersRound", RED.data.imageSize, RED.data.image, RED.data.quickLinks, RED.data.ranks, redGroups);
const AR_CONFIG = configFor("ar", AR.label, "Air & Rescue Division paperwork.", AR.image, "Plane", AR.data.imageSize, AR.data.image, AR.data.quickLinks, AR.data.ranks, arGroups);

for (const config of [BLS_CONFIG, RED_CONFIG, AR_CONFIG]) {
  for (const group of config.division.pages[0].groups) {
    for (const format of group.formats) {
      format.fields = [...new Map(format.fields.map((field) => [field.key, field])).values()];
    }
  }
  const validation = validatePaperworkConfig(config);
  if (!validation.ok) throw new Error(`${config.division.key}: ${validation.problems.join("; ")}`);
  await writeFile(`src/app/constants/paperwork/generated/${config.division.key}.json`, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({
  files: [BLS_CONFIG, RED_CONFIG, AR_CONFIG].map(({ division }) => ({
    key: division.key,
    formats: division.pages.flatMap((page) => page.groups.flatMap((group) => group.formats)).length,
  })),
  listingOptions: UPCOMING_COURSES.length,
  discussionBoards: Object.keys(DISCUSSION_BOARDS).filter((key) => key.startsWith("bls") || key.startsWith("red")).length,
  groups: [blsGroups, redGroups, arGroups].map((items) => items.length),
  listingName: UPCOMING_COURSES_LISTING.label,
}));
