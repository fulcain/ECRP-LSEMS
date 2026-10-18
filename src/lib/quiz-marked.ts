/**
 * The marked quiz: the EMR's submitted quiz is pasted in, the answers are read
 * out of it, and the quiz is rebuilt from the declared form (quiz-document.ts)
 * with those answers, the marker's per-question scores, and the Results
 * section filled in - rather than the raw paste being carried into the email.
 *
 * Both halves are pure: the card parses as the paste is typed and rebuilds as
 * the marking is filled, so what the member reads is what the email will say.
 */

import {
  QUIZ_BLANK_IMAGE,
  QUIZ_DOCUMENT_LONG,
  QUIZ_DOCUMENT_MC,
  QUIZ_RESULTS_MAX,
  type QuizDocumentLongQuestion,
  type QuizDocumentMcQuestion,
} from "@/app/constants/divisions/ftd/quiz-document";

/* ------------------------------------------------------------------ */
/*  Reading the EMR's answers out of the paste                          */
/* ------------------------------------------------------------------ */

export type SubmittedQuiz = {
  /** Which of each MC question's options the EMR marked, by question id. */
  mcMarks: Record<number, number[]>;
  /** The EMR's answer text, by longer question id. Empty = not answered. */
  longAnswers: Record<number, string>;
  /** True once at least one answer was read out of the paste. */
  found: boolean;
};

/** phpBB stores an id of its own on every tag; the paste is judged without it.
 * A tag that carries a value (`list=none`, `url=...`) keeps the id after that
 * value, so the value must be read back before the id is dropped. */
function stripPhpbbIds(text: string): string {
  return text
    .replace(
      /\[(\/?[a-z*0-9]+)=([^\]]*?)(?::[a-z0-9]+)+\]/gi,
      (_match, tag: string, value: string) => `[${tag}=${value}]`,
    )
    .replace(
      /\[(\/?[a-z*0-9]+)(?::[a-z0-9]+)+\]/gi,
      (_match, tag: string) => `[${tag}]`,
    );
}

export function parseSubmittedQuiz(pasted: string): SubmittedQuiz {
  /* Matching is whitespace-tolerant: phpBB and an EMR's copy can double
   * spaces or reflow a line, and an anchor that does not match for that would
   * silently drop the question. Every board and the prompt are folded to
   * single spaces before they are read. */
  const text = stripPhpbbIds(pasted).replace(/[ \t]+/g, " ");
  const anchorFor = (prompt: string) =>
    text.indexOf(prompt.replace(/[ \t]+/g, " ").trim());

  /* Each question is anchored by its own prompt: the paste is the form, so its
   * wording is the declaration's wording, in or out of its [b] wrapper. A
   * longer question a plain-text copy has slipped in on (every tag drawn away,
   * as a copy off the rendered page arrives) is anchored by its prompt with
   * the tags stripped out of it - the form's answers are words, and those a
   * plain-text copy still says. Blocks run from one anchor to the next. */
  const anchors: { id: number; mc: boolean; at: number }[] = [];
  for (const question of QUIZ_DOCUMENT_MC) {
    const at = anchorFor(question.prompt);
    if (at >= 0) anchors.push({ id: question.id, mc: true, at });
  }
  for (const question of QUIZ_DOCUMENT_LONG) {
    const at = anchorFor(question.prompt);
    if (at >= 0) {
      anchors.push({ id: question.id, mc: false, at });
    } else {
      const plainAt = anchorFor(taglessPrompt(question.prompt));
      if (plainAt >= 0) {
        anchors.push({ id: question.id, mc: false, at: plainAt });
      }
    }
  }
  anchors.sort((a, b) => a.at - b.at);

  const mcMarks: Record<number, number[]> = {};
  const longAnswers: Record<number, string> = {};
  let found = false;

  for (let i = 0; i < anchors.length; i++) {
    const anchor = anchors[i];
    const blockEnd = i + 1 < anchors.length ? anchors[i + 1].at : text.length;
    const block = text.slice(anchor.at, blockEnd);

    if (anchor.mc) {
      // An answer is the option's own [] slot, marked by an X inside it - in
      // any spacing the EMR typed it ([X], [x], [ X ]).
      const marked: number[] = [];
      const optionRe = /\[\*\]\s*\[([xX ]*)\]/g;
      let index = 0;
      for (const option of block.matchAll(optionRe)) {
        if (option[1].toLowerCase().includes("x")) marked.push(index);
        index++;
      }
      if (marked.length) {
        mcMarks[anchor.id] = marked;
        found = true;
      }
    } else {
      const answer = readLongAnswer(block, questionPrompt(anchor.id));
      if (answer) {
        longAnswers[anchor.id] = answer;
        found = true;
      }
    }
  }

  return { mcMarks, longAnswers, found };
}

