"use client";

import { useMedic } from "@/app/context/MedicContext";
import { copyBBCode } from "@/app/helpers/copyBBCode";
import {
  forumPostToast,
  handOffAndOpenForumPost,
} from "@/app/helpers/forumHandoff";
import {
  generateFirearmDischargeBody,
} from "@/app/templates/firearm-discharge";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BuilderField,
  BuilderForm,
  BuilderOutput,
  BuilderPreview,
  BuilderRequirement,
  BuilderSection,
  BuilderShell,
} from "@/components/builder/builder-layout";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ClipboardCopy,
  Copy,
  ExternalLink,
  FileText,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";

const COPIED_FLASH_MS = 1800;

const GOV_FIREARM_DISCHARGE_URL =
  "https://gov.eclipse-rp.net/posting.php?mode=post&f=2424";

export function FirearmDischargeTemplate() {
  const { medicCredentials } = useMedic();

  // Persisted so a refresh cannot throw the draft away mid-write.
  const [employeeName, setEmployeeName] = useLocalStorage<string>(
    "firearm-discharge-employee-name",
    "",
  );
  const [rank, setRank] = useLocalStorage<string>(
    "firearm-discharge-rank",
    "",
  );
  const [date, setDate] = useLocalStorage<string>(
    "firearm-discharge-date",
    "",
  );
  const [time, setTime] = useLocalStorage<string>(
    "firearm-discharge-time",
    "",
  );
  const [details, setDetails] = useLocalStorage<string>(
    "firearm-discharge-details",
    "",
  );
  const [footageUrl, setFootageUrl] = useLocalStorage<string>(
    "firearm-discharge-footage-url",
    "",
  );
  const [proofUrl, setProofUrl] = useLocalStorage<string>(
    "firearm-discharge-proof-url",
    "",
  );

  // The member writing the notice is usually the employee in it: take the name
  // and rank from the Staff Page until they type over them.
  const [identityTouched, setIdentityTouched] = useState(false);
  useEffect(() => {
    if (identityTouched) return;
    if (!medicCredentials.name && !medicCredentials.rank) return;
    setEmployeeName((prev) => prev || medicCredentials.name);
    setRank((prev) => prev || medicCredentials.rank);
  }, [
    identityTouched,
    medicCredentials.name,
    medicCredentials.rank,
    setEmployeeName,
    setRank,
  ]);

  const body = generateFirearmDischargeBody({
    employeeName,
    rank,
    date,
    time,
    details,
    footageUrl,
    proofUrl,
    signature: medicCredentials.signature ?? "",
  });

  // The situation is the one thing the app cannot know, so the copy buttons
  // wait for it; everything else has a placeholder or a saved value.
  const complete = Boolean(details.trim());

  const post = {
    subject: `${employeeName.trim() || "Fname Lname"} - Service Firearms Discharge Notice`,
    url: GOV_FIREARM_DISCHARGE_URL,
    feature: "the firearm discharge notice",
  };

  const handleCopy = () => {
    if (!complete) return;
    copyBBCode({ bbCodeText: body, post });
  };

  const handleCopyToGov = () => {
    if (!complete) return;
    const handedOff = handOffAndOpenForumPost(post, body);
    navigator.clipboard
      .writeText(body)
      .then(() =>
        toast.success(
          forumPostToast(
            handedOff,
            "BBCode copied - opening the posting page...",
            true,
          ),
        ),
      )
      .catch(() => toast.error("Failed to copy!"));
  };

  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_FLASH_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div className="space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        transition={Bounce}
      />

      <BuilderShell>
        <BuilderForm>
          <BuilderSection icon={Users} title="Employee">
            <BuilderField label="Employee name">
              <Input
                value={employeeName}
                onChange={(e) => {
                  setEmployeeName(e.target.value);
                  setIdentityTouched(true);
                }}
                placeholder="Fname Lname"
              />
            </BuilderField>
            <BuilderField label="Employee rank">
              <Input
                value={rank}
                onChange={(e) => {
                  setRank(e.target.value);
                  setIdentityTouched(true);
                }}
                placeholder="Full rank (e.g. Paramedic)"
              />
            </BuilderField>
          </BuilderSection>

          <BuilderSection icon={CalendarDays} title="When">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <BuilderField label="Date">
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value.toUpperCase())}
                  placeholder="DD/MMM/YYYY (e.g. 20/JUL/2026)"
                  className="font-mono"
                />
              </BuilderField>
              <BuilderField label="Time (( UTC ))">
                <div className="flex gap-2">
                  <Input
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="00:00 am/pm"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => {
                      const now = new Date();
                      const hours = now.getUTCHours();
                      const minutes = now.getUTCMinutes();
                      const suffix = hours >= 12 ? "pm" : "am";
                      const twelve =
                        hours % 12 === 0 ? 12 : hours % 12;
                      setTime(
                        `${twelve.toString().padStart(2, "0")}:${minutes
                          .toString()
                          .padStart(2, "0")} ${suffix}`,
                      );
                    }}
                    title="Fills in the current time (UTC)"
                  >
                    Now
                  </Button>
                </div>
              </BuilderField>
            </div>
          </BuilderSection>

          <BuilderSection
            icon={FileText}
            title="The incident"
            hint="The details are the body of the notice - the footage and proof links are optional."
          >
            <BuilderField label="Details of the situation">
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="What happened, in order"
                rows={4}
                className="resize-y"
              />
            </BuilderField>

            <BuilderField
              label="Relevant footage link"
              hint="Leave empty for a plain “None” on the line."
            >
              <Input
                value={footageUrl}
                onChange={(e) => setFootageUrl(e.target.value)}
                placeholder="https://... (clip, streamable, forum attachment)"
              />
            </BuilderField>

            <BuilderField
              label="Proof of RP link"
              hint={
                <>
                  Wrapped in <code>(( ... ))</code> on the notice.
                </>
              }
            >
              <Input
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://... (screenshot or post)"
              />
            </BuilderField>
          </BuilderSection>

          {!medicCredentials.signature && (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-300/20 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Signature not set
                </p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                  Save your signature on the{" "}
                  <Link
                    href="/workspace/staff"
                    className="underline transition-colors hover:text-amber-300"
                  >
                    Staff Page
                  </Link>{" "}
                  so the notice signs itself.
                </p>
              </div>
            </div>
          )}
        </BuilderForm>

        <BuilderPreview
          icon={FileText}
          title="Post Preview"
          badge="Firearm Discharge"
          actions={
            <>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={handleCopy}
                disabled={!complete}
                className="w-full"
              >
                <Copy className="h-4 w-4" />
                Copy Template
              </Button>

              <Link
                href={GOV_FIREARM_DISCHARGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  type="button"
                  size="lg"
                  onClick={handleCopyToGov}
                  disabled={!complete}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  Copy to GOV
                </Button>
              </Link>
            </>
          }
          note="Copy to GOV copies the notice and opens the new-topic page with it: the title and the body are filled in by the extension as the page loads, ready to review and submit."
        >
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-hover/50 px-3 py-2.5">
            <ClipboardCopy className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-mono text-xs text-foreground">
              {post.subject}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="ml-auto h-7 shrink-0 px-2 text-[10px]"
              onClick={async () => {
                if (!complete) return;
                await navigator.clipboard.writeText(post.subject);
                setCopied(true);
              }}
              disabled={!complete}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy title"}
            </Button>
          </div>

          <BuilderOutput label="Template Body" value={body} />

          {!complete && (
            <BuilderRequirement>
              Fill in the details of the situation to enable the copy buttons.
            </BuilderRequirement>
          )}
        </BuilderPreview>
      </BuilderShell>
    </div>
  );
}
