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
import { useMemo, useEffect, useRef } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";

// Re-inject the live structured fields (subject/recipient) into a preview
// body while preserving all other user edits.
const applyLiveFields = (
  body: string,
  subject: string,
  recipient: string,
  date: string,
): string => {
  let out = body;
  const titleValue = subject ? `${subject} | ${date}` : date;
  out = out.replace(/(^|\n)title="[^"]*"/, `$1title="${titleValue}"`);
  const greeting = recipient ? `[b]Dear ${recipient}[/b],` : "";
  if (/\[b\]Dear [^\n]*\n/.test(out)) {
    out = out.replace(/\[b\]Dear [^\n]*\n/, greeting ? `${greeting}\n` : "");
  } else if (greeting) {
    out = out.replace(/(\[divbox4=eeeeee\]\r?\n)/, `$1${greeting}\n`);
  }
  return out;
};

export default function Home() {
  const { medicCredentials, divisionRanks, setDivisionRanks } = useMedic();
  const [selectedDivision, setSelectedDivision] = useState<Divisions | null>(
    null,
  );
  const [selectedRank, setSelectedRank] = useState("");
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [previewBody, setPreviewBody] = useState("");
  const [previewEdited, setPreviewEdited] = useState(false);

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
      selectedDivisionLabel: selectedDivision.label,
      medicCredentials: { ...medicCredentials },
    }).trim();
  }, [selectedDivision, selectedRank, medicCredentials, isCredentialsEmpty]);

  const canGenerate =
    selectedDivision !== null &&
    (!Array.isArray(selectedDivision?.data?.ranks) || !!selectedRank);

  const generatedTemplate = useMemo(() => {
    if (!selectedDivision) return "";
    return generateEmailTemplate({
      medicCredentials: { ...medicCredentials },
      selectedRank: selectedRank || "",
      division: selectedDivision.data,
      subject: subject.trim(),
      recipient: recipient.trim(),
      date: getCurrentDateFormatted(),
    });
  }, [selectedDivision, selectedRank, medicCredentials, subject, recipient]);

  // Keep the preview in sync with the generated template until the user edits.
  useEffect(() => {
    if (!previewEdited) setPreviewBody(generatedTemplate);
  }, [generatedTemplate, previewEdited]);

  // Subject/recipient are live fields: re-inject them into the preview even
  // when the body has manual edits, preserving all other user edits. The ref
  // adopts the initial values on mount so a hydrated body is not clobbered.
  const lastLiveFieldsRef = useRef<string | null>(null);
  useEffect(() => {
    const key = `${subject.trim()}\u0000${recipient.trim()}`;
    if (lastLiveFieldsRef.current === null) {
      lastLiveFieldsRef.current = key;
      return;
    }
    if (lastLiveFieldsRef.current === key) return;
    lastLiveFieldsRef.current = key;
    if (!previewEdited) return;
    setPreviewBody((prev) =>
      prev
        ? applyLiveFields(prev, subject.trim(), recipient.trim(), getCurrentDateFormatted())
        : prev,
    );
  }, [subject, recipient, previewEdited]);

  // Hydrate the edited body once after mount so a reload doesn't lose it.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("email-template-body");
      if (saved) {
        setPreviewBody(saved);
        setPreviewEdited(true);
      }
    } catch (error) {
      console.error("Error reading saved template body:", error);
    }
  }, []);

  const handlePreviewChange = (value: string) => {
    setPreviewBody(value);
    setPreviewEdited(true);
    try {
      localStorage.setItem("email-template-body", value);
    } catch (error) {
      console.error("Error saving template body:", error);
    }
  };

  const handlePreviewReset = () => {
    setPreviewEdited(false);
    setPreviewBody(generatedTemplate);
    try {
      localStorage.removeItem("email-template-body");
    } catch (error) {
      console.error("Error clearing saved template body:", error);
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(message))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const handleGenerateSignature = () => {
    if (!selectedDivision || !medicSignatureText) return;
    copyToClipboard(medicSignatureText, "Signature Copied!");
  };

  const handleGenerateNewTemplate = () => {
    if (!canGenerate) return;
    copyToClipboard(previewBody || generatedTemplate, "BBCode Template Copied!");
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

      <div className="relative overflow-hidden rounded-[2rem] border border-sky-500/20 bg-slate-950/80 shadow-2xl shadow-sky-950/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsla(0,0%,100%,0.1) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative grid grid-cols-1 gap-8 p-5 lg:grid-cols-3 lg:p-8">
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
            previewBody={previewBody}
            onPreviewChange={handlePreviewChange}
            onPreviewReset={handlePreviewReset}
          />
        </div>
      </div>
    </BodyAndMainTitle>
  );
}
