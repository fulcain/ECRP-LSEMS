export type CivilianRideAlongPhaseKey =
  | "accepted"
  | "expired"
  | "denied"
  | "onHold"
  | "rideAlongReport";

export const civilianRideAlongConfig: Record<
  CivilianRideAlongPhaseKey,
  { label: string; sections: string[] }
> = {
  accepted: {
    label: "Accepted",
    sections: ["applicantName"],
  },
  expired: {
    label: "Expired",
    sections: ["applicantName"],
  },
  denied: {
    label: "Denied",
    sections: ["applicantName", "rejectionReasons"],
  },
  onHold: {
    label: "On Hold",
    sections: ["applicantName"],
  },
  rideAlongReport: {
    label: "Ride-Along Report",
    sections: ["applicantName", "notes"],
  },
};
