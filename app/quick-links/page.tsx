"use client";

import { links } from "@/app/configs/quickLinks/";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function QuickLinks() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLinks = links.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <div className="mt-20 flex flex-col items-center justify-center gap-6">
        <h3 className="text-3xl font-semibold">Quick Links</h3>

        {/* Search Bar */}
        <Input
          type="text"
          placeholder="Search division..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-2xl"
        />

        {/* Accordion */}
        <Accordion
          type="single"
          collapsible
          className="w-full max-w-2xl"
        >
          {filteredLinks.map((item, index) => (
            <AccordionItem key={index} value={item.label}>
              <AccordionTrigger className="cursor-pointer text-lg font-semibold">
                <div className="flex items-center justify-center gap-2">
                  <Image
                    src={item.image}
                    alt={item.label}
                    width={50}
                    height={50}
                    className="rounded-md object-cover"
                  />
                  <div>{item.label}</div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 p-4">
                <ul className="space-y-2">
                  {item.data.quickLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white transition-all hover:text-blue-600 hover:underline"
                      >
                        • {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
          {filteredLinks.length === 0 && (
            <p className="py-4 text-center text-gray-400">
              No divisions found.
            </p>
          )}
        </Accordion>
      </div>
    </>
  );
}
