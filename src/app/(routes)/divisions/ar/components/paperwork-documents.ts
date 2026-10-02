import { AlertTriangle, Award, FileCheck2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { arTemplates } from "@/app/templates/ar-formats";
import type {
  PickerDocument,
  PickerGroup,
} from "@/components/division/document-picker";

/**
 * Everything the A&R page can write, as the member decides it: the Air branch's
 * pilot paperwork and the Rescue branch's Mountain Rescue paperwork. Both
 * branches are the one division, so they share a workspace and are kept apart
 * as two groups in the picker.
 *
 * Only the plain-language hint and the icon live here - a format's name is read
 * from the template that renders it, so a template cannot be renamed in one
 * place and left stale in the other. Adding an A&R format means one entry in
 * the group below and one template in `app/templates/ar-formats`.
 */
export type ARDocument =
  | "certification"
  | "certificate"
  | "pilot-irregularity"
  | "mr-certification"
  | "mr-certificate"
  | "mr-irregularity";

export const AR_DOCUMENTS: readonly ARDocument[] = [
  "certification",
  "certificate",
  "pilot-irregularity",
  "mr-certification",
  "mr-certificate",
  "mr-irregularity",
];

/** Whether a `?format=` link names a document this picker offers. */
export function isARDocument(value: string): value is ARDocument {
  return (AR_DOCUMENTS as readonly string[]).includes(value);
}

function formatDocument(value: ARDocument, hint: string, icon: LucideIcon): PickerDocument<ARDocument> {
  const template = arTemplates.find((entry) => entry.value === value);
  // A card whose title went missing would be a blank button, so it fails
  // loudly rather than rendering one.
  if (!template) throw new Error(`No A&R template is declared for "${value}".`);
  return { value, label: template.label, hint, icon };
}

export const AR_PAPERWORK: readonly PickerGroup<ARDocument>[] = [
  {
    label: "Air - Pilot",
    hint: "Medevac Pilot certification and the paperwork around it.",
    documents: [
      formatDocument(
        "certification",
        "The full pilot certification - theory, airfield practice, agility course and time trial.",
        FileCheck2,
      ),
      formatDocument(
        "certificate",
        "The pilot certificate for their divisional profile once they have passed.",
        Award,
      ),
      formatDocument(
        "pilot-irregularity",
        "An irregularity report after a flight issue during training.",
        AlertTriangle,
      ),
    ],
  },
  {
    label: "Rescue - Mountain Rescue",
    hint: "Mountain Rescue certification and the paperwork around it.",
    documents: [
      formatDocument(
        "mr-certification",
        "The full Mountain Rescue certification - theory, practice, roads and Mount Chilliad.",
        FileCheck2,
      ),
      formatDocument(
        "mr-certificate",
        "The Mountain Rescue certificate for their divisional profile once they have passed.",
        Award,
      ),
      formatDocument(
        "mr-irregularity",
        "An irregularity report after a trek or off-road issue during training.",
        AlertTriangle,
      ),
    ],
  },
];
