/**
 * Every Discord role and every division the app knows about, declared exactly
 * once - the one place a snowflake, a display name or a divisional rank list
 * exists.
 *
 * This file is both things the app needs:
 *
 *   • the **gate** - `ROUTE_ACCESS` is derived from `DIVISIONS` below, so a
 *     division's page is open to that division's own ranks, to Command+ and to
 *     its director, and to nobody else without one of those snowflakes.
 *     `userHasAccess` resolves the aliases to the ids declared here.
 *   • the **collection** - the department ladder, the divisional ranks, the
 *     directors and the staff templates all read their id *and* their display
 *     name from here.
 *
 * An entry is `{ id, name }`, edited by hand - there is no sync script:
 *   - `id`   - the Discord role snowflake, or `null` when the guild has no
 *              such role. A `null` id is inert: it can identify nobody, and a
 *              gate whose ids are all blank denies rather than opening.
 *   - `name` - the display name people read in the app. Nothing matches it
 *              against Discord, so it can say `Head of FTD` where the guild
 *              says `Head of Field Training`.
 *
 * Section order is not significant except for the department ladder, which
 * `app/constants/general/ranks.ts` re-declares in hierarchy order.
 */

import { ROUTES } from "@/configs/routes";

export type GuildRoleEntry = {
  id: string | null;
  name: string;
};

