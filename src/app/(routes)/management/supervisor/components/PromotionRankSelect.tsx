"use client";

import { useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  allRanks,
  rankInfo,
  rankOrderLowToHigh,
  rankOrderHighToLow,
} from "@/app/templates/promotions";
import type { PromotionRank } from "@/app/templates/promotions";
import { Award, Check, ChevronDown, Search } from "lucide-react";

type PromotionRankSelectProps = {
  value: PromotionRank;
  onChange: (rank: PromotionRank) => void;
  ranks?: PromotionRank[];
  label?: string;
  order?: "low-to-high" | "high-to-low";
};

export function PromotionRankSelect({
  value,
  onChange,
  ranks = allRanks,
  label = "Promotion rank",
  order = "low-to-high",
}: PromotionRankSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const sortedRanks = useMemo(() => {
    const sequence = order === "high-to-low" ? rankOrderHighToLow : rankOrderLowToHigh;
    const indexByRank = new Map(
      sequence.map((rank, index) => [rank, index]),
    );
    return [...ranks].sort(
      (a, b) => (indexByRank.get(a) ?? 0) - (indexByRank.get(b) ?? 0),
    );
  }, [ranks, order]);

  const filteredRanks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedRanks;
    return sortedRanks.filter((rank) => {
      const info = rankInfo[rank];
      return `${info.label} ${info.shortLabel}`.toLowerCase().includes(q);
    });
  }, [sortedRanks, query]);

  const currentRankInfo = rankInfo[value];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Award className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-medium text-slate-300">{label}</h3>
        {currentRankInfo && (
          <span
            className={`ml-auto rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ${currentRankInfo.badge}`}
          >
            {currentRankInfo.label}
          </span>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-slate-800 bg-slate-950 text-white hover:bg-slate-900 hover:text-white"
          >
            {currentRankInfo?.label ?? "Select a rank"}
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] border-slate-800 bg-slate-900 p-0"
        >
          <div className="flex items-center gap-2 border-b border-slate-800 p-2">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ranks..."
              className="h-8 border-0 bg-transparent px-1 text-white placeholder:text-slate-600 focus-visible:ring-0"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filteredRanks.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-slate-500">
                No ranks found
              </p>
            ) : (
              filteredRanks.map((rank) => {
                const isSelected = rank === value;
                return (
                  <button
                    key={rank}
                    type="button"
                    onClick={() => {
                      onChange(rank);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <span>{rankInfo[rank].label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-emerald-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
