"use client";

import { Divisions, divisions } from "@/app/configs/divisions/";
import { pmTemplate } from "@/app/configs/divisions/";
import { getCurrentDateFormatted } from "@/app/helpers/getCurrentDateFormatted";
import { useLocalStorageState } from "@/app/hooks/useLocalStorage";
import { MedicCredentials } from "@/components/MedicCredentials";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Bounce } from "react-toastify";

export default function Home() {
  const date = getCurrentDateFormatted();

  const [medicCredentials, setMedicCredentials] = useLocalStorageState(
    "medic-credentials",
    {
      name: "",
      signature: "",
      rank: "",
    },
  );

  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Divisions | null>(
    null,
  );
  const [selectedRank, setSelectedRank] = useState("");

  const isCredentialsEmpty =
    !medicCredentials.name ||
    !medicCredentials.signature ||
    !medicCredentials.rank;

  const handleGenerate = () => {
    if (selectedDivision === null) return;

    const text = pmTemplate({
      date,
      division: selectedDivision.data,
      selectedRank: selectedRank || "",
      medicCredentials: {
        ...medicCredentials,
      },
    }).trim();

    navigator.clipboard
      .writeText(text)
      .then(() => toast("Copied!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />

      <div className="mt-20 flex flex-col items-center justify-center gap-10">
        <h1 className="text-2xl font-bold">LSEMS Division PMs</h1>

        {isCredentialsEmpty || showEditForm ? (
          <MedicCredentials
            medicCredentials={medicCredentials}
            setMedicCredentialsAction={(values) => {
              setMedicCredentials(values);
              setShowEditForm(false);
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => setShowEditForm(true)}
            >
              Edit Credentials
            </Button>
          </div>
        )}

        {/* PM Template Buttons */}
        <section className="flex flex-row flex-wrap justify-center gap-4">
          {divisions.map((item, idx) => (
            <div
              key={idx}
              className="flex w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md bg-red-500 p-3 text-white transition hover:bg-red-600"
              onClick={() => {
                setSelectedDivision(item);
                setSelectedRank("");
              }}
            >
              <div className="flex h-[100px] w-[100px] items-center justify-center rounded-md">
                <Image
                  src={item.image}
                  alt={item.label}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <span className="text-center text-sm">{item.label}</span>
            </div>
          ))}
        </section>

        {/* Rank Select + Generate PM */}
        {selectedDivision !== null && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <h3 className="text-lg font-bold">{selectedDivision.label}</h3>
            {Array.isArray(selectedDivision.data?.ranks) && (
              <Select
                onValueChange={(val) => setSelectedRank(val)}
                value={selectedRank}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a rank" />
                </SelectTrigger>
                <SelectContent>
                  {selectedDivision.data.ranks.map((rank, idx) => (
                    <SelectItem key={idx} value={rank}>
                      {rank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!Array.isArray(selectedDivision.data?.ranks) ? (
              <Button className="cursor-pointer" onClick={handleGenerate}>
                Generate PM
              </Button>
            ) : (
              <Button
                className="cursor-pointer"
                onClick={handleGenerate}
                disabled={!selectedRank}
              >
                Generate PM
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