export const ROLES = {
  // ─── Access-only roles ──────────────────────────────────────────────────
  // Roles that gate routes but are not a rank anyone is listed under.
  /** The LSEMS Command position - a Command+ rank, so it opens everything. */
  Command: { id: "737482405690081371", name: "Command" },
  /**
   * The aggregate role HQ hands out on top of the Command ranks.
   *
   * Recognised, so the Staff Page and the profile can name it - but it is
   * deliberately *not* in `COMMAND_ACCESS`, which names only the Command+
   * ranks themselves (Consultant, Lieutenant, Captain, Command and the three
   * Chiefs). Add it there if HQ wants it to open every page on its own.
   */
  CommandPlusTeam: { id: "1189390497639301213", name: "Command+ Team" },
  /** Above the Command ranks; recognised for the same reason as above. */
  HighCommand: { id: "737481926943834193", name: "High Command" },
  /** LSEMS Supervisor - opens the Supervisor tools, and nothing more. */
  Supervisor: { id: "740782964157448363", name: "Supervisor" },

  // ─── Department ranks ───────────────────────────────────────────────────
  // The LSEMS ladder, highest first. Order here is documentation; the ladder
  // itself (`LSEMS_RANKS`) is ordered in `app/constants/general/ranks.ts`.
  ChiefOfEMS: { id: "459439793185488916", name: "Chief of EMS" },
  AssistantChiefOfEMS: { id: "624916991421054976", name: "Assistant Chief of EMS" },
  DeputyChiefOfEMS: { id: "459439793307123713", name: "Deputy Chief of EMS" },
  /** A position people hold rather than a rung - also gates routes. */
  Consultant: { id: "1039228533651816590", name: "Consultant" },
  Commander: { id: "459439795391823882", name: "Commander" },
  Captain: { id: "459439798491283458", name: "Captain" },
  Lieutenant: { id: "459439799359635497", name: "Lieutenant" },
  LeadParamedic: { id: "579584822494625803", name: "Lead Paramedic" },
  SeniorParamedic: { id: "459439799825072129", name: "Senior Paramedic" },
  Paramedic: { id: "554627428446765066", name: "Paramedic" },
  JuniorParamedic: { id: "993202463962320926", name: "Junior Paramedic" },
  MasterEMT: { id: "819650743228956692", name: "Master EMT" },
  /** Part-time EMT contract - outside the promotion progression. */
  EMTP: { id: "1149314508934889553", name: "EMT-P" },
  EMTAdvanced: { id: "459439804719955968", name: "EMT-Advanced" },
  EMTIntermediate: { id: "459439805885972501", name: "EMT-Intermediate" },
  EMTBasic: { id: "459439805915201556", name: "EMT-Basic" },
  EMRTrainee: { id: "459439807496585217", name: "EMR Trainee" },
  /**
   * The base membership role: every LSEMS employee holds it, whatever their
   * rank. It is deliberately *not* a rung in `LSEMS_RANKS` - it belongs to no
   * promotion step and is never offered in a rank dropdown.
   */
  Employee: { id: "463305002400743444", name: "Employee" },

  // ─── Directors ──────────────────────────────────────────────────────────
  DirectorOfOperations: { id: "459439796805173256", name: "Director of Operations" },
  DirectorOfAdministration: { id: "459439795412664340", name: "Director of Administration" },
  DirectorOfSpecialOperations: { id: "459439797757280266", name: "Director of Special Operations" },

  // ─── Division membership ────────────────────────────────────────────────
  // The role every member of a division holds, whether or not they also hold
  // one of its ranks - a division's rank list only names its leadership, so
  // without these a regular member is invisible to the app: no division entry
  // in the sidebar, no page, and nothing to recognise in the Staff Page.
  //
  // `DIVISIONS` points each division at its own entry through `membership`,
  // and that entry is part of the division's route rule.
  BLSDivision: { id: "459441018576830474", name: "BLS Division" },
  AMUDivision: { id: "708846155680710666", name: "AMU Division" },
  REDDivision: {
    id: "459441020078260224",
    name: "Recruitment and Employment Division",
  },
  ForensicsDivision: { id: "668241994815897615", name: "Forensics" },
  FRDivision: { id: "585836527578382356", name: "Fire & Rescue Division" },
  PRDivision: { id: "684487430786515064", name: "Public Relations" },
  ARDivision: { id: "459441017263751168", name: "Air & Rescue Division" },
  MountainRescueDivision: {
    id: "1097944460903583946",
    name: "Mountain Rescue",
  },
  IADivision: { id: "665671359741034497", name: "Internal Affairs" },
  // Lifeguard has one role for membership and for its base rank, so the
  // division points at `Lifeguard` rather than adding a second entry.

  // ─── Field Training (FTD) ───────────────────────────────────────────────
  FTHead: { id: "459439795635224589", name: "Head of FTD" },
  InterimHeadOfFTD: { id: null, name: "Interim Head of FTD" },
  FTAssHead: { id: "1030270859610423407", name: "Assistant Head of FTD" },
  InterimAssistantHeadOfFTD: { id: null, name: "Interim Assistant Head of FTD" },
  FTI: { id: "796493688649023518", name: "Field Training Instructor" },
  FTO: { id: "836248428971425823", name: "Field Training Officer" },
  FTOInTraining: { id: null, name: "Field Training Officer in Training" },

  // ─── Basic Life Support ─────────────────────────────────────────────────
  HeadOfBLS: { id: "565645208436604930", name: "Head of BLS" },
  InterimHeadOfBLS: { id: null, name: "Interim Head of BLS" },
  AssistantHeadOfBLS: { id: "1099082229411479614", name: "Assistant Head of BLS" },
  InterimAssistantHeadOfBLS: { id: null, name: "Interim Assistant Head of BLS" },
  SeniorBLSInstructor: { id: "1270398018885128233", name: "Senior BLS Instructor" },
  BLSInstructor: { id: null, name: "BLS Instructor" },
  BLSInstructorTrainee: { id: null, name: "BLS Instructor Trainee" },

  // ─── Advanced Medical Unit ──────────────────────────────────────────────
  HeadOfAMU: { id: "708843788700876851", name: "Head of AMU" },
  InterimHeadOfAMU: { id: null, name: "Interim Head of AMU" },
  AssistantHeadOfAMU: { id: null, name: "Assistant Head of AMU" },
  InterimAssistantHeadOfAMU: { id: "1030888742128459897", name: "Interim Assistant Head of AMU" },
  AttendingPhysicians: { id: "1268723092356858017", name: "Attending Physicians" },
  ResidentPhysicians: { id: "1492952624641605812", name: "Resident Physicians" },
  AMUNurse: { id: "1436607667513720942", name: "AMU Nurse" },
  Surgeon: { id: null, name: "Surgeon" },
  MedicalStudent: { id: "1363588792807723089", name: "Medical Student" },

  // ─── RED ────────────────────────────────────────────────────────────────
  HeadOfRED: { id: "566996097667563535", name: "Head of RED" },
  InterimHeadOfRED: { id: null, name: "Interim Head of RED" },
  AssistantHeadOfRED: { id: null, name: "Assistant Head of RED" },
  InterimAssistantHeadOfRED: { id: "1147266557060337724", name: "Interim Assistant Head of RED" },
  SeniorHandler: { id: "1268336808354119833", name: "Senior Handler" },
  ApplicationHandler: { id: null, name: "Application Handler" },
  ProbationaryApplicationHandler: { id: null, name: "Probationary Application Handler" },

  // ─── Public Relations ───────────────────────────────────────────────────
  HeadOfPR: { id: "1034485534015377459", name: "Head of PR" },
  InterimHeadOfPR: { id: null, name: "Interim Head of PR" },
  AssistantHeadOfPR: { id: "1099775973894914128", name: "Assistant Head of PR" },
  InterimAssistantHeadOfPR: { id: null, name: "Interim Assistant Head of PR" },
  SeniorPublicRelationsRepresentative: { id: "1240327660433969213", name: "Senior Public Relations Representative" },
  PublicRelationsRepresentative: { id: null, name: "Public Relations Representative" },
  PublicRelationsTrainee: { id: null, name: "Public Relations Trainee" },

  // ─── Fire & Rescue / Fire Safety ────────────────────────────────────────
  // Both divisions are led by the same four roles, so they share these entries.
  HeadOfFR: { id: "588135936374734848", name: "Head of F&R" },
  InterimHeadOfFR: { id: null, name: "Interim Head of F&R" },
  AssistantHeadOfFR: { id: "905201704830664735", name: "Assistant Head of F&R" },
  InterimAssistantHeadOfFR: { id: null, name: "Interim Assistant Head of F&R" },
  SeniorFirefighterInstructor: { id: null, name: "Senior Firefighter Instructor" },
  FirefighterInstructor: { id: "1278870071405576266", name: "Firefighter Instructor" },
  Firefighter: { id: null, name: "Firefighter" },
  ProbationaryFireFighter: { id: null, name: "Probationary Fire Fighter" },
  ProbationaryFirefighter: { id: null, name: "Probationary Firefighter" },
  TraineeFirefighter: { id: null, name: "Trainee Firefighter" },
  FireMarshall: { id: null, name: "Fire Marshall" },
  FireSafetyInspector: { id: "1003034200242401280", name: "Fire Safety Inspector" },
  TraineeFireSafetyInspector: { id: null, name: "Trainee Fire Safety Inspector" },

  // ─── Forensics ──────────────────────────────────────────────────────────
  HeadOfFOR: { id: "684484521122726084", name: "Head of FOR" },
  InterimHeadOfFOR: { id: null, name: "Interim Head of FOR" },
  AssistantHeadOfFOR: { id: "1067943717526323310", name: "Assistant Head of FOR" },
  InterimAssistantHeadOfFOR: { id: null, name: "Interim Assistant Head of FOR" },
  ForensicsInstructor: { id: "1268726880329142276", name: "Forensics Instructor" },
  Serologist: { id: null, name: "Serologist" },
  Pathologist: { id: null, name: "Pathologist" },
  ForensicsStudent: { id: null, name: "Forensics Student" },

  // ─── Air & Rescue (Pilot + Mountain Rescue) ─────────────────────────────
  // Shared leadership, so both divisions point at the same four entries.
  HeadOfAR: { id: "579588741950341132", name: "Head of A&R" },
  InterimHeadOfAR: { id: null, name: "Interim Head of A&R" },
  AssistantHeadOfAR: { id: "1195192928306470912", name: "Assistant Head of A&R" },
  InterimAssistantHeadOfAR: { id: null, name: "Interim Assistant Head of A&R" },
  SeniorFlightInstructor: { id: null, name: "Senior Flight Instructor" },
  FlightInstructor: { id: "1278870648772362240", name: "Flight Instructor" },
  SeniorPilot: { id: null, name: "Senior Pilot" },
  Pilot: { id: null, name: "Pilot" },
  StudentPilot: { id: null, name: "Student Pilot" },
  SeniorMountainRescueInstructor: { id: null, name: "Senior Mountain Rescue Instructor" },
  MountainRescueInstructor: { id: "1278870369935036570", name: "Mountain Rescue Instructor" },
  MountainAndRescueOperator: { id: null, name: "Mountain and Rescue Operator" },
  MountainRescueStudent: { id: null, name: "Mountain Rescue Student" },

  // ─── Lifeguard ──────────────────────────────────────────────────────────
  HeadOfLifeguard: { id: null, name: "Head of Lifeguard" },
  InterimHeadOfLifeguard: { id: "909116229959180318", name: "Interim Head of Lifeguard" },
  AssistantHeadOfLifeguard: { id: "801644852780728390", name: "Assistant Head of Lifeguard" },
  InterimAssistantHeadOfLifeguard: { id: null, name: "Interim Assistant Head of Lifeguard" },
  LifeguardInstructor: { id: "1278869812956758208", name: "Lifeguard Instructor" },
  Lifeguard: { id: "585836948376125478", name: "Lifeguard" },
  LifeguardStudent: { id: null, name: "Lifeguard Student" },

  // ─── Internal Affairs ───────────────────────────────────────────────────
  HeadOfIA: { id: "1094639353533321336", name: "Head of IA" },
  InterimHeadOfIA: { id: null, name: "Interim Head of IA" },
  AssistantHeadOfIA: { id: null, name: "Assistant Head of IA" },
  InterimAssistantHeadOfIA: { id: null, name: "Interim Assistant Head of IA" },
  SeniorInvestigator: { id: null, name: "Senior Investigator" },
  Investigator: { id: null, name: "Investigator" },
  JuniorInvestigator: { id: null, name: "Junior Investigator" },

  // ─── Crisis Response Unit (dormant) ─────────────────────────────────────
  // Marked `dormant` in `DIVISIONS` below, so it stays out of the app; the
  // ranks are declared anyway so re-enabling it needs no id hunt.
  HeadOfCRU: { id: null, name: "Head of CRU" },
  InterimHeadOfCRU: { id: null, name: "Interim Head of CRU" },
  AssistantHeadOfCRU: { id: null, name: "Assistant Head of CRU" },
  InterimAssistantHeadOfCRU: { id: null, name: "Interim Assistant Head of CRU" },
  SeniorTherapist: { id: null, name: "Senior Therapist" },
  Therapist: { id: null, name: "Therapist" },
  TherapistInTraining: { id: null, name: "Therapist in Training" },
  SeniorFirstResponder: { id: null, name: "Senior First Responder" },
  FirstResponder: { id: null, name: "First Responder" },
  CrisisResponseRecruit: { id: null, name: "Crisis Response Recruit" },

  // ─── Other guild roles ──────────────────────────────────────────────────
  // Roles the guild has that no page is gated on. Declared so every id the
  // guild uses has one home here, and so a member holding one sees it named in
  // the Staff Page instead of being silently ignored.
  DivisionalHead: { id: "772290559464701964", name: "Divisional Head" },
  LeadershipTeam: { id: "1152091806675247124", name: "Leadership Team" },
  HeadOfSupervisorTrainingProgram: {
    id: "902670933658058813",
    name: "Head of the Supervisor Training Program",
  },
  DirectorOfFireDepartment: {
    id: "1012167862212903052",
    name: "Director of Fire Department",
  },
  AuditDivision: { id: "1245514080056512637", name: "Audit Division" },
  GSBAgent: { id: "1378905374291136672", name: "GSB Agent" },
  ExternalContractor: {
    id: "1128488167075491990",
    name: "Eexternal Contractor",
  },
  OnCallProgram: { id: "823265940451360809", name: "On Call Program" },
  InTimeOutButFixed: { id: "1497431184857108480", name: "IN TIME OUT BUT FIXED" },
  EmployeeOfTheMonth: {
    id: "1125863735618179112",
    name: "Employee of the month",
  },
  Applicant: { id: "736884486779699271", name: "Applicant" },
  Guest: { id: "981527764794503188", name: "Guest" },
} as const satisfies Record<string, GuildRoleEntry>;

