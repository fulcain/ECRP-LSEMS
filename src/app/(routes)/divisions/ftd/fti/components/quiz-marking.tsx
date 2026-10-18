"use client";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Archive,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Copy,
  ExternalLink,
  RotateCcw,
  XCircle,
} from "lucide-react";

import {
  QUIZ_AREA_URL,
  QUIZ_ARCHIVE_URL,
  QUIZ_EMAIL_SUBJECT,
  QUIZ_LONG_ANSWERS,
  QUIZ_MAX_POINTS,
  QUIZ_MC_ANSWERS,
  QUIZ_PASS_MARK,
} from "@/app/constants/divisions/ftd/quiz";
import { QUIZ_RESULTS_MAX } from "@/app/constants/divisions/ftd/quiz-document";
import {
  generateFailedQuizEmail,
  generatePassedAllCorrectQuizEmail,
  generatePassedQuizEmail,
  generateQuizProfilePost,
  type QuizCorrection,
} from "@/components/employee-stats/lib/generate-quiz-results-bbcode";
import {
  forumPostToast,
  handOffForumPost,
  type ForumPost,
} from "@/app/helpers/forumHandoff";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useMedic } from "@/app/context/MedicContext";
import { DIVISIONS } from "@/configs/roles";
import { buildMarkedQuiz, parseSubmittedQuiz } from "@/lib/quiz-marked";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import { GOV_PM_COMPOSE_URL } from "@/app/helpers/govLinks";
import { Button } from "@/components/ui/button";
import { BBCodeEditor } from "@/components/ui/bbcode-editor";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/*  Form persistence                                                    */
/* ------------------------------------------------------------------ */

// v2: the longer questions are keyed long10-long14 (they were 1-5), so a v1
// form's scores and generated email cannot survive the move.
const FORM_KEY = "fti-quiz-marking-v2";

/** A marker's choice per question, keyed `mc<id>` / `long<id>`. Empty = unmarked. */
type Scores = Record<string, string>;

type QuizForm = {
  /** The EMR's forum name, used as the results email's PM recipient. */
  emrName: string;
  /** The submitted quiz, pasted BBCode - it lands in the email's spoil. */
  quizPasted: string;
  scores: Scores;
  /** Marker notes for partially correct answers, keyed by question. */
  correctionNotes: Record<string, string>;
  /** The email the member typed over the generated one. */
  manualEmail: string;
  emailEdited: boolean;
  /** What the marked quiz's Results section says under "Instructor Comments". */
  comments: string;
};

const EMPTY_QUIZ_FORM: QuizForm = {
  emrName: "",
  quizPasted: "",
  scores: {},
  correctionNotes: {},
  manualEmail: "",
  emailEdited: false,
  comments: "",
};

/* ------------------------------------------------------------------ */
/*  Scoring helpers                                                     */
/* ------------------------------------------------------------------ */

function mcKey(question: { id: number }): string {
  return `mc${question.id}`;
}

function longKey(question: { id: number }): string {
  return `long${question.id}`;
}

function longQuestionNumber(id: number): number {
  return QUIZ_LONG_ANSWERS.findIndex((question) => question.id === id) + 1;
}

function correctionLabel(label: string, ooc: boolean): string {
  return ooc ? `[ooc]${label}[/ooc]` : label;
}

function scoreOf(scores: Scores, key: string): number | null {
  const raw = scores[key];
  if (raw === undefined || raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : null;
}

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value.toFixed(1));
}

/* ------------------------------------------------------------------ */
/*  Collapsible reference section                                       */
/* ------------------------------------------------------------------ */

function Collapsible({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="border border-border/40 rounded-xl group"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium cursor-pointer hover:bg-surface-hover/40 transition-colors rounded-xl list-none">
        <span>{label}</span>
        <ChevronDown className="h-4 w-4 transition-transform duration-200 text-muted-foreground" />
      </summary>
      <div className="px-5 pb-5 pt-1 border-t border-border/30">{children}</div>
    </details>
  );
}

function OocBadge() {
  return <Badge variant="warning">OOC</Badge>;
}