function questionPrompt(id: number): string {
  return (
    QUIZ_DOCUMENT_LONG.find((question) => question.id === id)?.prompt ?? ""
  );
}

/* The prompt as a copy off the rendered page says it: every BBCode tag drawn,
 * nothing but the form's own words left. */
function taglessPrompt(prompt: string): string {
  return prompt
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/* The OOC questions carry the form's closing )) right after the answer - that
 * is the form's writing, not the EMR's. It is spelled in more ways than the
 * template's own, depending on how much of the form the EMR erased: the whole
 * close, its [b] half-open, or just the )) - all of it is rebuilt by the
 * builder, never kept. */
function stripOocClose(answer: string): string {
  return answer
    .replace(/\s*\[b\]\s*\)\)\s*\[\/b\]\s*$/g, "")
    // [b])) / [b)) / bare )) - the close with or without its [b, guarded to a
    // double ) so a smiley never loses its paren.
    .replace(/\s*(\[b\]?)?\)\)+\s*$/g, "")
    .trim();
}

function stripAnswerOocWrapper(answer: string): string {
  const wrapped = answer.trim().match(/^\[ooc\]([\s\S]*?)\[\/ooc\]$/i);
  return (wrapped ? wrapped[1] : answer).trim();
}

function readLongAnswer(block: string, prompt: string): string {
  // The EMR's answer sits where the form says INPUT ANSWER - normally between
  // the question's [list=none] and its close.
  const answerMatch = block.match(/\[list=none\]([\s\S]*?)\[\/list\]/);
  if (answerMatch) {
    return stripAnswerOocWrapper(
      stripOocClose(answerMatch[1].replace(/INPUT ANSWER/g, "")),
    );
  }

  /* An EMR who erased the form's own list has the answer standing after the
   * prompt - the block minus the prompt, its (N) points note, its BBCode and
   * INPUT ANSWER is the answer. A plain-text copy (every tag drawn away, as a
   * copy off the rendered page arrives) is read with both spellings of the
   * prompt taken off, and stops where the next question starts: its Results
   * heading, or the bare number line the invisible question markers copy as. */
  const headingStop = block.search(/results \(for|multiple choice questions/i);
  let scope: string = headingStop >= 0 ? block.slice(0, headingStop) : block;
  const numberStop = scope.match(/(^|\n)[ \t]*\d{1,2}[ \t]*(\n|$)/);
  if (numberStop && numberStop.index && numberStop.index > 0) {
    scope = scope.slice(0, numberStop.index);
  }
  // The drawn mark slots stand on their own line in a plain copy - "[ 1 ]"
  // for the regular questions, "(( [ 1 ] ))" (as "(( 1 ))") for the OOC ones -
  // and are taken off before the points notes are, which would otherwise eat
  // the inner "( 1 )" of an OOC slot.
  const plainSlot = /^\s*(\[|\(\()\s*\[?\s*[\d.]*\s*\]?\s*\)?\)?\s*$/gm;
  return stripOocClose(
    scope
      .replace(taglessPrompt(prompt), "")
      .replace(prompt.trim(), "")
      .replace(plainSlot, "")
      .replace(/INPUT ANSWER/g, "")
      .replace(/\(\s*\d+\s*\)/g, "")
      .replace(/\[\/?[^\]]*\]/g, ""),
  );
}
/* ------------------------------------------------------------------ */
/*  Rebuilding the form with the answers and the marking in it          */
/* ------------------------------------------------------------------ */

export type MarkedQuizInput = {
  /** The EMR's pasted quiz - the answers are read out of it. */
  pasted: string;
  /** The marker's per-question scores, keyed `mc<id>` / `long<id>`. */
  scores: Record<string, string>;
  comments?: string;
  markerName?: string;
  markerRank?: string;
  markerSignature?: string;
  /** True once every question carries a score. */
  allScored?: boolean;
  /** The result the marking came to; only read when `allScored`. */
  passed?: boolean;
};

/* A form stored before a field existed has no value for it - the signature
 * block and comments just stay blank rather than the card crashing. */
export interface MarkedQuizResolved {
  pasted: string;
  scores: Record<string, string>;
  comments: string;
  markerName: string;
  markerRank: string;
  markerSignature: string;
  allScored: boolean;
  passed: boolean;
}

function resolveMarkedQuizInput(input: MarkedQuizInput): MarkedQuizResolved {
  return {
    pasted: input.pasted ?? "",
    scores: input.scores ?? {},
    comments: input.comments ?? "",
    markerName: input.markerName ?? "",
    markerRank: input.markerRank ?? "",
    markerSignature: input.markerSignature ?? "",
    allScored: input.allScored ?? false,
    passed: input.passed ?? false,
  };
}

function scoreOf(scores: Record<string, string>, key: string): number | null {
  const raw = scores[key];
  if (raw === undefined || raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : null;
}

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value.toFixed(1));
}