/** Union of every role alias in the registry. */
export type RoleName = keyof typeof ROLES;

/** A role resolved to what the divisions, directors and ladders export. */
export type RoleRef = {
  name: string;
  id: string | null;
};

/**
 * Resolve aliases to `{ name, id }` refs, in the order given - this is how a
 * division declares its rank list without repeating a name or a snowflake.
 */
export function roleRefs(...aliases: readonly RoleName[]): RoleRef[] {
  return aliases.map((alias) => ({
    name: ROLES[alias].name,
    id: ROLES[alias].id,
  }));
}

// ─── Divisions ────────────────────────────────────────────────────────────

/**
 * One division: which roles belong to it, and (when it has a page) which route
 * that page lives at.
 *
 * Declaring a division here wires it up everywhere at once:
 *   • its **page is gated** on `ranks` - see `ROUTE_ACCESS` below - plus
 *     Command+ and the `directors` declared on the entry itself, so its own
 *     members, HQ and its director can open it and nobody else.
 *   • `ranksForDivision(key)` gives `app/constants/divisions/*.ts` its rank
 *     list (display name *and* snowflake), so the division files never spell
 *     out a role.
 *   • `divisions` (`app/constants/divisions/index.ts`) is built from this
 *     object's order, so the app's division list, the quick-links page, the
 *     division templates and the staff page all follow it.
 *   • `dormant` marks a division the guild has roles for but the app does not
 *     carry (no page, no sidebar entry), so its ranks stay declared without
 *     appearing anywhere.
 */
