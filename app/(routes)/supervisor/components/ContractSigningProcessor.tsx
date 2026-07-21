"use client";

import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { ApplicantInfoCard } from "./contract/ApplicantInfoCard";
import { QuickLinksPanel } from "./contract/QuickLinksPanel";
import { SubTabs } from "./contract/SubTabs";
import { WorkflowHeader } from "./contract/WorkflowHeader";
import { WorkflowStepsList } from "./contract/WorkflowStepsList";
import { TeamSpeakCredentialsCard } from "./TeamSpeakCredentialsCard";
import type { ContractTab } from "./contract/types";
import { workflowByValue } from "./contract/workflows";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Bounce, ToastContainer } from "react-toastify";

type ApplicantTitle = "Mr." | "Ms.";

const EMPTY_TAB_COMPLETION: Record<ContractTab, string[]> = {
  recruitment: [],
  reinstatement: [],
  "emt-p": [],
};

function getDefaultDateHired(): Date {
  return new Date();
}

export function ContractSigningProcessor() {
  const [activeTab, setActiveTab] = useLocalStorage<ContractTab>(
    "supervisor-contract-tab",
    "recruitment",
  );

  const [personnelName, setPersonnelName] = useLocalStorage<string>(
    "supervisor-contract-applicant-name",
    "",
  );
  const [title, setTitle] = useState<ApplicantTitle>("Mr.");
  const [phoneNumber, setPhoneNumber] = useLocalStorage<string>(
    "supervisor-contract-phone-number",
    "",
  );
  const [employeeProfileLink, setEmployeeProfileLink] = useLocalStorage<string>(
    "supervisor-contract-profile-link",
    "",
  );
  const employeeNumber = useMemo(() => {
    try {
      const url = new URL(employeeProfileLink);
      const u = url.searchParams.get("u");
      return u ? u : "";
    } catch {
      return "";
    }
  }, [employeeProfileLink]);
  const [personnelFileLink, setPersonnelFileLink] = useLocalStorage<string>(
    "supervisor-contract-file-link",
    "",
  );
  const [dateHired, setDateHired] = useState<Date | undefined>(() => getDefaultDateHired());
  const [manualDate, setManualDate] = useLocalStorage<string>(
    "supervisor-contract-manual-date-string",
    format(new Date(), "dd/MMM/yyyy").toUpperCase(),
  );
  const [isManualDate, setIsManualDate] = useLocalStorage<boolean>(
    "supervisor-contract-manual-date",
    false,
  );

  const formattedDateHired = isManualDate
    ? manualDate      : dateHired
      ? format(dateHired, "dd/MMM/yyyy").toUpperCase()
      : "";

  // Per-tab completion for IC procedure steps (separate from OOC).
  const [completionByTab, setCompletionByTab] =
    useLocalStorage<Record<ContractTab, string[]>>(
      "supervisor-contract-completed-v2",
      EMPTY_TAB_COMPLETION,
    );

  // Per-tab completion for OOC checklist.
  const [oocCompletionByTab, setOocCompletionByTab] =
    useLocalStorage<Record<ContractTab, string[]>>(
      "supervisor-contract-ooc-completed-v2",
      EMPTY_TAB_COMPLETION,
    );

  const workflow = workflowByValue[activeTab];
  const completedSteps = completionByTab[activeTab] ?? [];
  const completedOocSteps = oocCompletionByTab[activeTab] ?? [];

  const totalChecklist = workflow.steps.length + workflow.oocList.length;
  const completedCount =
    workflow.steps.filter((step) => completedSteps.includes(step.id)).length +
    workflow.oocList.filter((item) => completedOocSteps.includes(item.id))
      .length;

  const progressPercent = useMemo(
    () =>
      totalChecklist === 0
        ? 0
        : Math.round((completedCount / totalChecklist) * 100),
    [completedCount, totalChecklist],
  );

  const toggleStep = (id: string) => {
    setCompletionByTab((prev) => {
      const current = prev[activeTab] ?? [];
      return {
        ...prev,
        [activeTab]: current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id],
      };
    });
  };

  const toggleOocStep = (id: string) => {
    setOocCompletionByTab((prev) => {
      const current = prev[activeTab] ?? [];
      return {
        ...prev,
        [activeTab]: current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id],
      };
    });
  };

  const resetChecklists = () => {
    setCompletionByTab((prev) => ({ ...prev, [activeTab]: [] }));
    setOocCompletionByTab((prev) => ({ ...prev, [activeTab]: [] }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="dark"
        transition={Bounce}
      />

      <SubTabs activeTab={activeTab} onChange={setActiveTab} />

      <WorkflowHeader
        workflow={workflow}
        completedCount={completedCount}
        totalCount={totalChecklist}
        progressPercent={progressPercent}
      />

      <ApplicantInfoCard
        personnelName={personnelName}
        onNameChange={setPersonnelName}
        title={title}
        onTitleChange={setTitle}
        phoneNumber={phoneNumber}
        onPhoneNumberChange={setPhoneNumber}
        dateHired={dateHired}
        employeeProfileLink={employeeProfileLink}
        onEmployeeProfileLinkChange={setEmployeeProfileLink}
        personnelFileLink={personnelFileLink}
        onPersonnelFileLinkChange={setPersonnelFileLink}
        onDateHiredChange={setDateHired}
        manualDate={manualDate}
        onManualDateChange={setManualDate}
        isManualDate={isManualDate}
        onManualDateToggle={setIsManualDate}
      />

      <TeamSpeakCredentialsCard />

      <WorkflowStepsList
        workflow={workflow}
        completedSteps={completedSteps}
        completedOocSteps={completedOocSteps}
        onToggleStep={toggleStep}
        onToggleOocStep={toggleOocStep}
        onReset={resetChecklists}
        personnelName={personnelName}
        dateHired={formattedDateHired}
        phone={phoneNumber}
        employeeNumber={employeeNumber}
        employeeProfileLink={employeeProfileLink}
        personnelFileLink={personnelFileLink}
      />

      <QuickLinksPanel
        title={`Quick Links - ${workflow.shortLabel}`}
        links={workflow.quickLinks}
      />
    </div>
  );
}
