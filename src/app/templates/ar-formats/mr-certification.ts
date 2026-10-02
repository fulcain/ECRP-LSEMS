import type { MRCertificationContext } from "./types";

/**
 * The Mountain Rescue certification paperwork, exactly as it goes on GOV. Every
 * `ANSWER` the profile carries is a field in the builder, and the signature
 * block comes off the Staff Page - the format never asks for it twice.
 */
export const mrCertificationTemplate = {
  value: "mr-certification",
  label: "Mountain Rescue Certification",
  renderBody: ({
    completionDate,
    answers,
    instructorName,
    instructorRank,
    instructorSignature,
  }: MRCertificationContext): string => {
    const signatureImg = instructorSignature
      ? `[img]${instructorSignature}[/img]`
      : "[i]Add your saved signature in Staff Page[/i]";
    const nameLine = instructorName || "[i]FNAME LNAME[/i]";
    const rankLine = instructorRank || "FULL RANK";

    return `[img]https://i.ibb.co/LD23BDj6/image.png[/img]

[divbox=white]
[b]Instructor In-Charge:[/b] ${nameLine}
[b]Instructor’s Rank:[/b] ${rankLine}
[b]Date:[/b] ${completionDate}
[/divbox]

[lsemssubtitle]MOUNTAINOUS OPERATION THEORY[/lsemssubtitle]
[divbox=white]

[b]Did the student understand how to accurately drive the Kamacho?[/b]
${answers.kamachoDriving}

[b]Does the student clearly understand the policies for driving the Kamacho?[/b]
${answers.kamachoPolicies}

[b]Was the student briefed on what their callsign will be when driving the Kamacho?[/b]
${answers.callsignBriefing}

[b]What would you rate their understanding of how to properly secure themselves to either their vehicle or sturdy obstacle? 1-5[/b]
${answers.securingRating}

[/divbox]

[lsemssubtitle]MOUNTAIN PRACTICE[/lsemssubtitle]
[divbox=white]

[b]Did the student struggle with any of the hills to trek up or down? If so, which one?[/b]
${answers.hillsStruggle}

[b]When driving on paved and noticeable roads, did the student follow city speed laws?[/b]
${answers.citySpeedLaws}

[b]How would you rate the student's performance during practice? 1-5[/b]
${answers.practiceRating}

[/divbox]

[lsemssubtitle]TRAVERSING NARROW MOUNTAINOUS ROADS[/lsemssubtitle]
[divbox=white]

[b]Did the student struggle navigating through the offroad paths?[/b]
${answers.offroadStruggle}

[b]Did the student drive reasonably considering the road situation?[/b]
${answers.roadSituation}

[b]Handling (RATING) 1-5:[/b]
${answers.roadsHandling}

[/divbox]

[lsemssubtitle]TREKKING UP MOUNT CHILLIAD[/lsemssubtitle]
[divbox=white]

[b]Was the student able to safely trek all the way up Mount Chilliad?[/b]
${answers.summitTrek}

[b]How long did it take for the student to reach the top?[/b]
${answers.summitTime}

[b]How many times, if any, did they stall the Kamacho?[/b]
${answers.summitStalls}

[b]Handling (RATING) 1-5:[/b]
${answers.summitHandling}

[b]Speed (RATING) 1-5:[/b]
${answers.summitSpeed}

[b]Confidence (RATING) 1-5:[/b]
${answers.summitConfidence}

[/divbox]

[lsemssubtitle]OFF-ROADING DOWN MOUNT CHILLIAD[/lsemssubtitle]
[divbox=white]

[b]Was the student able to safely trek down Mount Chilliad towards Paleto / Paleto MD?[/b]
${answers.descentTrek}

[b]How many times, if any, did they stall the Kamacho?[/b]
${answers.descentStalls}

[b]Handling (RATING) 1-5:[/b]
${answers.descentHandling}

[b]Confidence (RATING) 1-5:[/b]
${answers.descentConfidence}

[/divbox]

[lsemssubtitle]FINALIZATION & SIGNATURE[/lsemssubtitle]
[divbox=white]
[b]Final Comments:[/b] ${answers.finalComments}

[b]Result:[/b] ${answers.result}

${signatureImg}
${nameLine}
${rankLine}
[/divbox]

[lsemsfooter][/lsemsfooter]`;
  },
};
