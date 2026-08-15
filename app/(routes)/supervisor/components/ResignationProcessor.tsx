"use client";

import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useMedic } from "@/app/context/MedicContext";
import { copyBBCode } from "@/app/helpers/copyBBCode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bounce, ToastContainer } from "react-toastify";
import React, { useMemo } from "react";
import Link from "next/link";
import {
  Copy,
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
  Globe,
  ListChecks,
  Shield,
  Archive,
  KeyRound,
  FolderArchive,
  ScrollText,
  Ban,
  LogOut,
} from "lucide-react";
import {
  personnelFileDischargeTemplate,
  dischargeNoticeTemplate,
  resignationRemarksTemplate,
  revokeAccessTemplate,
  playerLogTemplate,
} from "@/app/templates/resignations";
import type { DischargeType } from "@/app/templates/resignations";

type OocItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  copyText?: string;
  copyLabel?: string;
  note?: string;
  action?: { label: string; url: string };
};

type IcStep = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  copyText?: string;
  titleText?: string;
  copyLabel?: string;
  note?: string;
  warning?: boolean;
  action?: { label: string; url: string };
  secondaryAction?: { label: string; url: string };
  subItems?: {
    id: string;
    label: string;
    copyText?: string;
    copyLabel?: string;
  }[];
};

const copyPlain = (text: string) => {
  navigator.clipboard.writeText(text);
};

