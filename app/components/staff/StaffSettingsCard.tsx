"use client";

import { MedicCredentials } from "@/app/(routes)/email-templates/components/MedicCredentials";
import { useMedic } from "@/app/context/MedicContext";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

type StaffSettingsCardProps = {
  title?: string;
  description?: string;
};

export function StaffSettingsCard({
  title = "Staff Settings",
  description = "Save your name, signature, and rank once to reuse across tools.",
}: StaffSettingsCardProps) {
  const { medicCredentials, setMedicCredentials } = useMedic();
  const [showEditForm, setShowEditForm] = useState(false);

  const isCredentialsEmpty =
    !medicCredentials.name ||
    !medicCredentials.signature ||
    !medicCredentials.rank;

  return (
    <div className="rounded-lg bg-slate-800 p-6 shadow-lg">
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

          {!isCredentialsEmpty && medicCredentials.signature && !showEditForm && (
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
    </div>
  );
}