export type Division = {
  /** Display label, e.g. `"Basic Life Support"`. */
  label: string;
  /** The division's ranks, highest first. */
  ranks: readonly RoleName[];
  /**
   * The role every member of the division holds, if the guild has one - this
   * is what makes a rank-and-file member (who holds no *rank* of the division)
   * recognisable to the app, and it opens the division's page like the ranks
   * do. `ranks` alone is leadership only, so without this a division's own
   * members can't open their page and the sidebar never shows it to them.
   */
  membership?: RoleName;
  /** The division's page. Absent => the division has no route yet. */
  route?: string;
  /**
   * The director roles that cover this division - the Director of
   * Administration looks after Basic Life Support, and so on. It is the only
   * place that coverage is written down: `general/directorRoles.ts` derives
   * each director's division list from here, and it is what opens a division's
   * page to its director.
   */
  directors?: readonly RoleName[];
  /** Declared but not part of the app - no page, no sidebar entry. */
  dormant?: boolean;
};

/**
 * Every division, in the order the app lists them (division selector, quick
 * links, staff page).
 *
 * Adding a division with a `route` gates that route automatically; adding one
 * without leaves it as a rank list that templates and paperwork can use.
 */
export const DIVISIONS = {
  /** Department-wide: no divisional ranks of its own. */
  general: { label: "General", ranks: [] },

  bls: {
    label: "Basic Life Support",
    route: ROUTES.divisions.bls,
    membership: "BLSDivision",
    ranks: [
      "HeadOfBLS",
      "InterimHeadOfBLS",
      "AssistantHeadOfBLS",
      "InterimAssistantHeadOfBLS",
      "SeniorBLSInstructor",
      "BLSInstructor",
      "BLSInstructorTrainee",
    ],
    directors: ["DirectorOfAdministration"],
  },
  amu: {
    label: "AMU",
    membership: "AMUDivision",
    ranks: [
      "HeadOfAMU",
      "InterimHeadOfAMU",
      "AssistantHeadOfAMU",
      "InterimAssistantHeadOfAMU",
      "AttendingPhysicians",
      "ResidentPhysicians",
      "AMUNurse",
      "Surgeon",
      "MedicalStudent",
    ],
    directors: ["DirectorOfSpecialOperations"],
  },
  ftd: {
    label: "Field Training",
    route: ROUTES.divisions.ftd.base,
    ranks: [
      "FTHead",
      "InterimHeadOfFTD",
      "FTAssHead",
      "InterimAssistantHeadOfFTD",
      "FTI",
      "FTO",
      "FTOInTraining",
      "Command",
      "CommandPlusTeam",
      "HighCommand",
    ],
    // Being in Field Training opens the whole workspace, every tab of it.
    directors: ["DirectorOfOperations"],
  },
  red: {
    label: "RED",
    route: ROUTES.divisions.red,
    membership: "REDDivision",
    ranks: [
      "HeadOfRED",
      "InterimHeadOfRED",
      "AssistantHeadOfRED",
      "InterimAssistantHeadOfRED",
      "SeniorHandler",
      "ApplicationHandler",
      "ProbationaryApplicationHandler",
    ],
    directors: ["DirectorOfAdministration"],
  },
  for: {
    label: "Forensics",
    membership: "ForensicsDivision",
    ranks: [
      "HeadOfFOR",
      "InterimHeadOfFOR",
      "AssistantHeadOfFOR",
      "InterimAssistantHeadOfFOR",
      "ForensicsInstructor",
      "Serologist",
      "Pathologist",
      "ForensicsStudent",
    ],
    directors: ["DirectorOfSpecialOperations"],
  },
  fr: {
    label: "Fire & Rescue",
    membership: "FRDivision",
    // Fire & Rescue and Fire Safety share their leadership roles.
    ranks: [
      "HeadOfFR",
      "InterimHeadOfFR",
      "AssistantHeadOfFR",
      "InterimAssistantHeadOfFR",
      "SeniorFirefighterInstructor",
      "FirefighterInstructor",
      "Firefighter",
      "ProbationaryFireFighter",
      "ProbationaryFirefighter",
      "TraineeFirefighter",
    ],
    directors: ["DirectorOfOperations"],
  },
  fs: {
    label: "Fire Safety",
    ranks: [
      "HeadOfFR",
      "InterimHeadOfFR",
      "AssistantHeadOfFR",
      "InterimAssistantHeadOfFR",
      "FireMarshall",
      "FireSafetyInspector",
      "TraineeFireSafetyInspector",
    ],
    directors: ["DirectorOfOperations"],
  },
  pr: {
    label: "Public Relations",
    membership: "PRDivision",
    ranks: [
      "HeadOfPR",
      "InterimHeadOfPR",
      "AssistantHeadOfPR",
      "InterimAssistantHeadOfPR",
      "SeniorPublicRelationsRepresentative",
      "PublicRelationsRepresentative",
      "PublicRelationsTrainee",
    ],
    directors: ["DirectorOfAdministration"],
  },
  mountainRescue: {
    label: "Mountain Rescue",
    membership: "MountainRescueDivision",
    // Air & Rescue leadership is shared with the Pilot division.
    ranks: [
      "HeadOfAR",
      "InterimHeadOfAR",
      "AssistantHeadOfAR",
      "InterimAssistantHeadOfAR",
      "SeniorMountainRescueInstructor",
      "MountainRescueInstructor",
      "MountainAndRescueOperator",
      "MountainRescueStudent",
    ],
    directors: ["DirectorOfOperations"],
  },
  pilot: {
    label: "Pilot",
    membership: "ARDivision",
    ranks: [
      "HeadOfAR",
      "InterimHeadOfAR",
      "AssistantHeadOfAR",
      "InterimAssistantHeadOfAR",
      "SeniorFlightInstructor",
      "FlightInstructor",
      "SeniorPilot",
      "Pilot",
      "StudentPilot",
    ],
    directors: ["DirectorOfOperations"],
  },
  lifeguard: {
    label: "Lifeguard",
    // One role covers membership and the base rank here, so it is the same
    // entry in both places.
    membership: "Lifeguard",
    ranks: [
      "HeadOfLifeguard",
      "InterimHeadOfLifeguard",
      "AssistantHeadOfLifeguard",
      "InterimAssistantHeadOfLifeguard",
      "LifeguardInstructor",
      "Lifeguard",
      "LifeguardStudent",
    ],
  },
  ia: {
    label: "Internal Affairs",
    membership: "IADivision",
    ranks: [
      "HeadOfIA",
      "InterimHeadOfIA",
      "AssistantHeadOfIA",
      "InterimAssistantHeadOfIA",
      "SeniorInvestigator",
      "Investigator",
      "JuniorInvestigator",
    ],
  },
  cru: {
    label: "CRU",
    ranks: [
      "HeadOfCRU",
      "InterimHeadOfCRU",
      "AssistantHeadOfCRU",
      "InterimAssistantHeadOfCRU",
      "SeniorTherapist",
      "Therapist",
      "TherapistInTraining",
      "SeniorFirstResponder",
      "FirstResponder",
      "CrisisResponseRecruit",
    ],
    dormant: true,
  },
} as const satisfies Record<string, Division>;

