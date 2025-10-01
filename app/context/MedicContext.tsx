"use client";

import  { createContext, useContext } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Dispatch, SetStateAction } from "react";

type MedicCredentials = {
  name: string;
  signature: string;
  rank: string;
};


type MedicContextType = {
  medicCredentials: MedicCredentials;
  setMedicCredentials: Dispatch<SetStateAction<MedicCredentials>>;
  divisionRanks: Record<string, string>;
  setDivisionRanks: Dispatch<SetStateAction<Record<string, string>>>;
};

const MedicContext = createContext<MedicContextType | undefined>(undefined);

export const MedicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicCredentials, setMedicCredentials] = useLocalStorage<MedicCredentials>(
    "medic-credentials",
    { name: "", signature: "", rank: "" }
  );

  const [divisionRanks, setDivisionRanks] = useLocalStorage<Record<string, string>>(
    "division-ranks",
    {}
  );

  return (
    <MedicContext.Provider
      value={{ medicCredentials, setMedicCredentials, divisionRanks, setDivisionRanks }}
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
