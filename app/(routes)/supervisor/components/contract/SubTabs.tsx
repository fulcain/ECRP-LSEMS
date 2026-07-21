"use client";

import type { ContractTab } from "./types";
import { workflows } from "./workflows";

type SubTabsProps = {
  activeTab: ContractTab;
  onChange: (tab: ContractTab) => void;
};

export function SubTabs({ activeTab, onChange }: SubTabsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {workflows.map((wf) => {
        const isActive = activeTab === wf.value;
        return (
          <button
            key={wf.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(wf.value)}
            className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? `${wf.accent}`
                : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            {wf.icon}
            {wf.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
