"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ClipboardCopy,
  ExternalLink,
  FileText,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { BLS } from "@/app/constants/divisions/bls";
import { directorTitleForDivisionKey } from "@/app/constants/general/directorRoles";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import {
  handOffForumPost,
  pickPostTarget,
} from "@/app/helpers/forumHandoff";
import { useMedic } from "@/app/context/MedicContext";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { blsTemplates } from "@/app/templates/bls-formats";
import { NowTimeButton } from "@/components/now-time-button";
import { PageContainer } from "@/components/ui/page-container";
import { DivisionQuickLinksLink } from "@/components/division-quick-links-link";
import { DivisionHeader } from "@/components/division/division-header";
import { DivisionUserGroupsLink } from "@/components/division/division-user-groups-link";
import {
  BuilderForm,
  BuilderOutput,
  BuilderPreview,
  BuilderSection,
  BuilderShell,
  BuilderTitleRow,
} from "@/components/builder/builder-layout";
import { DocumentPicker } from "@/components/division/document-picker";
import { DiscussionBoardComposer } from "@/components/discussion-board-composer";
import {
  BLS_LISTING,
  BLS_PAPERWORK,
  isBLSBoardKey,
  isBLSCourseReport,
  isBLSDocument,
  isUpcomingCourseType,
  type BLSWorkItem,
} from "./components/paperwork-documents";
import { CourseReportsProcessor } from "./components/CourseReportsProcessor";
import {
  UpcomingCourseProcessor,
  type UpcomingCourseType,
} from "./components/UpcomingCourseProcessor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COPIED_FLASH_MS = 1800;

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
 * The page is one workspace, so it has no tabs: everything a member can write -
 * the answer to an application, a course report, a change to the upcoming
 * courses listing, a board post - is a card in the picker below.
 */
const PAGE_TITLE = "Paperwork";
const PAGE_PURPOSE =
  "Pick what you are writing, fill it in, then copy it into GOV - the extension pastes it in for you.";

