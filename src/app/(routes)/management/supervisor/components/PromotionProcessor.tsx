"use client";

import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useMedic } from "@/app/context/MedicContext";
import { DASHBOARD_URL } from "./contract/constants";
import { copyBBCode } from "@/app/helpers/copyBBCode";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import { handOffForumPost, pickPostTarget } from "@/app/helpers/forumHandoff";
import {
  GOV_PM_COMPOSE_URL,
  GOV_STAFF_ROSTER_EDIT_URL,
} from "@/app/helpers/govLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bounce, ToastContainer } from "react-toastify";
import React, { useMemo } from "react";
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
} from "@/app/templates/promotions";
import type { PromotionRank } from "@/app/templates/promotions";
import { PromotionRankSelect } from "./PromotionRankSelect";

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
  const [title, setTitle] = useLocalStorage<"Mr." | "Ms.">(
    "supervisor-promotion-honorific",
    "Mr.",
  );
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
      // The email goes out as a private message, titled for the rank the member
      // is being promoted to - the dropdown above is what names it.
      steps.push({
        id: "email",
        label: "Send the promotion email",
        copyText: emailBBCode,
        titleText: currentRankInfo
          ? `${currentRankInfo.label} Promotion`
          : undefined,
        icon: Mail,
        action: { label: "Open Promotion Email", url: GOV_PM_COMPOSE_URL },
      });
    }
    steps.push({
      id: "personnel-post",
      label: "Post promotion format and update Personnel File (Title, Rank)",
      copyText: personnelBBCode,
      icon: FileText,
      action: {
        label: "Open Personnel Files",
        url: "https://gov.eclipse-rp.net/viewforum.php?f=605",
      },
    });
    steps.push({ id: "operationalAdjustments", label: "Update Operational Adjustments in Personnel File", copyText: operationalAdjustmentCopyText, icon: FileText, action: { label: "Open Personnel Files", url: "https://gov.eclipse-rp.net/viewforum.php?f=605" } });
    steps.push({ id: "employeeAdjustments", label: "Post Employee Adjustment under Employee Adjustments", copyText: rankAdjustmentBBCode, titleText: `Rank Adjustment | ${personnelName}`, icon: ClipboardCheck, action: { label: "Copy & Open Employee Adjustment", url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=573" } });
    // The roster entry is one edited post, so this opens that post's editor.
    steps.push({ id: "rosterUpdate", label: "Adjust their rank on the Staff Roster", copyText: "", icon: Users, action: { label: "Open Staff Roster", url: GOV_STAFF_ROSTER_EDIT_URL } });
    steps.push({ id: "dashboardSheets", label: "Use the 'Promote Employee' section on the Dashboard to update the sheets", copyText: "", icon: Globe, action: { label: "Open Dashboard", url: DASHBOARD_URL } });
    steps.push({ id: "meetingAgenda", label: "Mark the promotion task as Done under the Supervisor Meeting Agenda", copyText: "", icon: CheckSquare });
    if (newRank === "master-emt") {
      steps.push({ id: "deltaCallsign", label: "Let them pick one of the available DELTA callsigns", copyText: "", icon: Star });
      steps.push({ id: "oneToOneList", label: "Update their listing on the 1:1 list, moving it to the DELTA callsign section", copyText: "", icon: Users });
    }
    return steps;
  }, [emailTemplate, emailBBCode, personnelBBCode, rankAdjustmentBBCode, operationalAdjustmentCopyText, personnelName, newRank, currentRankInfo]);

  return (
    <div className="space-y-4">
      <ToastContainer position="top-right" autoClose={2000} transition={Bounce} />

      {/* Credentials Warning */}
      {isCredentialsEmpty && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-300/20 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Staff credentials not set</p>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
              Set your name, signature, and rank in the{" "}
              <Link href="/workspace/staff" className="underline transition-colors hover:text-amber-300">
                Staff Page
              </Link>{" "}
              so templates can auto-fill your information.
            </p>
          </div>
        </div>
      )}

      {/* Rank Selector */}
      <PromotionRankSelect value={newRank} onChange={setNewRank} />

      {/* Personnel Info */}
      <div className="panel-inner p-5">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">Personnel details</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label className="mb-1 block text-xs text-muted-foreground">Full name</Label>
            <Input
              value={personnelName}
              onChange={(e) => setPersonnelName(e.target.value)}
              placeholder="John Smith"
              className="border-border bg-surface-raised text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs text-muted-foreground">Title</Label>
            <div className="flex gap-1.5">
              {(["Mr.", "Ms."] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTitle(t)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    title === t
                      ? "border-border bg-surface-hover text-foreground"
                      : "border-border bg-surface-raised text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-1 block text-xs text-muted-foreground">Previous rank</Label>
            <Input
              value={previousRank}
              onChange={(e) => setPreviousRank(e.target.value)}
              placeholder="e.g. EMT-B, EMT-I"
              className="border-border bg-surface-raised text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs text-muted-foreground">Promotion date</Label>
            <Input
              value={promotionDate}
              onChange={(e) => setPromotionDate(e.target.value.toUpperCase())}
              placeholder="DD/MMM/YYYY"
              className="border-border bg-surface-raised font-mono text-foreground placeholder:text-muted-foreground"
            />
          </div>

        </div>
      </div>

      {/* Procedure Checklist */}
      <div className="panel-inner p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Procedure checklist</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetChecklists}
            className="text-muted-foreground hover:text-foreground"
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
                className="rounded-xl border border-border bg-surface-raised/60 p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    onClick={() => toggleStep(step.id)}
                    className="mt-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {isDone ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isDone ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    {(step.copyText.length > 0 || step.action || step.id === "operationalAdjustments") && !isDone && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {step.id === "operationalAdjustments" && (
                          <>
                            <Input
                              value={personnelFileUrl}
                              onChange={(e) => setPersonnelFileUrl(e.target.value)}
                              placeholder="Personnel File Topic URL"
                              className="h-7 w-full border-border bg-surface-raised text-xs text-foreground placeholder:text-muted-foreground sm:w-64"
                            />
                            {(!currentRankInfo?.label || !promotionDate) && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/30 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 text-[10px] text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-3 w-3" />
                                Fill rank and date to enable copy
                              </span>
                            )}
                          </>
                        )}
                        {step.copyText.length > 0 && (
                          <button
                            onClick={() =>
                              copyBBCode({
                                bbCodeText: step.copyText,
                                post: {
                                  subject: step.titleText,
                                  feature: "the promotion processor",
                                  // The personnel file link is on the same card,
                                  // and that topic is where most steps post.
                                  url: pickPostTarget(step.action?.url, personnelFileUrl),
                                },
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-raised px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                          >
                            <Copy className="h-3 w-3" />
                            Copy BBCode
                          </button>
                        )}
                        {step.titleText && (
                          <button
                            onClick={() => {
                              // The whole step goes over, not just the title: the
                              // member pastes this half by hand, and the extension
                              // fills a posting page's subject and body together.
                              handOffForumPost(
                                {
                                  subject: step.titleText,
                                  url: pickPostTarget(step.action?.url, personnelFileUrl),
                                  feature: "the promotion processor",
                                },
                                step.copyText ?? step.titleText!,
                              );
                              copyToClipboard(step.titleText!);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300/30 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-500/20 hover:text-emerald-200"
                          >
                            <Copy className="h-3 w-3" />
                            Copy Title
                          </button>
                        )}
                        {step.secondaryCopyText && (
                          <button
                            onClick={() =>
                              copyBBCode({
                                bbCodeText: step.secondaryCopyText!,
                                post: {
                                  feature: "the promotion processor",
                                  url: pickPostTarget(null, personnelFileUrl),
                                },
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-md border border-amber-300/30 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-300 transition-colors hover:bg-amber-500/20 hover:text-amber-200"
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
                            // One click does the whole step: the body (and its
                            // title, when the step has one) is copied and the page
                            // opens with the extension ready to fill both.
                            onClick={(event) => {
                              if (!step.copyText) return;
                              event.preventDefault();
                              copyBBCodeAndOpen({
                                bbCodeText: step.copyText,
                                url: step.action!.url,
                                post: {
                                  subject: step.titleText,
                                  url: pickPostTarget(
                                    step.action!.url,
                                    personnelFileUrl,
                                  ),
                                  feature: "the promotion processor",
                                },
                              });
                            }}
                            className="inline-flex items-center gap-1.5 rounded-md border border-indigo-300/30 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-700 dark:text-indigo-300 transition-colors hover:bg-indigo-500/20 hover:text-indigo-200"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {step.action.label}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* OOC Checklist */}
      <div className="panel-inner p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">
              (( Out-of-Character checklist ))
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
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
                className="rounded-xl border border-border bg-surface-raised/60 p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    onClick={() => toggleOoc(item.id)}
                    className="mt-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {isDone ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                  </button>
                  <p
                    className={`flex-1 text-sm leading-relaxed ${
                      isDone ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </p>
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Quick Links */}
      <div className="panel-inner p-5">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Quick links</h3>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://gov.eclipse-rp.net/viewforum.php?f=605"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-raised px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            Personnel Files
          </a>
          <a
            href="https://gov.eclipse-rp.net/viewforum.php?f=573"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-raised px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            Employee Adjustments
          </a>
          <a
            href="https://gov.eclipse-rp.net/viewtopic.php?t=9497"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-raised px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            Staff Roster
          </a>
          <a
            href={DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-raised px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
