"use client";

import { StaffSettingsCard } from "@/app/components/staff/StaffSettingsCard";
import { BodyAndMainTitle } from "@/components/layout/main-and-title";

export default function StaffPage() {
  return (
    <BodyAndMainTitle
      title="Staff Page"
      description="Manage your saved staff settings for signatures, ranks, and other shared tools."
    >
      <StaffSettingsCard />
    </BodyAndMainTitle>
  );
}
