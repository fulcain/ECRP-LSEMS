"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FileText, MessagesSquare, RefreshCcw, UserRound } from "lucide-react";

import {
  FormType,
  SessionProvider,
  useSession,
} from "@/app/(routes)/divisions/ftd/paperwork/components/SessionContext";
import {
  DocumentPicker,
  type PickerGroup,
} from "@/components/division/document-picker";
import { SessionDetailsCard } from "@/app/(routes)/divisions/ftd/paperwork/components/SessionDetailsCard";
import PaperworkForm from "@/app/(routes)/divisions/ftd/paperwork/components/PaperworkForm";
import ReinstatementForm from "@/app/(routes)/divisions/ftd/paperwork/components/ReinstatementForm";
import CivilianRideAlongForm from "@/app/(routes)/divisions/ftd/paperwork/components/CivilianRideAlongForm";
import { DiscussionBoardComposer } from "@/components/discussion-board-composer";

/**
 * Everything the Paperwork tab can write, grouped the way a member decides:
 * first "am I recording a session or posting on the board?".
 *
 * Adding a document is one entry here - `value` is the key the router below
 * understands, so a new one needs a branch in `PaperworkTypeRouter` and nothing
 * else on this page changes.
 */
const PAPERWORK_GROUPS: readonly PickerGroup<FormType>[] = [
  {
    label: "Write a session",
    hint: "An EMR you trained or reviewed - the session details are saved under the form.",
    documents: [
      {
        value: "normal",
        label: "Normal FT Paperwork",
        hint: "Field training phases for a new EMR.",
        icon: FileText,
      },
      {
        value: "reinstatement",
        label: "Reinstatement Paperwork",
        hint: "Phases for a previous Employee coming back.",
        icon: RefreshCcw,
      },
      {
        value: "civilianRideAlong",
        label: "Civilian Ride-Along",
        hint: "Accept, deny, hold or expire a request - or post the report.",
        icon: UserRound,
      },
    ],
  },
  {
    label: "Post on the board",
    hint: "No EMR and no session - just a topic written in the FTD house style.",
    documents: [
      {
        value: "ftdDiscussionBoard",
        label: "Discussion Board",
        hint: "Open a topic in the FTD discussion board.",
        icon: MessagesSquare,
      },
    ],
  },
];

const FORM_TYPES: readonly FormType[] = PAPERWORK_GROUPS.flatMap((group) =>
  group.documents.map((doc) => doc.value),
);

/**
 * The board carries no session: there is no EMR, no date and no phase. (The
 * instructors' own board is not here at all - it belongs to the FTI page, where
 * the instructors who post on it already are.)
 */
const BOARD_TYPES: readonly FormType[] = ["ftdDiscussionBoard"];

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
        <PaperworkTypePicker />
        <PaperworkTypeRouter />
        {/* Session Details is irrelevant to the Civilian Ride-Along flow
            (no EMR, no session row to save) and to a discussion board (no
            session at all), so it's hidden in those modes. */}
        {formType !== "civilianRideAlong" && !BOARD_TYPES.includes(formType) && (
          <SessionDetailsCard />
        )}
      </div>
    </>
  );
}

/**
 * The format switcher. The page title and its description come from the FTD
 * section shell, so this carries only the type tabs and the autosave note.
 */
function PaperworkTypePicker() {
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Saved into your browser automatically.
        </span>
      </div>
      <PaperworkTypeTabs />
    </div>
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
    if (tab && FORM_TYPES.includes(tab)) {
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
    <DocumentPicker
      groups={PAPERWORK_GROUPS}
      value={formType}
      // The form the tab opens on is the member's last one, so a cleared
      // choice (pressing Change) leaves it as it is - the picker has already
      // unfolded the grid.
      onChange={(next) => next && setFormType(next)}
    />
  );
}

function PaperworkTypeRouter() {
  const { formType } = useSession();
  if (formType === "normal") return <PaperworkForm />;
  if (formType === "reinstatement") return <ReinstatementForm />;
  if (formType === "civilianRideAlong") return <CivilianRideAlongForm />;
  // The board and its key are named alike on purpose: the card that chooses the
  // board is also the board's key, so there is nothing to map. Anything else -
  // including a form this tab no longer offers, still sitting in a member's
  // storage - falls back to the first form rather than rendering a builder
  // nobody asked for.
  if (formType === "ftdDiscussionBoard")
    return <DiscussionBoardComposer boardKey={formType} />;
  return <PaperworkForm />;
}
