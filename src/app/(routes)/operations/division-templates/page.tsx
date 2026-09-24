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
import DivisionSelector from "@/app/(routes)/operations/division-templates/components/DivisionSelector";
import TemplateOptions from "@/app/(routes)/operations/division-templates/components/TemplateOptions";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { useMemo, useEffect, useRef, useCallback } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";

// Re-inject the live structured fields (subject/recipient) into a preview
// body while preserving all other user edits. The greeting is only injected
// when the body still shows one - a template generated with the recipient
// section omitted has none, and must not have it resurrected.
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
    // Count the [mdsig] bars: a template built without the recipient section
    // has none, so leave greeting-less bodies alone.
    const mdsigCount = (out.match(/\[mdsig\b/g) ?? []).length;
    if (mdsigCount > 0) {
      out = out.replace(/(\[divbox4=eeeeee\]\r?\n)/, `$1${greeting}\n`);
    }
  }
  return out;
};

// The compose session is persisted so an accidental refresh cannot throw away
// the selected division or the typed preview.
const SESSION_STORAGE_KEY = "email-template-session";

type PreviewSession = {
  divisionLabel?: string;
  subject?: string;
  recipient?: string;
  omitBodySignature?: boolean;
  omitClosingSignature?: boolean;
  bodySignOffText?: string;
  body?: string;
  edited?: boolean;
};

export default function Home() {
  const { medicCredentials, divisionRanks, setDivisionRanks } = useMedic();
  const [selectedDivision, setSelectedDivision] = useState<Divisions | null>(
    null,
  );
  const [selectedRank, setSelectedRank] = useState("");
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [omitBodySignature, setOmitBodySignature] = useState(false);
  const [omitClosingSignature, setOmitClosingSignature] = useState(false);
  const [bodySignOffText, setBodySignOffText] = useState("");
  const [previewBody, setPreviewBody] = useState("");
  const [previewEdited, setPreviewEdited] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);

  // Division the current preview belongs to; picking another one starts fresh.
  const previewDivisionRef = useRef<string | null>(null);

  // Kept in sync every render so the unload flush below writes the newest values.
  const sessionRef = useRef<PreviewSession>({});
  sessionRef.current = {
    divisionLabel: selectedDivision?.label,
    subject,
    recipient,
    omitBodySignature,
    omitClosingSignature,
    bodySignOffText,
    body: previewBody,
    edited: previewEdited,
  };

  // Written synchronously: an effect would not run until after paint, so typing
  // and immediately refreshing could lose the last keystrokes.
  const persistSession = useCallback((override?: Partial<PreviewSession>) => {
    const session: PreviewSession = { ...sessionRef.current, ...override };
    // Nothing to remember until the tool has actually been used.
    if (!session.divisionLabel && !session.body) return;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error("Error saving template session:", error);
    }
  }, []);

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

  const effectiveRank = selectedRank || "";
  const generatedTemplate = useMemo(() => {
    if (!selectedDivision) return "";
    return generateEmailTemplate({
      medicCredentials: { ...medicCredentials },
      selectedRank: effectiveRank,
      division: selectedDivision.data,
      divisionLabel: selectedDivision.label,
      subject: subject.trim(),
      recipient: recipient.trim(),
      date: getCurrentDateFormatted(),
      omitBodySignature,
      omitRecipientSection: omitClosingSignature,
      bodySignOffText,
    });
  }, [
    selectedDivision,
    effectiveRank,
    medicCredentials,
    subject,
    recipient,
    omitBodySignature,
    omitClosingSignature,
    bodySignOffText,
  ]);

  // Keep the preview in sync with the generated template until the user edits.
  useEffect(() => {
    if (!previewEdited) setPreviewBody(generatedTemplate);
  }, [generatedTemplate, previewEdited]);

  // Picking another division starts from a freshly generated template so
  // content belonging to a previous division cannot resurface. Rank/role changes
  // made elsewhere leave manual edits alone - Reset regenerates on demand.
  useEffect(() => {
    if (!sessionRestored || !selectedDivision) return;
    if (previewDivisionRef.current === selectedDivision.label) return;
    previewDivisionRef.current = selectedDivision.label;
    setPreviewBody(generatedTemplate);
    setPreviewEdited(false);
  }, [sessionRestored, selectedDivision, generatedTemplate]);

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

  // Restore the last session once after mount so a refresh lands the user back
  // on the same division with their typed preview intact.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as PreviewSession;
      const division = divisions.find((d) => d.label === saved.divisionLabel);
      if (division) {
        setSelectedDivision(division);
        previewDivisionRef.current = division.label;
      }
      if (saved.subject) setSubject(saved.subject);
      if (saved.recipient) setRecipient(saved.recipient);
      if (saved.omitBodySignature) setOmitBodySignature(true);
      if (saved.omitClosingSignature) setOmitClosingSignature(true);
      if (saved.bodySignOffText) setBodySignOffText(saved.bodySignOffText);
      if (saved.body) {
        setPreviewBody(saved.body);
        setPreviewEdited(Boolean(saved.edited));
      }
      // Adopt the restored fields so the live-field sync below does not rewrite
      // the restored greeting and title on mount.
      lastLiveFieldsRef.current = `${(saved.subject ?? "").trim()}\u0000${(
        saved.recipient ?? ""
      ).trim()}`;
    } catch (error) {
      console.error("Error restoring template session:", error);
    } finally {
      setSessionRestored(true);
    }
  }, []);

  // Persist every change so a refresh or a closed tab cannot lose the session.
  useEffect(() => {
    if (!sessionRestored) return;
    persistSession();
  }, [
    sessionRestored,
    persistSession,
    selectedDivision?.label,
    subject,
    recipient,
    omitBodySignature,
    omitClosingSignature,
    bodySignOffText,
    previewBody,
    previewEdited,
  ]);

  // Safety net for a reload/close that beats the effect above, and for the
  // Electron and Android shells being backgrounded.
  useEffect(() => {
    if (!sessionRestored) return;
    const flush = () => persistSession();
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, [sessionRestored, persistSession]);

  const handlePreviewChange = (value: string) => {
    setPreviewBody(value);
    setPreviewEdited(true);
    persistSession({ body: value, edited: true });
  };

  const handlePreviewReset = () => {
    setPreviewEdited(false);
    setPreviewBody(generatedTemplate);
    persistSession({ body: generatedTemplate, edited: false });
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

  const handleCopyTemplate = () => {
    if (!previewBody) return;
    copyToClipboard(previewBody, "BBCode Template Copied!");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Division Email Templates"
        subtitle="Select a division and create email templates, signatures, or BBCode posts"
      />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        transition={Bounce}
      />

      <div className="panel relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
        <div className="relative grid grid-cols-1 gap-6 p-4 sm:p-5 lg:grid-cols-3 lg:p-6">
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
            omitBodySignature={omitBodySignature}
            setOmitBodySignature={setOmitBodySignature}
            omitClosingSignature={omitClosingSignature}
            setOmitClosingSignature={setOmitClosingSignature}
            bodySignOffText={bodySignOffText}
            setBodySignOffText={setBodySignOffText}
            handleGenerateSignature={handleGenerateSignature}
            handleCopyTemplate={handleCopyTemplate}
            previewBody={previewBody}
            onPreviewChange={handlePreviewChange}
            onPreviewReset={handlePreviewReset}
          />
        </div>
      </div>
    </PageContainer>
  );
}
