"use client";

import { MedicCredentials } from "@/app/(routes)/email-templates/components/MedicCredentials";
import { divisions } from "@/app/constants/divisions";
import { useMedic } from "@/app/context/MedicContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useState } from "react";

type StaffSettingsCardProps = {
  title?: string;
  description?: string;
};

const rankManagedDivisions = divisions.filter((division) =>
  Array.isArray(division.data.ranks),
);
const NONE_DIVISION_RANK = "__none__";

export function StaffSettingsCard({
  title = "Staff Settings",
  description = "Save your name, signature, and rank once to reuse across tools.",
}: StaffSettingsCardProps) {
  const { medicCredentials, setMedicCredentials, divisionRanks, setDivisionRanks } =
    useMedic();
  const [showEditForm, setShowEditForm] = useState(false);

  const isCredentialsEmpty =
    !medicCredentials.name ||
    !medicCredentials.signature ||
    !medicCredentials.rank;

  return (
    <div className="rounded-lg bg-slate-800 p-6 shadow-lg">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div className="flex flex-col">
              <h2 className="mb-1 text-xl font-semibold text-white">{title}</h2>
              <p className="text-sm text-slate-400">{description}</p>
              {!isCredentialsEmpty && !showEditForm && (
                <p className="mt-2 text-sm text-slate-400">
                  {medicCredentials.rank} {medicCredentials.name}
                </p>
              )}
            </div>

            {!isCredentialsEmpty &&
              medicCredentials.signature &&
              !showEditForm && (
                <div className="mt-2 flex items-center rounded bg-slate-700 p-2 sm:mt-0">
                  <Image
                    src={medicCredentials.signature}
                    alt={`${medicCredentials.name} signature`}
                    width={200}
                    height={64}
                    style={{ objectFit: "contain", height: "auto" }}
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}
          </div>

          {isCredentialsEmpty || showEditForm ? (
            <MedicCredentials
              medicCredentials={medicCredentials}
              setMedicCredentialsAction={(values) => {
                setMedicCredentials(values);
                setShowEditForm(false);
              }}
            />
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowEditForm(true)}
              className="whitespace-nowrap"
            >
              Edit Credentials
            </Button>
          )}
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Division Ranks</h3>
            <p className="text-sm text-slate-400">
              Set your saved rank for each division here so template tools can
              reuse them automatically.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rankManagedDivisions.map((division) => (
              <div
                key={division.label}
                className="rounded-lg border border-slate-700 bg-slate-800/70 p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Image
                    src={division.image}
                    alt={division.label}
                    width={36}
                    height={36}
                    className="h-9 w-9 object-contain"
                  />
                  <div>
                    <p className="font-medium text-white">{division.label}</p>
                    <p className="text-xs text-slate-400">
                      {division.data.divisionName}
                    </p>
                  </div>
                </div>

                <Select
                  value={divisionRanks[division.label] || ""}
                  onValueChange={(value) =>
                    setDivisionRanks((prev) => ({
                      ...prev,
                      [division.label]:
                        value === NONE_DIVISION_RANK ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full border-slate-600 bg-slate-700 text-white">
                    <SelectValue placeholder="Choose your division rank" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-800 text-white">
                    <SelectItem value={NONE_DIVISION_RANK}>None</SelectItem>
                    {division.data.ranks.map((rank) => (
                      <SelectItem key={rank} value={rank}>
                        {rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
