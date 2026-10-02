import { renderIrregularityBody } from "./irregularity-body";
import type { ARIrregularityContext } from "./types";

/** The Pilot irregularity report an instructor files after a flight issue. */
export const arIrregularityTemplate = {
  value: "pilot-irregularity",
  label: "Pilot Irregularity",
  renderBody: (context: ARIrregularityContext): string =>
    renderIrregularityBody(context, "https://i.imgur.com/ylD2pwP.png"),
};
