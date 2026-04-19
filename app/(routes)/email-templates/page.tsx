"use client";
import { useState } from "react";

import { getCurrentDateFormatted } from "@/app/helpers/getCurrentDateFormatted";
import {
  divisions,
  Divisions,
} from "@/app/constants/divisions";
import { generateSignature } from "@/app/templates/general/signature";
import { generateEmailTemplate } from "@/app/templates/general/division-emails";
import { useMedic } from "@/app/context/MedicContext";
import DivisionSelector from "@/app/(routes)/email-templates/components/DivisionSelector";
import TemplateOptions from "@/app/(routes)/email-templates/components/TemplateOptions";
import { BodyAndMainTitle } from "@/components/layout/main-and-title";
import { useMemo, useEffect } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";

export default function Home() {
  const { medicCredentials, divisionRanks, setDivisionRanks } = useMedic();
  const [selectedDivision, setSelectedDivision] = useState<Divisions | null>(
    null,
  );
  const [selectedRank, setSelectedRank] = useState("");
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");

  const isCredentialsEmpty =
    !medicCredentials.name ||
    !medicCredentials.signature ||
    !medicCredentials.rank;

  useEffect(() => {
    if (selectedDivision) {
      const saved = divisionRanks[selectedDivision.label];
      setSelectedRank(saved || "");
    }
  }, [selectedDivision, divisionRanks, setSelectedRank]);

  useEffect(() => {
    if (selectedDivision && selectedRank) {
      setDivisionRanks((prev) => ({
        ...prev,
        [selectedDivision.label]: selectedRank,
      }));
    }
  }, [selectedRank, selectedDivision, setDivisionRanks]);

  const medicSignatureText = useMemo(() => {
    if (!selectedDivision || isCredentialsEmpty) return "";
    return generateSignature({
      selectedRank,
      medicCredentials: { ...medicCredentials },
    }).trim();
  }, [selectedDivision, selectedRank, medicCredentials, isCredentialsEmpty]);

  const handleGenerateSignature = () => {
    if (!selectedDivision || !medicSignatureText) return;
    navigator.clipboard
      .writeText(medicSignatureText)
      .then(() => toast.success("Signature Copied!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const handleGenerateNewTemplate = () => {
    if (!selectedDivision) return;

    const bbcode = generateEmailTemplate({
      medicCredentials: { ...medicCredentials },
      selectedRank: selectedRank || "",
      division: selectedDivision.data,
      subject: subject.trim(),
      recipient: recipient.trim(),
      date: getCurrentDateFormatted(),
    });

    navigator.clipboard
      .writeText(bbcode)
      .then(() => toast.success("BBCode Template Copied!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  return (
    <BodyAndMainTitle
      description="Select a division and create email templates, signatures, or
              BBCode posts
"
      title="Division Email Templates"
    >
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="dark"
        transition={Bounce}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <DivisionSelector
          selectedDivision={selectedDivision}
          setSelectedDivision={setSelectedDivision}
          setSelectedRank={setSelectedRank}
          ArrayToLoop={divisions}
        />

        <TemplateOptions
          selectedDivision={selectedDivision}
          selectedRank={selectedRank}
          subject={subject}
          setSubject={setSubject}
          recipient={recipient}
          setRecipient={setRecipient}
          handleGenerateSignature={handleGenerateSignature}
          handleGenerateNewTemplate={handleGenerateNewTemplate}
        />
      </div>
    </BodyAndMainTitle>
  );
}
