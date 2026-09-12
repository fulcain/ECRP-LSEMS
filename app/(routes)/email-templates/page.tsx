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
import { useMemo, useEffect, useRef, useCallback } from "react";
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

// The compose session is persisted so an accidental refresh cannot throw away
// the selected division or the typed preview.
const SESSION_STORAGE_KEY = "email-template-session";

type PreviewSession = {
  divisionLabel?: string;
  subject?: string;
  recipient?: string;
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
    });
  }, [selectedDivision, effectiveRank, medicCredentials, subject, recipient]);

  // Keep the preview in sync with the generated template until the user edits.
  useEffect(() => {
    if (!previewEdited) setPreviewBody(generatedTemplate);
  }, [generatedTemplate, previewEdited]);

  // Picking another division starts from a freshly generated template so
  // content belonging to a previous division cannot resurface. Rank/role changes
  // made elsewhere leave manual edits alone — Reset regenerates on demand.
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
            handleCopyTemplate={handleCopyTemplate}
            previewBody={previewBody}
            onPreviewChange={handlePreviewChange}
            onPreviewReset={handlePreviewReset}
          />
        </div>
      </div>
    </BodyAndMainTitle>
  );
}