/** Key of a division in `DIVISIONS`, e.g. `"bls"`. */
export type DivisionKey = keyof typeof DIVISIONS;

/**
 * `DIVISIONS` as `[key, division]` pairs, in declaration order.
 *
 * `DIVISIONS` is `as const`, so with a `DivisionKey` alone TypeScript only
 * knows the fields every entry has - iterating the pairs widens each entry to
 * `Division`, which is what makes the optional `route`/`access`/`dormant`
 * readable.
 */
export const DIVISION_ENTRIES: ReadonlyArray<readonly [DivisionKey, Division]> =
  Object.entries(DIVISIONS) as ReadonlyArray<readonly [DivisionKey, Division]>;

/**
 * One division, widened to `Division` - `DIVISIONS` is `as const`, so indexing
 * it with a key of its own union only exposes the fields every entry shares,
 * which hides the optional ones (`route`, `membership`, `directors`, ...).
 */
function divisionFor(key: DivisionKey): Division {
  return DIVISIONS[key] as Division;
}

/**
 * A division's ranks as `{ name, id }` refs, highest first - what the division
 * files in `app/constants/divisions/*.ts` render and resolve members against.
 */
export function ranksForDivision(key: DivisionKey): RoleRef[] {
  return roleRefs(...DIVISIONS[key].ranks);
}

