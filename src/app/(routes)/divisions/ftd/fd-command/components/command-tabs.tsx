"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { BookOpen, Mail, RefreshCw, UserPlus, Users } from "lucide-react";

import { DiscussionBoardComposer } from "@/components/discussion-board-composer";
import { FtpManager } from "@/components/ftp/ftp-manager";

import { UpdateProfiles } from "./update-profiles";

import { TabBar, type Tab } from "@/components/ui/tab-bar";

import { CurrentEMRsTable } from "@/components/current-emrs/current-emrs-table";
import { FtoManagementCard } from "@/components/employee-stats/components/FtoManagementCard";
import { FtiPromotionCard } from "@/components/employee-stats/components/FtiPromotionCard";
import { EmrTrainingTimeCard } from "@/components/employee-stats/components/EmrTrainingTimeCard";
import { EmrDischargeCard } from "@/components/employee-stats/components/EmrDischargeCard";

type CommandTab = "emrs" | "ftos" | "emails" | "ftp" | "profiles";

const ALL_TABS: Tab<CommandTab>[] = [
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
    // The value stays "emails": it is what the stored tab and any bookmarked
    // `?tab=` say, and only the label moved.
    label: "Emails & Boards",
    icon: Mail,
    accent: "border-amber-300/40 dark:border-amber-400/40 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300",
  },
  {
    value: "ftp",
    label: "FTP",
    icon: BookOpen,
    accent: "border-emerald-300/40 dark:border-emerald-400/40 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  },
  {
    value: "profiles",
    label: "Update Profiles",
    icon: RefreshCw,
    accent: "border-rose-300/40 dark:border-rose-400/40 bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300",
  },
];

const COMMAND_TAB_LS_KEY = "ftd-command-tab";

/**
 * The tabs this member may actually open. The FTP is the one that edits the
 * repository, so it is offered only to a Discord admin - and whether this member
 * is one is decided on the server, because the gate is an environment variable
 * the browser has no copy of.
 */
function tabsFor(canEditFtp: boolean): Tab<CommandTab>[] {
  return ALL_TABS.filter((tab) => tab.value !== "ftp" || canEditFtp);
}

function readSavedTab(allowed: readonly CommandTab[]): CommandTab {
  try {
    const raw = localStorage.getItem(COMMAND_TAB_LS_KEY);
    return allowed.includes(raw as CommandTab) ? (raw as CommandTab) : "emrs";
  } catch {
    return "emrs";
  }
}

export function CommandTabs({ canEditFtp }: { canEditFtp: boolean }) {
  return (
    <Suspense fallback={null}>
      <CommandPageContent canEditFtp={canEditFtp} />
    </Suspense>
  );
}

function CommandPageContent({ canEditFtp }: { canEditFtp: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabs = useMemo(() => tabsFor(canEditFtp), [canEditFtp]);

  // Priority: URL param > localStorage > default "emrs". A `?tab=ftp` link
  // is not a way in: it matches nothing for a member the tab was withheld from,
  // so the page opens on EMRs instead.
  const initialTab = (() => {
    const param = searchParams.get("tab");
    const allowed = tabs.find((tab) => tab.value === param);
    if (allowed) return allowed.value;
    return readSavedTab(tabs.map((tab) => tab.value));
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
      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {tab === "emrs" && <CurrentEMRsTable />}
      {tab === "ftos" && <FtoManagementCard />}
      {tab === "ftp" && canEditFtp && <FtpManager />}
      {/* The updater rewrites nothing - the FTP or the store - so it is open to
          everyone this page already opens to. */}
      {tab === "profiles" && <UpdateProfiles />}
      {tab === "emails" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FtiPromotionCard />
            <EmrTrainingTimeCard />
            <EmrDischargeCard />
          </div>
          <DiscussionBoardComposer boardKey="ftdCommandBoard" />
        </div>
      )}
    </>
  );
}
