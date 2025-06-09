"use client";

import { divisions } from "@/app/configs/divisions/";
import { pmTemplate } from "@/app/configs/divisions/";
import { getCurrentDateFormatted } from "@/app/helpers/getCurrentDateFormatted";
import { useLocalStorageState } from "@/app/hooks/useLocalStorage";
import { MedicCredentials } from "@/components/MedicCredentials";
import { Button } from "@/components/ui/button";
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

  const isCredentialsEmpty =
    !medicCredentials.name || !medicCredentials.signature || !medicCredentials.rank;

  const handleClick = (generateText: (date: string) => string) => {
    const text = generateText(date).trim();
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast("Copied!");
      })
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
        <h1>LSEMS Division PMs</h1>

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
            <Button variant="outline" onClick={() => setShowEditForm(true)}>
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
              onClick={() =>
                handleClick(() =>
                  pmTemplate({ date, division: item.data, medicCredentials }),
                )
              }
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
      </div>
    </>
  );
}
