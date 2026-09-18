"use client";

import { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  Copy,
  FileText,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage, useSharedLocalStorageString } from "@/app/hooks/useLocalStorage";

import {
  SHARED_SIG_NAME_KEY,
  SHARED_SIG_RANK_KEY,
  SHARED_SIGNATURE_KEY,
  SHARED_FTD_RANK_KEY,
} from "@/components/employee-stats/lib/generate-fti-promotion-bbcode";
import {
  generateCertificationPaperwork,
  generateDivisionalFile,
  generateTrainerInfoBBCode,
} from "@/components/employee-stats/lib/generate-fti-certification-bbcode";
import { SharedSignatureBar } from "@/components/employee-stats/components/SharedSignatureBar";

/* ------------------------------------------------------------------ */
/*  Form persistence key                                                */
/* ------------------------------------------------------------------ */

const FORM_KEY = "fti-certification-form-v1";

/* ------------------------------------------------------------------ */
/*  Collapsible section                                                 */
/* ------------------------------------------------------------------ */

function Collapsible({
  label,
  defaultOpen = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details className="border border-border/40 rounded-xl group" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium cursor-pointer hover:bg-surface-hover/40 transition-colors rounded-xl list-none">
        <span>{label}</span>
        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-0 -rotate-90 text-muted-foreground" />
      </summary>
      <div className="px-5 pb-5 pt-1 border-t border-border/30">{children}</div>
    </details>
  );
}

/* ------------------------------------------------------------------ */
/*  Phase note content (read-only)                                     */
/* ------------------------------------------------------------------ */

function PhaseOneNotes() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none space-y-3 text-sm">
      <p className="italic text-center">
        To start off, rename your unit into <b>FTD-XXZ</b> and have the trainee join it.
      </p>

      <div>
        <h4 className="font-semibold text-[#800000]">1. Three Pillars of Training</h4>
        <p>Explain the Three Pillars in detail:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <b>Effort</b> - Putting effort into the training session is essential. The
            motivation behind the effort is equally important, EMRs can and will pick up on
            lack of effort or motivation.
          </li>
          <li>
            <b>Time</b> - EMRs have ample time to undergo their training (4 weeks) - ensure
            that the EMR is given a chance to learn, to digest and to understand the material.
            If an EMR seems to be rushing through training, reminding them that they have
            ample time is quite beneficial. Rushing only harms the digestion of the
            information provided through training.
          </li>
          <li>
            <b>Patience</b> - As an FTO, getting frustrated by the EMR is something that
            should be avoided. The EMR is in their training phase, and thus they would be
            sensitive to any frustration if they pick up on it.
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-[#800000]">2. Documentation</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Teach the FTO trainee where to find the following:
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>FT Handbook (so they can learn from it and reference it when necessary)</li>
              <li>General LSEMS Handbook (so they can direct EMRs to it)</li>
              <li>Student Profiles (for both regular &amp; reinstatement profiles)</li>
              <li>Student Area</li>
              <li>Public Civilian Ride-Along section</li>
            </ul>
          </li>
          <li>Direct the FTO trainee to the EMR Student Profiles.</li>
          <li>
            Direct the FTO trainee to the{" "}
            <a
              href="https://gov.eclipse-rp.net/viewforum.php?f=1161"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              FTO Student Profiles
            </a>.
          </li>
          <li>
            Go over <b>all</b> of the Regular EMR Profile, and cover from{" "}
            <b>Introduction</b> to <b>Certification</b>. Simply go through it and{" "}
            <b>emphasize</b> anything that may be important (usually bolded), you do not need
            to &quot;teach&quot; it to them. (If you think they got it, just skip this part.)
          </li>
          <li>Next, go over the Reinstatement EMR Profile in the same manner.</li>
          <li>
            Do a review of the Handbook with the FTO trainee, explain that the Training
            Profiles and the Handbook are tied together at times so cross-referencing should
            happen.
          </li>
          <li>
            Finally, show the FTO trainee the{" "}
            <b>the LSEMS application</b>{" "}
            and explain how it can be used to easily access the necessary FTD resources and
            information while training.
          </li>
        </ul>
      </div>
    </div>
  );
}

