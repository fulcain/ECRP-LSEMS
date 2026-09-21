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

/** The persisted session blob. This key and shape are shared with older
 *  builds, so stored sessions survive a deploy. */
interface StoredSession {
  ftoName: string;
  date: string | null; // ISO string or null
  timeStart: string;
  timeFinish: string;
  emrName: string;
  emrNameManual: string;
  sessionConducted: string;
  signature: string;
}

const SESSION_STORAGE_KEY = "ftd-session-details";

/** Read the stored session straight from storage.
 *  Deliberately not `useLocalStorage`: the restore pass has to see the stored
 *  values on mount, and the hook hydrates a render later. */
function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch (error) {
    console.error("Error reading the stored FTD session:", error);
    return null;
  }
}

function writeStoredSession(session: StoredSession) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Error writing the FTD session:", error);
  }
}

/** True once the member has put something into the session fields. */
function sessionTouched(details: SessionDetails): boolean {
  return Boolean(
    details.ftoName ||
      details.date ||
      details.timeStart ||
      details.timeFinish ||
      details.emrName ||
      details.emrNameManual ||
      details.sessionConducted ||
      details.signature,
  );
}

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
  const [details, setDetails] = useState<SessionDetails>(defaultDetails);

  // What storage holds as far as this tab knows: the restore reads it, every
  // write records it. The persist effect below compares against it instead of
  // tracking "have I run yet", which the double-invoked effects of StrictMode
  // would trip straight back into overwriting the stored session.
  const storedRef = useRef<StoredSession | null>(null);

  // Adopt the stored session. Runs before the persist effect below, so storage
  // has been read by the time that one decides whether to write.
  const [restoreDone, setRestoreDone] = useState(false);
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const stored = readStoredSession();
    storedRef.current = stored;
    if (stored) {
      setDetails((prev) =>
        sessionTouched(prev)
          ? prev
          : {
              ...defaultDetails,
              ftoName: stored.ftoName,
              date: stored.date ? new Date(stored.date) : undefined,
              timeStart: stored.timeStart,
              timeFinish: stored.timeFinish,
              emrName: stored.emrName,
              emrNameManual: stored.emrNameManual,
              sessionConducted: stored.sessionConducted,
              signature: stored.signature,
            },
      );
    }
    setRestoreDone(true);
  }, []);

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

  // The "Your Name" dropdown lists the FT roster; the member's own Staff Page
  // name is preselected into it, so the empty dropdown is one click instead of
  // a scroll-and-pick. A restored or picked name is left alone.
  const nameSeeded = useRef(false);
  useEffect(() => {
    if (nameSeeded.current) return;
    const saved = medicCredentials.name;
    if (!saved) return; // credentials still hydrating
    nameSeeded.current = true;
    setDetails((prev) => (prev.ftoName ? prev : { ...prev, ftoName: saved }));
  }, [medicCredentials.name]);

  // Write the session back, but never the values of a render that predates the
  // restore: those are the empty defaults, and persisting them is what made
  // these fields look like they were never saved.
  useEffect(() => {
    if (!restoreDone) return;
    const session: StoredSession = {
      ftoName: details.ftoName,
      date: details.date ? details.date.toISOString() : null,
      timeStart: details.timeStart,
      timeFinish: details.timeFinish,
      emrName: details.emrName,
      emrNameManual: details.emrNameManual,
      sessionConducted: details.sessionConducted,
      signature: details.signature,
    };
    if (!storedRef.current && !sessionTouched(details)) return;
    if (JSON.stringify(session) === JSON.stringify(storedRef.current)) return;
    storedRef.current = session;
    writeStoredSession(session);
  }, [details, restoreDone]);

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
