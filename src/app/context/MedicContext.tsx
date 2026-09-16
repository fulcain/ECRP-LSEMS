"use client";

import { defaultDirectorRole, type DirectorRole } from "@/app/constants/general/directorRoles";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { createContext, useContext, useMemo } from "react";
import { Dispatch, SetStateAction } from "react";

export type MedicCredentials = {
  name: string;
  signature: string;
  rank: string;
  directorRole: DirectorRole;
};

type MedicContextType = {
  medicCredentials: MedicCredentials;
  setMedicCredentials: Dispatch<SetStateAction<MedicCredentials>>;
  divisionRanks: Record<string, string>;
  setDivisionRanks: Dispatch<SetStateAction<Record<string, string>>>;
};

const MedicContext = createContext<MedicContextType | undefined>(undefined);

// Older saved credentials may predate the directorRole field. Fill in safe
// defaults so downstream consumers can always rely on the full shape.
export const normalizeMedicCredentials = (
  value: Partial<MedicCredentials> | undefined | null,
): MedicCredentials => ({
  name: value?.name ?? "",
  signature: value?.signature ?? "",
  rank: value?.rank ?? "",
  directorRole: {
    enabled: value?.directorRole?.enabled ?? defaultDirectorRole.enabled,
    title: value?.directorRole?.title ?? defaultDirectorRole.title,
  },
});

const defaultMedicCredentials: MedicCredentials = normalizeMedicCredentials({});

export const MedicProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [medicCredentials, setMedicCredentials] = useLocalStorage<
    MedicCredentials
  >("medic-credentials", defaultMedicCredentials);

  const [divisionRanks, setDivisionRanks] = useLocalStorage<
    Record<string, string>
  >("division-ranks", {});

  // Memoize so consumers (e.g. useMemo in email-templates page) don't see a
  // fresh object reference on every context render.
  const normalizedMedicCredentials = useMemo(
    () => normalizeMedicCredentials(medicCredentials),
    [medicCredentials],
  );

  return (
    <MedicContext.Provider
      value={{
        medicCredentials: normalizedMedicCredentials,
        setMedicCredentials,
        divisionRanks,
        setDivisionRanks,
      }}
    >
      {children}
    </MedicContext.Provider>
  );
};

export const useMedic = () => {
  const context = useContext(MedicContext);
  if (!context) throw new Error("useMedic must be used within a MedicProvider");
  return context;
};
