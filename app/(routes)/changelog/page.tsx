import { BodyAndMainTitle } from "@/components/layout/main-and-title";
import {
  changeLog,
  type ChangeItem,
  type ChangeType,
} from "@/app/constants/changelog";
import { CalendarDays, Sparkles, Zap } from "lucide-react";

const CATEGORY_META: Record<
  ChangeType,
  { label: string; chip: string; icon: React.ReactNode }
> = {
  feature: {
    label: "Feature",
    chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    icon: <Sparkles className="h-3 w-3" />,
  },
  change: {
    label: "Change",
    chip: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    icon: <Zap className="h-3 w-3" />,
  },
};

function ChangeItemRow({ item }: { item: ChangeItem }) {
  const meta = CATEGORY_META[item.type] ?? CATEGORY_META.change;
  return (
    <li className="group flex items-start gap-3">
      <span
        className={`mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-transform duration-200 group-hover:scale-105 ${meta.chip}`}
      >
        {meta.icon}
        {meta.label}
      </span>
      <p className="text-sm leading-relaxed text-slate-300 transition-colors duration-200 group-hover:text-white">
        {item.description}
      </p>
    </li>
  );
}

export default function ChangeLogPage() {
  return (
    <BodyAndMainTitle
      title="Change Log"
      description="A history of updates, features, and changes across the LSEMS tools"
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl shadow-blue-950/30">
        {/* Ambient glow + grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.10),_transparent_34%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsla(0,0%,100%,0.1) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative p-5 lg:p-8">
          {/* Timeline */}
          <ol className="relative space-y-8 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-gradient-to-b before:from-blue-500/50 before:via-purple-500/30 before:to-transparent">
            {changeLog.map((entry, index) => (
              <li
                key={`${entry.date}-${index}`}
                className="relative pl-12 animate-fade-in-up"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                {/* Timeline node */}
                <span className="absolute left-[7px] top-6 flex h-4 w-4 items-center justify-center">
                  <span className="relative h-3 w-3 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 ring-2 ring-slate-950" />
                </span>

                {/* Day card */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 transition-colors duration-200 hover:border-white/20 hover:bg-slate-900/95">
                  <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {entry.date}
                  </p>

                  {entry.title && (
                    <h2 className="mb-3 text-base font-semibold text-white">
                      {entry.title}
                    </h2>
                  )}

                  <ul className="space-y-2.5">
                    {entry.changes.map((item, i) => (
                      <ChangeItemRow key={i} item={item} />
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </BodyAndMainTitle>
  );
}
