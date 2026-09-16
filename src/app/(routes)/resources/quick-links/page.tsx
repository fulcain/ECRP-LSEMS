"use client";

import { divisions } from "@/app/constants/divisions";
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
import { useState, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";

interface QuickLink {
  name: string;
  url: string;
}

interface AccordionItemData {
  label: string;
  image: string;
  data: {
    divisionName?: string;
    quickLinks: QuickLink[];
  };
}

interface DivisionMatch {
  item: AccordionItemData;
  /** True when the division itself matched, so all of its links stay listed. */
  labelMatch: boolean;
  links: QuickLink[];
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function termsOf(query: string) {
  return normalize(query).split(" ").filter(Boolean);
}

/** Acronyms people actually type: "Field Training" -> ft, "Field Training Division" -> ftd. */
function acronymsOf(item: AccordionItemData) {
  return [item.label, item.data.divisionName ?? ""]
    .map((value) =>
      normalize(value)
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join(""),
    )
    .filter((acronym) => acronym.length >= 2);
}

function searchDivisions(items: AccordionItemData[], query: string): DivisionMatch[] {
  const terms = termsOf(query);

  if (terms.length === 0) {
    return items.map((item) => ({ item, labelMatch: true, links: item.data.quickLinks }));
  }

  const compact = terms.join("");
  const matches: DivisionMatch[] = [];

  for (const item of items) {
    const haystack = normalize(`${item.label} ${item.data.divisionName ?? ""}`);
    const labelMatch =
      terms.every((term) => haystack.includes(term)) || acronymsOf(item).includes(compact);

    if (labelMatch) {
      matches.push({ item, labelMatch, links: item.data.quickLinks });
      continue;
    }

    const matchingLinks = item.data.quickLinks.filter((link) =>
      terms.every((term) => normalize(link.name).includes(term)),
    );

    if (matchingLinks.length > 0) {
      matches.push({ item, labelMatch, links: matchingLinks });
    }
  }

  // Divisions named by the query outrank ones that only contain a matching link.
  return matches.sort(
    (a, b) => Number(b.labelMatch) - Number(a.labelMatch) || b.links.length - a.links.length,
  );
}

function HighlightedName({ name, terms }: { name: string; terms: string[] }) {
  if (terms.length === 0) {
    return <>{name}</>;
  }

  const pattern = new RegExp(`(${terms.join("|")})`, "gi");

  return (
    <>
      {name.split(pattern).map((part, index) =>
        terms.includes(part.toLowerCase()) ? (
          <mark key={index} className="rounded bg-emerald-400/20 px-0.5 text-emerald-200">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

interface QuickLinksAccordionItemProps {
  item: AccordionItemData;
  visibleLinks: QuickLink[];
  matchTerms: string[];
  /** The top search narrowed this division's links rather than matching its name. */
  narrowedBySearch: boolean;
}

function QuickLinksAccordionItem({
  item,
  visibleLinks,
  matchTerms,
  narrowedBySearch,
}: QuickLinksAccordionItemProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const localTerms = termsOf(searchTerm);
  const filteredLinks =
    localTerms.length === 0
      ? visibleLinks
      : visibleLinks.filter((link) =>
          localTerms.every((term) => normalize(link.name).includes(term)),
        );
  const highlightTerms = localTerms.length > 0 ? localTerms : matchTerms;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <AccordionItem
      value={item.label}
      className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 shadow-sm transition-colors duration-200 hover:border-white/20"
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
          {narrowedBySearch && (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
              {visibleLinks.length} {visibleLinks.length === 1 ? "match" : "matches"}
            </span>
          )}
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
            No links found
            {searchTerm.trim() ? <> for &ldquo;{searchTerm.trim()}&rdquo;</> : null}
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
                    <HighlightedName name={link.name} terms={highlightTerms} />
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
  const [divisionSearch, setDivisionSearch] = useState("");
  const [openDivisions, setOpenDivisions] = useState<string[]>([]);

  const query = divisionSearch.trim();
  const matches = searchDivisions(divisions, query);

  // Show the hits as soon as the query changes; collapsing them still works.
  useEffect(() => {
    if (!query) return;

    setOpenDivisions(searchDivisions(divisions, query).map((match) => match.item.label));
  }, [query]);

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
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              aria-label="Search divisions and links"
              placeholder="Search divisions or links..."
              value={divisionSearch}
              onChange={(e) => setDivisionSearch(e.target.value)}
              className="w-full border-slate-700 bg-slate-800/80 py-2 pl-9 text-white placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500 focus-visible:ring-2"
            />
          </div>

          {matches.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No divisions or links found for &ldquo;{query}&rdquo;
            </p>
          ) : (
            <Accordion
              type="multiple"
              value={openDivisions}
              onValueChange={setOpenDivisions}
              className="w-full space-y-4"
            >
              {matches.map((match) => (
                <QuickLinksAccordionItem
                  key={match.item.label}
                  item={match.item}
                  visibleLinks={match.links}
                  matchTerms={termsOf(query)}
                  narrowedBySearch={!match.labelMatch}
                />
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </BodyAndMainTitle>
  );
}