export default function BLSFormatsPage() {
  const { medicCredentials, divisionRanks } = useMedic();
  // Nothing is chosen until the member picks a card, so the page opens on the
  // picker alone - no builder is filled in for a document nobody asked for.
  const [selectedDocument, setSelectedDocument] = useState<BLSWorkItem | null>(
    null,
  );
  // A retired `?type=new|reschedule|cancelled` link names a change to the
  // listing, which the builder's dropdown holds now - so it opens the listing
  // already set to that change instead of dropping it.
  const [legacyCourseType, setLegacyCourseType] = useState<
    UpcomingCourseType | undefined
  >(undefined);

  // Sync the initial document from the URL. Runs once on mount - the effects
  // below keep the URL in step afterwards.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromFormat = params.get("format");
    // `?format=` is any document the picker offers - a board, a course report
    // and the listing included. Until the listing became one card, each change
    // to it was a value of its own, so those links open it on that change.
    if (fromFormat && isBLSDocument(fromFormat)) {
      setSelectedDocument(fromFormat);
    } else if (fromFormat && isUpcomingCourseType(fromFormat)) {
      setLegacyCourseType(fromFormat);
      setSelectedDocument(BLS_LISTING);
    }

    // `?type=` came before `?format=`: a course report's type is still a
    // document the picker offers, while the listing's change moved into its
    // builder, so that link opens the listing on the change it named.
    const fromType = params.get("type");
    if (fromType && isBLSCourseReport(fromType)) {
      setSelectedDocument(fromType);
    } else if (fromType && isUpcomingCourseType(fromType)) {
      setLegacyCourseType(fromType);
      setSelectedDocument(BLS_LISTING);
    }

    // `?tab=` is retired with the bar it came from: every value it ever held
    // named a document, so an old link opens the one it named instead of
    // dropping the reader on the first card.
    const legacyTab = params.get("tab");
    if (legacyTab === "discussion-boards") {
      setSelectedDocument("blsDiscussionBoard");
    } else if (legacyTab === "course-reports") {
      setSelectedDocument(
        fromType && isBLSCourseReport(fromType) ? fromType : "joint",
      );
    } else if (legacyTab === "upcoming-course") {
      setSelectedDocument(BLS_LISTING);
    }
  }, []);

  // The picker's value is the page's `?format=`, so a link someone shares opens
  // the document they were looking at - and a page with nothing picked carries
  // no `?format=` at all. `?tab=`, `?type=` and the older `?report=` are retired
  // spellings of the same choice, read once on mount and dropped, so a stale
  // link cannot be shared back.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("tab");
    params.delete("type");
    params.delete("report");
    if (selectedDocument) params.set("format", selectedDocument);
    else params.delete("format");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, [selectedDocument]);
  const [applicantName, setApplicantName] = useLocalStorage<string>(
    "bls-format-applicant-name",
    "",
  );
  // The application post this format belongs on. Pasted once and reused, it is
  // the page the extension opens and fills - no post id is guessed from a name.
  const [govLink, setGovLink] = useLocalStorage<string>(
    "bls-format-gov-link",
    "",
  );
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

  // Typed values survive a reload: a format is filled in over several minutes and
  // copying one field at a time, so anything lost to a refresh has to be redone.
  const [reasons, setReasons] = useLocalStorage<string[]>("bls-format-reasons", [
    "",
  ]);
  const [cooldownDays, setCooldownDays] = useLocalStorage<number>(
    "bls-format-cooldown-days",
    7,
  );
  const [reapplyDate, setReapplyDate] = useLocalStorage<string>(
    "bls-format-reapply-date",
    "",
  );
  const [courseDate, setCourseDate] = useLocalStorage<string>(
    "bls-format-course-date",
    "01/FEB/2026",
  );
  const [courseTime, setCourseTime] = useLocalStorage<string>(
    "bls-format-course-time",
    "12:00",
  );

  const addReason = () => setReasons((prev) => [...prev, ""]);
  const removeReason = (index: number) =>
    setReasons((prev) => prev.filter((_, i) => i !== index));
  const updateReason = (index: number, value: string) =>
    setReasons((prev) => prev.map((r, i) => (i === index ? value : r)));

  // A board, a course report and the upcoming-courses listing are not templates
  // - each has a builder of its own - and a page with nothing picked has none.
  const activeFormat =
    blsTemplates.find((format) => format.value === selectedDocument) ?? null;
  const boardKey =
    selectedDocument && isBLSBoardKey(selectedDocument)
      ? selectedDocument
      : null;
  const reportType =
    selectedDocument && isBLSCourseReport(selectedDocument)
      ? selectedDocument
      : null;
  const courseListing = selectedDocument === BLS_LISTING;
  const blsRank = divisionRanks["Basic Life Support"] ?? "";

  // Build the full thread title: "[STATUS] BLS Training - <Applicant Name>".
  // The status prefix (e.g. "[ACCEPTED] BLS Training") is set by the
  // template; the suffix is the title-cased applicant name. When no name
  // is entered, only the status prefix is shown - so the pill clearly
  // signals that the suffix is still missing.
  const fullTitle = activeFormat?.titleTag
    ? `${activeFormat.titleTag}${
        applicantName.trim()
          ? ` - ${formatTitleCase(applicantName)}`
          : ""
      }`
    : null;

  const supportsReasons = activeFormat?.value === "on-hold";
  const supportsDenialDetails = activeFormat?.value === "denied";
  const supportsCourseDetails = activeFormat?.value === "upcoming-class";

  const bbcodeOutput = useMemo(() => {
    // Nothing is being written yet: the picker is on its own.
    if (!activeFormat) return "";
    const applicant = applicantName.trim() || "Applicant Name";
    // A director covering Basic Life Support signs as the director, not as a
    // BLS rank they don't hold.
    const directorTitle = directorTitleForDivisionKey(
      medicCredentials.directorRole,
      "bls",
    );
    const medicRank = directorTitle
      ? `${directorTitle} / ${medicCredentials.rank}`
      : blsRank
        ? `${medicCredentials.rank} | ${blsRank}`
        : medicCredentials.rank || undefined;
    return activeFormat.renderBody({
      applicant,
      reasons,
      medicName: medicCredentials.name || undefined,
      medicRank,
      medicSignature: medicCredentials.signature || undefined,
      cooldownDays,
      reapplyDate: reapplyDate || undefined,
      courseDate: courseDate || undefined,
      courseTime: courseTime || undefined,
    });
  }, [
    activeFormat,
    applicantName,
    reasons,
    medicCredentials.name,
    medicCredentials.rank,
    medicCredentials.signature,
    medicCredentials.directorRole,
    blsRank,
    cooldownDays,
    reapplyDate,
    courseDate,
    courseTime,
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

  // The generated format is a GOV post, so the extension is told what to fill
  // with it - the body from Copy BBCode, the title from Copy tag.
  const formatPost = {
    subject: fullTitle ?? undefined,
    feature: "the BLS format generator",
    url: pickPostTarget(govLink.trim()),
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
  // has scrolled to it.
  const handleCopyAndOpen = () => {
    const url = govLink.trim();
    if (!url) return;
    copyBBCodeAndOpen({
      bbCodeText: bbcodeOutput,
      url,
      post: { ...formatPost, url: pickPostTarget(url) },
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
          label={BLS.label}
          emblem={BLS.image}
          title={PAGE_TITLE}
          purpose={PAGE_PURPOSE}
          actions={
            <>
              <DivisionUserGroupsLink group="bls" />
              <DivisionQuickLinksLink division="bls" />
            </>
          }
        />

        <DocumentPicker
          groups={BLS_PAPERWORK}
          value={selectedDocument}
          onChange={setSelectedDocument}
          className="mb-6"
        />

        {reportType && (
          <CourseReportsProcessor reportType={reportType} />
        )}

        {courseListing && (
          <UpcomingCourseProcessor initialCourseType={legacyCourseType} />
        )}

        {boardKey && <DiscussionBoardComposer boardKey={boardKey} />}

        {activeFormat && !boardKey && !reportType && !courseListing && (
        <div key={animKey}>
          <BuilderShell>
            {/* ════ LEFT COLUMN ════ */}
            <BuilderForm>
              {/* ── Application Builder ── */}
              <BuilderSection icon={ShieldCheck} title="Application Builder">
                  {/* Applicant name - animated wrapper */}
                  <div
                    key={selectedDocument + "-fields"}
                    className="animate-fade-up space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="applicant-name">Applicant name</Label>
                      <Input
                        id="applicant-name"
                        value={applicantName}
                        onChange={(event) => setApplicantName(event.target.value)}
                        placeholder="Enter the applicant's name"
                        className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                      />
                    </div>
                  </div>

                  {/* GOV application link - handed to the browser extension so
                      it can open the post and fill this format into it. */}
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
                      The browser extension opens this post and fills the format
                      into it. Leave it empty to keep the copy-only flow.
                    </p>
                  </div>

                  {/* ── Denial details ── */}
                  {supportsDenialDetails && (
                    <div
                      key="denied"
                      className="animate-fade-up space-y-4 rounded-xl border border-border bg-surface-hover/40 p-4"
                    >
                      <p className="eyebrow text-red-700 dark:text-red-300">
                        Denial details
                      </p>

                      <div className="space-y-2">
                        <Label htmlFor="cooldown-days">Cool-down days</Label>
                        <Input
                          id="cooldown-days"
                          type="number"
                          min={1}
                          value={cooldownDays}
                          onChange={(e) =>
                            setCooldownDays(
                              e.target.value === ""
                                ? 1
                                : Number(e.target.value),
                            )
                          }
                          placeholder="7, 14 or 30"
                          className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          Number of days the applicant must wait before they
                          can reapply.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reapply-date">Reapply date</Label>
                        <Input
                          id="reapply-date"
                          value={reapplyDate}
                          onChange={(event) =>
                            setReapplyDate(event.target.value)
                          }
                          placeholder="e.g. 01 AUG 2026"
                          className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          The exact date the applicant may reapply.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Course details ── */}
                  {supportsCourseDetails && (
                    <div
                      key="course"
                      className="animate-fade-up space-y-3 rounded-xl border border-border bg-surface-hover/40 p-4"
                    >
                      <p className="eyebrow text-muted-foreground">
                        Upcoming class details
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="course-date">Course date</Label>
                        <Input
                          id="course-date"
                          value={courseDate}
                          onChange={(event) =>
                            setCourseDate(event.target.value)
                          }
                          placeholder="e.g. 01/FEB/2026"
                          className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          Used both for the header date and the timezone image
                          URL. Format: <span className="font-mono">DD/MMM/YYYY</span>.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="course-time">Course time ((UTC))</Label>
                        <div className="flex gap-2">
                          <Input
                            id="course-time"
                            value={courseTime}
                            onChange={(event) =>
                              setCourseTime(event.target.value)
                            }
                            placeholder="e.g. 12:00"
                            className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                          />
                          <NowTimeButton onFill={setCourseTime} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          24-hour, <span className="font-mono">HH:MM</span>.
                          Used to build the timezone image.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Hold reasons (on-hold only) ── */}
                  {supportsReasons && (
                    <div
                      key="on-hold-reasons"
                      className="animate-fade-up space-y-3 rounded-xl border border-border bg-surface-hover/40 p-4"
                    >
                      <p className="eyebrow text-amber-700 dark:text-amber-300">
                        Hold reasons
                      </p>
                      <div className="space-y-2">
                        {reasons.map((reason, index) => (
                          <div
                            key={index}
                            className="animate-fade-up flex items-center gap-2"
                            style={{ animationDelay: `${index * 0.05}s` }}
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
              </BuilderSection>
            </BuilderForm>

            {/* ════ RIGHT COLUMN ════ */}
            <BuilderPreview
              icon={FileText}
              title="Generated Output"
              badge={activeFormat.label}
              actions={
                <>
                  {supportsCourseDetails && (
                    <Button
                      onClick={() =>
                        window.open("https://www.inyourowntime.zone", "_blank")
                      }
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Timezone Map
                    </Button>
                  )}
                  <Button
                    onClick={handleCopyAndOpen}
                    disabled={!govLink.trim()}
                    variant="outline"
                    size="lg"
                    className="w-full"
                    title={
                      govLink.trim()
                        ? "Opens the GOV application link with this format filled in"
                        : "Paste the GOV Application Link above first"
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                    Copy &amp; Open
                  </Button>
                  <Button
                    onClick={handleCopy}
                    size="lg"
                    className={
                      copied
                        ? "w-full bg-emerald-600 text-white hover:bg-emerald-500"
                        : "w-full"
                    }
                  >
                    {copied ? (
                      <Check className="animate-check h-4 w-4" />
                    ) : (
                      <ClipboardCopy className="h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy BBCode"}
                  </Button>
                </>
              }
              note="Copy &amp; Open opens the GOV application link with this format already filled in - the extension pastes it as the page loads."
            >
              {activeFormat.titleTag && (
                <BuilderTitleRow
                  value={fullTitle ?? ""}
                  onCopy={handleCopyTitleTag}
                  copyLabel={copiedTitleTag ? "Copied!" : "Copy title"}
                />
              )}

              <BuilderOutput value={bbcodeOutput} />
            </BuilderPreview>
          </BuilderShell>
        </div>
        )}
      </PageContainer>
    </>
  );
}
