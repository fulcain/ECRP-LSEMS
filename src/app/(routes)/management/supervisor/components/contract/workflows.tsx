import type { ContractTab, ContractWorkflow } from "./types";
import { recruitmentWorkflow } from "./workflows/recruitment";
import { reinstatementWorkflow } from "./workflows/reinstatement";
import { emtpWorkflow } from "./workflows/emt-p";

import { DASHBOARD_URL } from "./constants";
export { DASHBOARD_URL };

export { recruitmentWorkflow, reinstatementWorkflow, emtpWorkflow };

export const workflows: ContractWorkflow[] = [
  recruitmentWorkflow,
  reinstatementWorkflow,
  emtpWorkflow,
];

export const workflowByValue: Record<ContractTab, ContractWorkflow> =
  workflows.reduce<Record<ContractTab, ContractWorkflow>>((acc, wf) => {
    acc[wf.value] = wf;
    return acc;
  }, {} as Record<ContractTab, ContractWorkflow>);
