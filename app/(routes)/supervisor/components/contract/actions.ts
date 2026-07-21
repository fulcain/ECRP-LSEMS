import { copyBBCode } from "@/app/helpers/copyBBCode";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import type { ExternalLink } from "./types";

/**
 * Applicant-name placeholder tokens. The primary, canonical one is
 * `{{applicantName}}` — write it in any template and it will be replaced
 * with the name typed into the Applicant Info card at copy time.
 *
 * The older implicit tokens (`FName LName` / `Fname Lname` / `First Last`)
 * are still recognised as defensive fallbacks so anything that hasn't
 * been migrated yet still works. They are intentionally listed AFTER the
 * canonical token.
 *
 * Any other `{{...}}` token (e.g. `{{supervisorName}}`) is NOT in this
 * list and is therefore preserved verbatim in copied output. Use those
 * for non-applicant fields the supervisor needs to fill in themselves.
 *
 * `Lastname` alone is intentionally excluded — that token appears inside
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
] as const;

/**
 * Replace recognised placeholders inside `text` with the supplied values.
 * Unrecognised `{{...}}` tokens are preserved verbatim so the supervisor
 * still sees what needs to be filled in manually.
 */
function interpolatePlaceholders(
  text: string,
  personnelName: string | null,
  metadata: { dateHired: string | null; phone: string | null; employeeNumber: string | null; employeeProfileLink: string | null; personnelFileLink: string | null },
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
  return out;
}

/**
 * Dispatches the right behavior for an `ExternalLink` action:
 *  - copyText + url → copy BBCode to clipboard AND open the URL in a new tab
 *  - copyText only  → copy BBCode to clipboard
 *  - url only       → open the URL in a new tab
 *
 * When a `personnelName` is supplied (non-empty), recognised name
 * placeholders inside `copyText` are replaced with that name before the
 * BBCode is copied.
 */
export function handleContractAction(
  action: ExternalLink,
  personnelName: string | null,
  metadata?: { dateHired?: string | null; phone?: string | null; employeeNumber?: string | null; employeeProfileLink?: string | null; personnelFileLink?: string | null },
): void {
  if (action.copyText) {
    const interpolated = interpolatePlaceholders(
      action.copyText,
      personnelName,
      { dateHired: metadata?.dateHired ?? null, phone: metadata?.phone ?? null, employeeNumber: metadata?.employeeNumber ?? null, employeeProfileLink: metadata?.employeeProfileLink ?? null, personnelFileLink: metadata?.personnelFileLink ?? null },
    );
    if (action.url) {
      copyBBCodeAndOpen({ bbCodeText: interpolated, url: action.url });
    } else {
      copyBBCode({ bbCodeText: interpolated });
    }
    return;
  }
  if (action.url) {
    window.open(action.url, "_blank", "noopener,noreferrer");
  }
}
