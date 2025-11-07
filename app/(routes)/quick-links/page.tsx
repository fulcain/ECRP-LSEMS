"use client";

import { links } from "@/app/configs/quick-links";
import { BodyAndMainTitle } from "@/components/layout/BodyMainAndTitle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function QuickLinks() {
  return (
    <BodyAndMainTitle
      title="Quick Links"
      description="Browse and access all your quick links"
    >
      <Accordion type="single" collapsible className="w-full space-y-4">
        {links.map((item, index) => (
          <AccordionItem
            key={index}
            value={item.label}
            className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-sm"
          >
            <AccordionTrigger className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-lg font-semibold text-white transition-colors duration-200 hover:bg-slate-700 focus:bg-slate-600 focus:text-white">
              <div className="flex flex-row items-center justify-center gap-2">
                <Image
                  src={item.image}
                  alt={item.label}
                  width={33}
                  height={32}
                  className="rounded-sm object-cover"
                />
                <span>{item.label}</span>
              </div>
            </AccordionTrigger>

            <AccordionContent className="border-t border-slate-700 bg-slate-900 p-4">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {item.data.quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-md px-3 py-2 text-white transition-colors duration-200 hover:bg-slate-700 hover:text-blue-400"
                    >
                      <div className="flex flex-row items-center justify-start gap-2">
                        <ChevronRight /> {link.name}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </BodyAndMainTitle>
  );
}
