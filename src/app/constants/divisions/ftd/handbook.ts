/**
 * The FTD handbook, section by section.
 *
 * The handbook is the EMR profile post - the one document a trainee's whole
 * training is recorded on - and it has two formats, kept apart on purpose: the
 * regular one and the reinstatement one. Each format is a run of sections, and
 * each section is **one file** under `docs/handbook/<format>/`.
 *
 * That shape is what makes it editable in the app rather than in a code editor:
 * a section is a file, so the Handbook tab can show the section's own text,
 * write it back when a member publishes, and - because it is a file in the
 * repository - hand the change over as a git diff like any other edit. Nothing
 * here is stored in the database: a publish either writes the file or says it
 * could not, and offers the file to apply by hand.
 *
 * The files are BBCode, exactly as the forum takes it, and the sections are
 * joined in order with a newline between them - so the listing order below *is*
 * the document's order, and `npm run handbook:check` fails if a file is missing,
 * orphaned, or repeated.
 *
 * `mustKeep` is the placeholders a section cannot lose: the name line, the date,
 * the signature image, the checklist markers. They are what an edit made in a
 * hurry drops, and publishing is refused without them.
 */

export type HandbookFormatKey = "regular" | "reinstatement";

export type HandbookSection = {
  /** The name the app and a link use. Stable: it is a URL parameter. */
  id: string;
  /** What the section is called on the page. */
  title: string;
  /** One plain line: what this section is. */
  hint: string;
  /** Path from the repository root. */
  file: string;
  /** Placeholders that must survive an edit, checked before publishing. */
  mustKeep?: readonly string[];
};

export type HandbookFormat = {
  key: HandbookFormatKey;
  label: string;
  hint: string;
  sections: readonly HandbookSection[];
};

/**
 * The placeholders the handbook's own formats use, for the insert menu.
 *
 * A `{{token}}` is filled in before the post is copied - by the contract
 * workflow, which knows the applicant and the supervisor - so it must survive an
 * edit untouched. The BBCode ones are conventions the trainer fills in by hand.
 */
export const HANDBOOK_VARIABLES: readonly {
  token: string;
  hint: string;
}[] = [
  {
    token: "{{applicantName}}",
    hint: "The member's name - the trainee's in a profile header, the supervisor's in a signature.",
  },
  {
    token: "{{dateHired}}",
    hint: "The date the member was hired or reinstated, filled in from the Applicant Info card.",
  },
  {
    token: "{{supervisorName}}",
    hint: "The supervisor running the session, rank and name together, from their Staff Page.",
  },
  {
    token: "{{medic.name}}",
    hint: "The supervisor's name on its own.",
  },
  {
    token: "{{medic.rank}}",
    hint: "The supervisor's rank on its own.",
  },
  {
    token: "{{medic.sig}}",
    hint: "The supervisor's saved signature image.",
  },
  {
    token: "{{phone}}",
    hint: "The member's phone number, from the Applicant Info card.",
  },
  {
    token: "{{employeeNumber}}",
    hint: "The member's employee number.",
  },
  {
    token: "{{badgeNumber}}",
    hint: "The member's badge number.",
  },
  {
    token: "{{employeeProfileLink}}",
    hint: "A link to the member's employee profile.",
  },
  {
    token: "{{personnelFileLink}}",
    hint: "A link to the member's personnel file.",
  },
  {
    token: "{{personnelFileNumber}}",
    hint: "The member's personnel file number.",
  },
  {
    token: "[img]SIGNATURE[/img]",
    hint: "Where the trainer's signature image goes. The trainer replaces it in the forum editor.",
  },
  {
    token: "[i]Medic Name[/i]",
    hint: "The trainer's printed name, under their signature, in a regular profile.",
  },
  {
    token: "SIGNATURE",
    hint: "The reinstatement profile's signature placeholder - a line the trainer replaces.",
  },
  {
    token: "RANK",
    hint: "The rank line under a reinstatement signature.",
  },
  {
    token: "[cb]",
    hint: "An empty checkbox - what a mandatory line looks like before it is done.",
  },
  {
    token: "[cbc]",
    hint: "A ticked checkbox - what the same line becomes once it is done.",
  },
];