/**
 * The role that marks plain membership of a division, if the guild has one -
 * what an ordinary member holds when they hold none of the division's ranks.
 *
 * Returns `undefined` for a division that has no such role (or whose ids are
 * still blank), which is the case the app must keep working in: membership is
 * an extra way in, never the only one.
 */
export function membershipForDivision(key: DivisionKey): RoleRef | undefined {
  const alias = divisionFor(key).membership;
  if (!alias) return undefined;
  return { name: ROLES[alias].name, id: ROLES[alias].id };
}

// ─── Access invariants ────────────────────────────────────────────────────
//
// **Who may open what does not live in this file.** It lives in the
// `access-matrix` item of the Vercel Global Config, edited in the app.
//
// This file used to declare a rule per route (`ROUTE_ACCESS`, derived from the
// divisions below), and that rule was the second copy of every decision: the
// editor showed a row's config rule, a stored row replaced it, and the two could
// describe the same page differently. There is one answer now, and it is the
// store's.
//
// What is left here is the part the store must never be able to decide:
//
//   • `EVERY_PAGE_ROLES` - HQ, which no row may take a page away from;
//   • `DEFAULT_PAGE_ROLES` - what a page opens to when the store has no row for
//     it, so a missing row reads as a wide default rather than a closed door;
//   • `ADMIN_PAGES` - the permission editor itself, which no stored value can
//     open or close, because a gate that can be edited away is not a gate.
//
// The rest of this file is the data everything else reads: `ROLES`, and the
// divisions - each with its `ranks`, its `membership` role, its `directors` and
// the page it owns. Those ranks are what templates, paperwork and the Staff Page
// resolve members against, which is why they stay declared here.

