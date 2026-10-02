import type { ARIrregularityContext } from "./types";

/**
 * Both irregularities are the same report with a different banner, so the body
 * lives in one place - a change to the wording is made once rather than in two
 * templates that would drift.
 */
export function renderIrregularityBody(
  { name, rank, date, time, information, nextStep }: ARIrregularityContext,
  image: string,
): string {
  return `[img]${image}[/img]

[divbox=white]
[b]Your name:[/b] ${name}
[b]Your rank:[/b] ${rank}
[b]Date:[/b] ${date}
[b]Time:[/b] ${time}
[b]Information:[/b] ${information}
[b]What was the student instructed to do next:[/b] ${nextStep}

[/divbox]
[lsemsfooter]`;
}