/** The sections of a regular profile that end in a trainer's signature block. */
const SIGNED: readonly string[] = ["[img]SIGNATURE[/img]", "[i]Medic Name[/i]"];

/**
 * The reinstatement sections sign with a bare placeholder line and a rank under
 * it, rather than the regular profile's image tag.
 */
const REINSTATEMENT_SIGNED: readonly string[] = ["SIGNATURE\nRANK"];

export const HANDBOOK_FORMATS: readonly HandbookFormat[] = [
  {
    key: "regular",
    label: "Regular FTP",
    hint: "The profile a new hire's training is recorded on, from Introduction to Certification.",
    sections: [
      {
        id: "profile-header",
        title: "Student Information",
        hint: "The top of the profile: who the trainee is, when they were hired, and the phase checklist.",
        file: "docs/handbook/regular/preamble.txt",
        mustKeep: [
          "{{applicantName}}",
          "{{dateHired}}",
          "[cb]Introduction",
          "[cb]Certification",
        ],
      },
      {
        id: "introduction",
        title: "Introduction",
        hint: "The first session: uniform, bodycam, and what the trainee may not do yet.",
        file: "docs/handbook/regular/introduction.txt",
        mustKeep: SIGNED,
      },
      {
        id: "phase-1",
        title: "Phase 1",
        hint: "Radio codes, radio calls, calls list, panics and the department radio.",
        file: "docs/handbook/regular/phase-1.txt",
        mustKeep: SIGNED,
      },
      {
        id: "phase-2",
        title: "Phase 2",
        hint: "Treatment and the medical side, from a patient's first assessment onwards.",
        file: "docs/handbook/regular/phase-2.txt",
        mustKeep: SIGNED,
      },
      {
        id: "phase-3",
        title: "Phase 3",
        hint: "Driving, scene management and the practice track.",
        file: "docs/handbook/regular/phase-3.txt",
        mustKeep: SIGNED,
      },
      {
        id: "pre-certification",
        title: "Pre-Certification",
        hint: "The evaluation session, and the questions a trainer should be able to ask.",
        file: "docs/handbook/regular/pre-certification.txt",
        mustKeep: SIGNED,
      },
      {
        id: "certification",
        title: "Certification",
        hint: "The final session, the roster line, and the certificate itself.",
        file: "docs/handbook/regular/certification.txt",
        mustKeep: SIGNED,
      },
      {
        id: "personnel-file-post",
        title: "Personnel File Post",
        hint: "The post a passed trainee is given in their personnel file.",
        file: "docs/handbook/regular/personnel-file-post.txt",
        mustKeep: ["{{applicantName}}"],
      },
      {
        id: "ride-along-paperwork",
        title: "Ride-Along Paperwork",
        hint: "The record of a mandatory ride-along, whose time counts towards certification.",
        file: "docs/handbook/regular/ride-along-paperwork.txt",
        mustKeep: SIGNED,
      },
    ],
  },
  {
    key: "reinstatement",
    label: "Reinstatement FTP",
    hint: "The profile a returning member's training is recorded on. Separate from the regular one on purpose.",
    sections: [
      {
        id: "reinstatement-header",
        title: "Reinstatee Information",
        hint: "The top of the profile: who is coming back, who is running it, and to which rank.",
        file: "docs/handbook/reinstatement/preamble.txt",
        mustKeep: [
          "Reinstatee Name:",
          "Reinstated by:",
          "Date reinstated:",
          "Rank to be reinstated to:",
          "{{applicantName}}",
          "{{supervisorName}}",
          "DD/MMM/YYYY",
        ],
      },
      {
        id: "reinstatement-phase-i",
        title: "Reinstatement - Phase I",
        hint: "The first session back: hospitals, calls and unit management.",
        file: "docs/handbook/reinstatement/reinstatement-phase-i.txt",
        mustKeep: REINSTATEMENT_SIGNED,
      },
      {
        id: "reinstatement-phase-ii",
        title: "Reinstatement - Phase II",
        hint: "The second session back: treatment and the medical side.",
        file: "docs/handbook/reinstatement/reinstatement-phase-ii.txt",
        mustKeep: REINSTATEMENT_SIGNED,
      },
      {
        id: "reinstatement-certification",
        title: "Reinstatement - Certification",
        hint: "The closing session, and what a reinstatee signs off on.",
        file: "docs/handbook/reinstatement/reinstatement-certification.txt",
        mustKeep: REINSTATEMENT_SIGNED,
      },
    ],
  },
];

