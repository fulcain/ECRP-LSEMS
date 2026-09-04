"use client";

import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  Copy,
  ExternalLink,
  ListChecks,
  MessageSquare,
  RotateCcw,
  Square,
} from "lucide-react";
import Link from "next/link";
import { handleContractAction } from "./actions";
import type {
  ContractStep,
  ContractWorkflow,
  OOCStep,
} from "./types";

type WorkflowStepsListProps = {
  workflow: ContractWorkflow;
  completedSteps: string[];
  completedOocSteps: string[];
  onToggleStep: (stepId: string) => void;
  onToggleOocStep: (stepId: string) => void;
  onReset: () => void;
  personnelName: string;
  dateHired: string;
  phone: string;
  employeeNumber: string;
  employeeProfileLink: string;
  personnelFileLink: string;
  badgeNumber: string;
};

export function WorkflowStepsList({
  workflow,
  completedSteps,
  completedOocSteps,
  onToggleStep,
  onToggleOocStep,
  onReset,
  personnelName,
  dateHired,
  phone,
  employeeNumber,
  employeeProfileLink,
  personnelFileLink,
  badgeNumber,
}: WorkflowStepsListProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-300">
            Procedure checklist
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-slate-500 hover:text-slate-200"
          title="Clears both the procedure checklist and the OOC checklist for this contract type"
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Reset all
        </Button>
      </div>

      <ol className="space-y-2">
        {workflow.steps.map((step) => (
          <StepRow
            key={step.id}
            step={step}
            isDone={completedSteps.includes(step.id)}
            onToggle={() => onToggleStep(step.id)}
            personnelName={personnelName}
            dateHired={dateHired}
            phone={phone}
            employeeNumber={employeeNumber}
            employeeProfileLink={employeeProfileLink}
            personnelFileLink={personnelFileLink}
            badgeNumber={badgeNumber}
          />
        ))}
      </ol>

      <div className="mt-6 mb-4 flex items-center gap-2 border-t border-slate-800 pt-5">
        <MessageSquare className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-medium text-slate-300">
          (( Out-of-Character checklist ))
        </h3>
      </div>

      <ol className="space-y-2">
        {workflow.oocList.map((item) => (
          <OOCRow
            key={item.id}
            item={item}
            isDone={completedOocSteps.includes(item.id)}
            onToggle={() => onToggleOocStep(item.id)}
          />
        ))}
      </ol>
    </div>
  );
}

type StepRowProps = {
  step: ContractStep;
  isDone: boolean;
  onToggle: () => void;
  personnelName: string;
  dateHired: string;
  phone: string;
  employeeNumber: string;
  employeeProfileLink: string;
  personnelFileLink: string;
  badgeNumber: string;
};

const METADATA_LABELS: Record<string, string> = {
  employeeProfileLink: "Employee Profile Link",
  personnelFileLink: "Personnel File Link",
  badgeNumber: "Badge Number",
  personnelFileNumber: "Personnel File Number",
};

function StepRow({ step, isDone, onToggle, personnelName, dateHired, phone, employeeNumber, employeeProfileLink, personnelFileLink, badgeNumber }: StepRowProps) {
  const trimmedName = personnelName.trim();
  const passedName = trimmedName.length > 0 ? trimmedName : null;
  const metadata = { dateHired: dateHired || null, phone: phone || null, employeeNumber: employeeNumber || null, employeeProfileLink: employeeProfileLink || null, personnelFileLink: personnelFileLink || null, badgeNumber: badgeNumber || null, personnelFileNumber: personnelFileLink ? ((() => { try { return new URL(personnelFileLink).searchParams.get('u') ?? null; } catch { return null; } })()) : null };

  return (
    <li className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 transition-colors hover:border-slate-700">
      <div className="flex items-start gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={isDone}
          aria-label={
            isDone ? "Mark step as incomplete" : "Mark step as complete"
          }
          onClick={onToggle}
          className="mt-0.5 text-slate-500 transition-colors hover:text-slate-200"
        >
          {isDone ? (
            <CheckSquare className="h-5 w-5" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </button>
        <div className="flex-1">
          <h4
            className={`text-sm font-medium ${
              isDone ? "text-slate-500 line-through" : "text-white"
            }`}
          >
            {step.title}
          </h4>
          <p
            className={`mt-1 text-sm ${
              isDone ? "text-slate-500 line-through" : "text-slate-400"
            }`}
          >
            {step.description}
          </p>

          {step.actions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {step.actions.map((action, idx) => {
                if (action.internal) {
                  return (
                    <Link
                      key={idx}
                      href={action.internal.href}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                      {action.label}
                    </Link>
                  );
                }
                const requiredMissing = (action.requiresMetadata ?? []).filter(
                  (key) => !metadata[key],
                );
                const nameMissing = !!(action.requiresName && !passedName);
                const missingLabels = [
                  ...(nameMissing ? ["Applicant Name"] : []),
                  ...requiredMissing.map((key) => METADATA_LABELS[key]),
                ];
                const disabled = missingLabels.length > 0;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      handleContractAction(action, passedName, metadata);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                      disabled
                        ? "cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600"
                        : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                    title={
                      disabled
                        ? `${missingLabels.join(", ")} required to enable`
                        : action.description
                    }
                  >
                    {action.copyText ? (
                      <Copy className="h-3 w-3" />
                    ) : (
                      <ExternalLink className="h-3 w-3" />
                    )}
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
          {(() => {
            const missingLabels: string[] = [];
            for (const action of step.actions) {
              if (action.requiresName && !passedName) {
                missingLabels.push("Applicant Name");
              }
              for (const key of action.requiresMetadata ?? []) {
                if (!metadata[key]) {
                  missingLabels.push(METADATA_LABELS[key]);
                }
              }
            }
            const unique = Array.from(new Set(missingLabels));
            if (unique.length === 0) return null;
            return (
              <p className="mt-2 text-xs text-amber-400/90">
                Fill in the {unique.join(", ")} to enable copying.
              </p>
            );
          })()}
        </div>
      </div>
    </li>
  );
}

type OOCRowProps = {
  item: OOCStep;
  isDone: boolean;
  onToggle: () => void;
};

function OOCRow({ item, isDone, onToggle }: OOCRowProps) {
  return (
    <li className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 transition-colors hover:border-slate-700">
      <div className="flex items-start gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={isDone}
          aria-label={
            isDone ? "Mark OOC step as incomplete" : "Mark OOC step as complete"
          }
          onClick={onToggle}
          className="mt-0.5 text-slate-500 transition-colors hover:text-slate-200"
        >
          {isDone ? (
            <CheckSquare className="h-5 w-5" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </button>
        <p
          className={`flex-1 text-sm leading-relaxed ${
            isDone ? "text-slate-500 line-through" : "text-slate-200"
          }`}
        >
          {item.label}
        </p>
      </div>
    </li>
  );
}