/**
 * The ranks HQ is made of: Consultant, Lieutenant, Captain, Command and the
 * three Chief ranks. Listed here because it is the Command ranks' *membership*,
 * read by more than the gate - and folded into `EVERY_PAGE_ROLES` below.
 */
export const COMMAND_ACCESS: readonly RoleName[] = [
  "Consultant",
  "Lieutenant",
  "Captain",
  "Command",
  "ChiefOfEMS",
  "AssistantChiefOfEMS",
  "DeputyChiefOfEMS",
];

/**
 * The roles no stored row may lock out of a page.
 *
 * `COMMAND_ACCESS` is the department's own command ladder, and `CommandPlusTeam`
 * is the team that administers the permission matrix: a page can be narrowed,
 * but never against HQ, and never against the people deciding. It is applied at
 * decision time rather than written into each rule, so a row that leaves these
 * roles out changes who *else* gets in and nothing more.
 *
 * The Access Manager is the deliberate exception - it is `CommandPlusTeam`'s own
 * page and is closed to the Command ranks, the one route this list does not
 * reach.
 */
export const EVERY_PAGE_ROLES: readonly RoleName[] = [
  ...COMMAND_ACCESS,
  "CommandPlusTeam",
];

/**
 * What a page opens to when the store holds no row for it.
 *
 * One role, deliberately: `Employee` is every member of the department, so a
 * route nobody has ruled on is open to everyone rather than closed to everyone.
 * Rotating the store's read token, or a page added before its row, then costs
 * visibility nobody asked for instead of an outage - and the editor shows the
 * fallback as the row's value, so narrowing one is a single edit away.
 *
 * This is the one place a wide default is the right answer; the editor is where
 * it gets narrowed.
 */
