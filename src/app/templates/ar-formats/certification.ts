import type { ARCertificationContext } from "./types";

const SPACER = "[color=transparent]spacer[/color]";

/**
 * The Medevac Pilot certification paperwork, exactly as it goes on GOV. Every
 * `ANSWER` the profile carries is a field in the builder, and the signature
 * block comes off the Staff Page - the format never asks for it twice.
 */
export const arCertificationTemplate = {
  value: "certification",
  label: "Certification",
  renderBody: ({
    answers,
    instructorName,
    instructorRank,
    instructorSignature,
  }: ARCertificationContext): string => {
    const signatureImg = instructorSignature
      ? `[img]${instructorSignature}[/img]`
      : "[i]Add your saved signature in Staff Page[/i]";
    const nameLine = instructorName || "[i]FNAME LNAME[/i]";
    const rankLine = instructorRank || "FULL RANK";

    return `[img]https://i.ibb.co/7d6CHcYG/ij789o-I.png[/img]
${SPACER}
[lsemssubtitle][b][size=120]Section 1: Theory Portion[/size][/b][/lsemssubtitle][divbox=white]
[b]Were all of the radio calls covered?[/b]
${answers.radioCalls}

[b]Did the student understand how to conduct a helipad inspection?[/b]
${answers.helipadInspection}

[b]Did the student understand how to land a medevac properly?[/b]
${answers.medevacLanding}

[b]Did the student have any questions? If so, what were they about?[/b]
${answers.questions}

[b]How would you rate the student's knowledge of Radio Protocols 1-5?[/b]
${answers.radioProtocolRating}

[b]How would you rate the student's understanding of Helicopter Safety? 1-5[/b]
${answers.helicopterSafetyRating}

[/divbox]
[lsemssubtitle][b][size=120]Section 2: Airfield Practice[/size][/b][/lsemssubtitle]
[divbox=white]
[b]How would you rate the student's performance during practice? 1-5[/b]
${answers.practicePerformance}

[b]What are the student's piloting strengths and weaknesses during the practical training?[/b]
${answers.strengthsWeaknesses}

[b]Did the student collide with anything at any point during the practical training? [/b]
${answers.collisions}

[b]Did the student understand how to perform a basket rescue, as well as when to do it? [/b]
${answers.basketRescue}

[/divbox]
[lsemssubtitle][b][size=120]Section 3: Agility Course[/size][/b][/lsemssubtitle]
[divbox=white]
[b]Did the student fly safely throughout the course?[/b]
${answers.courseFlightSafety}

[b]Did the student misidentify any of the landings, if so, did they correct on their own?[/b]
${answers.landings}

[b]Did the student collide with anything at any point during the course? [/b]
${answers.courseCollisions}

[b]Handling (RATING) 1-5:[/b] 
${answers.handling}

[b]Confidence (RATING) 1-5:[/b] 
${answers.confidence}

[b]How long did the course take (from liftoff to landing & engine off):[/b] 
${answers.courseTime}

[/divbox]

[lsemssubtitle][b][size=120]Section 4: Time Trial[/size][/b][/lsemssubtitle]
[divbox=white]
[b]Time:[/b] ${answers.trialTime}

[b]Comments (optional):[/b] ${answers.trialComments}
[/divbox]
[lsemssubtitle][size=120][b]Conclusion[/size][/b][/lsemssubtitle]
[divbox=white]
[b]Final thoughts:[/b]
${answers.finalThoughts}

[b]Status:[/b] ${answers.status}

${signatureImg}
${nameLine}
${rankLine}
[/divbox]
[lsemsfooter][/lsemsfooter]`;
  },
};
