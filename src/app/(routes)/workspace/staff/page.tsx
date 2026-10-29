"use client";

import { StaffSettingsCard } from "@/app/components/staff/StaffSettingsCard";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";

export default function StaffPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Staff Page"
        subtitle="Your personnel record, signature and division ranks in one place."
      />
      <StaffSettingsCard />
    </PageContainer>
  );
}
