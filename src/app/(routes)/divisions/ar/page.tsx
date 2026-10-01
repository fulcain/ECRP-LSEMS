"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Check,
  ClipboardCopy,
  ExternalLink,
  FileCheck2,
  FileText,
} from "lucide-react";

import { AR } from "@/app/constants/divisions/ar";
import { General } from "@/app/constants/divisions/general";
import { directorTitleForDivisionKey } from "@/app/constants/general/directorRoles";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import { getCurrentDateShort } from "@/app/helpers/getCurrentDateFormatted";
import {
  handOffForumPost,
  pickPostTarget,
} from "@/app/helpers/forumHandoff";
import { useMedic } from "@/app/context/MedicContext";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import {
  arCertificateTemplate,
  arCertificationTemplate,
  arTemplates,
} from "@/app/templates/ar-formats";
import type {
  ARCertificateContext,
  ARCertificationContext,
} from "@/app/templates/ar-formats";
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
} from "@/components/builder/builder-layout";
import { DocumentPicker } from "@/components/division/document-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { AR_PAPERWORK, isARDocument, type ARDocument } from "./components/paperwork-documents";

const COPIED_FLASH_MS = 1800;

/**
 * The page is one workspace, so it has no tabs: the certification paperwork
 * and the certificate are the two cards in the picker below.
 */
const PAGE_TITLE = "Paperwork";
const PAGE_PURPOSE =
  "Pick what you are writing, fill it in, then copy it into GOV - the extension pastes it in for you.";

/** The questions of the certification, section by section, in the format's order. */
const CERTIFICATION_FIELDS: readonly {
  key: keyof ARCertificationContext["answers"];
  label: string;
  hint?: string;
}[] = [
  { key: "radioCalls", label: "Were all of the radio calls covered?" },
  { key: "helipadInspection", label: "Did the student understand how to conduct a helipad inspection?" },
  { key: "medevacLanding", label: "Did the student understand how to land a medevac properly?" },
  { key: "questions", label: "Did the student have any questions? If so, what were they about?" },
  { key: "radioProtocolRating", label: "Rating: knowledge of Radio Protocols 1-5" },
  { key: "helicopterSafetyRating", label: "Rating: understanding of Helicopter Safety 1-5" },
  { key: "practicePerformance", label: "Rating: performance during practice 1-5" },
  { key: "strengthsWeaknesses", label: "Piloting strengths and weaknesses during the practical training" },
  { key: "collisions", label: "Did the student collide with anything during the practical training?" },
  { key: "basketRescue", label: "Did the student understand how to perform a basket rescue, as well as when to do it?" },
  { key: "courseFlightSafety", label: "Did the student fly safely throughout the course?" },
  { key: "landings", label: "Did the student misidentify any of the landings, if so, did they correct on their own?" },
  { key: "courseCollisions", label: "Did the student collide with anything at any point during the course?" },
  { key: "handling", label: "Handling (RATING) 1-5" },
  { key: "confidence", label: "Confidence (RATING) 1-5" },
  { key: "courseTime", label: "How long did the course take (from liftoff to landing & engine off)" },
  { key: "trialTime", label: "Time Trial time", hint: "MM:SS" },
  { key: "trialComments", label: "Time Trial comments (optional)" },
  { key: "finalThoughts", label: "Final thoughts" },
  { key: "status", label: "Status" },
];

const FIELD_STORAGE_KEY = "ar-certification-answers-v1";
type StoredAnswers = Record<string, string>;

const EMPTY_ANSWERS: StoredAnswers = {
  ...Object.fromEntries(
    CERTIFICATION_FIELDS.map((field) => [field.key as string, ""]),
  ),
  // A certification is passed unless it is failed, so that is where the
  // dropdown starts.
  status: "PASS",
};