/** Every section, in the order the document is assembled in. */
export const HANDBOOK_SECTIONS: readonly HandbookSection[] =
  HANDBOOK_FORMATS.flatMap((format) => format.sections);

/** A section as a whole-profile paste needs it: what it is called, and its text. */
export type HandbookSplitSection = {
  id: string;
  title: string;
  /** The section's text as it stands - its heading is what a paste is cut at. */
  content: string;
};

export type HandbookSplitResult =
  | { ok: true; sections: { id: string; content: string }[] }
  | { ok: false; reason: string };

/**
 * The heading a section's text begins with, or null when it begins with
 * something else.
 *
 * Only the tag itself, because a heading often shares its line with the body -
 * `[spoiler=Personnel File Post][code]…` is a single line.
 */
export function sectionHeading(content: string): string | null {
  const first = content.split("\n").find((line) => line.trim() !== "")?.trim() ?? "";
  if (!first.startsWith("[spoiler=")) return null;
  const close = first.indexOf("]");
  return close === -1 ? null : first.slice(0, close + 1);
}

/**
 * Cut a whole pasted profile back into its sections.
 *
 * The member writes the profile somewhere else and pastes the finished thing in,
 * so the app has to find the sections again rather than ask anyone to retype them
 * one at a time. Each section's own heading is where the next one begins, and the
 * text before the first heading is the header - so the pieces joined back with a
 * newline are the pasted document exactly, which `npm run handbook:check`
 * asserts by round-tripping this function against the files.
 */
export function splitHandbookDocument(
  sections: readonly HandbookSplitSection[],
  document: string,
): HandbookSplitResult {
  const bounds: number[] = [0];
  for (let index = 1; index < sections.length; index += 1) {
    const section = sections[index];
    const heading = sectionHeading(section.content);
    if (!heading) {
      return {
        ok: false,
        reason: `${section.title} has no [spoiler=…] heading of its own to split at.`,
      };
    }
    const at = document.indexOf(`\n${heading}`, bounds[index - 1]);
    if (at === -1) {
      // A paste that begins at a section heading has dropped everything above
      // it, which is worth saying rather than blaming a heading that is there.
      const dropped = index === 1 && document.trimStart().startsWith(heading);
      return {
        ok: false,
        reason: dropped
          ? `The pasted profile starts at ${heading}, so the header above it is missing. Paste the whole profile, from its first line.`
          : `The pasted profile has no ${heading} heading, so I can't tell where ${section.title} begins. Keep every section's own heading and paste the whole profile.`,
      };
    }
    bounds.push(at + 1);
  }
  return {
    ok: true,
    sections: bounds.map((start, index) => ({
      id: sections[index].id,
      // The newline before a heading is the separator the assembler puts back,
      // so it belongs to neither section.
      content: document.slice(
        start,
        index + 1 < bounds.length ? bounds[index + 1] - 1 : document.length,
      ),
    })),
  };
}

/** A section by id, or undefined - a stale link matches nothing. */
export function handbookSection(id: string): HandbookSection | undefined {
  return HANDBOOK_SECTIONS.find((section) => section.id === id);
}

/** The format a section belongs to, for grouping the list and the profile it builds. */
export function handbookFormatOf(
  section: HandbookSection,
): HandbookFormat | undefined {
  return HANDBOOK_FORMATS.find((format) =>
    format.sections.some((entry) => entry.id === section.id),
  );
}
