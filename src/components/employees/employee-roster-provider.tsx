"use client";

import type { EmployeeRecord } from "@/app/constants/employees";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type EmployeeRosterContextValue = {
  employees: EmployeeRecord[];
  setEmployees: Dispatch<SetStateAction<EmployeeRecord[]>>;
  loading: boolean;
  refresh: () => Promise<void>;
};

const EmployeeRosterContext = createContext<EmployeeRosterContextValue | null>(null);

export function EmployeeRosterProvider({ children }: { children: ReactNode }) {
  const [employees, setRosterState] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);
  const revision = useRef(0);

  const setEmployees = useCallback<Dispatch<SetStateAction<EmployeeRecord[]>>>(
    (next) => {
      revision.current += 1;
      setRosterState(next);
    },
    [],
  );

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    const currentRevision = revision.current;
    try {
      const response = await fetch("/api/employees", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { employees?: EmployeeRecord[] };
      if (
        Array.isArray(data.employees) &&
        currentRequest === requestId.current &&
        currentRevision === revision.current
      ) {
        setRosterState(data.employees);
      }
    } catch {
      // Keep the last successful roster available during a temporary outage.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
  }, [refresh]);

  const value = useMemo(
    () => ({ employees, setEmployees, loading, refresh }),
    [employees, loading, refresh, setEmployees],
  );

  return (
    <EmployeeRosterContext.Provider value={value}>
      {children}
    </EmployeeRosterContext.Provider>
  );
}

export function useEmployeeRoster() {
  const context = useContext(EmployeeRosterContext);
  if (!context) {
    throw new Error("useEmployeeRoster must be used within an EmployeeRosterProvider");
  }
  return context;
}
