export type ARCertificationContext = {
  /** The member being certified. */
  studentName: string;
  /** The instructor's answers, section by section, in the format's own order. */
  answers: {
    radioCalls: string;
    helipadInspection: string;
    medevacLanding: string;
    questions: string;
    radioProtocolRating: string;
    helicopterSafetyRating: string;
    practicePerformance: string;
    strengthsWeaknesses: string;
    collisions: string;
    basketRescue: string;
    courseFlightSafety: string;
    landings: string;
    courseCollisions: string;
    handling: string;
    confidence: string;
    courseTime: string;
    trialTime: string;
    trialComments: string;
    finalThoughts: string;
    status: string;
  };
  /** Who ran the certification - from the Staff Page, like every signature. */
  instructorName?: string;
  instructorRank?: string;
  instructorSignature?: string;
};

export type ARCertificateContext = {
  /** The member being certified as a Medevac Pilot. */
  studentName: string;
  /** The day the certification was passed, as it is written on GOV. */
  completionDate: string;
  /** "Rank Fname Lname" - the member who ran the certification. */
  certifiedBy: string;
};
