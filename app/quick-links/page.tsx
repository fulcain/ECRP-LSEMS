"use client";

import { links } from "@/app/configs/quickLinks/";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="mt-20 flex flex-col items-center justify-center gap-10">
        <Accordion
          type="single"
          collapsible
          className="w-full max-w-2xl"
          defaultValue={links[0]?.label || "item-1"}
        >
          {links.map((item, index) => (
            <AccordionItem key={index} value={item.label}>
              <AccordionTrigger className="cursor-pointer text-lg font-semibold">
                <div className="flex items-center justify-center gap-2">
                  <Image
                    src={item.image}
                    alt={item.label}
                    width={50}
                    height={500}
                    className="rounded-md"
                  />
                  <div>{item.label}</div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 p-4">
                <div>
                  <ul className="space-y-2">
                    {item.data.quickLinks.map((link, idx) => (
                      <li key={idx}>
                        <Link
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 transition-all hover:text-blue-600 hover:underline"
                        >
                          • {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
