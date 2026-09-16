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
    image: "https://i.ibb.co/TBg7mLgt/9gkzvd5.png",
    sections: ["tenFifteen", "detailedNotes", "nextTraining"],
  },
  reinstatementPhase2: {
    label: "Phase II",
    image: "https://i.ibb.co/3yWWfSG1/Wv5756l.png",
    sections: ["tenFifteen", "detailedNotes", "nextTraining"],
  },
  reinstatementCertPassed: {
    label: "Certification Passed",
    image: "https://i.ibb.co/svbRMF7n/36xcqas.png",
    sections: ["tenFifteen", "detailedNotes", "passedCertNotes"],
  },
  reinstatementCertFailed: {
    label: "Certification Failed",
    image: "https://i.ibb.co/SCxFDgv/mwt-GIRR.png",
    sections: ["tenFifteen", "detailedNotes", "failedCert", "nextTraining"],
  },
  reinstatementRideAlong: {
    label: "Ride-Along",
    image: "https://i.ibb.co/NgqYb6fM/f-V26BWG.png",
    sections: ["tenFifteen", "rideAlong", "detailedNotes", "nextTraining"],
  },
};
