"use client";

import type { ContractWorkflow } from "./types";

type WorkflowHeaderProps = {
  workflow: ContractWorkflow;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
};

export function WorkflowHeader({
  workflow,
  completedCount,
  totalCount,
  progressPercent,
}: WorkflowHeaderProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {workflow.label}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{workflow.description}</p>
        </div>

        <div className="min-w-[180px]">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
              Progress
            </p>
            <p className="text-sm font-medium text-white">
              {completedCount}
              <span className="text-slate-500"> / {totalCount}</span>
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-slate-300 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
