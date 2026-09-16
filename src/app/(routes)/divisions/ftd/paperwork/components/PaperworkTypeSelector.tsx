"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FileText, RefreshCcw, UserRound } from "lucide-react";

import {
  FormType,
  SessionProvider,
  useSession,
} from "@/app/(routes)/divisions/ftd/paperwork/components/SessionContext";
import { SessionDetailsCard } from "@/app/(routes)/divisions/ftd/paperwork/components/SessionDetailsCard";
import PaperworkForm from "@/app/(routes)/divisions/ftd/paperwork/components/PaperworkForm";
import ReinstatementForm from "@/app/(routes)/divisions/ftd/paperwork/components/ReinstatementForm";
import CivilianRideAlongForm from "@/app/(routes)/divisions/ftd/paperwork/components/CivilianRideAlongForm";
import { cn } from "@/lib/utils";

interface PaperworkTypeOption {
  value: FormType;
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const PAPERWORK_TYPES: PaperworkTypeOption[] = [
  {
    value: "normal",
    label: "Normal FT Paperwork",
    description: "Field training phases for new EMRs.",
    Icon: FileText,
  },
  {
    value: "reinstatement",
    label: "Reinstatement Paperwork",
    description: "Phases for previous Employees of the Department.",
    Icon: RefreshCcw,
  },
  {
    value: "civilianRideAlong",
    label: "Civilian Ride-Along",
    description:
      "Accept / Deny / Hold / Expire a request, or post a Ride-Along Report.",
    Icon: UserRound,
  },
];

/**
 * Outer shell - only job is to mount `SessionProvider`. The actual
 * `useSession()` calls live in `PaperworkTypeContent` so the hook runs
 * inside the provider's subtree (otherwise React throws the
 * "useSession must be used within a <SessionProvider>" error).
 */
export function PaperworkTypeSelector() {
  return (
    <SessionProvider>
      <PaperworkTypeContent />
    </SessionProvider>
  );
}

function PaperworkTypeContent() {
  const { formType } = useSession();
  return (
    <>
      {/* Synchronise the ?tab= URL parameter with the active form type so users
          can share/bookmark links to a specific paperwork format. Must be
          wrapped in <Suspense> because useSearchParams() requires it. */}
      <Suspense fallback={null}>
        <FormTypeUrlSyncer />
      </Suspense>
      <div className="space-y-6">
        <PaperworkHeader />
        <PaperworkTypeRouter />
        {/* Session Details is irrelevant to the Civilian Ride-Along flow
            (no EMR, no session row to save), so it's hidden in that mode. */}
        {formType !== "civilianRideAlong" && <SessionDetailsCard />}
      </div>
    </>
  );
}

function PaperworkHeader() {
  return (
    <header className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Paperwork</h1>
          <p className="text-sm text-muted-foreground">
            Choose a paperwork format to begin.
          </p>
        </div>
        <span className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Saved into your browser automatically.
        </span>
      </div>
      <PaperworkTypeTabs />
    </header>
  );
}

/**
 * Reads the ?tab= query param on mount and writes the active form type back
 * to the URL whenever it changes, without scrolling or adding a history entry.
 * Must be rendered inside <Suspense> (Next.js requirement for useSearchParams).
 */
function FormTypeUrlSyncer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { formType, setFormType } = useSession();

  // On mount, read ?tab= and sync into context.
  useEffect(() => {
    const tab = searchParams.get("tab") as FormType | null;
    const validTypes: FormType[] = ["normal", "reinstatement", "civilianRideAlong"];
    if (tab && validTypes.includes(tab)) {
      setFormType(tab);
    }
    // Intentionally run only once on mount - the effect below keeps the URL
    // in sync whenever formType changes afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever formType changes, update ?tab= in the URL.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", formType);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [formType, pathname, router, searchParams]);

  return null;
}

function PaperworkTypeTabs() {
  const { formType, setFormType } = useSession();

  return (
    <nav aria-label="Paperwork type" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PAPERWORK_TYPES.map(({ value, label, description, Icon }) => {
        const active = formType === value;
        return (
          <button
            key={value}
            type="button"
            aria-current={active ? "true" : undefined}
            onClick={() => setFormType(value)}
            className={cn(
              "cursor-pointer group flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              active
                ? "border-primary/70 bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/40 hover:bg-muted/40",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                active
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground group-hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span
                className={cn(
                  "text-sm font-medium",
                  active ? "text-primary" : "text-foreground",
                )}
              >
                {label}
              </span>
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function PaperworkTypeRouter() {
  const { formType } = useSession();
  return formType === "normal" ? (
    <PaperworkForm />
  ) : formType === "reinstatement" ? (
    <ReinstatementForm />
  ) : (
    <CivilianRideAlongForm />
  );
}
