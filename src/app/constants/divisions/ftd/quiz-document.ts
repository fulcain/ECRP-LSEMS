/**
 * The GOV quiz form is the source for the copy attached to results emails.
 * Read its question text and options here so wording changes flow through to
 * marking, answer extraction, and the marked quiz the EMR receives.
 */

import { QUIZ_EMAIL_CONTENT } from "@/app/(routes)/divisions/ftd/paperwork/lib/phase-notes/normal/quiz-email-content";

const blankImage = QUIZ_EMAIL_CONTENT.match(/^\[img\](.+?)\[\/img\]/)?.[1];
if (!blankImage) throw new Error("Quiz form is missing its banner image.");
export const QUIZ_BLANK_IMAGE = blankImage;

export type QuizDocumentMcQuestion = {
  id: number;
  ooc: boolean;
  prompt: string;
  options: string[];
};

export type QuizDocumentLongQuestion = {
  id: number;
  ooc: boolean;
  prompt: string;
  points: number;
  answerPrefix: string;
  answerSuffix: string;
};

function questionBlock(id: number): string {
  const marker = `[color=transparent]${id}[/color]`;
  const start = QUIZ_EMAIL_CONTENT.indexOf(marker);
  if (start < 0) throw new Error(`Quiz form is missing question ${id}.`);

  const nextMarker = QUIZ_EMAIL_CONTENT.indexOf(
    `[color=transparent]${id + 1}[/color]`,
    start + marker.length,
  );
  return QUIZ_EMAIL_CONTENT.slice(start + marker.length, nextMarker < 0 ? undefined : nextMarker);
}

function parseMcQuestion(id: number): QuizDocumentMcQuestion {
  const block = questionBlock(id);
  const promptMatch = block.match(/\[\*\]\[b\]([\s\S]*?)\[\/b\]\[list=a\]/);
  if (!promptMatch) throw new Error(`Quiz form question ${id} has no multiple-choice prompt.`);

  const optionLines = [...block.matchAll(/^\[\*\]\[\][ \t]*(.+?)[ \t]*$/gm)];
  if (optionLines.length !== 4) {
    throw new Error(`Quiz form question ${id} must have four answer options.`);
  }

  return {
    id,
    ooc: promptMatch[1].includes("[ooc]"),
    prompt: promptMatch[1],
    options: optionLines.map((match) => match[1].trim()),
  };
}

function parseLongQuestion(id: number): QuizDocumentLongQuestion {
  const block = questionBlock(id);
  const questionMatch = block.match(
    /\[\*\]\[b\]([\s\S]*?)\[\/b\]\s*\((\d+)\)\[list=none\]([\s\S]*?)\[\/list\]/,
  );
  if (!questionMatch) throw new Error(`Quiz form question ${id} has no written-answer prompt.`);

  const placeholderAt = questionMatch[3].indexOf("INPUT ANSWER");
  if (placeholderAt < 0) throw new Error(`Quiz form question ${id} has no answer placeholder.`);

  const answerPrefix = questionMatch[3].slice(0, placeholderAt);
  const answerSuffix = questionMatch[3].slice(placeholderAt + "INPUT ANSWER".length);
  return {
    id,
    ooc: questionMatch[1].includes("[ooc]"),
    prompt: questionMatch[1],
    points: Number(questionMatch[2]),
    answerPrefix,
    answerSuffix,
  };
}

export const QUIZ_DOCUMENT_MC: readonly QuizDocumentMcQuestion[] = Array.from(
  { length: 9 },
  (_, index) => parseMcQuestion(index + 1),
);

export const QUIZ_DOCUMENT_LONG: readonly QuizDocumentLongQuestion[] = Array.from(
  { length: 5 },
  (_, index) => parseLongQuestion(index + 10),
);

function resultMaximum(label: string): number {
  const line = QUIZ_EMAIL_CONTENT.split(/\r?\n/).find((entry) =>
    entry.includes(`${label}:`),
  );
  const maximum = line
    ?.replace(/\[[^\]]*\]/g, "")
    .match(/\bout of\s+(\d+)/i)?.[1];
  if (!maximum) throw new Error(`Quiz form Results section is missing ${label}.`);
  return Number(maximum);
}

/** The Results section's "out of" figures, as the form prints them. */
export const QUIZ_RESULTS_MAX = {
  mc: resultMaximum("Multiple Choice Score"),
  longer: resultMaximum("Longer Questions Score"),
  ooc: resultMaximum("OOC Score"),
  total: resultMaximum("Total Score"),
} as const;
