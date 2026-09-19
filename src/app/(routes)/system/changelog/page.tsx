import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ChangeLogTimeline } from "./components/ChangeLogTimeline";
import { unifiedChangeLog } from "./lib/unify";

export default function ChangeLogPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="LSEMS System"
        title="Change Log"
        subtitle="A unified history of updates, features and changes across the LSEMS application."
      />
      <ChangeLogTimeline log={unifiedChangeLog} />
    </PageContainer>
  );
}
