import { renderIrregularityBody } from "./irregularity-body";
import type { ARIrregularityContext } from "./types";

/**
 * The Mountain Rescue irregularity report, filed after a trek or off-road
 * issue - the same report as the pilot one with the Rescue banner.
 */
export const mrIrregularityTemplate = {
  value: "mr-irregularity",
  label: "Mountain Rescue Irregularity",
  renderBody: (context: ARIrregularityContext): string =>
    renderIrregularityBody(context, "https://i.ibb.co/xqPQKv7G/image.png"),
};
