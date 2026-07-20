"use client";

import { links } from "@/app/constants/divisions";
import { BodyAndMainTitle } from "@/components/layout/main-and-title";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";

interface QuickLink {
  name: string;
  url: string;
}

interface AccordionItemData {
  label: string;
  image: string;
  data: {
    quickLinks: QuickLink[];
  };
}

interface QuickLinksAccordionItemProps {
  item: AccordionItemData;
}

function QuickLinksAccordionItem({ item }: QuickLinksAccordionItemProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLinks = item.data.quickLinks.filter((link) =>
    link.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <AccordionItem
      value={item.label}
      className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-white/20"
    >
      <AccordionTrigger className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/5 [&[data-state=open]]:border-b [&[data-state=open]]:border-white/10">
        <div className="flex flex-row items-center justify-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/80">
            <Image
              src={item.image}
              alt={item.label}
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <span>{item.label}</span>
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-5">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search links..."
            value={searchTerm}
            onChange={handleChange}
            className="w-full border-slate-700 bg-slate-800/80 py-2 pl-9 text-white placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500 focus-visible:ring-2"
          />
        </div>

        {filteredLinks.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No links found for &ldquo;{searchTerm}&rdquo;
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredLinks.map((link, idx) => (
              <li key={idx}>
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-white transition-all duration-200 hover:border-white/10 hover:bg-white/5"
                >
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-500 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-sky-400" />
                  <span className="transition-colors duration-200 group-hover:text-sky-300">
                    {link.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

export default function QuickLinks() {
  return (
    <BodyAndMainTitle
      title="Quick Links"
      description="Browse and access all your quick links"
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-slate-950/80 shadow-2xl shadow-emerald-950/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(52,211,153,0.15),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.10),_transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsla(0,0%,100%,0.1) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative p-5 lg:p-8">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {links.map((item, index) => (
              <QuickLinksAccordionItem key={index} item={item} />
            ))}
          </Accordion>
        </div>
      </div>
    </BodyAndMainTitle>
  );
}
