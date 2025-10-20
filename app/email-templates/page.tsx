"use client";

import { getCurrentDateFormatted } from "../helpers/getCurrentDateFormatted";
import {
  divisions,
  Divisions,
  generateSignature,
  pmTemplate,
  generateNewTemplate,
} from "@/app/configs/divisions/";
import { useMedic } from "@/app/context/MedicContext";
import DivisionSelector from "@/app/email-templates/components/DivisionSelector";
import TemplateOptions from "@/app/email-templates/components/TemplateOptions";
import { MedicCredentials } from "@/components/MedicCredentials";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";

export default function Home() {
  const {
    medicCredentials,
    setMedicCredentials,
    divisionRanks,
    setDivisionRanks,
  } = useMedic();

  const [showEditForm, setShowEditForm] = useState(false);
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
  }, [selectedDivision, divisionRanks]);

  useEffect(() => {
    if (selectedDivision && selectedRank) {
      setDivisionRanks({
        ...divisionRanks,
        [selectedDivision.label]: selectedRank,
      });
    }
  }, [selectedRank, selectedDivision]);

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

  const handleGenerate = () => {
    if (!selectedDivision) return;

    const text = pmTemplate({
      date: getCurrentDateFormatted(),
      division: selectedDivision.data,
      selectedRank: selectedRank || "",
      medicCredentials: { ...medicCredentials },
      subject: subject.trim(),
      recipient: recipient.trim(),
    }).trim();

    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("PM Template Copied!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const handleGenerateNewTemplate = () => {
    if (!selectedDivision) return;

    const bbcode = generateNewTemplate({
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
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="dark"
        transition={Bounce}
      />

      <main className="text-foreground min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
              Division Email Templates
            </h1>
            <p className="text-slate-400">
              Select a division and create email templates, signatures, or
              BBCode posts
            </p>
          </div>

          <div className="mb-8 rounded-lg bg-slate-800 p-6 shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <div className="flex flex-col">
                  <h2 className="mb-1 text-xl font-semibold text-white">
                    Medic Credentials
                  </h2>
                  {!isCredentialsEmpty && !showEditForm && (
                    <p className="text-sm text-slate-400">
                      {medicCredentials.rank} {medicCredentials.name}
                    </p>
                  )}
                </div>

                {!isCredentialsEmpty &&
                  medicCredentials.signature &&
                  !showEditForm && (
                    <div className="mt-2 flex items-center rounded bg-slate-700 p-2 sm:mt-0">
                      <img
                        src={medicCredentials.signature}
                        alt={`${medicCredentials.name} signature`}
                        className="h-16 w-auto object-contain"
                      />
                    </div>
                  )}
              </div>

              {isCredentialsEmpty || showEditForm ? (
                <MedicCredentials
                  medicCredentials={medicCredentials}
                  setMedicCredentialsAction={(values) => {
                    setMedicCredentials(values);
                    setShowEditForm(false);
                  }}
                />
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowEditForm(true)}
                  className="whitespace-nowrap"
                >
                  Edit Credentials
                </Button>
              )}
            </div>
          </div>

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
              setSelectedRank={setSelectedRank}
              subject={subject}
              setSubject={setSubject}
              recipient={recipient}
              setRecipient={setRecipient}
              handleGenerateSignature={handleGenerateSignature}
              handleGenerate={handleGenerate}
              handleGenerateNewTemplate={handleGenerateNewTemplate}
            />
          </div>
        </div>
      </main>
    </>
  );
}
