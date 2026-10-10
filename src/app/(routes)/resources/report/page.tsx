import type { Metadata } from "next";

import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ReportForm } from "./ReportForm";

export const metadata: Metadata = {
  title: "Report Form",
  description: "Send a bug report or a feature request to the developer",
};

export default function ReportPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="LSEMS Resources"
        title="Report Form"
        subtitle="Found a bug, or have an idea for something new? Send it to the developer to fix or build - attach image links if they help."
      />
      <ReportForm />
    </PageContainer>
  );
}
