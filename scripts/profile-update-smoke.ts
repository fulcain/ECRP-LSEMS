import { FTP_DOCUMENTS } from "../src/app/constants/divisions/ftd/ftp-content";
import { updatePastedProfile } from "../src/lib/ftp-profile-update";

// A "member's profile": the FTP template with the blanks filled the way the
// forum has it - a real name, real dates, signed sessions, some ticks done.
const memberProfile = FTP_DOCUMENTS.regular
  .replace(/\{\{applicantName\}\}/g, "John Doe")
  .replace(/\{\{dateHired\}\}/g, "12/Aug/2026")
  .replace(/\[img\]SIGNATURE\[\/img\]/g, "[img]https://i.ibb.co/example/sig.png[/img]")
  .replace(/\[i\]Fname Lname\[\/i\]/g, "[i]Jane Smith[/i]")
  .replace(/\nRank\n/g, "\nParamedic\n")
  .replace("[cb]Introduction", "[cbc]Introduction")
  .replace("[cb]Phase 1", "[cbc]Phase 1");

const result = updatePastedProfile("regular", memberProfile);
if (!result.ok) {
  console.error("FAIL:", result.reason);
  process.exit(1);
}

const checks: [string, boolean][] = [
  ["header kept verbatim", result.output.includes("[b]Student Name:[/b] John Doe")],
  ["date kept", result.output.includes("[b]Date Hired:[/b] 12/Aug/2026")],
  ["header ticks carried", result.output.includes("[cbc]Introduction")],
  ["student name filled", result.output.includes("John Doe has been promoted to EMT-Basic!")],
  ["trainer signature carried", result.output.includes("[i]Jane Smith[/i]")],
  ["trainer signature image carried", result.output.includes("[img]https://i.ibb.co/example/sig.png[/img]")],
  ["trainer rank carried", result.output.includes("\nParamedic\n")],
  ["no template placeholders left", !result.output.includes("{{applicantName}}") && !result.output.includes("[img]SIGNATURE[/img]")],
  ["nothing unexpected unfilled", result.unfilled.join(",") === "DD/MMM/2023"],
  ["all sections replaced", result.replaced.length === 8],
  ["nothing added", result.added.length === 0],
  ["signatures carried on every session section", result.signaturesCarried.length === 7],
];

let failed = 0;
for (const [name, ok] of checks) {
  if (!ok) {
    failed += 1;
    console.error("FAIL:", name);
  }
}
if (failed > 0) {
  console.error(`${failed} of ${checks.length} failed`);
  process.exit(1);
}
console.log(`${checks.length}/${checks.length} smoke checks passed`);

// A paste with nothing above the first heading still builds, with a warning.
const headerless = updatePastedProfile(
  "regular",
  memberProfile.slice(memberProfile.indexOf("[spoiler=Introduction]")),
);
if (!headerless.ok || !headerless.output.includes("[spoiler=Introduction]")) {
  console.error("FAIL: headerless paste did not build");
  process.exit(1);
}
if (headerless.warnings.length === 0) {
  console.error("FAIL: headerless paste gave no warning");
  process.exit(1);
}
console.log("headerless paste handled with a warning");

// Reinstatement round-trips the same way.
const reinstate = updatePastedProfile(
  "reinstatement",
  FTP_DOCUMENTS.reinstatement.replace(/\{\{applicantName\}\}/g, "John Doe"),
);
if (
  !reinstate.ok ||
  !reinstate.output.includes("[b]Reinstatee Name:[/b] John Doe") ||
  !reinstate.output.includes("[spoiler=REINSTATEMENT - Phase I]")
) {
  console.error("FAIL: reinstatement merge");
  process.exit(1);
}
console.log("reinstatement merged");
