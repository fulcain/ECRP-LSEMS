"use client";

import {
  divisions,
  Divisions,
  generateSignature,
} from "@/app/configs/divisions/";
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
import { Bounce, ToastContainer, toast } from "react-toastify";

export default function Home() {
  const date = getCurrentDateFormatted();

  const [medicCredentials, setMedicCredentials] = useLocalStorageState(
    "medic-credentials",
    { name: "", signature: "", rank: "" },
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
    if (!selectedDivision) return;

    const text = pmTemplate({
      date,
      division: selectedDivision.data,
      selectedRank: selectedRank || "",
      medicCredentials: { ...medicCredentials },
    }).trim();

    navigator.clipboard
      .writeText(text)
      .then(() => toast("PM template Copied!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const handleGenerateSignature = () => {
    if (!selectedDivision) return;

    const text = generateSignature({
      selectedRank: selectedRank || "",
      medicCredentials: { ...medicCredentials },
    }).trim();

    navigator.clipboard
      .writeText(text)
      .then(() => toast("Signature Copied!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2002}
        theme="dark"
        transition={Bounce}
      />

      <div className="mt-20 flex flex-col items-center gap-11 text-white">
        <h3 className="text-3xl font-semibold">LSEMS Division PMs</h3>

        {isCredentialsEmpty || showEditForm ? (
          <MedicCredentials
            medicCredentials={medicCredentials}
            setMedicCredentialsAction={(values) => {
              setMedicCredentials(values);
              setShowEditForm(false);
            }}
          />
        ) : (
          <Button variant="outline" onClick={() => setShowEditForm(true)}>
            Edit Credentials
          </Button>
        )}

        <div className="flex min-h-[36px] items-center justify-center gap-2">
          {selectedDivision && Array.isArray(selectedDivision.data?.ranks) && (
            <Select
              onValueChange={(val) => setSelectedRank(val)}
              value={selectedRank}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select rank" />
              </SelectTrigger>
              <SelectContent>
                {selectedDivision.data.ranks.map((rank, idx) => (
                  <SelectItem className="cursor-pointer" key={idx} value={rank}>
                    {rank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={handleGenerate}
              disabled={
                !selectedDivision ||
                (Array.isArray(selectedDivision?.data?.ranks) && !selectedRank)
              }
            >
              PM
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={handleGenerateSignature}
              disabled={
                !selectedDivision ||
                (Array.isArray(selectedDivision?.data?.ranks) && !selectedRank)
              }
            >
              Signature
            </Button>
          </div>
        </div>

        {/* Divisions */}
        <section className="grid w-full max-w-5xl grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 p-4">
          {divisions.map((item, idx) => (
            <div
              key={idx}
              className="bg-input/30 border-input hover:bg-input/50 flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition"
              onClick={() => {
                setSelectedDivision(item);
                setSelectedRank("");
              }}
              style={{ minHeight: 48, minWidth: 140 }}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.label}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-sm whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