export function ResignationProcessor() {
  const { medicCredentials } = useMedic();

  const [personnelName, setPersonnelName] = useLocalStorage(
    "resig-personnel-name",
    "",
  );
  const [employeeRank, setEmployeeRank] = useLocalStorage(
    "resig-employee-rank",
    "",
  );
  const [dischargeType, setDischargeType] = useLocalStorage<DischargeType>(
    "resig-discharge-type",
    "Honorable",
  );
  const [dischargeDate, setDischargeDate] = useLocalStorage(
    "resig-discharge-date",
    "",
  );
  const [dischargeReason, setDischargeReason] = useLocalStorage(
    "resig-discharge-reason",
    "",
  );
  const [resignationPostUrl, setResignationPostUrl] = useLocalStorage(
    "resig-post-url",
    "",
  );
  const [dischargeRpLink, setDischargeRpLink] = useLocalStorage(
    "resig-discharge-rp-link",
    "",
  );

  const [completedSteps, setCompletedSteps] = useLocalStorage<string[]>(
    "resig-completed-steps",
    [],
  );
  const [completedOoc, setCompletedOoc] = useLocalStorage<string[]>(
    "resig-completed-ooc",
    [],
  );

  const isCredentialsEmpty =
    !medicCredentials.name || !medicCredentials.signature || !medicCredentials.rank;

  const reachOutTag = medicCredentials.name
    ? `[Reached out to, ${medicCredentials.name}]`
    : "[Reached out to, YOURNAME]";

  const personnelFileBBCode = useMemo(
    () =>
      personnelFileDischargeTemplate.renderBody({
        date: dischargeDate,
        dischargeType,
        dischargedBy: medicCredentials.name,
        paperworkLink: resignationPostUrl,
      }),
    [dischargeDate, dischargeType, medicCredentials.name, resignationPostUrl],
  );

  const dischargeNoticeBBCode = useMemo(
    () =>
      dischargeNoticeTemplate.renderBody({
        employeeRank,
        employeeName: personnelName,
        date: dischargeDate,
        dischargeType,
        reason: dischargeReason,
        processedByName: medicCredentials.name,
        processedByRank: medicCredentials.rank,
      }),
    [
      employeeRank,
      personnelName,
      dischargeDate,
      dischargeType,
      dischargeReason,
      medicCredentials,
    ],
  );

  const resignationRemarksBBCode = useMemo(
    () =>
      resignationRemarksTemplate.renderBody({
        dischargeType,
        justification: dischargeReason,
        signature: medicCredentials.signature,
        medicName: medicCredentials.name,
        medicRank: medicCredentials.rank,
      }),
    [dischargeType, dischargeReason, medicCredentials],
  );

  const revokeAccessBBCode = useMemo(
    () =>
      revokeAccessTemplate.renderBody({
        employeeName: personnelName,
      }),
    [personnelName],
  );

  const playerLogBBCode = useMemo(
    () =>
      playerLogTemplate.renderBody({
        date: dischargeDate,
        employeeName: personnelName,
        reason: dischargeReason,
        rpLink: dischargeRpLink || undefined,
      }),
    [dischargeDate, personnelName, dischargeReason, dischargeRpLink],
  );

  const dischargeTitle = useMemo(() => {
    const type = dischargeType === "Dishonorable" ? "Dishonorable" : "Honorable";
    return `${type} Discharge | ${personnelName || "Fname Lname"}`;
  }, [dischargeType, personnelName]);

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleOoc = (id: string) => {
    setCompletedOoc((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const resetChecklists = () => {
    setCompletedSteps([]);
    setCompletedOoc([]);
  };

  const icSteps: IcStep[] = useMemo(
    () => [
      {
        id: "review",
        label:
          "Read through the resignation and ensure it has details and reasoning",
        icon: ScrollText,
        action: {
          label: "Open Resignation Forum",
          url: "https://gov.eclipse-rp.net/viewforum.php?f=614",
        },
        subItems: [
          {
            id: "review-lack",
            label:
              "If details/reasoning are missing: mark the topic with the reach-out tag, email the employee (BCC High Command), recommend an LOA/ROH or EMT-P switch if eligible, then wait 24 hours after the reach-out",
            copyText: reachOutTag,
            copyLabel: "Copy reach-out tag",
          },
          {
            id: "review-ok",
            label:
              "If details/reasoning are present: confirm the resignation was posted 24+ hours ago before proceeding",
          },
        ],
      },
      {
        id: "personnel-file",
        label:
          "Update the first post under the Discharge Section of the Personnel File",
        copyText: personnelFileBBCode,
        icon: FileText,
        action: {
          label: "Open Personnel Files",
          url: "https://gov.eclipse-rp.net/viewforum.php?f=605",
        },
      },
      {
        id: "archive-personnel",
        label: "Archive the personnel file",
        icon: Archive,
      },
      {
        id: "roster",
        label:
          "Update the Roster, removing them (CTRL+F for name & callsign)",
        icon: Users,
        action: {
          label: "Open Staff Roster",
          url: "https://gov.eclipse-rp.net/viewtopic.php?f=570&t=9497",
        },
      },
      {
        id: "points-of-contact",
        label:
          "If they were a divisional head/assistant head, remove them from the Points of Contact list",
        icon: ClipboardCheck,
        action: {
          label: "Open Points of Contact",
          url: "https://gov.eclipse-rp.net/viewtopic.php?p=647937#p647937",
        },
      },
      {
        id: "one-to-one",
        label: "Remove them from the 1:1 list",
        icon: ListChecks,
        action: {
          label: "Open 1:1 List",
          url: "https://gov.eclipse-rp.net/viewtopic.php?p=852847#p852847",
        },
      },
      {
        id: "revoke-access",
        label:
          "Revoke access cards, keys, and all other employment-issued access (( Remove from F4 only if pay is processed ))",
        icon: KeyRound,
      },
      {
        id: "usergroups",
        label: "Remove them from their LSEMS usergroups",
        icon: Shield,
      },
      {
        id: "emr-profile",
        label:
          "For EMR resignations/terminations: archive their EMR Profile or Reinstatement Profile",
        icon: FolderArchive,
        action: {
          label: "Open EMR Profiles",
          url: "https://gov.eclipse-rp.net/viewforum.php?f=617",
        },
        secondaryAction: {
          label: "Open Reinstatement Profiles",
          url: "https://gov.eclipse-rp.net/viewforum.php?f=601",
        },
      },
      {
        id: "duty-reports",
        label:
          "Archive their Duty Reports topic and FT Session Reports topic, if they had one",
        icon: FileText,
        action: {
          label: "Open Duty Reports",
          url: "https://gov.eclipse-rp.net/viewforum.php?f=755",
        },
      },
      {
        id: "divisional-file",
        label: "Archive their Divisional Personnel File",
        icon: FolderArchive,
        action: {
          label: "Open Divisional Personnel Files",
          url: "https://gov.eclipse-rp.net/viewforum.php?f=4155",
        },
      },
      {
        id: "ia-check",
        label:
          "Ensure there was no notice of an active IA case involving them",
        icon: AlertTriangle,
        warning: true,
        action: {
          label: "Open Supervisor Discussion Board",
          url: "https://gov.eclipse-rp.net/viewforum.php?f=1933",
        },
      },
      {
        id: "suspension-check",
        label: "Ensure they are not currently suspended",
        icon: Ban,
        warning: true,
        note: "Failure to meet either check above is grounds for a Dishonorable Discharge",
        action: {
          label: "Open Employee Adjustments",
          url: "https://gov.eclipse-rp.net/viewforum.php?f=573",
        },
      },
      {
        id: "discharge-notice",
        label: "Post the Discharge notice under Employee Adjustments",
        copyText: dischargeNoticeBBCode,
        titleText: dischargeTitle,
        icon: ClipboardCheck,
        action: {
          label: "Open Employee Adjustments",
          url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=573",
        },
      },
      {
        id: "resignation-remarks",
        label:
          "Respond to the resignation post with the remarks format before archiving it",
        copyText: resignationRemarksBBCode,
        icon: MessageSquare,
        action: {
          label: "Open Resignation Forum",
          url: "https://gov.eclipse-rp.net/viewforum.php?f=614",
        },
      },
    ],
    [
      reachOutTag,
      personnelFileBBCode,
      dischargeNoticeBBCode,
      resignationRemarksBBCode,
      dischargeTitle,
    ],
  );

  const oocItems: OocItem[] = useMemo(
    () => [
      {
        id: "revoke-access-ooc",
        label:
          "Roleplay revoking access and save a screenshot of the roleplay with /time",
        icon: KeyRound,
        copyText: revokeAccessBBCode,
        copyLabel: "Copy /me",
      },
      {
        id: "player-log",
        label:
          "Update player-logs in the LSEMS Discord and attach the revoke-access proof screenshot",
        icon: MessageSquare,
        copyText: playerLogBBCode,
        copyLabel: "Copy player-log",
      },
      {
        id: "usergroup-request",
        label:
          "Request usergroup removal in the #forum-and-f4-requests channel",
        icon: Users,
        note: "Strongly encouraged - doing it this way is easier on you and your time.",
      },
      {
        id: "f4-removal",
        label:
          "Create a request in #forum-and-f4-requests for F4 removal. If Command+ is around, ask them to process pay; if you are Command+, process pay yourself and remove from F4.",
        icon: Shield,
      },
      {
        id: "discord-roles",
        label:
          "Remove TS roles and Discord roles. Issue the Guest role for an Honorable discharge; kick from Discord for a Dishonorable discharge.",
        icon: Headphones,
      },
      {
        id: "dashboard",
        label:
          "Open the LSEMS Dashboard, find their name, click 'REMOVE', and follow the on-screen prompts.",
        icon: Globe,
        action: { label: "Open Dashboard", url: "https://ecrplsems.com/" },
      },
    ],
    [revokeAccessBBCode, playerLogBBCode],
  );

  const completedOocCount = oocItems.filter((item) =>
    completedOoc.includes(item.id),
  ).length;

  return (
    <div className="space-y-4">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="dark"
        transition={Bounce}
      />

      {/* Credentials Warning */}
      {isCredentialsEmpty && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              Staff credentials not set
            </p>
            <p className="text-xs text-amber-400/70">
              Set your name, signature, and rank in the{" "}
              <Link
                href="/staff"
                className="underline transition-colors hover:text-amber-300"
              >
                Staff Page
              </Link>{" "}
              so templates can auto-fill your information.
            </p>
          </div>
        </div>
      )}

      {/* Personnel Info */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <LogOut className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-300">
            Personnel details
          </h3>
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
            <Label className="mb-1 block text-xs text-slate-500">
              Employee rank
            </Label>
            <Input
              value={employeeRank}
              onChange={(e) => setEmployeeRank(e.target.value)}
              placeholder="e.g. EMT-B, Paramedic"
              className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs text-slate-500">
              Discharge type
            </Label>
            <div className="flex gap-1.5">
              {(["Honorable", "Dishonorable"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setDischargeType(type)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    dischargeType === type
                      ? type === "Honorable"
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : "border-red-500/40 bg-red-500/20 text-red-300"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-1 block text-xs text-slate-500">
              Discharge date
            </Label>
            <Input
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value.toUpperCase())}
              placeholder="DD/MMM/YYYY"
              className="border-slate-800 bg-slate-950 font-mono text-white placeholder:text-slate-600"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1 block text-xs text-slate-500">
              Discharge reason / justification
            </Label>
            <Input
              value={dischargeReason}
              onChange={(e) => setDischargeReason(e.target.value)}
              placeholder="Reason for discharge"
              className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1 block text-xs text-slate-500">
              Resignation post URL
            </Label>
            <Input
              value={resignationPostUrl}
              onChange={(e) => setResignationPostUrl(e.target.value)}
              placeholder="https://gov.eclipse-rp.net/viewtopic.php?t=..."
              className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1 block text-xs text-slate-500">
              RP of discharge link
            </Label>
            <Input
              value={dischargeRpLink}
              onChange={(e) => setDischargeRpLink(e.target.value)}
              placeholder="https://..."
              className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Procedure Checklist */}
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
                className={`rounded-lg border bg-slate-950/50 p-4 transition-colors ${
                  step.warning
                    ? "border-red-500/20 hover:border-red-500/40"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    onClick={() => toggleStep(step.id)}
                    className={`mt-0.5 transition-colors ${
                      step.warning
                        ? "text-red-400/70 hover:text-red-300"
                        : "text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {isDone ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isDone
                          ? "text-slate-500 line-through"
                          : step.warning
                            ? "text-red-300"
                            : "text-white"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.subItems && !isDone && (
                      <ul className="mt-2 space-y-1.5 border-l border-slate-700 pl-3">
                        {step.subItems.map((sub) => (
                          <li key={sub.id} className="text-xs text-slate-400">
                            {sub.label}
                            {sub.copyText && (
                              <button
                                onClick={() =>
                                  copyBBCode({ bbCodeText: sub.copyText! })
                                }
                                className="ml-2 inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                              >
                                <Copy className="h-3 w-3" />
                                {sub.copyLabel || "Copy"}
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {step.note && !isDone && (
                      <p className="mt-2 text-xs font-medium text-red-400">
                        {step.note}
                      </p>
                    )}
                    {!isDone &&
                      (step.copyText ||
                        step.titleText ||
                        step.action ||
                        step.secondaryAction) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {step.copyText && (
                            <button
                              onClick={() =>
                                copyBBCode({ bbCodeText: step.copyText! })
                              }
                              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                            >
                              <Copy className="h-3 w-3" />
                              {step.copyLabel || "Copy BBCode"}
                            </button>
                          )}
                          {step.titleText && (
                            <button
                              onClick={() => copyPlain(step.titleText!)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300 transition-colors hover:bg-emerald-500/20 hover:text-emerald-200"
                            >
                              <Copy className="h-3 w-3" />
                              Copy Title
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
                          {step.secondaryAction && (
                            <a
                              href={step.secondaryAction.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300 transition-colors hover:bg-indigo-500/20 hover:text-indigo-200"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {step.secondaryAction.label}
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
            {completedOocCount}/{oocItems.length}
          </span>
        </div>
        <ol className="space-y-2">
          {oocItems.map((item) => {
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
                    {isDone ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`text-sm leading-relaxed ${
                        isDone ? "text-slate-500 line-through" : "text-slate-200"
                      }`}
                    >
                      {item.label}
                    </p>
                    {item.note && !isDone && (
                      <p className="mt-1 text-xs text-slate-500">{item.note}</p>
                    )}
                    {!isDone && (item.copyText || item.action) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.copyText && (
                          <button
                            onClick={() =>
                              copyBBCode({ bbCodeText: item.copyText! })
                            }
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                          >
                            <Copy className="h-3 w-3" />
                            {item.copyLabel || "Copy"}
                          </button>
                        )}
                        {item.action && (
                          <a
                            href={item.action.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300 transition-colors hover:bg-indigo-500/20 hover:text-indigo-200"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {item.action.label}
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
