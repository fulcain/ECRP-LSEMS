export type PhaseKey =
  | "introduction"
  | "phase1"
  | "phase2"
  | "phase3"
  | "preCert"
  | "certPassed"
  | "certFailed"
  | "rideAlong";

export const paperworkConfig: Record<
  PhaseKey,
  { label: string; image: string | null; sections: string[] }
> = {
  introduction: {
    label: "Introduction",
    image: "https://i.ibb.co/BHKjgFH0/9fb-JGt0.png",
    sections: ["issues"],
  },
  phase1: {
    label: "Phase 1",
    image: "https://i.ibb.co/4RtWTcm4/15q-Kt-Ob.png",
    sections: ["tenFifteen", "detailedNotes", "nextTraining"],
  },
  phase2: {
    label: "Phase 2",
    image: "https://i.ibb.co/jBH9zQT/WNwx-LGs.png",
    sections: ["tenFifteen", "detailedNotes", "nextTraining"],
  },
  phase3: {
    label: "Phase 3",
    image: "https://i.ibb.co/gMZCXCWY/Jj-D9Y74.png",
    sections: ["tenFifteen", "detailedNotes", "nextTraining"],
  },
  preCert: {
    label: "Pre-Certification",
    image: "https://i.ibb.co/xKXfycrx/p33kyzm.png",
    sections: ["tenFifteen", "detailedNotes", "preCertNotes"],
  },
  certPassed: {
    label: "Certification Passed",
    image: "https://i.ibb.co/hJXDYZH1/hu-DCb-JP.png",
    sections: ["tenFifteen", "detailedNotes", "passedCertNotes"],
  },
  certFailed: {
    label: "Certification Failed",
    image: "https://i.ibb.co/hJXDYZH1/hu-DCb-JP.png",
    sections: ["tenFifteen", "detailedNotes", "failedCert", "nextTraining"],
  },
  rideAlong: {
    label: "Ride Along",
    image: "https://i.ibb.co/NgqYb6fM/f-V26BWG.png",
    sections: ["tenFifteen", "rideAlong", "detailedNotes", "nextTraining"],
  },
};
