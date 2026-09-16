/**
 * Paste-friendly, first-person narration of the Ride-Along notes.
 * Backticked spans render as click-to-copy command chips in Script mode;
 * "## " paragraphs render as section headings. Copying strips both.
 */
export const RIDE_ALONG_SPOKEN = [
  "Ride-along - minimum 1 hour, and no time cap if it's optional.",

  "|| Quick checklist while you ride. ||",

  "|| Request Call Priority on the MD frequency - or have the trainee do it. ||",

  "|| Let the EMR try radio codes, unit management, and call handling before you step in. This is their play time ||",

  "||Note any mistakes as you go, and give feedback live or after the ride-along so they can correct it next session. ||",

  "|| Honesty wins. Generic praise only hurts the trainee - call out what didn't work, and assign additional mandatories when needed. ||",

  "|| It depends on the phase they're in and whether it's mandatory or optional - treat optional sessions the same as mandatory ones. If they're struggling with something, be honest about it and assign additional mandatory sessions as needed. ||",
].join("\n\n");