export const DEFAULT_PAGE_ROLES: readonly RoleName[] = ["Employee"];

/**
 * The pages only `CommandPlusTeam` may open - the live permission editor.
 *
 * Deliberately not store-driven: `isAdminOnlyPath` refuses a stored row for
 * these paths, and `ADMIN_PAGE_ROLES` is what they are gated on instead, so the
 * page that decides access can not be opened - or closed - from inside itself.
 * `DISCORD_ADMIN_IDS` (`ADMIN_USER_IDS`) still bypasses every rule, which is how
 * the developer reaches the page regardless of Discord roles.
 *
 * Deliberately *not* `...COMMAND_ACCESS` either: the Command ranks do not manage
 * the matrix, and holding a Command rank must not become a way to grant yourself
 * one.
 */
export const ADMIN_PAGES: readonly string[] = [ROUTES.management.access];

/** The roles a page in `ADMIN_PAGES` opens to. Never merged into, never stored. */
export const ADMIN_PAGE_ROLES: readonly RoleName[] = ["CommandPlusTeam"];

/**
 * Whether `pathname` is one of `ADMIN_PAGES` - the CommandPlusTeam-only tools.
 *
 * Prefix-matched, with the trailing `/` so that a future `/management/access-…`
 * page isn't caught by accident.
 */
export function isAdminOnlyPath(pathname: string): boolean {
  const path = pathname.split("?")[0];
  return ADMIN_PAGES.some(
    (adminPath) => path === adminPath || path.startsWith(`${adminPath}/`),
  );
}

/** A division whose page `pathname` is (or is inside), for the denial hint. */
export type DivisionRoute = {
  key: DivisionKey;
  label: string;
  route: string;
};

/**
 * The division that owns `pathname`, if any - longest prefix wins, matching
 * how `matchRoleRule` resolves a rule. Used to explain *which* division's
 * members a page is for when someone is refused.
 */
export function divisionForRoute(pathname: string): DivisionRoute | undefined {
  let best: DivisionRoute | undefined;
  for (const [key, division] of DIVISION_ENTRIES) {
    const route = division.route;
    if (!route) continue;
    if (pathname !== route && !pathname.startsWith(`${route}/`)) continue;
    if (!best || route.length > best.route.length) {
      best = { key, label: division.label, route };
    }
  }
  return best;
}

/**
 * Discord user IDs that bypass every role check.
 *
 * Set `DISCORD_ADMIN_IDS` to a comma-separated list of Discord user IDs.
 * An empty or unset value disables the admin bypass.
 */
export const ADMIN_USER_IDS: ReadonlySet<string> = new Set(
  (process.env.DISCORD_ADMIN_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
);
