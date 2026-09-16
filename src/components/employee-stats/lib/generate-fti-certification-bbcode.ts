const CERTIFICATION_TEMPLATE = `[img]https://i.ibb.co/bRYqMRDN/b-J9-At-RT.png[/img]
[divbox4=white]

[lsemssubtitle]Stage 1. Questions[/lsemssubtitle]

[b][i]Did the student FTO understand the meaning behind the three pillars of training clearly?
[/i][/b][list][i]{ANSWER_1}[/i][/list]

[b][i]Was the student FTO able to navigate to the 5 listed sections?
[/i][/b][list][i]{ANSWER_2}[/i][/list]

[b][i]Was the student FTO able to chew through everything in the Regulations Section of the FT Handbook?
[/i][/b][list][i]{ANSWER_3}[/i][/list]

[hr][/hr]

[lsemssubtitle]Stage 3. Questions[/lsemssubtitle]

[b][i]Did the student FTO successfully deliver the training phases in their certification?
[/i][/b][list][i]{ANSWER_4}[/i][/list]

[b][i]Are you confident that the student FTO will be able to train an EMR?
[/i][/b][list][i]{ANSWER_5}[/i][/list]

[/divbox4]

[divbox4=white]
[b][i]Sign please:[/i][/b]
I, [b]{CERTIFIED_BY}[/b], hereby certify [b]{STUDENT_RANK} {STUDENT_NAME}[/b] as a [b]Field Training Officer[/b].

[i]*Fill out the top post, and add your name, rank & date of training, please![/i]
[hr][/hr]

[img]{SIGNATURE}[/img]
[i]{CERTIFIER_NAME}[/i]
[b]{CERTIFIER_RANK}
Los Santos Emergency Medical Services[/b]
[/divbox4]`;

const DIVISIONAL_TEMPLATE = `[lsemsfooter][divbox4=white][center]

[fimg=150,150]https://i.ibb.co/HTQd3rsx/9f9h6N3.png[/fimg]

[size=125]{STUDENT_NAME} is now a Field Training Officer![/size]

[size=115]
[b]Date:[/b] {COMPLETION_DATE}
[b]Certified by:[/b] {CERTIFIED_BY}
[/size][/center][/divbox4]
[lsemsfooter]`;

export interface FtiCertificationValues {
  studentName: string;
  studentRank: string;
  certifierName: string;
  certifierRank: string;
  certifiedBy: string;
  signature: string;
  completionDate: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer5: string;
}

function substitute(template: string, values: FtiCertificationValues): string {
  return template.replace(
    /\{STUDENT_NAME\}|\{STUDENT_RANK\}|\{CERTIFIER_NAME\}|\{CERTIFIER_RANK\}|\{CERTIFIED_BY\}|\{SIGNATURE\}|\{COMPLETION_DATE\}|\{ANSWER_1\}|\{ANSWER_2\}|\{ANSWER_3\}|\{ANSWER_4\}|\{ANSWER_5\}/g,
    (token) => {
      switch (token) {
        case "{STUDENT_NAME}":
          return values.studentName;
        case "{STUDENT_RANK}":
          return values.studentRank;
        case "{CERTIFIER_NAME}":
          return values.certifierName;
        case "{CERTIFIER_RANK}":
          return values.certifierRank;
        case "{CERTIFIED_BY}":
          return values.certifiedBy;
        case "{SIGNATURE}":
          return values.signature;
        case "{COMPLETION_DATE}":
          return values.completionDate;
        case "{ANSWER_1}":
          return values.answer1;
        case "{ANSWER_2}":
          return values.answer2;
        case "{ANSWER_3}":
          return values.answer3;
        case "{ANSWER_4}":
          return values.answer4;
        case "{ANSWER_5}":
          return values.answer5;
        default:
          return token;
      }
    },
  );
}

/** Generates the FTO Certification Paperwork BBCode for posting in the FTO's student profile. */
export function generateCertificationPaperwork(values: FtiCertificationValues): string {
  return substitute(CERTIFICATION_TEMPLATE, values);
}

/** Generates the Divisional File BBCode - auto-filled from the same values, no extra input needed. */
export function generateDivisionalFile(values: FtiCertificationValues): string {
  return substitute(DIVISIONAL_TEMPLATE, values);
}

const TRAINER_INFO_TEMPLATE = `[b]Certified by:[/b] {CERTIFIED_BY}
[b]Date of completion:[/b] {COMPLETION_DATE}`;

/** Generates just the trainer info block with certified by and date of completion. */
export function generateTrainerInfoBBCode(values: { certifiedBy: string; completionDate: string }): string {
  return TRAINER_INFO_TEMPLATE.replace(
    /\{CERTIFIED_BY\}|\{COMPLETION_DATE\}/g,
    (token) => {
      switch (token) {
        case "{CERTIFIED_BY}":
          return values.certifiedBy;
        case "{COMPLETION_DATE}":
          return values.completionDate;
        default:
          return token;
      }
    },
  );
}