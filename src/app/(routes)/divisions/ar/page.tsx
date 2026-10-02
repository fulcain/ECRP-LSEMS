"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
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
  arCertificationTemplate,
  arCertificateTemplate,
  arIrregularityTemplate,
  arTemplates,
  mrCertificationTemplate,
  mrCertificateTemplate,
  mrIrregularityTemplate,
} from "@/app/templates/ar-formats";
import type {
  ARCertificateContext,
  ARCertificationContext,
  ARIrregularityContext,
  MRCertificationContext,
  MRCertificateContext,
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
 * The page is one workspace, so it has no tabs: the pilot and Mountain Rescue
 * paperwork are the two groups of cards in the picker below.
 */
const PAGE_TITLE = "Paperwork";
const PAGE_PURPOSE =
  "Pick what you are writing, fill it in, then copy it into GOV - the extension pastes it in for you.";

type AnswerField = {
  key: string;
  label: string;
  hint?: string;
  type?: "text" | "textarea" | "passfail";
};

/** The questions of the pilot certification, in the format's order. */
const PILOT_CERTIFICATION_FIELDS: readonly AnswerField[] = [
  { key: "radioCalls", label: "Were all of the radio calls covered?" },
  { key: "helipadInspection", label: "Did the student understand how to conduct a helipad inspection?" },
  { key: "medevacLanding", label: "Did the student understand how to land a medevac properly?" },
  { key: "questions", label: "Did the student have any questions? If so, what were they about?" },
  { key: "radioProtocolRating", label: "Rating: knowledge of Radio Protocols 1-5" },
  { key: "helicopterSafetyRating", label: "Rating: understanding of Helicopter Safety 1-5" },
  { key: "practicePerformance", label: "Rating: performance during practice 1-5" },
  { key: "strengthsWeaknesses", label: "Piloting strengths and weaknesses during the practical training", type: "textarea" },
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
  { key: "finalThoughts", label: "Final thoughts", type: "textarea" },
  { key: "status", label: "Status", type: "passfail" },
];

/** The questions of the Mountain Rescue certification, in the format's order. */
const MR_CERTIFICATION_FIELDS: readonly AnswerField[] = [
  { key: "kamachoDriving", label: "Did the student understand how to accurately drive the Kamacho?" },
  { key: "kamachoPolicies", label: "Does the student clearly understand the policies for driving the Kamacho?" },
  { key: "callsignBriefing", label: "Was the student briefed on what their callsign will be when driving the Kamacho?" },
  { key: "securingRating", label: "Rating: understanding of how to properly secure themselves 1-5" },
  { key: "hillsStruggle", label: "Did the student struggle with any of the hills to trek up or down? If so, which one?" },
  { key: "citySpeedLaws", label: "When driving on paved and noticeable roads, did the student follow city speed laws?" },
  { key: "practiceRating", label: "Rating: performance during practice 1-5" },
  { key: "offroadStruggle", label: "Did the student struggle navigating through the offroad paths?" },
  { key: "roadSituation", label: "Did the student drive reasonably considering the road situation?" },
  { key: "roadsHandling", label: "Handling (RATING) 1-5" },
  { key: "summitTrek", label: "Was the student able to safely trek all the way up Mount Chilliad?" },
  { key: "summitTime", label: "How long did it take for the student to reach the top?" },
  { key: "summitStalls", label: "How many times, if any, did they stall the Kamacho?" },
  { key: "summitHandling", label: "Handling (RATING) 1-5" },
  { key: "summitSpeed", label: "Speed (RATING) 1-5" },
  { key: "summitConfidence", label: "Confidence (RATING) 1-5" },
  { key: "descentTrek", label: "Was the student able to safely trek down Mount Chilliad towards Paleto / Paleto MD?" },
  { key: "descentStalls", label: "How many times, if any, did they stall the Kamacho?" },
  { key: "descentHandling", label: "Handling (RATING) 1-5" },
  { key: "descentConfidence", label: "Confidence (RATING) 1-5" },
  { key: "finalComments", label: "Final Comments", type: "textarea" },
  { key: "result", label: "Result", type: "passfail" },
];

/** Both irregularities carry the same fields - only the banner differs. */
const IRREGULARITY_FIELDS: readonly AnswerField[] = [
  { key: "date", label: "Date", hint: "DD/MMM/YYYY" },
  { key: "time", label: "Time", hint: "MM/HH am/pm" },
  { key: "information", label: "Information", type: "textarea" },
  { key: "nextStep", label: "What was the student instructed to do next", type: "textarea" },
];

const DOCUMENT_KIND: Record<ARDocument, "certification" | "certificate" | "irregularity"> = {
  certification: "certification",
  certificate: "certificate",
  "pilot-irregularity": "irregularity",
  "mr-certification": "certification",
  "mr-certificate": "certificate",
  "mr-irregularity": "irregularity",
};

type StoredAnswers = Record<string, string>;

function emptyAnswers(fields: readonly AnswerField[], passFailKey?: string): StoredAnswers {
  const base = Object.fromEntries(fields.map((field) => [field.key, ""]));
  // A certification is passed unless it is failed, so that is where the
  // dropdown starts.
  if (passFailKey) base[passFailKey] = "PASS";
  return base;
}

const PILOT_STORAGE_KEY = "ar-certification-answers-v1";
const MR_STORAGE_KEY = "ar-mr-certification-answers-v1";
const PILOT_IRREGULARITY_STORAGE_KEY = "ar-pilot-irregularity-v1";
const MR_IRREGULARITY_STORAGE_KEY = "ar-mr-irregularity-v1";

const EMPTY_PILOT_ANSWERS = emptyAnswers(PILOT_CERTIFICATION_FIELDS, "status");
const EMPTY_MR_ANSWERS = emptyAnswers(MR_CERTIFICATION_FIELDS, "result");
const EMPTY_PILOT_IRREGULARITY = emptyAnswers(IRREGULARITY_FIELDS);
const EMPTY_MR_IRREGULARITY = emptyAnswers(IRREGULARITY_FIELDS);

/** A PASS/FAIL stored before it was a dropdown may still be the old placeholder. */
function normalizePassFail(value: string | undefined): string {
  return ["PASS", "FAIL"].includes(value ?? "") ? (value as string) : "PASS";
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/(^|[\s\-'])(\p{L})/gu, (_m, prefix: string, ch: string) => prefix + ch.toUpperCase())
    .trim()
    .replace(/\s+/g, " ");
}

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
  // Each format keeps its own answers: a pilot run and a Mountain Rescue run
  // are different pieces of work, and losing one to a refresh means retyping a
  // whole section.
  const [pilotAnswers, setPilotAnswers] = useLocalStorage<StoredAnswers>(
    PILOT_STORAGE_KEY,
    EMPTY_PILOT_ANSWERS,
  );
  const [mrAnswers, setMrAnswers] = useLocalStorage<StoredAnswers>(
    MR_STORAGE_KEY,
    EMPTY_MR_ANSWERS,
  );
  const [pilotIrregularity, setPilotIrregularity] = useLocalStorage<StoredAnswers>(
    PILOT_IRREGULARITY_STORAGE_KEY,
    EMPTY_PILOT_IRREGULARITY,
  );
  const [mrIrregularity, setMrIrregularity] = useLocalStorage<StoredAnswers>(
    MR_IRREGULARITY_STORAGE_KEY,
    EMPTY_MR_IRREGULARITY,
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

  const activeFormat =
    arTemplates.find((format) => format.value === selectedDocument) ?? null;

  const documentKind = selectedDocument ? DOCUMENT_KIND[selectedDocument] : null;
  const isCertificate = documentKind === "certificate";
  const isIrregularity = documentKind === "irregularity";
  const isMountain = selectedDocument?.startsWith("mr-") ?? false;

  // The field list, the stored answers and the setter that belong to the
  // document the member has chosen - one selection drives the whole form.
  const activeFields: readonly AnswerField[] = isIrregularity
    ? IRREGULARITY_FIELDS
    : selectedDocument === "mr-certification"
      ? MR_CERTIFICATION_FIELDS
      : selectedDocument === "certification"
        ? PILOT_CERTIFICATION_FIELDS
        : [];

  const activeAnswers = isIrregularity
    ? isMountain
      ? mrIrregularity
      : pilotIrregularity
    : isMountain
      ? mrAnswers
      : pilotAnswers;

  const updateAnswer = (key: string, value: string) => {
    if (isIrregularity) {
      (isMountain ? setMrIrregularity : setPilotIrregularity)((prev) => ({
        ...prev,
        [key]: value,
      }));
    } else {
      (isMountain ? setMrAnswers : setPilotAnswers)((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const arRank = divisionRanks["Air & Rescue"] ?? "";

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

  const instructorName =
    titleCase(medicCredentials.name || "") || "Fname Lname";

  const bbcodeOutput = useMemo(() => {
    if (!selectedDocument) return "";

    if (selectedDocument === "certification") {
      const context: ARCertificationContext = {
        studentName: student,
        answers: {
          radioCalls: pilotAnswers.radioCalls ?? "",
          helipadInspection: pilotAnswers.helipadInspection ?? "",
          medevacLanding: pilotAnswers.medevacLanding ?? "",
          questions: pilotAnswers.questions ?? "",
          radioProtocolRating: pilotAnswers.radioProtocolRating ?? "",
          helicopterSafetyRating: pilotAnswers.helicopterSafetyRating ?? "",
          practicePerformance: pilotAnswers.practicePerformance ?? "",
          strengthsWeaknesses: pilotAnswers.strengthsWeaknesses ?? "",
          collisions: pilotAnswers.collisions ?? "",
          basketRescue: pilotAnswers.basketRescue ?? "",
          courseFlightSafety: pilotAnswers.courseFlightSafety ?? "",
          landings: pilotAnswers.landings ?? "",
          courseCollisions: pilotAnswers.courseCollisions ?? "",
          handling: pilotAnswers.handling ?? "",
          confidence: pilotAnswers.confidence ?? "",
          courseTime: pilotAnswers.courseTime ?? "",
          trialTime: pilotAnswers.trialTime ?? "MM:SS",
          trialComments: pilotAnswers.trialComments ?? "ANSWER",
          finalThoughts: pilotAnswers.finalThoughts ?? "",
          status: normalizePassFail(pilotAnswers.status),
        },
        instructorName: medicCredentials.name || undefined,
        instructorRank,
        instructorSignature: medicCredentials.signature || undefined,
      };
      return arCertificationTemplate.renderBody(context);
    }

    if (selectedDocument === "certificate") {
      const context: ARCertificateContext = {
        studentName: student,
        completionDate: completionDate || "DD/MMM/YYYY",
        certifiedBy: instructorRank
          ? `${instructorRank} ${medicCredentials.name || "Fname Lname"}`
          : `Rank ${medicCredentials.name || "Fname Lname"}`,
      };
      return arCertificateTemplate.renderBody(context);
    }

    if (selectedDocument === "mr-certification") {
      const context: MRCertificationContext = {
        studentName: student,
        completionDate: completionDate || "DD/MMM/YYYY",
        answers: {
          kamachoDriving: mrAnswers.kamachoDriving ?? "",
          kamachoPolicies: mrAnswers.kamachoPolicies ?? "",
          callsignBriefing: mrAnswers.callsignBriefing ?? "",
          securingRating: mrAnswers.securingRating ?? "",
          hillsStruggle: mrAnswers.hillsStruggle ?? "",
          citySpeedLaws: mrAnswers.citySpeedLaws ?? "",
          practiceRating: mrAnswers.practiceRating ?? "",
          offroadStruggle: mrAnswers.offroadStruggle ?? "",
          roadSituation: mrAnswers.roadSituation ?? "",
          roadsHandling: mrAnswers.roadsHandling ?? "",
          summitTrek: mrAnswers.summitTrek ?? "",
          summitTime: mrAnswers.summitTime ?? "",
          summitStalls: mrAnswers.summitStalls ?? "",
          summitHandling: mrAnswers.summitHandling ?? "",
          summitSpeed: mrAnswers.summitSpeed ?? "",
          summitConfidence: mrAnswers.summitConfidence ?? "",
          descentTrek: mrAnswers.descentTrek ?? "",
          descentStalls: mrAnswers.descentStalls ?? "",
          descentHandling: mrAnswers.descentHandling ?? "",
          descentConfidence: mrAnswers.descentConfidence ?? "",
          finalComments: mrAnswers.finalComments ?? "",
          result: normalizePassFail(mrAnswers.result),
        },
        instructorName: medicCredentials.name || undefined,
        instructorRank,
        instructorSignature: medicCredentials.signature || undefined,
      };
      return mrCertificationTemplate.renderBody(context);
    }

    if (selectedDocument === "mr-certificate") {
      const context: MRCertificateContext = {
        studentName: student,
        completionDate: completionDate || "DD/MMM/YYYY",
        certifiedBy: instructorRank
          ? `${instructorRank} ${medicCredentials.name || "Fname Lname"}`
          : `Rank ${medicCredentials.name || "Fname Lname"}`,
      };
      return mrCertificateTemplate.renderBody(context);
    }

    const irregularity = isMountain ? mrIrregularity : pilotIrregularity;
    const context: ARIrregularityContext = {
      name: instructorName,
      rank: instructorRank || "Fullrank",
      date: irregularity.date || "DD/MMM/YYYY",
      time: irregularity.time || "MM/HH am/pm",
      information: irregularity.information || "",
      nextStep: irregularity.nextStep || "",
    };
    return isMountain
      ? mrIrregularityTemplate.renderBody(context)
      : arIrregularityTemplate.renderBody(context);
  }, [
    selectedDocument,
    isMountain,
    student,
    completionDate,
    pilotAnswers,
    mrAnswers,
    pilotIrregularity,
    mrIrregularity,
    instructorRank,
    instructorName,
    medicCredentials.name,
    medicCredentials.signature,
  ]);

  const builderTitle = isCertificate
    ? "Certificate"
    : isIrregularity
      ? "Irregularity Report"
      : "Certification Builder";
  const BuilderIcon = isCertificate ? Award : isIrregularity ? AlertTriangle : FileCheck2;

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
              <BuilderSection icon={BuilderIcon} title={builderTitle}>
                {!isIrregularity && (
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
                )}

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
                        : isIrregularity
                          ? "Paste the post URL"
                          : "Paste the student's profile post URL"
                    }
                    className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    The browser extension opens this post and fills the format
                    into it. Leave it empty to keep the copy-only flow.
                  </p>
                </div>

                {isIrregularity && (
                  <p className="text-xs text-muted-foreground">
                    Your name and rank are read off your Staff Page - the report
                    never asks for them twice.
                  </p>
                )}

                {(isCertificate || selectedDocument === "mr-certification") && (
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
                      The date on the document. Format:{" "}
                      <span className="font-mono">DD/MMM/YYYY</span>. Certified
                      by is read off your Staff Page rank and signature.
                    </p>
                  </div>
                )}
                {!isCertificate && (
                  <div className="space-y-3">
                    {activeFields.map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <Label htmlFor={`answer-${field.key}`} className="text-xs">
                          {field.label}
                          {field.hint ? (
                            <span className="ml-1.5 font-normal text-muted-foreground">
                              ({field.hint})
                            </span>
                          ) : null}
                        </Label>
                        {field.type === "passfail" ? (
                          <Select
                            value={normalizePassFail(activeAnswers[field.key])}
                            onValueChange={(value) =>
                              updateAnswer(field.key, value)
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
                        ) : field.type === "textarea" ? (
                          <textarea
                            id={`answer-${field.key}`}
                            value={activeAnswers[field.key] ?? ""}
                            onChange={(event) =>
                              updateAnswer(field.key, event.target.value)
                            }
                            rows={3}
                            className="w-full rounded-md border border-border bg-surface-hover px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2"
                          />
                        ) : field.key === "date" ? (
                          <div className="flex items-center gap-2">
                            <Input
                              id={`answer-${field.key}`}
                              value={activeAnswers[field.key] ?? ""}
                              onChange={(event) =>
                                updateAnswer(field.key, event.target.value)
                              }
                              placeholder="e.g. 01/OCT/2026"
                              className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-2"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateAnswer(field.key, getCurrentDateShort())
                              }
                              className="shrink-0"
                            >
                              Today
                            </Button>
                          </div>
                        ) : (
                          <Input
                            id={`answer-${field.key}`}
                            value={activeAnswers[field.key] ?? ""}
                            onChange={(event) =>
                              updateAnswer(field.key, event.target.value)
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
