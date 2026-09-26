"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  Copy,
  Trash2,
  User,
  FileCheck,
  FileText,
  Pencil,
  Lock,
  Plus,
  X,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useHighestRank } from "@/app/hooks/useHighestRank";
import { rankOptions } from "@/app/constants/general/ranks";
import { useSession } from "@/app/(routes)/divisions/ftd/paperwork/components/SessionContext";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import {
  handOffForumPost,
  pickPostTarget,
} from "@/app/helpers/forumHandoff";

import {
  civilianRideAlongConfig,
  type CivilianRideAlongPhaseKey,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/civilianRideAlongConfig";
import {
  generateCivilianRideAlongBBCode,
  type CivilianRideAlongValues,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/generateCivilianRideAlongBBCode";
import { CivilianRideAlongGuideline } from "@/app/(routes)/divisions/ftd/paperwork/components/CivilianRideAlongGuideline";

const RIDE_ALONG_PROGRAM_URL =
  "https://gov.eclipse-rp.net/viewforum.php?f=577";

/**
 * Status tag each phase puts in front of the applicant's name. The ride-along
 * report is not a decision on the application, so it carries no tag.
 */
const PHASE_TITLE_TAGS: Record<CivilianRideAlongPhaseKey, string | null> = {
  accepted: "[ACCEPTED]",
  expired: "[EXPIRED]",
  denied: "[DENIED]",
  onHold: "[ON-HOLD]",
  rideAlongReport: null,
};

const defaultFormState = {
  applicantName: "",
  rank: "",
  notes: "",
  rejectionReasons: [] as Array<{ reason: string }>,
};

/** Civilian Ride-Along paperwork form. */
export default function CivilianRideAlongForm() {
  const [phase, setPhase] = useState<CivilianRideAlongPhaseKey>("accepted");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const { details, setDetails, setCurrentPhase } = useSession();
  const { rankLabel: autoRankLabel } = useHighestRank();

  // Rank dropdown is locked by default, matching the other papers.
  const [isRankEditing, setIsRankEditing] = useState(false);

  // The hook *is* the form's state. Mirroring it into a second `useState` and
  // writing that back lost the stored data: the mirror's own mount write
  // replaced the hydrated value before it could ever be applied.
  const [form, setForm] = useLocalStorage<typeof defaultFormState>(
    "ftd-civilian-ridealong-form-data",
    { ...defaultFormState },
  );

  // The applicant's own thread: the decision is posted as a reply in it, so this
  // is the page the extension opens and fills. No post id is guessed from a name.
  const [govLink, setGovLink] = useLocalStorage<string>(
    "ftd-ridealong-gov-link",
    "",
  );

  // Auto-populate Rank from highest Discord role on hook resolve.
  // Always overwrites on page reload so the rank reflects their current
  // Discord roles even if it changed since the last visit.
  useEffect(() => {
    if (!autoRankLabel) return;
    setForm((prev: typeof defaultFormState) => ({
      ...prev,
      rank: autoRankLabel,
    }));
  }, [autoRankLabel, setForm]);

  useEffect(() => {
    setCurrentPhase(phase);
  }, [phase, setCurrentPhase]);

  useEffect(() => {
    return () => {
      setCurrentPhase(null);
    };
  }, [setCurrentPhase]);

  const clearAllFields = () => {
    setForm({
      ...defaultFormState,
      rank: autoRankLabel ?? form.rank,
    });
    setOutput("");
    setCopied(false);
    toast.info("All fields cleared", { theme: "dark" });
  };

  const update = <K extends keyof typeof defaultFormState>(
    key: K,
    value: (typeof defaultFormState)[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addRejectionReason = () => {
    update("rejectionReasons", [
      ...form.rejectionReasons,
      { reason: "" },
    ]);
  };

  const updateRejectionReason = (index: number, value: string) => {
    const updated = [...form.rejectionReasons];
    updated[index] = { reason: value };
    update("rejectionReasons", updated);
  };

  const removeRejectionReason = (index: number) => {
    update(
      "rejectionReasons",
      form.rejectionReasons.filter((_, i) => i !== index),
    );
  };

  const config = civilianRideAlongConfig[phase];
  const sections = config.sections;

  // "[ACCEPTED] Firstname Lastname" - the application's own title, retagged for
  // whichever decision this phase carries.
  const titleTag = PHASE_TITLE_TAGS[phase];
  const fullTitle = titleTag
    ? `${titleTag}${
        form.applicantName.trim() ? ` ${form.applicantName.trim()}` : ""
      }`
    : null;

  const generate = () => {
    const values: CivilianRideAlongValues = {
      applicantName: form.applicantName,
      signature: details.signature,
      rank: form.rank,
      notes: form.notes,
      rejectionReasons: form.rejectionReasons,
    };
    const bbcode = generateCivilianRideAlongBBCode(values, phase);
    setOutput(bbcode);
    setCopied(false);
  };

  // The response is a reply in the applicant's own thread, so the post carries
  // the body plus the status-tagged title for the extension to fill both.
  const rideAlongPost = {
    subject: fullTitle ?? undefined,
    feature: "the civilian ride-along paperwork generator",
    url: pickPostTarget(govLink.trim()),
  };

  const copyToClipboard = async () => {
    if (!output) return;
    handOffForumPost(rideAlongPost, output);
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied!", { theme: "dark" });
  };

  // Copies and opens the applicant's thread in one click, so the decision is
  // written into the page that just opened.
  const copyAndOpen = () => {
    const url = govLink.trim();
    if (!output || !url) return;
    copyBBCodeAndOpen({
      bbCodeText: output,
      url,
      post: { ...rideAlongPost, url: pickPostTarget(url) },
    });
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <div className="space-y-6">
        <h2 className="sr-only">Civilian Ride-Along Paperwork</h2>

        {/* === Guideline (read this before filling anything) === */}
        <CivilianRideAlongGuideline />

        {/* === Applicant / Signature / Rank === */}
        <Card className="border-0 shadow-none bg-muted/30">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Applicant&apos;s Name
              </Label>
              <Input
                value={form.applicantName}
                onChange={(e) => update("applicantName", e.target.value)}
                placeholder="Firstname Lastname"
                className="bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="ridealong-gov-link"
                className="text-xs text-muted-foreground flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                GOV Application Link
                {fullTitle && (
                  <span className="ml-1 rounded-md bg-background px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground">
                    {fullTitle}
                  </span>
                )}
              </Label>
              <Input
                id="ridealong-gov-link"
                value={govLink}
                onChange={(e) => setGovLink(e.target.value)}
                placeholder="Paste the applicant's application post URL"
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                The browser extension opens this post and fills the decision and
                its tagged title in. Leave it empty to keep the copy-only flow.
              </p>
            </div>

            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Signature (image link)
                </Label>                  <Input
                  value={details.signature}
                  onChange={(e) =>
                    setDetails((prev) => ({
                      ...prev,
                      signature: e.target.value,
                    }))
                  }
                  placeholder="insert link here"
                  className="bg-background"
                />
              </div>
              <div className="flex-1 min-w-[160px] space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  Rank
                  {autoRankLabel && form.rank === autoRankLabel && (
                    <span
                      aria-live="polite"
                      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-primary/70"
                      title={`Auto-detected: ${autoRankLabel}. Click the pencil to override.`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                      auto
                      <span className="sr-only">
                        Auto-detected {autoRankLabel} from your Discord
                        roles.
                      </span>
                    </span>
                  )}
                </Label>
                <div className="flex items-center gap-1.5">
                  <Select
                    value={form.rank || undefined}
                    onValueChange={(v) => update("rank", v)}
                    disabled={!isRankEditing}
                  >
                    <SelectTrigger
                      className="bg-background flex-1"
                      aria-label="Rank"
                    >
                      <SelectValue
                        placeholder={
                          autoRankLabel ?? "No rank detected - click edit"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {rankOptions.map((label) => (
                        <SelectItem key={label} value={label}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsRankEditing((v) => !v)}
                    aria-label={
                      isRankEditing ? "Lock rank" : "Edit rank manually"
                    }
                    title={
                      isRankEditing
                        ? "Click to lock"
                        : autoRankLabel
                          ? `Auto-selected: ${autoRankLabel}. Click to edit.`
                          : "Edit manually"
                    }
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    {isRankEditing ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === Phase Selector === */}
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(civilianRideAlongConfig).map(([key, value]) => (
            <Button
              key={key}
              variant={phase === key ? "default" : "ghost"}
              size="sm"
              onClick={() => setPhase(key as CivilianRideAlongPhaseKey)}
              className="text-sm font-normal"
            >
              {value.label}
            </Button>
          ))}
        </div>

        {/* === Phase-Specific Form Sections === */}
        <div className="space-y-4">
          {/* === Rejection Reasons (Denied only) === */}
          {sections.includes("rejectionReasons") && (
            <Card className="border shadow-sm border-destructive/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">
                    Rejection Reasons
                  </Label>
                </div>
                {form.rejectionReasons.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Add at least one reason for the denial.
                  </p>
                ) : (
                  form.rejectionReasons.map((r, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground shrink-0 w-6">
                        {index + 1}.
                      </span>
                      <Input
                        value={r.reason}
                        onChange={(e) =>
                          updateRejectionReason(index, e.target.value)
                        }
                        placeholder="e.g. Incomplete application"
                        className="bg-background"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRejectionReason(index)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        aria-label={`Remove reason ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRejectionReason}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add reason
                </Button>
              </CardContent>
            </Card>
          )}

          {/* === Notes (Ride-Along Report only) === */}
          {sections.includes("notes") && (
            <Card className="border shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">
                    Notes (optional but preferred)
                  </Label>
                </div>
                <Textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Anything noteworthy about how the session went."
                  className="min-h-[100px] bg-background"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* === Action Bar === */}
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 flex flex-wrap gap-2 justify-center md:justify-start shadow-lg">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1.5 font-normal"
          >
            <a
              href={RIDE_ALONG_PROGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the Ride-Along Program forum in a new tab"
            >
              <ExternalLink className="h-4 w-4" />
              Open Program
            </a>
          </Button>
          <Button onClick={generate} size="sm" className="px-6">
            <FileCheck className="h-4 w-4 mr-2" />
            Generate
          </Button>
          <Button
            disabled={!output}
            variant="secondary"
            size="sm"
            onClick={copyToClipboard}
            className="px-6"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            disabled={!output || !govLink.trim()}
            variant="secondary"
            size="sm"
            onClick={copyAndOpen}
            className="px-6"
            title={
              !output
                ? "Generate the paperwork first"
                : govLink.trim()
                  ? "Copies the paperwork and opens the application with it"
                  : "Paste the GOV Application Link above first"
            }
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Copy &amp; Open
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFields}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* === Generated BBCode Output === */}
        {output && (
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">
                  Generated BBCode
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-muted-foreground hover:text-foreground gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-xs">Re-copy</span>
                </Button>
              </div>
              <Textarea
                value={output}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-background"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