function PhaseTwoNotes() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none space-y-3 text-sm">
      <ul className="list-disc pl-5 space-y-2">
        <li>
          This is where the FTO trainee&apos;s ability to <b>&quot;teach&quot;</b> is
          observed by you, the FTI.
        </li>
        <li>
          Pick any of the phases, then pretend you are a clueless EMR and have the FTO
          trainee &quot;teach&quot; the phase to you.
        </li>
        <li>
          The FTO trainee does <b>not</b> need to complete an entire phase. They only need to
          demonstrate enough of it for the FTI to properly evaluate their ability to teach,
          explain information, and answer questions.
        </li>
        <li>
          Try to be creative. Ask silly questions, make some intentional mistakes, etc. You
          want to fully take on the &quot;EMR&quot; role during this part.
        </li>
        <li>
          The &quot;ride-along&quot; portions should be skipped, but{" "}
          <i>
            <b>
              <u>everything else</u>
            </b>
          </i>{" "}
          relevant to the selected portion should be demonstrated if deemed necessary.
        </li>
        <li>
          Once you are satisfied with their training and have properly evaluated their
          performance, ensure the FTO trainee submits the correct paperwork in the{" "}
          <a
            href="https://gov.eclipse-rp.net/viewtopic.php?t=53452"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-700 underline"
          >
            Practice Student Profile (link)
          </a>
          .
        </li>
        <li>
          Confirm that the FTO trainee has filled out all the required fields, such as 10-15s
          and subjects to focus on. The notes are optional but encouraged.
        </li>
        <li>
          Remind them that at the end of every piece of paperwork, there is a link they must
          click and fill out for Field Training Sessions. This is <b>mandatory</b>. For ease
          of access, all of this is available in the LSEMS application.
        </li>
        <li>
          Please reach out to the Head of FTD, or if they are unavailable, any Command+
          member to have them added to the Field Training Session Report Form, as they are not
          added automatically.
        </li>
        <li>
          Explain the importance of filling out Field Training Session reports correctly and
          walk them through the form, emphasizing that these reports are <b>mandatory</b> for
          all training sessions.
        </li>
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function FtiPage() {
  /* ---- Shared signature data ---- */
  const [sigName] = useSharedLocalStorageString(SHARED_SIG_NAME_KEY, "");
  const [sigRank] = useSharedLocalStorageString(SHARED_SIG_RANK_KEY, "");
  const [ftdRank] = useSharedLocalStorageString(SHARED_FTD_RANK_KEY, "");
  const [signature] = useSharedLocalStorageString(SHARED_SIGNATURE_KEY, "");

  /* ---- Per-page form state ---- */
  const [savedForm, setSavedForm] = useLocalStorage(FORM_KEY, {
    studentName: "",
    studentRank: "",
    certifiedBy: "",
    completionDate: "",
    answer1: "",
    answer2: "",
    answer3: "",
    answer4: "",
    answer5: "",
  });

  // The fields read straight off the stored form and write back one at a time.
  // Giving each its own `useState` and persisting those lost the stored answers:
  // the mount pass wrote the empty defaults over them before they were applied.
  const setField = (
    field:
      | "studentName"
      | "studentRank"
      | "certifiedBy"
      | "completionDate"
      | "answer1"
      | "answer2"
      | "answer3"
      | "answer4"
      | "answer5",
    value: string,
  ) => setSavedForm((prev) => ({ ...prev, [field]: value }));

  const studentName = savedForm.studentName;
  const studentRank = savedForm.studentRank;
  const certifiedBy = savedForm.certifiedBy;
  const completionDate = savedForm.completionDate;
  const answer1 = savedForm.answer1;
  const answer2 = savedForm.answer2;
  const answer3 = savedForm.answer3;
  const answer4 = savedForm.answer4;
  const answer5 = savedForm.answer5;

  const setStudentName = (value: string) => setField("studentName", value);
  const setStudentRank = (value: string) => setField("studentRank", value);
  const setCertifiedBy = (value: string) => setField("certifiedBy", value);
  const setCompletionDate = (value: string) =>
    setField("completionDate", value);
  const setAnswer1 = (value: string) => setField("answer1", value);
  const setAnswer2 = (value: string) => setField("answer2", value);
  const setAnswer3 = (value: string) => setField("answer3", value);
  const setAnswer4 = (value: string) => setField("answer4", value);
  const setAnswer5 = (value: string) => setField("answer5", value);

  /* Auto-fill certifiedBy from shared bar on first mount (only if empty) */
  const [certByInitDone, setCertByInitDone] = useState(false);
  useEffect(() => {
    if (certByInitDone) return;
    const sharedFull = [sigRank, sigName].filter(Boolean).join(" ");
    if (sharedFull && !certifiedBy) {
      setCertifiedBy(sharedFull);
    }
    setCertByInitDone(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- BBCode generation ---- */
  const certifierRank = ftdRank ? `${sigRank} | ${ftdRank}` : sigRank;

  const certValues = useMemo(
    () => ({
      studentName,
      studentRank,
      certifierName: sigName,
      certifierRank,
      certifiedBy,
      signature,
      completionDate,
      answer1,
      answer2,
      answer3,
      answer4,
      answer5,
    }),
    [studentName, studentRank, sigName, certifierRank, certifiedBy, signature, completionDate, answer1, answer2, answer3, answer4, answer5],
  );

  const certBBCode = useMemo(
    () => generateCertificationPaperwork(certValues),
    [certValues],
  );

  const divisionalBBCode = useMemo(
    () => generateDivisionalFile(certValues),
    [certValues],
  );

  const trainerInfoBBCode = useMemo(
    () => generateTrainerInfoBBCode({ certifiedBy, completionDate }),
    [certifiedBy, completionDate],
  );

  /* ---- Copy helpers ---- */
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`, { theme: "dark" });
    } catch {
      toast.error("Couldn't copy to clipboard - check browser permissions.", { theme: "dark" });
    }
  };

  // Content only: the FTD section layout owns the container and the heading.
  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

      <SharedSignatureBar subtitle="applies to all paperwork on this page" />

      {/* ---- Phase Notes ---- */}
      <Card>
        <CardHeader>
          <CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            Phase Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Collapsible label="Phase 1 - Overview">
            <PhaseOneNotes />
          </Collapsible>
          <Collapsible label="Phase 2 - Evaluation">
            <PhaseTwoNotes />
          </Collapsible>
        </CardContent>
      </Card>

      {/* ---- Trainer Information ---- */}
      <Card>
        <CardHeader>
          <CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            Trainer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Certified by</Label>
              <Input
                value={certifiedBy}
                onChange={(e) => setCertifiedBy(e.target.value)}
                placeholder="Rank Fname Lname"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Date of Completion
              </Label>
              <Input
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                placeholder="DD/MMM/YYYY"
              />
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => copyToClipboard(trainerInfoBBCode, "Trainer info")}
            className="px-4 mt-3"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Trainer Info
          </Button>
        </CardContent>
      </Card>

      {/* ---- Paperwork ---- */}
      <Card>
        <CardHeader>
          <CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
            Paperwork
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* ---- FTO Certification Paperwork ---- */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">
              FTO Certification Paperwork - FTO Profile
            </h3>

            {/* Student details needed for the paperwork */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Student Name</Label>
                <Input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Fname Lname"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Student Rank</Label>
                <Input
                  value={studentRank}
                  onChange={(e) => setStudentRank(e.target.value)}
                  placeholder="EMR"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Fill in the five evaluation answers below. Signature, your name and rank are pulled from the Shared Signature bar above.
            </p>

            <div className="grid gap-4 sm:grid-cols-1">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  1. Did the student FTO understand the meaning behind the three pillars of
                  training clearly?
                </Label>
                <Textarea
                  value={answer1}
                  onChange={(e) => setAnswer1(e.target.value)}
                  placeholder="Your answer..."
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  2. Was the student FTO able to navigate to the 5 listed sections?
                </Label>
                <Textarea
                  value={answer2}
                  onChange={(e) => setAnswer2(e.target.value)}
                  placeholder="Your answer..."
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  3. Was the student FTO able to chew through everything in the Regulations
                  Section of the FT Handbook?
                </Label>
                <Textarea
                  value={answer3}
                  onChange={(e) => setAnswer3(e.target.value)}
                  placeholder="Your answer..."
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  4. Did the student FTO successfully deliver the training phases in their
                  certification?
                </Label>
                <Textarea
                  value={answer4}
                  onChange={(e) => setAnswer4(e.target.value)}
                  placeholder="Your answer..."
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  5. Are you confident that the student FTO will be able to train an EMR?
                </Label>
                <Textarea
                  value={answer5}
                  onChange={(e) => setAnswer5(e.target.value)}
                  placeholder="Your answer..."
                  rows={2}
                />
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => copyToClipboard(certBBCode, "Certification paperwork")}
              className="px-6"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Certification Paperwork
            </Button>
          </div>

          {/* ---- Divider ---- */}
          <hr className="border-border/50" />

          {/* ---- Divisional File ---- */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              FTO Student Passed Paperwork - Divisional File
            </h3>
            <p className="text-xs text-muted-foreground">
              This is auto-generated from the student name, completion date, and your shared
              signature.
            </p>

            <Button
              size="sm"
              onClick={() => copyToClipboard(divisionalBBCode, "Divisional file")}
              className="px-6"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Divisional File
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}