"use client";

import React from "react";
import Image from "next/image";
import { divisions } from "@/app/configs/divisions/";
import { getCurrentDateFormatted } from "@/app/helpers/getCurrentDateFormatted";
import { pmTemplate } from "@/app/configs/divisions/";
import { ToastContainer, toast } from "react-toastify";
import { Bounce } from "react-toastify";

export default function Home() {
  const date = getCurrentDateFormatted();

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
      <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
        <h1>LSEMS Division PMs</h1>

        <section className="flex flex-row flex-wrap justify-center gap-4">
          {divisions.map((item, idx) => (
            <div
              key={idx}
              className="flex w-32 flex-col items-center justify-center gap-2 rounded-md bg-red-500 p-3 text-white transition hover:bg-red-600 cursor-pointer"
              onClick={() =>
                handleClick(() => pmTemplate({ date, division: item.data }))
              }
            >
              <div className="w-[100px] h-[100px] flex items-center justify-center rounded-md">
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