/** An unmarked question leaves the form's own blank slot standing. */
function slot(score: number | null): string {
  return score === null ? "[  ]" : `[ ${formatScore(score)} ]`;
}

function mcQuestionLines(question: QuizDocumentMcQuestion, marks: number[], score: number | null): string[] {
  const open = question.id === QUIZ_DOCUMENT_MC[0].id ? "[list=1]" : "";
  const marker = `[color=transparent]${question.id}[/color]`;
  const lines = [marker, `${open}[*][b]${question.prompt}[/b][list=a]`];
  question.options.forEach((option, index) => {
    const pick = marks.includes(index) ? "[X]" : "[]";
    lines.push(`[*]${pick} ${option}`);
  });
  lines.push("[/list]");
  lines.push(
    question.ooc
      ? `[float=right][ooc] ${slot(score)} [/ooc][/float]`
      : `[float=right]${slot(score)}[/float]`,
  );
  return lines;
}

function longQuestionLines(question: QuizDocumentLongQuestion, answer: string, score: number | null): string[] {
  const open = question.id === QUIZ_DOCUMENT_LONG[0].id ? "[list=1]" : "";
  const marker = `[color=transparent]${question.id}[/color]`;
  return [
    marker,
    `${open}[*][b]${question.prompt}[/b] (${question.points})[list=none]`,
    `${question.answerPrefix}${answer}${question.answerSuffix}`,
    "",
    "[/list]",
    question.ooc
      ? `[float=right][ooc] ${slot(score)} [/ooc][/float]`
      : `[float=right]${slot(score)}[/float]`,
  ];
}

function totalLine(regular: number, ooc: number): string {
  return `[float=right][TOTAL ${formatScore(regular)} [ooc] ${formatScore(ooc)} OOC TOTAL [/ooc]][/float]`;
}

function signatureImage(signature: string): string {
  const value = signature.trim();
  if (!value) return "Signature";
  if (/^\[img\][\s\S]*\[\/img\]$/i.test(value)) return value;
  return `[img]${value}[/img]`;
}

