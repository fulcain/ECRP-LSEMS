"use client";

import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useMedic } from "@/app/context/MedicContext";
import { copyBBCode } from "@/app/helpers/copyBBCode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bounce, ToastContainer } from "react-toastify";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Mail,
  Users,
  AlertTriangle,
  CheckSquare,
  Square,
  ExternalLink,
  MessageSquare,
  Headphones,
  FileText,
  ClipboardCheck,
  Award,
  RotateCcw,
  Star,
  Globe,
  ListChecks,
  Shield,
} from "lucide-react";
import {
  promotionEmailTemplates,
  personnelFilePostDefs,
  rankAdjustmentTemplate,
  rankInfo,
  allRanks,
} from "@/app/templates/promotions";
import type { PromotionRank } from "@/app/templates/promotions";

const OOC_ITEMS = [
  { id: "f4Rank", label: "Update their rank in the F4 menu", icon: Shield },
  { id: "discordRank", label: "Update their Discord rank, replacing their old one with their new one", icon: MessageSquare },
  { id: "teamspeakRank", label: "Update their Teamspeak rank, replacing their old one with their new one", icon: Headphones },
] as const;

type OocItem = { id: string; label: string; icon: React.ComponentType<{ className?: string }> };
type IcStep = {
  id: string;
  label: string;
  copyText: string;
  titleText?: string;
  secondaryCopyText?: string;
  secondaryCopyLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: { label: string; url: string };
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export function PromotionProcessor() {
  const { medicCredentials } = useMedic();

  const [personnelName, setPersonnelName] = useLocalStorage("promo-personnel-name", "");
  const [title, setTitle] = useState<"Mr." | "Ms.">("Mr.");
  const [newRank, setNewRank] = useLocalStorage<PromotionRank>("promo-new-rank", "emt-b");
  const [previousRank, setPreviousRank] = useLocalStorage("promo-previous-rank", "");
  const [promotionDate, setPromotionDate] = useLocalStorage("promo-date", "");

  const [completedSteps, setCompletedSteps] = useLocalStorage<string[]>(
    "promo-completed-steps",
    []
  );
  const [completedOoc, setCompletedOoc] = useLocalStorage<string[]>(
    "promo-completed-ooc",
    []
  );
  const [personnelFileUrl, setPersonnelFileUrl] = useLocalStorage(
    "promo-personnel-file-url",
    ""
  );

  const isCredentialsEmpty =
    !medicCredentials.name || !medicCredentials.signature || !medicCredentials.rank;

  const currentRankInfo = rankInfo[newRank];

  const emailTemplate = useMemo(
    () => promotionEmailTemplates.find((t) => t.value === newRank),
    [newRank]
  );

  const personnelPost = useMemo(
    () => personnelFilePostDefs.find((p) => p.rank === newRank),
    [newRank]
  );

  const emailBBCode = useMemo(() => {
    if (!emailTemplate) return "";
    return emailTemplate.renderBody({
      personnelName,
      title,
      medicName: medicCredentials.name,
      medicRank: medicCredentials.rank,
      medicSignature: medicCredentials.signature,
    });
  }, [emailTemplate, personnelName, title, medicCredentials]);

  const personnelBBCode = useMemo(() => {
    if (!personnelPost) return "";
    return personnelPost.renderBody({
      personnelName,
      date: promotionDate,
      promotedByName: medicCredentials.name,
      promotedByRank: medicCredentials.rank,
    });
  }, [personnelPost, personnelName, promotionDate, medicCredentials]);

  const rankAdjustmentBBCode = useMemo(() => {
    return rankAdjustmentTemplate.renderBody({
      personnelName,
      previousRank,
      newRank: currentRankInfo?.label || "",
      date: promotionDate,
      signature: medicCredentials.signature,
      medicName: medicCredentials.name,
      medicRank: medicCredentials.rank,
    });
  }, [personnelName, previousRank, currentRankInfo, promotionDate, medicCredentials]);

  const operationalAdjustmentBBCode = useMemo(() => {
    const rankLabel = currentRankInfo?.label || "";
    if (personnelFileUrl && rankLabel && promotionDate) {
      return `[url=${personnelFileUrl}]${rankLabel} -> ${promotionDate}[/url]`;
    }
    return "";
  }, [personnelFileUrl, currentRankInfo, promotionDate]);

  const operationalAdjustmentCopyText = operationalAdjustmentBBCode || "";

  const allOocItems: OocItem[] = [...OOC_ITEMS];

  const completedOocCount = allOocItems.filter((item) =>
    completedOoc.includes(item.id)
  ).length;

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleOoc = (id: string) => {
    setCompletedOoc((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const resetChecklists = () => {
    setCompletedSteps([]);
    setCompletedOoc([]);
  };

  const icSteps: IcStep[] = useMemo(() => {
    const steps: IcStep[] = [];
    if (emailTemplate) {
      steps.push({ id: "email", label: "Send the promotion email", copyText: emailBBCode, icon: Mail });
    }
    steps.push({ id: "personnel-post", label: "Post promotion format and update Personnel File (Title, Rank, Operational Adjustments)", copyText: personnelBBCode, secondaryCopyText: operationalAdjustmentCopyText, secondaryCopyLabel: "Copy Operational Adjustments", icon: FileText });
    steps.push({ id: "employeeAdjustments", label: "Post Employee Adjustment under Employee Adjustments", copyText: rankAdjustmentBBCode, titleText: `Rank Adjustment | ${personnelName}`, icon: ClipboardCheck, action: { label: "Open Employee Adjustments", url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=573" } });
    steps.push({ id: "rosterUpdate", label: "Adjust their rank on the Staff Roster", copyText: "", icon: Users, action: { label: "Open Staff Roster", url: "https://gov.eclipse-rp.net/viewtopic.php?t=9497" } });
    steps.push({ id: "dashboardSheets", label: "Use the 'Promote Employee' section on the Dashboard to update the sheets", copyText: "", icon: Globe, action: { label: "Open Dashboard", url: "https://ecrplsems.com/" } });
    steps.push({ id: "meetingAgenda", label: "Mark the promotion task as Done under the Supervisor Meeting Agenda", copyText: "", icon: CheckSquare });
    if (newRank === "master-emt") {
      steps.push({ id: "deltaCallsign", label: "Let them pick one of the available DELTA callsigns", copyText: "", icon: Star });
      steps.push({ id: "oneToOneList", label: "Update their listing on the 1:1 list, moving it to the DELTA callsign section", copyText: "", icon: Users });
    }
    return steps;
  }, [emailTemplate, emailBBCode, personnelBBCode, rankAdjustmentBBCode, operationalAdjustmentBBCode, newRank]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <ToastContainer position="top-right" autoClose={2000} theme="dark" transition={Bounce} />

      {/* Credentials Warning */}
      {isCredentialsEmpty && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">Staff credentials not set</p>
            <p className="text-xs text-amber-400/70">
              Set your name, signature, and rank in the{" "}
              <Link href="/staff" className="underline transition-colors hover:text-amber-300">
                Staff Page
              </Link>{" "}
              so templates can auto-fill your information.
            </p>
          </div>
        </div>
      )}

      {/* Rank Selector */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Award className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-300">Promotion rank</h3>
          {currentRankInfo && (
            <span
              className={`ml-auto rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ${currentRankInfo.badge}`}
            >
              {currentRankInfo.label}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
          {allRanks.map((rank) => (
            <button
              key={rank}
              onClick={() => setNewRank(rank)}
              className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                newRank === rank
                  ? `${rankInfo[rank].border} ${rankInfo[rank].badge}`
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              {rankInfo[rank].shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Personnel Info */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-300">Personnel details</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label className="mb-1 block text-xs text-slate-500">Full name</Label>
            <Input
              value={personnelName}
              onChange={(e) => setPersonnelName(e.target.value)}
              placeholder="John Smith"
              className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs text-slate-500">Title</Label>
            <div className="flex gap-1.5">
              {(["Mr.", "Ms."] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTitle(t)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    title === t
                      ? "border-slate-600 bg-slate-800 text-white"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-1 block text-xs text-slate-500">Previous rank</Label>
            <Input
              value={previousRank}
              onChange={(e) => setPreviousRank(e.target.value)}
              placeholder="e.g. EMT-B, EMT-I"
              className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs text-slate-500">Promotion date</Label>
            <Input
              value={promotionDate}
              onChange={(e) => setPromotionDate(e.target.value.toUpperCase())}
              placeholder="DD/MMM/YYYY"
              className="border-slate-800 bg-slate-950 font-mono text-white placeholder:text-slate-600"
            />
          </div>

        </div>
      </div>

      {/* Procedure Checklist */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        {/* Personnel File URL Input */}
        <div className="mb-4">
          <Label className="mb-1 block text-xs text-slate-500">Personnel File Topic URL (for Operational Adjustments)</Label>
          <Input
            value={personnelFileUrl}
            onChange={(e) => setPersonnelFileUrl(e.target.value)}
            placeholder="https://gov.eclipse-rp.net/viewtopic.php?p=..."
            className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
          />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-medium text-slate-300">Procedure checklist</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetChecklists}
            className="text-slate-500 hover:text-slate-200"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset all
          </Button>
        </div>
        <ol className="space-y-2">
          {icSteps.map((step) => {
            const isDone = completedSteps.includes(step.id);
            const Icon = step.icon;
            return (
              <li
                key={step.id}
                className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 transition-colors hover:border-slate-700"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    onClick={() => toggleStep(step.id)}
                    className="mt-0.5 text-slate-500 transition-colors hover:text-slate-200"
                  >
                    {isDone ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isDone ? "text-slate-500 line-through" : "text-white"
                      }`}
                    >
                      {step.label}
                    </p>
                    {(step.copyText.length > 0 || step.action) && !isDone && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {step.copyText.length > 0 && (
                          <button
                            onClick={() => copyBBCode({ bbCodeText: step.copyText })}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                          >
                            <Copy className="h-3 w-3" />
                            Copy BBCode
                          </button>
                        )}
                        {step.titleText && (
                          <button
                            onClick={() => copyToClipboard(step.titleText!)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300 transition-colors hover:bg-emerald-500/20 hover:text-emerald-200"
                          >
                            <Copy className="h-3 w-3" />
                            Copy Title
                          </button>
                        )}
                        {step.secondaryCopyText && (
                          <button
                            onClick={() => copyBBCode({ bbCodeText: step.secondaryCopyText! })}
                            className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300 transition-colors hover:bg-amber-500/20 hover:text-amber-200"
                          >
                            <Copy className="h-3 w-3" />
                            {step.secondaryCopyLabel || "Copy"}
                          </button>
                        )}
                        {step.action && (
                          <a
                            href={step.action.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300 transition-colors hover:bg-indigo-500/20 hover:text-indigo-200"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {step.action.label}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <Icon className="h-4 w-4 shrink-0 text-slate-600" />
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* OOC Checklist */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-medium text-slate-300">
              (( Out-of-Character checklist ))
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {completedOocCount}/{allOocItems.length}
          </span>
        </div>
        <ol className="space-y-2">
          {allOocItems.map((item) => {
            const isDone = completedOoc.includes(item.id);
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 transition-colors hover:border-slate-700"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    onClick={() => toggleOoc(item.id)}
                    className="mt-0.5 text-slate-500 transition-colors hover:text-slate-200"
                  >
                    {isDone ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                  </button>
                  <p
                    className={`flex-1 text-sm leading-relaxed ${
                      isDone ? "text-slate-500 line-through" : "text-slate-200"
                    }`}
                  >
                    {item.label}
                  </p>
                  <Icon className="h-4 w-4 shrink-0 text-slate-600" />
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Quick Links */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="mb-3 text-sm font-medium text-slate-300">Quick links</h3>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://gov.eclipse-rp.net/viewforum.php?f=605"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ExternalLink className="h-3 w-3" />
            Personnel Files
          </a>
          <a
            href="https://gov.eclipse-rp.net/viewforum.php?f=573"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ExternalLink className="h-3 w-3" />
            Employee Adjustments
          </a>
          <a
            href="https://gov.eclipse-rp.net/viewtopic.php?t=9497"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ExternalLink className="h-3 w-3" />
            Staff Roster
          </a>
          <a
            href="https://ecrplsems.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ExternalLink className="h-3 w-3" />
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
