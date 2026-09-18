import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { changeLog as lsemsChangeLog, type ChangeItem, type ChangeType } from "@/app/constants/changelog";
import { changeLog as ftdChangeLog } from "@/app/constants/ftd-changelog";
import { CalendarDays, Sparkles, Zap } from "lucide-react";

type UnifiedChange = { date: string; title?: string; changes: ChangeItem[] };

const CATEGORY_META: Record<ChangeType, { label: string; chip: string; icon: React.ReactNode }> = {
  feature: { label: "Feature", chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300", icon: <Sparkles className="h-3 w-3" /> },
  change: { label: "Change", chip: "border-blue-500/30 bg-blue-500/10 text-blue-300", icon: <Zap className="h-3 w-3" /> },
};

const formerFtdChanges: UnifiedChange[] = ftdChangeLog.map((day) => ({
  date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  changes: day.entries.map((entry) => ({ type: entry.type === "added" ? "feature" : "change", description: entry.description })),
}));

const unifiedChangeLog = [...lsemsChangeLog, ...formerFtdChanges].sort((a, b) => {
  const aDate = Date.parse(a.date);
  const bDate = Date.parse(b.date);
  return (Number.isNaN(bDate) ? 0 : bDate) - (Number.isNaN(aDate) ? 0 : aDate);
});

function ChangeItemRow({ item }: { item: ChangeItem }) {
  const meta = CATEGORY_META[item.type] ?? CATEGORY_META.change;
  return <li className="group flex min-w-0 items-start gap-3"><span className={`mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-transform duration-200 group-hover:scale-105 ${meta.chip}`}>{meta.icon}{meta.label}</span><p className="min-w-0 text-sm leading-relaxed text-slate-300 transition-colors duration-200 group-hover:text-white">{item.description}</p></li>;
}

export default function ChangeLogPage() {
  return <PageContainer>
    <PageHeader title="Change Log" subtitle="A unified history of updates, features, and changes across the LSEMS application." />
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl shadow-blue-950/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.10),_transparent_34%)]" />
      <div className="relative p-4 sm:p-5 lg:p-8">
        {unifiedChangeLog.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">No entries yet - check back soon.</p> : <ol className="relative space-y-8 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-gradient-to-b before:from-blue-500/50 before:via-purple-500/30 before:to-transparent">
          {unifiedChangeLog.map((entry, index) => <li key={`${entry.date}-${index}`} className="relative pl-10 sm:pl-12"><span className="absolute left-[7px] top-6 flex h-4 w-4 items-center justify-center"><span className="relative h-3 w-3 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 ring-2 ring-slate-950" /></span><div className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/90 p-4 transition-colors duration-200 hover:border-white/20 sm:p-5"><p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400"><CalendarDays className="h-3.5 w-3.5" />{entry.date}</p>{entry.title && <h2 className="mb-3 text-base font-semibold text-white">{entry.title}</h2>}<ul className="space-y-2.5">{entry.changes.map((item, itemIndex) => <ChangeItemRow key={itemIndex} item={item} />)}</ul></div></li>)}
        </ol>}
      </div>
    </div>
  </PageContainer>;
}
