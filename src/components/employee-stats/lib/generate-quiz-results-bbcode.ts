import {
  QUIZ_IMAGES,
  QUIZ_MAX_POINTS,
  QUIZ_STUDENT_AREA_URL,
} from "@/app/constants/divisions/ftd/quiz";

export type QuizCorrection = { question: string; answers: string[]; note?: string };

/** One correction: the question as the outer item, its correct answers nested. */
function correctionBlocks(corrections: QuizCorrection[]): string {
  return corrections
    .map(({ question, answers, note }) => {
      const details = note?.trim() ? [note.trim()] : answers;
      return `[list][*]${question}\n[list][*]${details.join("\n[*]")}[/list]\n[/list]`;
    })
    .join("\n[color=transparent]spacer[/color]\n");
}

function failedQuestionBlocks(questions: QuizCorrection[]): string {
  const items = questions.map(({ question, note }) =>
    note?.trim()
      ? `[*]${question}\n[list]\n[*] ${note.trim()}\n[/list]`
      : `[*]${question}`,
  );
  return `[list]\n${items.join("\n")}\n[/list]`;
}

function markedQuizOr(markedQuiz: string): string {
  return markedQuiz.trim() || "PASTE QUIZ HERE";
}

const QUIZ_HEADER_PASSED = `[img]${QUIZ_IMAGES.passed}[/img]
[divbox=white]
[color=transparent]spacer[/color]`;

const QUIZ_FOOTER = `[b]Note:[/b][i] If you struggle to find a Junior Paramedic+ who is an FTO, please use the [b][url=${QUIZ_STUDENT_AREA_URL}][color=firebrick]Student Area (click!)[/url][/b][/color]. This allows you to find a trainer much easier![/i]
[color=transparent]spacer[/color]
[/divbox][lsemsfooter][/lsemsfooter]`;

const PASSED_HEADER = `[center][size=135][b]Congratulations, you have [color=green][b]PASSED[/b][/color] your Quiz![/b][/size][/center]`;
const FAILED_HEADER = `[center][size=135][b]Unfortunately, you have [color=red][b]FAILED[/b][/color] your Quiz.[/b][/size][/center]`;

const SIGNATURE = `[b]Best of luck with your Pre-Certification & Certification![/b]
*[i] Assuming you have completed all remaining Mandatory Ride Alongs[/i]`;

/** The "Quiz Results" email for a passed quiz with questions to correct. */
export function generatePassedQuizEmail(input: {
  regularScore: string;
  oocScore: string;
  corrections: QuizCorrection[];
  markedQuiz: string;
}): string {
  const correctionsText = input.corrections.length
    ? `While you did pass, please do ensure you read through the corrections below:\n\n${correctionBlocks(input.corrections)}\n[color=transparent]spacer[/color]\n\n`
    : "";
  return `${QUIZ_HEADER_PASSED}
${PASSED_HEADER}
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
You scored ${input.regularScore} out of ${QUIZ_MAX_POINTS.regular} points [ooc] ${input.oocScore} out of ${QUIZ_MAX_POINTS.ooc} [/ooc].

${correctionsText}
${SIGNATURE}
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[hr][/hr]
If you are interested, you can see your marked quiz below:
[spoil]
${markedQuizOr(input.markedQuiz)}
[/spoil]
[hr][/hr]
${QUIZ_FOOTER}`;
}

/** The "Quiz Results" email for a passed quiz with full marks - no corrections. */
export function generatePassedAllCorrectQuizEmail(input: {
  markedQuiz: string;
}): string {
  return `${QUIZ_HEADER_PASSED}
${PASSED_HEADER}
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
You scored ${QUIZ_MAX_POINTS.regular} out of ${QUIZ_MAX_POINTS.regular} points [ooc] ${QUIZ_MAX_POINTS.ooc} out of ${QUIZ_MAX_POINTS.ooc} [/ooc], full marks!
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
${SIGNATURE}
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[hr][/hr]
If you are interested, you can see your marked quiz below:
[spoil]
${markedQuizOr(input.markedQuiz)}
[/spoil]
[hr][/hr]
${QUIZ_FOOTER}`;
}

/**
 * The "Quiz Results" email for a failed quiz. Questions only, no answers: the
 * EMR's email reply to this is where the corrected answers come from.
 */
export function generateFailedQuizEmail(input: {
  regularScore: string;
  oocScore: string;
  questions: QuizCorrection[];
  markedQuiz: string;
}): string {
  return `[img]${QUIZ_IMAGES.failed}[/img]
[divbox=white]
[color=transparent]spacer[/color]
${FAILED_HEADER}
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
You scored ${input.regularScore} out of ${QUIZ_MAX_POINTS.regular} points [ooc] ${input.oocScore} out of ${QUIZ_MAX_POINTS.ooc} [/ooc].

Do not worry, all the answers can be found in the Department Manual! Once you've done that, correct your answers to these questions:

${failedQuestionBlocks(input.questions)}

[b]Please respond to this email with the correct answers.[/b]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[hr][/hr]
You can see your marked quiz below:
[spoil]
${markedQuizOr(input.markedQuiz)}
[/spoil]
[hr][/hr]
[/divbox][lsemsfooter][/lsemsfooter]`;
}

/** The post the EMR's profile gets once the quiz is passed. */
export function generateQuizProfilePost(): string {
  return `[lsemssubtitle]Quiz - PASSED[/lsemssubtitle]
[divbox=white]
[color=transparent]spacer[/color]
EMR has PASSED their Quiz and is cleared for their Pre-Certification & Certification
[color=transparent]spacer[/color]
[/divbox]`;
}
