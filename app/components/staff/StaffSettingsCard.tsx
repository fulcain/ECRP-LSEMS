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
    <div className="relative overflow-hidden rounded-[2rem] border border-violet-500/20 bg-slate-950/80 shadow-2xl shadow-violet-950/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.15),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.10),_transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsla(0,0%,100%,0.1) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative space-y-8 p-5 lg:p-8">
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
                <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-slate-800/50 p-2 transition-all duration-200 hover:border-white/20 sm:mt-0">
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
              className="whitespace-nowrap border-slate-600 text-slate-300 transition-all duration-200 hover:scale-[1.02] hover:border-violet-500/40 hover:bg-violet-950/20 hover:text-violet-200 active:scale-95"
            >
              Edit Credentials
            </Button>
          )}
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
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
                className="rounded-xl border border-white/10 bg-slate-800/50 p-4 transition-all duration-200 hover:border-white/20 hover:bg-slate-800/70"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700/50">
                    <Image
                      src={division.image}
                      alt={division.label}
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
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
                  <SelectTrigger className="w-full border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-slate-500">
                    <SelectValue placeholder="Choose your division rank" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-900 text-white">
                    <SelectItem value={NONE_DIVISION_RANK} className="transition-all duration-150 hover:bg-slate-700/60">None</SelectItem>

                    {Array.isArray(division.data.ranks) &&
                      division.data.ranks.map((rank) => (
                        <SelectItem key={rank} value={rank} className="transition-all duration-150 hover:bg-slate-700/60">
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
