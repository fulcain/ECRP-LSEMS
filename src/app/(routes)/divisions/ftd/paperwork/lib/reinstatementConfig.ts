export type ReinstatementPhaseKey =
  | "reinstatementPhase1"
  | "reinstatementPhase2"
  | "reinstatementCertPassed"
  | "reinstatementCertFailed"
  | "reinstatementRideAlong";

export const reinstatementConfig: Record<
  ReinstatementPhaseKey,
  { label: string; image: string | null; sections: string[] }
> = {
  reinstatementPhase1: {
    label: "Phase I",
    image: "https://i.ibb.co/JwWCQ0wm/9gkzvd5.png",
    sections: ["tenFifteen", "detailedNotes", "nextTraining"],
  },
  reinstatementPhase2: {
    label: "Phase II",
    image: "https://i.ibb.co/BV0RhbYY/Wv5756l.png",
    sections: ["tenFifteen", "detailedNotes", "nextTraining"],
  },
  reinstatementCertPassed: {
    label: "Certification Passed",
    image: "https://i.ibb.co/v0YqW3f/36xcqas.png",
    sections: ["tenFifteen", "detailedNotes", "passedCertNotes"],
  },
  reinstatementCertFailed: {
    label: "Certification Failed",
    image: "https://i.ibb.co/1fP6H9CF/mwt-GIRR.png",
    sections: ["tenFifteen", "detailedNotes", "failedCert", "nextTraining"],
  },
  reinstatementRideAlong: {
    label: "Ride-Along",
    image: "https://i.ibb.co/6cn4xtM9/f-V26BWG.png",
    sections: ["tenFifteen", "rideAlong", "detailedNotes", "nextTraining"],
  },
};
