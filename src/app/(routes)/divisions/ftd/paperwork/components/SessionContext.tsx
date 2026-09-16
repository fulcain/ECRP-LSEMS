"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useMedic } from "@/app/context/MedicContext";
import { fetchEMRProfileLinks, EMRProfileLink } from "@/components/current-emrs/fetchCurrentEMRs";

export interface SessionDetails {
  ftoName: string;
  date: Date | undefined;
  timeStart: string;   // "HH:MM" from <input type="time">
  timeFinish: string;  // "HH:MM"
  emrName: string;     // selected from EMR dropdown
  emrNameManual: string; // manual fallback
  sessionConducted: string;
  signature: string;   // FTO signature - shared across all form types
}

const defaultDetails: SessionDetails = {
  ftoName: "",
  date: undefined,
  timeStart: "",
  timeFinish: "",
  emrName: "",
  emrNameManual: "",
  sessionConducted: "",
  signature: "",
};

export type FormType = "normal" | "reinstatement" | "civilianRideAlong";

interface AdditionalMandatoriesState {
  normal: string;
  reinstatement: string;
  civilianRideAlong: string;
}

interface SessionContextValue {
  /** The current shared session fields. */
  details: SessionDetails;

  /** Replace the entire details object (or merge via spread). */
  setDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;

  /** Derived: whichever EMR name the user chose. */
  resolvedEMR: string;

  /** Full list of FTO names (from /api/get-fto-names). */
  ftoNames: string[];

  /** Full EMR list with profile links (from /api/current-emrs). */
  emrList: EMRProfileLink[];

  /** Derive the profile-link for the currently-selected EMR. */
  selectedEMRProfileLink: string | undefined;

  /** Which paperwork form is currently rendered. */
  formType: FormType;
  setFormType: (type: FormType) => void;

  /** Current phase within the active form (e.g. "phase1", "reinstatementPhase2"). */
  currentPhase: string | null;
  setCurrentPhase: (phase: string | null) => void;

  /** Live Additional Mandatories count for the currently active form type. */
  additionalMandatories: string;
  setAdditionalMandatories: (value: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/** Cross-form session state: FTO/date/times/EMR/phase/additional mandatories. Persists to localStorage. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [persisted, setPersisted] = useLocalStorage<{
    ftoName: string;
    date: string | null; // ISO string or null
    timeStart: string;
    timeFinish: string;
    emrName: string;
    emrNameManual: string;
    sessionConducted: string;
    signature: string;
  }>("ftd-session-details", {
    ftoName: "",
    date: null,
    timeStart: "",
    timeFinish: "",
    emrName: "",
    emrNameManual: "",
    sessionConducted: "",
    signature: "",
  });

  const [details, setDetails] = useState<SessionDetails>(() => ({
    ...defaultDetails,
    ftoName: persisted.ftoName,
    date: persisted.date ? new Date(persisted.date) : undefined,
    timeStart: persisted.timeStart,
    timeFinish: persisted.timeFinish,
    emrName: persisted.emrName,
    emrNameManual: persisted.emrNameManual,
    sessionConducted: persisted.sessionConducted,
    signature: persisted.signature,
  }));

  // `useLocalStorage` hydrates after the first render, so the initial read
  // above only ever sees defaults. Apply the stored session once it arrives,
  // and only while the form is still untouched - a reload used to drop the
  // trainer, times and signature the member had already filled in.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    setDetails((prev) => {
      const touched =
        prev.ftoName ||
        prev.date ||
        prev.timeStart ||
        prev.timeFinish ||
        prev.emrName ||
        prev.emrNameManual ||
        prev.sessionConducted ||
        prev.signature;
      if (touched) return prev;
      return {
        ...defaultDetails,
        ftoName: persisted.ftoName,
        date: persisted.date ? new Date(persisted.date) : undefined,
        timeStart: persisted.timeStart,
        timeFinish: persisted.timeFinish,
        emrName: persisted.emrName,
        emrNameManual: persisted.emrNameManual,
        sessionConducted: persisted.sessionConducted,
        signature: persisted.signature,
      };
    });
  }, [persisted]);

  // The signature belongs to the member, not to the session: take it from the
  // Staff Page so it only ever has to be saved once. A signature the session
  // already carries - typed here, or restored above - is left alone.
  const { medicCredentials } = useMedic();
  const signatureSeeded = useRef(false);
  useEffect(() => {
    if (signatureSeeded.current) return;
    const saved = medicCredentials.signature;
    if (!saved) return; // credentials still hydrating
    signatureSeeded.current = true;
    setDetails((prev) =>
      prev.signature ? prev : { ...prev, signature: saved },
    );
  }, [medicCredentials.signature]);

  useEffect(() => {
    setPersisted({
      ftoName: details.ftoName,
      date: details.date ? details.date.toISOString() : null,
      timeStart: details.timeStart,
      timeFinish: details.timeFinish,
      emrName: details.emrName,
      emrNameManual: details.emrNameManual,
      sessionConducted: details.sessionConducted,
      signature: details.signature,
    });
  }, [details, setPersisted]);

  const [ftoNames, setFtoNames] = useState<string[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/get-fto-names");
        const data = await res.json();
        setFtoNames(data.options ?? []);
      } catch (err) {
        console.error("Error fetching FTO names:", err);
      }
    };
    load();
  }, []);

  const [emrList, setEmrList] = useState<EMRProfileLink[]>([]);
  useEffect(() => {
    fetchEMRProfileLinks().then(setEmrList);
  }, []);

  const [formType, setFormTypeRaw] = useLocalStorage<FormType>(
    "ftd-form-type",
    "normal",
  );
  const setFormType = (type: FormType) => setFormTypeRaw(type);

  const [currentPhase, setCurrentPhase] = useState<string | null>(null);

  const [additionalMandatoriesByType, setAdditionalMandatoriesByType] =
    useLocalStorage<AdditionalMandatoriesState>(
      "ftd-additional-mandatories",
      { normal: "", reinstatement: "", civilianRideAlong: "" },
    );

  const additionalMandatories =
    additionalMandatoriesByType[formType] ?? "";

  const setAdditionalMandatories = (value: string) => {
    setAdditionalMandatoriesByType((prev) => ({ ...prev, [formType]: value }));
  };

  const resolvedEMR = details.emrName || details.emrNameManual;

  const selectedEMRProfileLink = emrList.find(
    (e) => e.EMR === details.emrName,
  )?.profileLink;

  return (
    <SessionContext.Provider
      value={{
        details,
        setDetails,
        resolvedEMR,
        ftoNames,
        emrList,
        selectedEMRProfileLink,
        formType,
        setFormType,
        currentPhase,
        setCurrentPhase,
        additionalMandatories,
        setAdditionalMandatories,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

/** Returns the shared session context; throws if no provider is mounted above. */
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a <SessionProvider>");
  }
  return ctx;
}