export function buildMarkedQuiz(rawInput: MarkedQuizInput): string {
  const input = resolveMarkedQuizInput(rawInput);
  const parsed = parseSubmittedQuiz(input.pasted);
  const anyScored = Object.values(input.scores).some(
    (value) => value !== "" && value !== undefined,
  );

  // Nothing was picked up, marked or written - the placeholder stays.
  if (!input.pasted.trim() && !anyScored && !input.comments.trim()) return "";

  /* The marked quiz is always the form rebuilt with the marking in it, so
   * numbers, totals and Results travel even when a paste's answers could not
   * be read (the marker is told why below the editor, and the X marks are
   * the only part missing). */

  /* ---- The marking's own totals ---- */
  let mcRegular = 0;
  let longerRegular = 0;
  let mcOoc = 0;
  let longerOoc = 0;
  for (const question of QUIZ_DOCUMENT_MC) {
    const score = scoreOf(input.scores, `mc${question.id}`);
    if (score === null) continue;
    if (question.ooc) mcOoc += score;
    else mcRegular += score;
  }
  for (const question of QUIZ_DOCUMENT_LONG) {
    const score = scoreOf(input.scores, `long${question.id}`);
    if (score === null) continue;
    if (question.ooc) longerOoc += score;
    else longerRegular += score;
  }
  const regular = mcRegular + longerRegular;
  const ooc = mcOoc + longerOoc;

  const finalResult = input.allScored
    ? input.passed
      ? "PASS"
      : "FAIL"
    : "PASS/FAIL";

  const commentLines = input.comments.trim()
    ? [input.comments.trim()]
    : [];

  return [
    `[img]${QUIZ_BLANK_IMAGE}[/img]`,
    "[lsemssubtitle]Multiple Choice Questions[/lsemssubtitle]",
    "[divbox=white]",
    '[b][i]Add an "X" to the [] to pick your answer(s). Do keep in mind that multiple answers are possible![/i][/b]',
    "[color=transparent]spacer[/color]",
    ...QUIZ_DOCUMENT_MC.flatMap((question) =>
      mcQuestionLines(question, parsed.mcMarks[question.id] ?? [], scoreOf(input.scores, `mc${question.id}`)),
    ),
    "[/list]",
    "[hr][/hr]",
    totalLine(mcRegular, mcOoc),
    "[color=transparent]spacer[/color]",
    "[color=transparent]spacer[/color]",
    "[/divbox]",
    "[lsemssubtitle]Longer Questions[/lsemssubtitle]",
    "[divbox=white]",
    '[b][i]Replace the "INPUT ANSWER" with your ANSWER, points are shown in brackets at the end of the question.[/b][/i]',
    "[color=transparent]spacer[/color]",
    ...QUIZ_DOCUMENT_LONG.flatMap((question) =>
      longQuestionLines(question, parsed.longAnswers[question.id] ?? "", scoreOf(input.scores, `long${question.id}`)),
    ),
    "[color=transparent]spacer[/color]",
    "[color=transparent]spacer[/color]",
    "[/list]",
    "[hr][/hr]",
    totalLine(longerRegular, longerOoc),
    "[color=transparent]spacer[/color]",
    "[color=transparent]spacer[/color]",
    "[/divbox]",
    "[lsemssubtitle]Results (For Field Training Instructor+ ONLY!)[/lsemssubtitle]",
    "[divbox=white]",
    `Multiple Choice Score: ${formatScore(mcRegular)} out of ${QUIZ_RESULTS_MAX.mc}`,
    `Longer Questions Score: ${formatScore(longerRegular)} out of ${QUIZ_RESULTS_MAX.longer}`,
    `[ooc]OOC Score: ${formatScore(ooc)} out of ${QUIZ_RESULTS_MAX.ooc}[/ooc]`,
    `Total Score: [b]${formatScore(regular)}[/b] out of [b]${QUIZ_RESULTS_MAX.total}[/b] [ooc] This excludes OOC Score! [/ooc]`,
    "[color=transparent]spacer[/color]",
    "[b]Instructor Comments:[/b]",
    ...commentLines,
    "[color=transparent]spacer[/color]",
    `[b]Final Result[/b]: ${finalResult}`,
    "[color=transparent]spacer[/color]",
    "[hr][/hr]",
    `Marked by:${input.markerName.trim() ? ` ${input.markerName.trim()}` : ""}`,
    "[i]By signing these results, I confirm that I marked these answers truthfully and honestly. [/i]",
    signatureImage(input.markerSignature),
    input.markerRank.trim() || "Rank",
    "[color=transparent]spacer[/color]",
    "[/divbox]",
    "[lsemsfooter][/lsemsfooter]",
  ].join("\n");
}
