import { copyBBCode } from "@/app/helpers/copyBBCode";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import { isTitleOnlyText, pickPostTarget } from "@/app/helpers/forumHandoff";
import type { ExternalLink } from "./types";

/**
 * Applicant-name placeholder tokens. The primary, canonical one is
 * `{{applicantName}}` - write it in any template and it will be replaced
 * with the name typed into the Applicant Info card at copy time.
 *
 * The older implicit tokens (`FName LName` / `Fname Lname` / `First Last`)
 * are still recognised as defensive fallbacks so anything that hasn't
 * been migrated yet still works. They are intentionally listed AFTER the
 * canonical token.
 *
 * `Lastname` alone is intentionally excluded - that token appears inside
 * radio-call teaching examples ("EMR Lastname is requesting...") that
 * describe a universal radio format rather than a specific individual.
 */
const NAME_PLACEHOLDERS = [
  "{{applicantName}}",
  "FName LName",
  "Fname Lname",
  "Fname lname",
  "First Last",
] as const;

/** Extra placeholder tokens that carry applicant metadata. */
const METADATA_PLACEHOLDERS = [
  "{{dateHired}}",
  "{{phone}}",
  "{{employeeNumber}}",
  "{{employeeProfileLink}}",
  "{{personnelFileLink}}",
  "{{badgeNumber}}",
  "{{personnelFileNumber}}",
] as const;

/** The Staff Page details a signature line is written from. */
export type MedicValues = {
  name?: string | null;
  rank?: string | null;
  signature?: string | null;
};

type MetadataValues = {
  dateHired: string | null;
  phone: string | null;
  employeeNumber: string | null;
  employeeProfileLink: string | null;
  personnelFileLink: string | null;
  badgeNumber: string | null;
  personnelFileNumber: string | null;
};

/**
 * The supervisor's own details, as the Staff Page holds them. `supervisorName`
 * is the rank and name together ("Senior EMT John Doe"), because that is how a
 * signature block names the supervisor; the dotted tokens are for templates
 * that need the pieces separately. Any token with nothing behind it is left
 * verbatim, so an unfilled Staff Page is visible rather than silently blank.
 */
function medicReplacements(medic?: MedicValues): Array<[string, string]> {
  const name = medic?.name?.trim() ?? "";
  const rank = medic?.rank?.trim() ?? "";
  const signature = medic?.signature?.trim() ?? "";
  return [
    ["{{supervisorName}}", [rank, name].filter(Boolean).join(" ")],
    ["{{medic.name}}", name],
    ["{{medic.rank}}", rank],
    ["{{medic.sig}}", signature],
  ];
}

/**
 * Replace recognised placeholders inside `text` with the supplied values.
 * Unrecognised `{{...}}` tokens - and any token whose value is still empty -
 * are preserved verbatim so the supervisor sees what needs filling in.
 */
function interpolatePlaceholders(
  text: string,
  personnelName: string | null,
  metadata: MetadataValues,
  medic?: MedicValues,
): string {
  let out = text;
  if (personnelName) {
    for (const placeholder of NAME_PLACEHOLDERS) {
      out = out.split(placeholder).join(personnelName);
    }
  }
  for (const token of METADATA_PLACEHOLDERS) {
    const key = token.slice(2, -2) as keyof typeof metadata;
    const value = metadata[key];
    if (value) {
      out = out.split(token).join(value);
    }
  }
  for (const [token, value] of medicReplacements(medic)) {
    if (value) {
      out = out.split(token).join(value);
    }
  }
  return out;
}

/**
 * Dispatches the right behavior for an `ExternalLink` action:
 *  - copyText + url → copy BBCode to clipboard AND open the URL in a new tab
 *  - copyText only  → copy BBCode to clipboard
 *  - url only       → open the URL in a new tab
 *
 * Recognised placeholders inside `copyText` (and `postTitle`) are replaced
 * before the BBCode is copied: the applicant's name from the Applicant Info
 * card, the metadata fields, and the supervisor's own Staff Page details.
 */
export function handleContractAction(
  action: ExternalLink,
  personnelName: string | null,
  metadata?: Partial<MetadataValues>,
  medic?: MedicValues,
): void {
  const values: MetadataValues = {
    dateHired: metadata?.dateHired ?? null,
    phone: metadata?.phone ?? null,
    employeeNumber: metadata?.employeeNumber ?? null,
    employeeProfileLink: metadata?.employeeProfileLink ?? null,
    personnelFileLink: metadata?.personnelFileLink ?? null,
    badgeNumber: metadata?.badgeNumber ?? null,
    personnelFileNumber: metadata?.personnelFileNumber ?? null,
  };

  if (action.copyText) {
    const interpolated = interpolatePlaceholders(
      action.copyText,
      personnelName,
      values,
      medic,
    );
    // A step copies a post body or a bare title line, and the extension wants
    // them in different fields: the title fills the subject, the body the
    // editor. A step that posts both names its title outright; otherwise a line
    // short enough to be a title is treated as one.
    const title = action.postTitle
      ? interpolatePlaceholders(action.postTitle, personnelName, values, medic)
      : null;
    const titleOnly = !title && isTitleOnlyText(interpolated);
    const post = {
      subject: title ?? (titleOnly ? interpolated : undefined),
      bbcode: titleOnly ? "" : interpolated,
      feature: "a supervisor workflow",
      // Most steps post into the applicant's file, and the member has already
      // pasted that topic's link into the Applicant Info card.
      url: pickPostTarget(action.url, values.personnelFileLink),
    };
    if (action.url) {
      copyBBCodeAndOpen({ bbCodeText: interpolated, url: action.url, post });
    } else {
      copyBBCode({ bbCodeText: interpolated, post });
    }
    return;
  }
  if (action.url) {
    window.open(action.url, "_blank", "noopener,noreferrer");
  }
}
