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
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {workflow.label}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{workflow.description}</p>
        </div>

        <div className="min-w-[180px]">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Progress
            </p>
            <p className="text-sm font-medium text-foreground">
              {completedCount}
              <span className="text-muted-foreground"> / {totalCount}</span>
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-hover">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