function ScoreChoices({
  value,
  options,
  label,
  onChange,
}: {
  value: number | null;
  options: readonly (number | null)[];
  label: string;
  onChange: (value: number | null) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const selected = value === option;
        const text = option === null ? "Clear" : formatScore(option);
        return (
          <Button
            key={option ?? "unscored"}
            type="button"
            size="sm"
            variant={selected ? "default" : "outline"}
            aria-pressed={selected}
            aria-label={option === null ? `${label}: not scored` : `${label}: ${text} points`}
            title={option === null ? "Clear this score and leave the question unscored" : `Give ${text} points`}
            onClick={() => onChange(option)}
            className="h-9 min-w-10 px-2.5 tabular-nums"
          >
            {text}
          </Button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Answer-sheet reference                                              */
/* ------------------------------------------------------------------ */

function GuidelinesReference() {
  return (
    <ul className="list-disc pl-5 space-y-1.5 text-sm">
      <li>
        When a quiz has been submitted in the{" "}
        <a
          href={QUIZ_AREA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          Quiz Area (click!)
        </a>
        , <b>immediately</b> move the submitted quiz to the{" "}
        <a
          href={QUIZ_ARCHIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          Quiz Area - Archive (click!)
        </a>
        . This is to prevent any potential copying of answers.
      </li>
      <li>
        Before doing anything else, add your name in the &quot;Marker: &quot; field
        at the bottom of the quiz and immediately save it. This is to prevent
        multiple people working on a quiz.
      </li>
      <li>
        <b>Multiple choice:</b> each question is worth 1 point, with a maximum of
        7 points [ooc] + 2 OOC [/ooc]. Two correct choices means half a point
        (0.5) each; wrong choices earn 0 points.
      </li>
      <li>
        <b>Longer questions:</b> each &quot;mentioned&quot; point listed in the answer
        sheet is worth 1 point. If they mention something that isn&apos;t listed
        but you deem it acceptable, mark it as correct and mention it to the Head
        of FTD. Total for this section is 9 points [ooc] + 4 OOC [/ooc].
      </li>
      <li>
        Once marked, fill out the results at the end of the quiz itself, then
        sign it. The results email&apos;s subject is{" "}
        <b>{QUIZ_EMAIL_SUBJECT}</b>, and the email is added as a reply to the
        quiz.
      </li>
      <li>
        <b>Pass:</b> a minimum of {QUIZ_PASS_MARK.regular} out of{" "}
        {QUIZ_MAX_POINTS.regular} points [ooc]+ {QUIZ_PASS_MARK.ooc} out of{" "}
        {QUIZ_MAX_POINTS.ooc} for OOC [/ooc].
      </li>
      <li>
        <b>Fail:</b> below that. Send only the questions they got wrong -{" "}
        <b>do not give any answers</b>, as their response to your email will be
        to correct these answers.
      </li>
    </ul>
  );
}

function McAnswerSheet() {
  return (
    <ol className="list-decimal pl-5 space-y-1 text-sm">
      {QUIZ_MC_ANSWERS.map((question) => (
        <li key={question.id} className="flex items-center gap-1.5">
          <span>{question.answers.join(", ")}</span>
          {question.ooc ? <OocBadge /> : null}
        </li>
      ))}
    </ol>
  );
}

function LongAnswerSheet() {
  return (
    <ol className="list-decimal pl-5 space-y-3 text-sm">
      {QUIZ_LONG_ANSWERS.map((question) => (
        <li key={question.id}>
          <span className="inline-flex items-center gap-1.5">Mention of:</span>
          {question.ooc ? (
            <span className="ml-1.5 align-middle">
              <OocBadge />
            </span>
          ) : null}
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            {question.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/*  Main card                                                           */
/* ------------------------------------------------------------------ */

export function QuizMarking() {
  const [form, setForm] = useLocalStorage<QuizForm>(FORM_KEY, EMPTY_QUIZ_FORM);

  /* ---- The marker's own details, straight from the Staff Page ---- */
  const { medicCredentials, divisionRanks } = useMedic();
  const markerName = medicCredentials.name;
  const sigRank = medicCredentials.rank;
  const ftdRank = divisionRanks[DIVISIONS.ftd.label] || "";
  const markerSignature = medicCredentials.signature;

  const update = (patch: Partial<QuizForm>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const setQuizPasted = (value: string) => update({ quizPasted: value });
  const setEmrName = (value: string) => update({ emrName: value });
  const setComments = (value: string) => update({ comments: value });

  const setScore = (key: string, value: string) =>
    setForm((prev) => {
      const notes = { ...(prev.correctionNotes ?? {}) };
      if (prev.scores[key] !== value) delete notes[key];
      return {
        ...prev,
        scores: { ...prev.scores, [key]: value },
        correctionNotes: notes,
      };
    });

  const setCorrectionNote = (key: string, note: string) =>
    setForm((prev) => ({
      ...prev,
      correctionNotes: { ...(prev.correctionNotes ?? {}), [key]: note },
    }));

  /* ---- Clearing for the next quiz ---- */

  const anyMarked = useMemo(
    () => Object.values(form.scores).some((value) => value !== ""),
    [form.scores],
  );

  const clearResults = () => {
    // The pasted quiz and the EMR's name stay - clearing the marking is not
    // clearing the submission; a second button owns the paste.
    setForm({
      ...form,
      scores: {},
      correctionNotes: {},
      comments: "",
      manualEmail: "",
      emailEdited: false,
    });
    toast.success("Quiz marking cleared", { theme: "dark" });
  };

  /* ---- Totals and result ---- */

  const totals = useMemo(() => {
    let mc = 0;
    let longer = 0;
    let ooc = 0;
    for (const question of QUIZ_MC_ANSWERS) {
      const score = scoreOf(form.scores, mcKey(question));
      if (score !== null) {
        if (question.ooc) ooc += score;
        else mc += score;
      }
    }
    for (const question of QUIZ_LONG_ANSWERS) {
      const score = scoreOf(form.scores, longKey(question));
      if (score !== null) {
        if (question.ooc) ooc += score;
        else longer += score;
      }
    }
    return { regular: mc + longer, ooc, mc, longer };
  }, [form.scores]);

  const allScored = useMemo(
    () =>
      QUIZ_MC_ANSWERS.every(
        (question) => scoreOf(form.scores, mcKey(question)) !== null,
      ) &&
      QUIZ_LONG_ANSWERS.every(
        (question) => scoreOf(form.scores, longKey(question)) !== null,
      ),
    [form.scores],
  );

  const fullMarks = useMemo(() => {
    if (!allScored) return false;
    return QUIZ_MC_ANSWERS.every(
      (question) => scoreOf(form.scores, mcKey(question)) === 1,
    ) && QUIZ_LONG_ANSWERS.every(
      (question) =>
        scoreOf(form.scores, longKey(question)) === question.points.length,
    );
  }, [allScored, form.scores]);

  const passed =
    allScored &&
    totals.regular >= QUIZ_PASS_MARK.regular &&
    totals.ooc >= QUIZ_PASS_MARK.ooc;

  const overMax =
    totals.regular > QUIZ_MAX_POINTS.regular ||
    totals.ooc > QUIZ_MAX_POINTS.ooc;

  /* ---- Incomplete scores become corrections; partial scores can carry a note. ---- */
  const corrections = useMemo(() => {
    const rows: QuizCorrection[] = [];
    for (const question of QUIZ_MC_ANSWERS) {
      const key = mcKey(question);
      const score = scoreOf(form.scores, key);
      if (score !== null && score < 1) {
        const note = form.correctionNotes?.[key]?.trim();
        rows.push({
          question: correctionLabel(`Multiple Choice Question ${question.id}`, question.ooc),
          answers: [question.answers.join(", ")],
          ...(score > 0 && note ? { note } : {}),
        });
      }
    }
    for (const question of QUIZ_LONG_ANSWERS) {
      const key = longKey(question);
      const score = scoreOf(form.scores, key);
      if (score !== null && score < question.points.length) {
        const note = form.correctionNotes?.[key]?.trim();
        rows.push({
          question: correctionLabel(
            `Longer question ${longQuestionNumber(question.id)}`,
            question.ooc,
          ),
          answers: question.points,
          ...(score > 0 && note ? { note } : {}),
        });
      }
    }
    return rows;
  }, [form.scores, form.correctionNotes]);

  const failedQuestions = useMemo(() => {
    const rows: QuizCorrection[] = [];
    for (const question of QUIZ_MC_ANSWERS) {
      const key = mcKey(question);
      const score = scoreOf(form.scores, key);
      if (score !== null && score < 1) {
        rows.push({
          question: correctionLabel(`Multiple Choice Question ${question.id}`, question.ooc),
          answers: [],
          ...(score > 0 && form.correctionNotes?.[key]?.trim()
            ? { note: form.correctionNotes[key].trim() }
            : {}),
        });
      }
    }
    for (const question of QUIZ_LONG_ANSWERS) {
      const key = longKey(question);
      const score = scoreOf(form.scores, key);
      if (score !== null && score < question.points.length) {
        rows.push({
          question: correctionLabel(
            `Longer question ${longQuestionNumber(question.id)}`,
            question.ooc,
          ),
          answers: [],
          ...(score > 0 && form.correctionNotes?.[key]?.trim()
            ? { note: form.correctionNotes[key].trim() }
            : {}),
        });
      }
    }
    return rows;
  }, [form.scores, form.correctionNotes]);

  /* ---- The marked quiz: the paste's answers filled into the form ---- */

  const parsedPaste = useMemo(
    () => parseSubmittedQuiz(form.quizPasted),
    [form.quizPasted],
  );

  /* Longer questions the paste's answers were not read for - unanswered at
   * the EMR's end, or a paste the render erased the form from. The card says
   * which, so a blank answer in the marked quiz is a decision, not a silence. */
  const unreadLongIds = useMemo(() => {
    if (!form.quizPasted.trim() || !parsedPaste.found) return [];
    return QUIZ_LONG_ANSWERS.filter(
      (question) => parsedPaste.longAnswers[question.id] === undefined,
    ).map((question) => longQuestionNumber(question.id));
  }, [form.quizPasted, parsedPaste]);

  const markedQuiz = useMemo(
    () =>
      buildMarkedQuiz({
        pasted: form.quizPasted,
        scores: form.scores,
        comments: form.comments,
        markerName,
        markerRank: ftdRank || sigRank,
        markerSignature,
        allScored,
        passed,
      }),
    [
      form.quizPasted,
      form.scores,
      form.comments,
      markerName,
      ftdRank,
      sigRank,
      markerSignature,
      allScored,
      passed,
    ],
  );

  /* ---- The results email is built only when the instructor asks for it. ---- */

  const generateEmail = () => {
    if (!allScored) return;
    let email: string;
    if (passed && fullMarks) {
      email = generatePassedAllCorrectQuizEmail({ markedQuiz });
    } else if (passed) {
      email = generatePassedQuizEmail({
        regularScore: formatScore(totals.regular),
        oocScore: formatScore(totals.ooc),
        corrections,
        markedQuiz,
      });
    } else {
      email = generateFailedQuizEmail({
        regularScore: formatScore(totals.regular),
        oocScore: formatScore(totals.ooc),
        questions: failedQuestions,
        markedQuiz,
      });
    }
    update({ manualEmail: email, emailEdited: false });
  };

  const emailBody = form.manualEmail;

  const setEmailBody = (value: string) =>
    update({
      manualEmail: value,
      emailEdited: value.trim().length > 0,
    });

  /* ---- Copy helpers, handed to the extension like every other card ---- */

  const copyEmail = async () => {
    if (!emailBody.trim()) return;
    const emrName = form.emrName.trim();
    const post: ForumPost = {
      subject: QUIZ_EMAIL_SUBJECT,
      feature: "the quiz marking card",
    };
    if (emrName) post.recipient = emrName;
    const handedOff = handOffForumPost(post, emailBody);
    try {
      await navigator.clipboard.writeText(emailBody);
      toast.success(
        forumPostToast(
          handedOff,
          `${QUIZ_EMAIL_SUBJECT} email copied to clipboard`,
        ),
        { theme: "dark" },
      );
    } catch {
      toast.error("Couldn't copy to clipboard - check browser permissions.", {
        theme: "dark",
      });
    }
  };

  const profilePost = useMemo(() => generateQuizProfilePost(), []);

  const sendEmail = () => {
    if (!emailBody.trim()) return;
    const emrName = form.emrName.trim();
    void copyBBCodeAndOpen({
      bbCodeText: emailBody,
      url: GOV_PM_COMPOSE_URL,
      post: {
        subject: QUIZ_EMAIL_SUBJECT,
        recipient: emrName || undefined,
        feature: "the quiz marking card",
      },
    });
  };

  const copyProfilePost = async () => {
    const handedOff = handOffForumPost(
      { feature: "the quiz marking card" },
      profilePost,
    );
    try {
      await navigator.clipboard.writeText(profilePost);
      toast.success(
        forumPostToast(handedOff, "EMR profile post copied to clipboard"),
        { theme: "dark" },
      );
    } catch {
      toast.error("Couldn't copy to clipboard - check browser permissions.", {
        theme: "dark",
      });
    }
  };

  /* ---- Render ---- */

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          Quiz Marking - EMR Quizzes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-xs text-muted-foreground">
          This quiz is a &quot;safety net&quot; to prevent EMRs from reaching EMT-Basic
          without having read the Department Manual. Paste the submitted quiz,
          mark it against the answer sheet, then generate the results email when
          you are ready.
        </p>

        {/* ---- Step 1: the submitted quiz ---- */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold">1. The submitted quiz</h3>
          <p className="text-xs text-muted-foreground">
            Move the quiz to the Quiz Area - Archive and add your name to its
            &quot;Marker: &quot; field first. Then copy the quiz post&apos;s BBCode and
            paste it here - it is what you mark against, and it is dropped
            straight into the results email.
          </p>
          <BBCodeEditor
            value={form.quizPasted}
            onChange={setQuizPasted}
            rows={6}
            placeholder="Paste the EMR's quiz BBCode here (viewtopic: select all in the editor and copy)..."
            maxHeightClass="max-h-[50vh]"
          />
          <p className="text-xs text-muted-foreground">
            The EMR&apos;s X marks and answers are read out of this paste and
            filled into the marked quiz the results email carries.
          </p>
          {form.quizPasted.trim() ? (
            parsedPaste.found ? (
              <>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  The EMR&apos;s answers were read from the paste - every X
                  mark and answer here travels into the marked quiz.
                </p>
                {unreadLongIds.length ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    No answer was read for Longer question
                    {unreadLongIds.length === 1 ? "" : "s"}{" "}
                    {unreadLongIds.join(", ")} - the marked quiz leaves{" "}
                    {unreadLongIds.length === 1 ? "it" : "them"} blank. If the
                    EMR answered{" "}
                    {unreadLongIds.length === 1 ? "it" : "them"}, copy the quiz
                    out of the topic&apos;s editor (BBCode) rather than off the
                    rendered page and paste it again.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                The EMR&apos;s answers could not be read from this paste - the
                marked quiz will still carry your scores, totals and results,
                but without their X marks. Copy the quiz out of the topic&apos;s
                editor (BBCode) rather than off the rendered page and paste it
                again.
              </p>
            )
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              The EMR&apos;s quiz is not pasted in yet - the marked quiz will
              carry your scores, totals and results, but no answers. Paste the
              EMR&apos;s quiz into the box above so its answers travel too.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <a
                href={QUIZ_AREA_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Quiz Area
              </a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a
                href={QUIZ_ARCHIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Archive className="h-4 w-4 mr-2" />
                Quiz Area - Archive
              </a>
            </Button>
          </div>
        </div>

        {/* ---- The answer sheet ---- */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold">Answer sheet &amp; marking guidelines</h3>
          <Collapsible label="Marking guidelines">
            <GuidelinesReference />
          </Collapsible>
          <Collapsible label="Multiple choice answers">
            <McAnswerSheet />
          </Collapsible>
          <Collapsible label="Longer question answers">
            <LongAnswerSheet />
          </Collapsible>
        </div>

        {/* ---- Step 2: the marking sheet ---- */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold">2. Mark the quiz</h3>
          <p className="text-xs text-muted-foreground">
            Read the EMR&apos;s answers against the answer sheet above. Half
            points follow the guidelines. Any question below full marks is
            added to the email automatically; add a short note when an answer
            earns partial credit.
          </p>

          <div className="space-y-2">
            {QUIZ_MC_ANSWERS.map((question) => {
              const key = mcKey(question);
              const score = scoreOf(form.scores, key);
              return (
                <div
                  key={key}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/40 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      Multiple Choice Question {question.id}
                    </span>
                    {question.ooc ? <OocBadge /> : null}
                    <span className="text-xs text-muted-foreground">
                      Correct: {question.answers.join(", ")}
                      {question.answers.length > 1 ? " (0.5 each)" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Score</span>
                    <ScoreChoices
                      value={score}
                      options={[null, 0, 0.5, 1]}
                      label={`Multiple choice question ${question.id}`}
                      onChange={(value) => setScore(key, value === null ? "" : String(value))}
                    />
                    {score === 0 ? (
                      <Badge variant="muted">Added to corrections</Badge>
                    ) : score !== null && score < 1 ? (
                      <Input
                        className="w-full sm:w-64"
                        value={form.correctionNotes?.[key] ?? ""}
                        onChange={(event) => setCorrectionNote(key, event.target.value)}
                        placeholder="Optional note for the email"
                        aria-label={`Correction note for question ${question.id}`}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            {QUIZ_LONG_ANSWERS.map((question) => {
              const key = longKey(question);
              const score = scoreOf(form.scores, key);
              return (
                <div
                  key={key}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/40 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      Longer question {longQuestionNumber(question.id)}
                    </span>
                    {question.ooc ? <OocBadge /> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Score / {question.points.length}
                    </span>
                    <ScoreChoices
                      value={score}
                      options={[
                        null,
                        ...Array.from(
                          { length: question.points.length + 1 },
                          (_, point) => point,
                        ),
                      ]}
                      label={`Longer question ${longQuestionNumber(question.id)}`}
                      onChange={(value) => setScore(key, value === null ? "" : String(value))}
                    />
                    {score === 0 ? (
                      <Badge variant="muted">Added to corrections</Badge>
                    ) : score !== null && score < question.points.length ? (
                      <Input
                        className="w-full sm:w-64"
                        value={form.correctionNotes?.[key] ?? ""}
                        onChange={(event) => setCorrectionNote(key, event.target.value)}
                        placeholder="Optional note for the email"
                        aria-label={`Correction note for longer question ${longQuestionNumber(question.id)}`}
                      />
                    ) : null}
                  </div>
                  <details className="basis-full rounded-lg border border-border/40 bg-surface-hover/30 px-3 py-2 text-xs">
                    <summary className="cursor-pointer font-medium text-muted-foreground">
                      View the {question.points.length} point{question.points.length === 1 ? "" : "s"} to award
                    </summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground/90">
                      {question.points.map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  </details>
                </div>
              );
            })}
          </div>

          {/* Totals and result */}
          <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border/40 bg-surface-hover/40 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Regular</p>
              <p className="text-lg font-semibold">
                {formatScore(totals.regular)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  out of {QUIZ_MAX_POINTS.regular}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Multiple Choice</p>
              <p className="text-lg font-semibold">
                {formatScore(totals.mc)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  out of {QUIZ_RESULTS_MAX.mc}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Longer Questions</p>
              <p className="text-lg font-semibold">
                {formatScore(totals.longer)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  out of {QUIZ_RESULTS_MAX.longer}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">OOC</p>
              <p className="text-lg font-semibold">
                {formatScore(totals.ooc)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  out of {QUIZ_MAX_POINTS.ooc}
                </span>
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {!allScored ? (
                <span className="text-sm text-muted-foreground">
                  Mark every question to see the result
                </span>
              ) : passed ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  PASSED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  FAILED
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                disabled={!anyMarked}
                onClick={clearResults}
                title="Clears the scores, the pasted quiz and the results email"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear results
              </Button>
            </div>
          </div>
          {overMax ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              The totals exceed the quiz&apos;s maximum ({QUIZ_MAX_POINTS.regular} regular{" "}
              + {QUIZ_MAX_POINTS.ooc} OOC) - check the totals on the live quiz form
              before sending, and fix them in the email below if they differ.
            </p>
          ) : null}
        </div>

        {/* ---- Step 3: the results email ---- */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold">3. The results email</h3>
          <p className="text-xs text-muted-foreground">
            {allScored ? (
              "Generate the email when you are ready. It will not update when scores or comments change; generate it again to refresh."
            ) : (
              "Mark every question to generate the email."
            )}
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              EMR&apos;s forum name (email recipient, optional)
            </Label>
            <Input
              value={form.emrName}
              onChange={(e) => setEmrName(e.target.value)}
              placeholder="Fname_Lname - filled on the email page by the extension"
              className="border-border bg-surface-hover text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Instructor comments (optional, printed on the marked quiz)
            </Label>
            <Textarea
              value={form.comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Anything you want on the Results section under Instructor Comments..."
              rows={2}
            />
          </div>
          <Button size="sm" disabled={!allScored} onClick={generateEmail}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            {emailBody.trim() ? "Generate email from current scores" : "Generate results email"}
          </Button>
          <BBCodeEditor
            value={emailBody}
            onChange={setEmailBody}
            rows={12}
            maxHeightClass="max-h-[60vh]"
            placeholder="Your results email will appear here after you generate it."
          />
          {form.emailEdited ? (
            <p className="text-xs text-muted-foreground">
              You have edited this email. Your edits stay until you generate it
              again from the current scores.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={!emailBody.trim()} onClick={copyEmail}>
              <Copy className="h-4 w-4 mr-2" />
              Copy {QUIZ_EMAIL_SUBJECT} email
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!emailBody.trim() || !allScored}
              onClick={sendEmail}
              title="Copies the email and opens the GOV private-message composer - subject and recipient are filled by the extension"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Copy Quiz Result and Open Gov
            </Button>
            {allScored && passed ? (
              <Button
                size="sm"
                variant="outline"
                onClick={copyProfilePost}
                title="The post their EMR profile gets, clearing them for Pre-Certification & Certification"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy EMR profile post
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
