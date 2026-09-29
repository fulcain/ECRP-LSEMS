"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import {
  handOffForumPost,
  pickPostTarget,
} from "@/app/helpers/forumHandoff";
import {
  Check,
  ClipboardCopy,
  ExternalLink,
  Plus,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import { RED } from "@/app/constants/divisions/red";
import { directorTitleForDivisionKey } from "@/app/constants/general/directorRoles";
import { useMedic } from "@/app/context/MedicContext";
import { GOV_PM_COMPOSE_URL } from "@/app/helpers/govLinks";
import {
  redTemplates,
  OFFER_HOURS,
  OFFER_TIERS,
} from "@/app/templates/red-formats";
import { NowTimeButton } from "@/components/now-time-button";
import { PageContainer } from "@/components/ui/page-container";
import { DivisionQuickLinksLink } from "@/components/division-quick-links-link";
import { DivisionHeader } from "@/components/division/division-header";
import { DivisionUserGroupsLink } from "@/components/division/division-user-groups-link";
import { DocumentPicker } from "@/components/division/document-picker";
import { DiscussionBoardComposer } from "@/components/discussion-board-composer";
import {
  isREDBoardKey,
  isREDDocument,
  RED_PAPERWORK,
  type REDWorkItem,
} from "./components/paperwork-documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const COPIED_FLASH_MS = 1800;

const genderOptions = ["Mr.", "Mrs."] as const;

/**
 * Title-cases a name field used in copyable thread titles.
 *
 * Examples:
 *   "john doe"        → "John Doe"
 *   "JOHN DOE"        → "John Doe"
 *   "mary-jane smith" → "Mary-Jane Smith"
 *   "o'brien"         → "O'Brien"
 *
 * Capitalizes the first letter of every word boundary (start of string,
 * whitespace, hyphen, apostrophe) and lower-cases the rest. Multiple
 * internal whitespace is collapsed to a single space.
 */
function formatTitleCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/(^|[\s\-'])(\p{L})/gu, (_match, prefix: string, ch: string) =>
      prefix + ch.toUpperCase(),
    )
    .trim()
    .replace(/\s+/g, " ");
}


/**
 * Where a format is posted. The buttons beside the output open exactly these
 * places - a section for a new post, a topic to reply to - so the same target
 * goes with the copied post and the extension can fill the right editor without
 * being told twice.
 *
 * The two feedback requests are letters to a person rather than forum posts:
 * they go out as private messages, so their target is the composer - which the
 * extension opens with the recipient and the letter already in it.
 */
const FORMAT_POST_TARGETS: Partial<
  Record<(typeof redTemplates)[number]["value"], string>
> = {
  "feedback-request": GOV_PM_COMPOSE_URL,
  "frd-feedback-request": GOV_PM_COMPOSE_URL,
};

export default function REDFormatsPage() {
  const { medicCredentials, divisionRanks } = useMedic();
  // Nothing is chosen until the member picks a card, so the page opens on the
  // picker alone - no builder is filled in for a document nobody asked for.
  const [selectedDocument, setSelectedDocument] = useState<REDWorkItem | null>(
    null,
  );

  // Sync the initial document from the URL. `?format=` names any document the
  // picker offers, the board included, so a link to one still opens it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("format") as REDWorkItem | null;
    if (fromUrl && isREDDocument(fromUrl)) setSelectedDocument(fromUrl);
    // The board used to be its own tab; an old `?tab=discussion-board` link
    // opens the board it named rather than the first application format.
    if (params.get("tab") === "discussion-board") {
      setSelectedDocument("redDiscussionBoard");
    }
  }, []);

  // The picker's value is the page's `?format=`, so a link someone shares opens
  // the document they were looking at - and a page with nothing picked carries
  // no `?format=` at all. `?tab=` is retired with the bar it came from: it is
  // read once on mount and dropped.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("tab");
    if (selectedDocument) params.set("format", selectedDocument);
    else params.delete("format");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, [selectedDocument]);
  const [gender, setGender] = useState<(typeof genderOptions)[number]>(
    genderOptions[0],
  );
  const [applicantName, setApplicantName] = useState("");
  // The application post this format belongs on. Pasted once and reused, it is
  // the page the extension opens and fills - a formatted target picks the
  // member's own post over a section listing when they gave one.
  const [govLink, setGovLink] = useLocalStorage<string>(
    "red-formats:gov-link",
    "",
  );
  // A feedback request is sent to somebody, so who it is addressed to is a
  // field of its own - the composer opens with it already in the username box.
  const [recipient, setRecipient] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedTitleTag, setCopiedTitleTag] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const copyTimerRef = useRef<number | undefined>(undefined);
  const prevFormatRef = useRef(selectedDocument);

  // Trigger a subtle re-animation when the format changes
  useEffect(() => {
    if (prevFormatRef.current !== selectedDocument) {
      setAnimKey((k) => k + 1);
      prevFormatRef.current = selectedDocument;
    }
  }, [selectedDocument]);

  // Clear any in-flight "Copied!" flash if the component unmounts mid-flash.
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== undefined) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);
  const [reasons, setReasons] = useState<string[]>([""]);
  const [denialType, setDenialType] = useLocalStorage<"IC" | "OOC">(
    "red-formats:denialType",
    "OOC",
  );
  const [applyOtherChar, setApplyOtherChar] = useLocalStorage<
    "may" | "may not"
  >("red-formats:applyOtherChar", "may");
  const [weeks, setWeeks] = useLocalStorage<number>(
    "red-formats:weeks",
    2,
  );
  const [employmentRank, setEmploymentRank] = useState("");
  const [offerTier, setOfferTier] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");

  const addReason = () => setReasons((prev) => [...prev, ""]);
  const removeReason = (index: number) =>
    setReasons((prev) => prev.filter((_, i) => i !== index));
  const updateReason = (index: number, value: string) =>
    setReasons((prev) => prev.map((r, i) => (i === index ? value : r)));

  // A board is not a template, so this falls back to the first format - the
  // builder below is only rendered when a format is the selected document.
  // The format builder is only for a format: the board has a composer of its
  // own, and a page with nothing picked has neither.
  const activeFormat =
    redTemplates.find((format) => format.value === selectedDocument) ?? null;
  const boardKey =
    selectedDocument && isREDBoardKey(selectedDocument)
      ? selectedDocument
      : null;
  const redRank = divisionRanks.RED ?? "";
  // The two letters that leave the forum: they are private messages to a
  // person, so they take a recipient instead of an application link.
  const isFeedbackRequest =
    selectedDocument === "feedback-request" ||
    selectedDocument === "frd-feedback-request";
  const feedbackRecipient = isFeedbackRequest ? recipient.trim() : "";
  const supportsReasons =
    selectedDocument === "pending-edit" ||
    selectedDocument === "reinstatement-on-hold" ||
    selectedDocument === "reinstatement-denied";
  const supportsEmploymentRank = selectedDocument === "reinstatement-offer";
  // What the offer will actually list: the picked tier, or the default when none.
  const offerHours = OFFER_HOURS[offerTier] ?? OFFER_HOURS.EMTs;
  const isReinstatement =
    selectedDocument?.startsWith("reinstatement-") ?? false;
  const reasonSectionLabel =
    selectedDocument === "reinstatement-denied"
      ? "Reasons for denial"
      : selectedDocument === "reinstatement-on-hold"
        ? "Reinstatement concerns"
        : "Hold reasons";

  // Build the full thread title: "[STATUS] LSEMS Application - <Applicant Name>".
  // The status prefix (e.g. "[ACCEPTED] LSEMS Application") is set by the
  // template; the suffix is the title-cased applicant name. When no name
  // is entered, only the status prefix is shown - so the pill clearly
  // signals that the suffix is still missing.
  const fullTitle = !isReinstatement && activeFormat?.titleTag
    ? `${activeFormat.titleTag}${
        applicantName.trim() ? ` - ${formatTitleCase(applicantName)}` : ""
      }`
    : null;


  const bbcodeOutput = useMemo(() => {
    // Nothing is being written yet: the picker is on its own.
    if (!activeFormat) return "";
    const applicant = `${gender} ${applicantName.trim() || "Applicant Name"}`;
    // A director covering RED signs as the director, not as a RED rank they
    // don't hold.
    const directorTitle = directorTitleForDivisionKey(
      medicCredentials.directorRole,
      "red",
    );
    const medicRank = directorTitle
      ? `${directorTitle} / ${medicCredentials.rank}`
      : redRank
        ? `${medicCredentials.rank} / ${redRank}`
        : medicCredentials.rank || undefined;
    return activeFormat.renderBody({
      applicant,
      reasons,
      medicName: medicCredentials.name || undefined,
      medicRank,
      medicSignature: medicCredentials.signature || undefined,
      denialType,
      applyOtherChar,
      weeks,
      employmentRank: employmentRank || undefined,
      offerTier: offerTier || undefined,
      interviewDate: interviewDate || undefined,
      interviewTime: interviewTime || undefined,
    });
  }, [
    activeFormat,
    applicantName,
    gender,
    reasons,
    medicCredentials.name,
    medicCredentials.rank,
    medicCredentials.signature,
    medicCredentials.directorRole,
    redRank,
    denialType,
    applyOtherChar,
    weeks,
    employmentRank,
    offerTier,
    interviewDate,
    interviewTime,
  ]);

  const flashCopied = (setter: (value: boolean) => void) => {
    if (copyTimerRef.current !== undefined) {
      window.clearTimeout(copyTimerRef.current);
    }
    setter(true);
    copyTimerRef.current = window.setTimeout(
      () => setter(false),
      COPIED_FLASH_MS,
    );
  };

  // Where a format posts, when it names a place itself. It follows the chosen
  // template, not whatever the picker last held.
  const formatPostTarget = activeFormat
    ? FORMAT_POST_TARGETS[activeFormat.value]
    : undefined;

  // Where Copy & Open lands for this format. A feedback request is a message to
  // a person, so a link pasted for some earlier post must not win over the
  // composer - the member is writing to somebody, not replying on their thread.
  const formatUrl = isFeedbackRequest
    ? GOV_PM_COMPOSE_URL
    : govLink.trim() || formatPostTarget;

  // The generated format is a GOV post, so the extension is told what to fill
  // with it - the body from Copy BBCode, the title from Copy tag, and, for a
  // letter to somebody, who it is addressed to.
  const formatPost = {
    subject: fullTitle ?? undefined,
    feature: "the RED format generator",
    recipient: feedbackRecipient || undefined,
    url: pickPostTarget(formatUrl, formatPostTarget),
  };

  const handleCopy = async () => {
    handOffForumPost(formatPost, bbcodeOutput);
    await navigator.clipboard.writeText(bbcodeOutput);
    setCopiedTitleTag(false);
    flashCopied(setCopied);
  };

  const handleCopyTitleTag = async () => {
    if (!fullTitle) return;
    // The body travels with it: the title is what reaches the clipboard, but a
    // posting page this opens should get both fields filled.
    handOffForumPost(formatPost, bbcodeOutput);
    await navigator.clipboard.writeText(fullTitle);
    setCopied(false);
    flashCopied(setCopiedTitleTag);
  };

  // Same post as Copy BBCode, but the pasted link is opened with it: the
  // extension fills that page as it loads, so it is written before the member
  // has scrolled to it. The format's own target is the fallback when the pasted
  // link is a listing rather than a page a post can land on.
  const handleCopyAndOpen = () => {
    // A format can name its own posting page, so its Copy & Open works without
    // the member pasting a link first - the button would otherwise be the only
    // way to reach that page, and a plain link copies nothing.
    if (!formatUrl) return;
    copyBBCodeAndOpen({
      bbCodeText: bbcodeOutput,
      url: formatUrl,
      post: {
        ...formatPost,
        url: pickPostTarget(formatUrl, formatPostTarget),
      },
    });
  };

  return (
    <>
      {/* ── One-shot entry animations (cheap, GPU-friendly) ── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkPop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-fade-up {
          animation: fadeSlideUp 0.35s ease-out both;
        }
        .animate-check {
          animation: checkPop 0.4s ease-out both;
        }
      `}</style>

      <PageContainer>
        <DivisionHeader
          label={RED.label}
          emblem={RED.image}
          title="Paperwork"
          purpose="Every reply a RED application can get - pick the stage the applicant is at, then copy it into GOV."
          actions={
            <>
              <DivisionUserGroupsLink group="red" />
              <DivisionQuickLinksLink division="red" />
            </>
          }
        />

        <DocumentPicker
          groups={RED_PAPERWORK}
          value={selectedDocument}
          onChange={setSelectedDocument}
          className="mb-6"
        />

        {boardKey ? (
          <DiscussionBoardComposer boardKey={boardKey} />
        ) : activeFormat ? (
        <div key={animKey} className="panel overflow-hidden">

          <div className="relative grid gap-6 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
            {/* ════ LEFT COLUMN ════ */}
            <section className="min-w-0 space-y-6">
              {/* ── Application Builder ── */}
              <div className="panel-inner p-5 transition-colors hover:border-primary/30">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-hover text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Application Builder
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Gender & Name - animated wrapper */}
                  <div
                    key={selectedDocument + "-fields"}
                    className="animate-fade-up space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="applicant-gender">
                        Applicant title
                      </Label>
                      <Select
                        value={gender}
                        onValueChange={(value) =>
                          setGender(
                            value as (typeof genderOptions)[number],
                          )
                        }
                        disabled={selectedDocument === "discord-invite"}
                      >
                        <SelectTrigger
                          id="applicant-gender"
                          className="w-full border-border bg-surface-hover text-foreground transition-colors data-[disabled]:opacity-50"
                        >
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-surface text-foreground">
                          {genderOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="applicant-name">
                        Applicant name
                      </Label>
                      <Input
                        id="applicant-name"
                        value={applicantName}
                        onChange={(event) =>
                          setApplicantName(event.target.value)
                        }
                        placeholder="Enter the applicant's name"
                        disabled={selectedDocument === "discord-invite"}
                        className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Who the letter goes to. It is not a post anybody can
                        reply to on a thread, so the only name this format
                        needs beyond the applicant's is the recipient's. */}
                    {isFeedbackRequest && (
                      <div className="space-y-2">
                        <Label htmlFor="feedback-recipient">Recipient</Label>
                        <Input
                          id="feedback-recipient"
                          value={recipient}
                          onChange={(event) =>
                            setRecipient(event.target.value)
                          }
                          placeholder="Their name on GOV"
                          className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          Sent as a private message: Copy &amp; Open writes this
                          name into the composer&apos;s recipient box.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* GOV application link - handed to the browser extension so
                      it can open the post and fill this format into it. A
                      feedback request has no post to reply on. */}
                  {!isFeedbackRequest && (
                    <div className="space-y-2">
                      <Label htmlFor="gov-link">GOV Application Link</Label>
                      <Input
                        id="gov-link"
                        value={govLink}
                        onChange={(event) => setGovLink(event.target.value)}
                        placeholder="Paste the GOV application post URL"
                        className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        The browser extension opens this post and fills the
                        format into it. Leave it empty to keep the copy-only
                        flow.
                      </p>
                    </div>
                  )}

                  {/* ── Conditional fields ── */}
                  {selectedDocument === "interview-scheduled" && (
                    <div
                      key="interview"
                      className="animate-fade-up space-y-3 rounded-xl border border-border bg-surface-hover/40 p-4"
                    >
                      <p className="eyebrow text-muted-foreground">
                        Interview details
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="interview-date">
                          Interview date
                        </Label>
                        <Input
                          id="interview-date"
                          value={interviewDate}
                          onChange={(event) =>
                            setInterviewDate(event.target.value)
                          }
                          placeholder="e.g. 15 JUL 2026"
                          className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="interview-time">
                          Interview time ((UTC))
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="interview-time"
                            value={interviewTime}
                            onChange={(event) =>
                              setInterviewTime(event.target.value)
                            }
                            placeholder="e.g. 14:00"
                            className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                          />
                          <NowTimeButton onFill={setInterviewTime} />
                        </div>
                      </div>
                    </div>
                  )}

                  {supportsEmploymentRank && (
                    <div
                      key="employment-rank"
                      className="animate-fade-up space-y-3 rounded-xl border border-border bg-surface-hover/40 p-4"
                    >
                      <p className="eyebrow text-rose-700 dark:text-rose-300">
                        Reinstatement offer details
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="employment-rank">Rank offered</Label>
                        <Input
                          id="employment-rank"
                          value={employmentRank}
                          onChange={(event) => setEmploymentRank(event.target.value)}
                          placeholder="Decided Rank"
                          className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor="offer-tier">
                            Activity requirement
                          </Label>
                          <span className="chip rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide">
                            {offerHours}
                          </span>
                        </div>
                        <Select
                          value={offerTier}
                          onValueChange={setOfferTier}
                        >
                          <SelectTrigger
                            id="offer-tier"
                            className="w-full border-border bg-surface-hover text-foreground transition-colors"
                          >
                            <SelectValue placeholder="Select activity tier" />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-surface text-foreground">
                            {OFFER_TIERS.map((tier) => (
                              <SelectItem key={tier} value={tier}>
                                {tier}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {offerTier
                            ? `The offer will list ${offerHours} per pay cycle.`
                            : `No tier picked - the offer falls back to ${offerHours} per pay cycle.`}
                        </p>
                      </div>
                    </div>
                  )}

                  {supportsReasons && (
                    <div
                      key={selectedDocument}
                      className="animate-fade-up space-y-3 rounded-xl border border-border bg-surface-hover/40 p-4"
                    >
                      <p className="eyebrow text-amber-700 dark:text-amber-300">
                        {reasonSectionLabel}
                      </p>
                      <div className="space-y-2">
                        {reasons.map((reason, index) => (
                          <div
                            key={index}
                            className="animate-fade-up flex items-center gap-2"
                            style={{
                              animationDelay: `${index * 0.05}s`,
                            }}
                          >
                            <Input
                              value={reason}
                              onChange={(e) =>
                                updateReason(index, e.target.value)
                              }
                              placeholder={`Reason ${index + 1}`}
                              className="flex-1 border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                            />
                            {reasons.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeReason(index)}
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 shrink-0 text-muted-foreground transition-colors hover:text-red-600 dark:hover:text-red-400"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        onClick={addReason}
                        variant="outline"
                        size="sm"
                        className="border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add reason
                      </Button>
                    </div>
                  )}

                  {selectedDocument === "denied" && (
                    <div
                      key="denied"
                      className="animate-fade-up space-y-4 rounded-xl border border-border bg-surface-hover/40 p-4"
                    >
                      <p className="eyebrow text-red-700 dark:text-red-300">
                        Denial details
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="denial-type">Denial type</Label>
                        <Select
                          value={denialType}
                          onValueChange={(value) =>
                            setDenialType(value as "IC" | "OOC")
                          }
                        >
                          <SelectTrigger
                            id="denial-type"
                            className="w-full border-border bg-surface-hover text-foreground transition-colors"
                          >
                            <SelectValue placeholder="Select denial type" />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-surface text-foreground">
                            <SelectItem value="IC">
                              IC - In Character
                            </SelectItem>
                            <SelectItem value="OOC">
                              OOC - Out of Character
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="apply-other-char">
                          Apply on another character
                        </Label>
                        <Select
                          value={applyOtherChar}
                          onValueChange={(value) =>
                            setApplyOtherChar(value as "may" | "may not")
                          }
                        >
                          <SelectTrigger
                            id="apply-other-char"
                            className="w-full border-border bg-surface-hover text-foreground transition-colors"
                          >
                            <SelectValue placeholder="Select permission" />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-surface text-foreground">
                            <SelectItem value="may">May</SelectItem>
                            <SelectItem value="may not">May not</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Choose whether the applicant can reapply on another
                          character during the cooldown.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weeks">Cool-down weeks</Label>
                        <Input
                          id="weeks"
                          type="number"
                          min={1}
                          value={weeks}
                          onChange={(e) =>
                            setWeeks(
                              e.target.value === ""
                                ? 1
                                : Number(e.target.value),
                            )}
                          placeholder="2, 4, or more"
                          className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          Standard cooldown is 2 or 4 weeks.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label>Reasons for denial</Label>
                        <div className="space-y-2">
                          {reasons.map((reason, index) => (
                            <div
                              key={index}
                              className="animate-fade-up flex items-center gap-2"
                              style={{
                                animationDelay: `${index * 0.05}s`,
                              }}
                            >
                              <Input
                                value={reason}
                                onChange={(e) =>
                                  updateReason(index, e.target.value)
                                }
                                placeholder={`Reason ${index + 1}`}
                                className="flex-1 border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                              />
                              {reasons.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeReason(index)}
                                  size="icon"
                                  variant="ghost"
                                  className="h-10 w-10 shrink-0 text-muted-foreground transition-colors hover:text-red-600 dark:hover:text-red-400"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          onClick={addReason}
                          variant="outline"
                          size="sm"
                          className="border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          Add reason
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ════ RIGHT COLUMN ════ */}
            <section className="min-w-0 space-y-6">
              {/* ── Generated Output ── */}
              <div className="panel-inner p-5 transition-colors hover:border-primary/30">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                      Generated Output
                    </p>
                    <h3 className="mt-0.5 text-xl font-semibold text-foreground">
                      Ready to paste BBCode
                    </h3>
                  </div>

                  <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
                    {selectedDocument === "feedback-request" && (
                      <Button
                        onClick={() =>
                          window.open(
                            "https://gov.eclipse-rp.net/viewforum.php?f=2516",
                            "_blank",
                          )
                        }
                        variant="outline"
                        size="sm"
                        className="border-primary/40 text-primary hover:bg-primary/10"
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        Open Forum
                      </Button>
                    )}
                    {selectedDocument === "frd-feedback-request" && (
                      <Button
                        onClick={() =>
                          window.open(
                            "https://gov.eclipse-rp.net/viewtopic.php?t=118519",
                            "_blank",
                          )
                        }
                        variant="outline"
                        size="sm"
                        className="border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        Info Topic
                      </Button>
                    )}
                    <Button
                      onClick={handleCopyAndOpen}
                      disabled={!formatUrl}
                      variant="outline"
                      size="sm"
                      className="border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                      title={
                        isFeedbackRequest
                          ? "Opens a new GOV private message with the letter pasted in"
                          : formatUrl
                            ? "Opens the GOV page with this format filled in"
                            : "Paste the GOV Application Link above first"
                      }
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Copy &amp; Open
                    </Button>
                    {fullTitle && (
                      <>
                        <span className="min-w-0 flex-1 truncate rounded-md border border-border bg-surface/80 px-2.5 py-1 font-mono text-xs tracking-wide text-muted-foreground shadow-sm">
                          {fullTitle}
                        </span>
                        <Button
                          onClick={handleCopyTitleTag}
                          variant="outline"
                          size="sm"
                          className={`${
                            copiedTitleTag
                              ? "border-emerald-300/60 dark:border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                              : "border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                          }`}
                          title={`Copies "${fullTitle}" to your clipboard`}
                        >
                          {copiedTitleTag ? (
                            <Check className="animate-check h-3.5 w-3.5" />
                          ) : (
                            <Tag className="h-3.5 w-3.5" />
                          )}
                          {copiedTitleTag ? "Copied!" : "Copy tag"}
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={handleCopy}
                      size="default"
                      className={
                        copied
                          ? "bg-emerald-600 text-white hover:bg-emerald-500"
                          : ""
                      }
                    >
                      {copied ? (
                        <Check className="animate-check h-4 w-4" />
                      ) : (
                        <ClipboardCopy className="h-4 w-4" />
                      )}
                      {copied ? "Copied!" : "Copy BBCode"}
                    </Button>
                  </div>
                </div>

                <Textarea
                  value={bbcodeOutput}
                  readOnly
                  className="min-h-[340px] resize-none border-border/60 bg-background/80 font-mono text-sm leading-relaxed text-foreground transition-all duration-200 focus-visible:ring-2 lg:min-h-[460px]"
                />

              </div>
            </section>
          </div>
        </div>
        ) : null}
      </PageContainer>
    </>
  );
}
