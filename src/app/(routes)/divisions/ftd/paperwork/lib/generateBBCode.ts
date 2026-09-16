/** Pure BBCode assembler for normal field-training paperwork. */
export function generateBBCode(
  values: Record<string, any>,
  phase: string,
  sections: string[],
  image?: string,
) {
  const yesNo = (val: boolean) => (val ? "YES" : "NO");
  const cbCodeFts = values.ftsCompleted ? "[cbc]" : "[cb]";
  const cbCodeIntroEmail = values.introEmailSent ? "[cbc]" : "[cb]";
  const passedPreCert = values.passedPreCert ? "YES" : "NO";
  const quizSent = values.wasQuizSent ? "YES" : "NO";
  const medicalGiven = values.wasMedicalGiven ? "YES" : "NO";
  const detailedNotesListType = values.detailedNotesListNone ? "none" : "";
  const fTSessionLink = "https://forms.gle/BJ6iLg5Fkf9Ug6fE6";

  const tenFifteenSection = `[list]
${
  values.participated && values.tenFifteenCalls?.length
    ? values.tenFifteenCalls
        .map(
          (call: any, index: number) =>
            `[*]Call ${index + 1}: ${call.rating || "N/A"} - ${call.performanceNotes || "N/A"}`,
        )
        .join("\n")
    : "[*]N/A"
}
[/list]`;

  const rideAlongSection = `[b]Ride-along Type:[/b] ${values.rideAlongType || ""}`;
  const detailedNotesSection = `[b]${phase === "certPassed" || phase === "certFailed" ? "Certification Notes" : "Detailed Notes About Time Spent (Optional but strongly encouraged)"}:[/b]
[list${detailedNotesListType ? `=${detailedNotesListType}` : ""}]
${values.detailedNotes}
[/list]`;

  const issuesSection =
    sections.includes("issues") && values.issues
      ? `[b]Issues:[/b]
[list=none]
${values.issues}
[/list]`
      : "";

  const reasonFailureSection = sections.includes("failedCert")
    ? `[b]Reason for Failure:[/b]
[list=none]
${values.reasonFailure}
[/list]`
    : "";

  const notesNextTrainingSection =
    sections.includes("nextTraining") && phase !== "certFailed"
      ? `[lsemssubtitle]NOTES FOR NEXT TRAINING SESSION[/lsemssubtitle]
[divbox=white]
[b]Additional Mandatories given:[/b] ${values.additionalMandatories || "0"}
[color=transparent]spacer[/color]
[b]Subjects to focus on during next training session:[/b]
[list=none]
${values.notesNextTraining || ""}
[/list]
[/divbox]`
      : "";

  const notesForPreCert = sections.includes("preCertNotes")
    ? `[lsemssubtitle]NOTES FOR CERTIFICATION[/lsemssubtitle]
[divbox=white]
[color=transparent]spacer[/color]
[b]What should be observed during next session:[/b][list=none]
${values.notesNextTraining}

[/list]
[b]Has the EMR passed the Pre-Certification and is the EMR ready to work alone?[/b][list=none]
${passedPreCert}

[b]If the EMR failed the Pre-Certification, was the EMR sent the quiz?[/b] (Ignore if not relevant)
${quizSent}
[/list]
[/divbox]`
    : "";

  const notesForPassedCert = sections.includes("passedCertNotes")
    ? `[b][lsemssubtitle]PASSED CERTIFICATION NOTES:[/lsemssubtitle][/b]
[divbox=white]
[b] Call sign given: [/b] ECHO-${values.callsign}

[b] Medical license given? [/b] ${medicalGiven}

[/divbox]`
    : "";

  const notesForFailedCert = sections.includes("failedCert")
    ? `[b][lsemssubtitle]CERTIFICATION FAILED NOTES:[/lsemssubtitle][/b]
[divbox=white]
${reasonFailureSection}

[b]Mandatory Ride-Alongs Assigned (DEFAULT 2 + FREE TO ADD MORE): [/b] ${values.additionalMandatories}

[b]Subjects to focus on during next training session: [/b][list=none]
${values.notesNextTraining}

[/list]
[/divbox]`
    : "";

  const signatureSection = `[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
[img]${values.signature || ""}[/img]
${values.rank || ""}
[/divbox]`;

  if (phase === "introduction") {
    return `[img]https://i.ibb.co/BHKjgFH0/9fb-JGt0.png[/img]
[lsemssubtitle]SESSION DETAILS:[/lsemssubtitle]
[divbox=white]
[list]
[*][b]Time Started:[/b] ${values.timeStarted || ""}
[*][b]Time Ended:[/b] ${values.timeEnded || ""}
[*][b]If there were any issues, describe them below:[/b]
${values.issues || "X"}
[*][b]Click [url=${fTSessionLink}]here[/url] to submit your Field Training Session Report.[/b] ${cbCodeFts} [i](Please add a 'cbc' in the box if completed.)[/i]
[*][b]Checked if the EMR was sent the Introduction Email?[/b] ${cbCodeIntroEmail} [i](Please add a 'cbc' in the box if completed.)[/i]
[/list]
[/divbox]
${signatureSection}
[lsemsfooter][/lsemsfooter]`;
  }

  // filter(Boolean) keeps skipped sections from leaving double blank lines.
  const sessionDetailsParts = [
    values.rideAlongType ? rideAlongSection : "",
    `[b]Time Started:[/b] ${values.timeStarted || ""}`,
    `[b]Time Ended:[/b] ${values.timeEnded || ""}`,
    `[b]Did the EMR participate in a 10-15 call?[/b] ${yesNo(values.participated)}
[i]If Yes, rate their performance (1-5). Explain any issues if performance was poor:[/i]`,
    tenFifteenSection,
    `[color=transparent]spacer[/color]`,
    detailedNotesSection,
    issuesSection,
  ].filter(Boolean);

  const postSessionSections = [
    notesForPreCert,
    notesForPassedCert,
    notesForFailedCert,
    notesNextTrainingSection,
  ].filter(Boolean);

  return `${image ? `[img]${image}[/img]\n` : ""}[lsemssubtitle]SESSION DETAILS:[/lsemssubtitle]
[divbox=white]

${sessionDetailsParts.join("\n\n")}
[/divbox]
${postSessionSections.join("\n")}
[lsemssubtitle]Field Training Session Report[/lsemssubtitle]
[divbox=white]
[b]Click [url=${fTSessionLink}]here[/url] to submit your Field Training Session Report.[/b] ${cbCodeFts} [i](Please add a 'cbc' in the box if completed.)[/i]
[/divbox]
${signatureSection}
[lsemsfooter][/lsemsfooter]`;
}
