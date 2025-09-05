"use client";

import { links } from "@/app/configs/quickLinks/";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import Image from "next/image";

export default function QuickLinks() {
  return (
    <main className="text-foreground mx-auto mt-20 flex max-w-2xl flex-col items-center justify-center gap-4">
      <h3 className="text-center text-3xl font-semibold">Quick Links</h3>

      <Accordion type="single" collapsible className="w-full">
        {links.map((item, index) => (
          <AccordionItem key={index} value={item.label}>
            <AccordionTrigger className="text-md flex cursor-pointer items-center gap-2 py-2 font-semibold">
              <div className="flex items-center gap-2">
                <Image
                  src={item.image}
                  alt={item.label}
                  width={32}
                  height={32}
                  className="rounded-sm object-cover"
                />
                <span>{item.label}</span>
              </div>
            </AccordionTrigger>

            <AccordionContent className="p-4">
              <ul className="grid grid-cols-2 gap-2 text-sm">
                {item.data.quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-blue-600 hover:underline"
                    >
                      • {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  );
}
