"use client";

import { useState } from "react";
import { FileText, Pill, Ban } from "lucide-react";
import {
  DocumentPicker,
  type PickerGroup,
} from "@/components/division/document-picker";
import { PrescriptionProfileBuilder } from "./PrescriptionProfileBuilder";
import { MethadonePrescriptionBuilder } from "./MethadonePrescriptionBuilder";
import { MethadoneDeniedBuilder } from "./MethadoneDeniedBuilder";

type PrescriptionFormat = "profile" | "methadone" | "methadone-denied";

const prescriptionGroups: readonly PickerGroup<PrescriptionFormat>[] = [
  {
    label: "Prescriptions",
    hint: "Write the patient's profile first, then the prescriptions that go in it.",
    documents: [
      {
        value: "profile",
        label: "Prescription Profile",
        hint: "The patient's prescription profile: general information and the empty prescription spoilers.",
        icon: FileText,
      },
      {
        value: "methadone",
        label: "Methadone",
        hint: "A methadone prescription issued after a drug test, with the line for the patient's profile.",
        icon: Pill,
      },
      {
        value: "methadone-denied",
        label: "Methadone Denied",
        hint: "A refused methadone prescription, listing the reason and whether it carries a ban.",
        icon: Ban,
      },
    ],
  },
];

export function PrescriptionsTab() {
  // Nothing is picked for the member: the cards show first, and a builder only
  // appears once they have said which prescription they are writing.
  const [format, setFormat] = useState<PrescriptionFormat | null>(null);

  return (
    <div className="space-y-6">
      <DocumentPicker
        groups={prescriptionGroups}
        value={format}
        onChange={setFormat}
        legend="Which prescription are you writing?"
      />

      {format === "profile" && <PrescriptionProfileBuilder />}
      {format === "methadone" && <MethadonePrescriptionBuilder />}
      {format === "methadone-denied" && <MethadoneDeniedBuilder />}
    </div>
  );
}
