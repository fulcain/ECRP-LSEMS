"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Mail, UserPlus, Users } from "lucide-react";

import { TabBar, type Tab } from "@/components/ui/tab-bar";

import { CurrentEMRsTable } from "@/components/current-emrs/current-emrs-table";
import { FtoManagementCard } from "@/components/employee-stats/components/FtoManagementCard";
import { FtiPromotionCard } from "@/components/employee-stats/components/FtiPromotionCard";
import { EmrTrainingTimeCard } from "@/components/employee-stats/components/EmrTrainingTimeCard";
import { EmrDischargeCard } from "@/components/employee-stats/components/EmrDischargeCard";

type CommandTab = "emrs" | "ftos" | "emails";

const VALID_TABS: CommandTab[] = ["emrs", "ftos", "emails"];

const TABS: Tab<CommandTab>[] = [
  {
    value: "emrs",
    label: "EMRs",
    icon: Users,
    accent: "border-indigo-300/40 dark:border-indigo-400/40 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
  },
  {
    value: "ftos",
    label: "FTOs",
    icon: UserPlus,
    accent: "border-sky-300/40 dark:border-sky-400/40 bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300",
  },
  {
    value: "emails",
    label: "Emails",
    icon: Mail,
    accent: "border-amber-300/40 dark:border-amber-400/40 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300",
  },
];

function isValidTab(value: string): value is CommandTab {
  return (VALID_TABS as string[]).includes(value);
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <CommandPageContent />
    </Suspense>
  );
}

const COMMAND_TAB_LS_KEY = "ftd-command-tab";

function readSavedTab(): CommandTab {
  try {
    const raw = localStorage.getItem(COMMAND_TAB_LS_KEY);
    return isValidTab(raw ?? "") ? (raw as CommandTab) : "emrs";
  } catch {
    return "emrs";
  }
}

function CommandPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Priority: URL param > localStorage > default "emrs"
  const initialTab = (() => {
    const param = searchParams.get("tab");
    if (isValidTab(param ?? "")) return param as CommandTab;
    return readSavedTab();
  })();

  const [tab, setTab] = useState<CommandTab>(initialTab);

  // Sync tab → URL + localStorage
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    try {
      localStorage.setItem(COMMAND_TAB_LS_KEY, tab);
    } catch { /* noop */ }
  }, [tab, pathname, router, searchParams]);

  // Content only: the FTD section layout owns the container and the heading.
  return (
    <>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === "emrs" && <CurrentEMRsTable />}
      {tab === "ftos" && <FtoManagementCard />}
      {tab === "emails" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FtiPromotionCard />
          <EmrTrainingTimeCard />
          <EmrDischargeCard />
        </div>
      )}
    </>
  );
}