export default function ARFormatsPage() {
  const { medicCredentials, divisionRanks } = useMedic();
  // Nothing is chosen until the member picks a card, so the page opens on the
  // picker alone - no builder is filled in for a document nobody asked for.
  const [selectedDocument, setSelectedDocument] = useState<ARDocument | null>(
    null,
  );

  // Sync the initial document from the URL. Runs once on mount - the effect
  // below keeps the URL in step afterwards.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromFormat = params.get("format");
    if (fromFormat && isARDocument(fromFormat)) {
      setSelectedDocument(fromFormat);
    }
  }, []);

  // The picker's value is the page's `?format=`, so a link someone shares opens
  // the document they were looking at - and a page with nothing picked carries
  // no `?format=` at all.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedDocument) params.set("format", selectedDocument);
    else params.delete("format");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, [selectedDocument]);

  const [govLink, setGovLink] = useLocalStorage<string>(
    "ar-format-gov-link",
    "",
  );
  const [studentName, setStudentName] = useLocalStorage<string>(
    "ar-format-student-name",
    "",
  );
  const [completionDate, setCompletionDate] = useLocalStorage<string>(
    "ar-format-completion-date",
    "DD/MMM/YYYY",
  );
  // The certification's answers live in one stored record: the format has
  // twenty of them, and losing one to a refresh means retyping a whole section.
  const [answers, setAnswers] = useLocalStorage<StoredAnswers>(
    FIELD_STORAGE_KEY,
    EMPTY_ANSWERS,
  );
  const [copied, setCopied] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const copyTimerRef = useRef<number | undefined>(undefined);
  const prevFormatRef = useRef(selectedDocument);

  useEffect(() => {
    if (prevFormatRef.current !== selectedDocument) {
      setAnimKey((k) => k + 1);
      prevFormatRef.current = selectedDocument;
    }
  }, [selectedDocument]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== undefined) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const updateAnswer = (key: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const activeFormat =
    arTemplates.find((format) => format.value === selectedDocument) ?? null;
  const arRank = divisionRanks["Air & Rescue"] ?? "";
  const isCertificate = selectedDocument === "certificate";

  // The status is a PASS/FAIL dropdown, but an answer saved before it was one
  // may still carry the old free-text placeholder - normalise, PASS by default.
  const statusAnswer = ["PASS", "FAIL"].includes(answers.status ?? "")
    ? (answers.status as string)
    : "PASS";

  const titleCase = (value: string) =>
    value
      .toLowerCase()
      .replace(/(^|[\s\-'])(\p{L})/gu, (_m, prefix: string, ch: string) => prefix + ch.toUpperCase())
      .trim()
      .replace(/\s+/g, " ");

  const student = titleCase(studentName) || "Fname Lname";

  // The signature block comes off the Staff Page - a director covering A&R
  // signs as the director, not as an A&R rank they don't hold.
  const instructorRank = useMemo(() => {
    const directorTitle = directorTitleForDivisionKey(
      medicCredentials.directorRole,
      "ar",
    );
    if (directorTitle) return `${directorTitle} / ${medicCredentials.rank}`;
    return arRank
      ? `${medicCredentials.rank} | ${arRank}`
      : medicCredentials.rank || undefined;
  }, [medicCredentials.rank, medicCredentials.directorRole, arRank]);

  const certificationBBCode = useMemo(() => {
    if (selectedDocument !== "certification") return "";
    const context: ARCertificationContext = {
      studentName: student,
      answers: {
        radioCalls: answers.radioCalls ?? "",
        helipadInspection: answers.helipadInspection ?? "",
        medevacLanding: answers.medevacLanding ?? "",
        questions: answers.questions ?? "",
        radioProtocolRating: answers.radioProtocolRating ?? "",
        helicopterSafetyRating: answers.helicopterSafetyRating ?? "",
        practicePerformance: answers.practicePerformance ?? "",
        strengthsWeaknesses: answers.strengthsWeaknesses ?? "",
        collisions: answers.collisions ?? "",
        basketRescue: answers.basketRescue ?? "",
        courseFlightSafety: answers.courseFlightSafety ?? "",
        landings: answers.landings ?? "",
        courseCollisions: answers.courseCollisions ?? "",
        handling: answers.handling ?? "",
        confidence: answers.confidence ?? "",
        courseTime: answers.courseTime ?? "",
        trialTime: answers.trialTime ?? "MM:SS",
        trialComments: answers.trialComments ?? "ANSWER",
        finalThoughts: answers.finalThoughts ?? "",
        status: statusAnswer,
      },
      instructorName: medicCredentials.name || undefined,
      instructorRank,
      instructorSignature: medicCredentials.signature || undefined,
    };
    return arCertificationTemplate.renderBody(context);
  }, [selectedDocument, student, answers, statusAnswer, medicCredentials.name, medicCredentials.signature, instructorRank]);

  const certificateBBCode = useMemo(() => {
    if (selectedDocument !== "certificate") return "";
    const context: ARCertificateContext = {
      studentName: student,
      completionDate: completionDate || "DD/MMM/YYYY",
      certifiedBy: instructorRank
        ? `${instructorRank} ${medicCredentials.name || "Fname Lname"}`
        : `Rank ${medicCredentials.name || "Fname Lname"}`,
    };
    return arCertificateTemplate.renderBody(context);
  }, [selectedDocument, student, completionDate, instructorRank, medicCredentials.name]);

  const bbcodeOutput =
    selectedDocument === "certificate" ? certificateBBCode : certificationBBCode;

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
  // with it. Neither format carries a subject: the certification and the
  // certificate are both replies to a post that already has one - the
  // student's profile or their divisional file.
  const formatPost = {
    feature: "the A&R format generator",
    url: pickPostTarget(govLink.trim()),
  };

  const handleCopy = async () => {
    handOffForumPost(formatPost, bbcodeOutput);
    await navigator.clipboard.writeText(bbcodeOutput);
    flashCopied(setCopied);
  };



  // The certificate goes in the member's divisional profile, so the section
  // it belongs in is one link away - read from the division's own quick links
  // rather than a URL typed here, so the two cannot drift apart.
  const divisionalProfilesUrl =
    General.data.quickLinks.find((link) => link.name.startsWith("Divisional Personnel Files"))
      ?.url ?? null;

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
    <PageContainer>
      <DivisionHeader
        label={AR.label}
        emblem={AR.image}
        title={PAGE_TITLE}
        purpose={PAGE_PURPOSE}
        actions={
          <>
            <DivisionUserGroupsLink group="air-rescue" />
            <DivisionQuickLinksLink division="ar" />
          </>
        }
      />

      <DocumentPicker
        groups={AR_PAPERWORK}
        value={selectedDocument}
        onChange={setSelectedDocument}
        className="mb-6"
      />

      {activeFormat && (
        <div key={animKey}>
          <BuilderShell>
            {/* ════ LEFT COLUMN ════ */}
            <BuilderForm>
              <BuilderSection
                icon={isCertificate ? Award : FileCheck2}
                title={isCertificate ? "Certificate" : "Certification Builder"}
              >
                <div className="space-y-2">
                  <Label htmlFor="student-name">
                    {isCertificate ? "Member certified" : "Student name"}
                  </Label>
                  <Input
                    id="student-name"
                    value={studentName}
                    onChange={(event) => setStudentName(event.target.value)}
                    placeholder="Enter the member's name"
                    className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                  />
                </div>

                {/* The post this format belongs in - handed to the browser
                    extension so it can open the post and fill the format in. */}
                <div className="space-y-2">
                  <Label htmlFor="gov-link">GOV Post Link</Label>
                  <Input
                    id="gov-link"
                    value={govLink}
                    onChange={(event) => setGovLink(event.target.value)}
                    placeholder={
                      isCertificate
                        ? "Paste the divisional profile post URL"
                        : "Paste the student's profile post URL"
                    }
                    className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    The browser extension opens this post and fills the format
                    into it. Leave it empty to keep the copy-only flow.
                  </p>
                </div>

                {isCertificate ? (
                  <div className="space-y-2">
                    <Label htmlFor="completion-date">Date</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="completion-date"
                        value={completionDate}
                        onChange={(event) => setCompletionDate(event.target.value)}
                        placeholder="e.g. 01/OCT/2026"
                        className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCompletionDate(getCurrentDateShort())}
                        className="shrink-0"
                      >
                        Today
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The date on the certificate. Format:{" "}
                      <span className="font-mono">DD/MMM/YYYY</span>. Certified
                      by is read off your Staff Page rank and signature.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {CERTIFICATION_FIELDS.map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <Label htmlFor={`answer-${field.key}`} className="text-xs">
                          {field.label}
                          {field.hint ? (
                            <span className="ml-1.5 font-normal text-muted-foreground">
                              ({field.hint})
                            </span>
                          ) : null}
                        </Label>
                        {field.key === "status" ? (
                          <Select
                            value={statusAnswer}
                            onValueChange={(value) =>
                              updateAnswer(field.key as string, value)
                            }
                          >
                            <SelectTrigger
                              id={`answer-${field.key}`}
                              className="w-full border-border bg-surface-hover text-foreground"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PASS">PASS</SelectItem>
                              <SelectItem value="FAIL">FAIL</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : field.key === "finalThoughts" ||
                        field.key === "strengthsWeaknesses" ? (
                          <textarea
                            id={`answer-${field.key}`}
                            value={answers[field.key] ?? ""}
                            onChange={(event) =>
                              updateAnswer(field.key as string, event.target.value)
                            }
                            rows={3}
                            className="w-full rounded-md border border-border bg-surface-hover px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2"
                          />
                        ) : (
                          <Input
                            id={`answer-${field.key}`}
                            value={answers[field.key] ?? ""}
                            onChange={(event) =>
                              updateAnswer(field.key as string, event.target.value)
                            }
                            className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                          />
                        )}
                      </div>
                    ))}
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
                  {isCertificate && divisionalProfilesUrl && (
                    <Button
                      onClick={() => window.open('https://gov.eclipse-rp.net/viewforum.php?f=4155', "_blank")}
                      variant="outline"
                      size="lg"
                      className="w-full"
                      title="Opens the divisional profiles section on GOV"
                    >
                      <Award className="h-4 w-4" />
                      Open Divisional Profiles
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
                        ? "Opens the GOV post link with this format filled in"
                        : "Paste the GOV Post Link above first"
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
                      <Check className="h-4 w-4" />
                    ) : (
                      <ClipboardCopy className="h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy BBCode"}
                  </Button>
                </>
              }
              note="Copy &amp; Open opens the GOV post link with this format already filled in - the extension pastes it as the page loads."
            >
              <BuilderOutput value={bbcodeOutput} />
            </BuilderPreview>
          </BuilderShell>
        </div>
      )}
    </PageContainer>
  );
}
