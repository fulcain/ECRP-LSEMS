"use client";

import { MedicCredentials } from "@/app/(routes)/operations/division-templates/components/MedicCredentials";
import { divisions } from "@/app/constants/divisions";
import { useMedic } from "@/app/context/MedicContext";
import {
  useGuildIdentity,
  type GuildIdentityRead,
} from "@/app/hooks/useGuildIdentity";
import { ROUTES } from "@/configs/routes";
import { hasIdentity, type MemberIdentity } from "@/lib/member-identity";
import {
  syncedDirectorRole,
  syncedDivisionRanks,
  syncedRank,
  type DiscordSyncMode,
} from "@/lib/staff-sync";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SyncOutcomeNote } from "@/app/components/staff/SyncOutcomeNote";
import { Crown, RefreshCw, Sparkles } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type StaffSettingsCardProps = {
  title?: string;
  description?: string;
};

/** One "what Discord says" pill: the rank, a division, or a director title. */
function DetectedChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-emerald-400/20 bg-slate-900/60 px-3 py-1 text-xs">
      <span className="shrink-0 text-[10px] font-semibold tracking-[0.16em] text-emerald-300/80 uppercase">
        {label}
      </span>
      <span className="truncate font-medium text-white">{value}</span>
    </span>
  );
}

const rankManagedDivisions = divisions.filter(
  (division) => division.data.ranks.length > 0,
);
const NONE_DIVISION_RANK = "__none__";

export function StaffSettingsCard({
  title = "Staff Settings",
  description = "Save your name, signature, and rank once to reuse across tools.",
}: StaffSettingsCardProps) {
  const { medicCredentials, setMedicCredentials, divisionRanks, setDivisionRanks } =
    useMedic();
  const [showEditForm, setShowEditForm] = useState(false);

  const {
    identity,
    user,
    isLoading: identityLoading,
    error: identityError,
    refresh,
  } = useGuildIdentity();
  const [syncing, setSyncing] = useState(false);
  /**
   * What the last press of Sync produced, so the panel can report it. Null
   * until the button is used: the automatic pass has nothing to announce.
   */
  const [syncOutcome, setSyncOutcome] = useState<GuildIdentityRead | null>(null);
  const detected = hasIdentity(identity);
  //
  // The "what Discord says" panel is shown whenever Discord actually answered,
  // not only when it found something. Gating it on `detected` meant the panel -
  // and its Sync button, and any explanation of what Sync just did - vanished
  // at exactly the moment a member removed their last role, which is the one
  // moment they need to see the result and be able to press it again.
  const hasDiscordAnswer = user !== null;

  /**
   * Copy what Discord says onto the saved credentials.
   *
   * The rules themselves live in `lib/staff-sync.ts`; this is only the wiring
   * from them into the two saved stores.
   */
  const applyDiscord = useCallback(
    (next: MemberIdentity, mode: DiscordSyncMode) => {
      setMedicCredentials((prev) => ({
        ...prev,
        rank: syncedRank(prev.rank, next, mode),
        directorRole: syncedDirectorRole(prev.directorRole, next, mode),
      }));

      setDivisionRanks((prev) =>
        syncedDivisionRanks(
          prev,
          next,
          mode,
          rankManagedDivisions.map((division) => division.label),
        ),
      );
    },
    [setDivisionRanks, setMedicCredentials],
  );

  // Re-read the member's roles once per page load, as soon as Discord answers,
  // so a rank added since the last visit is in place without anyone pressing
  // anything - the session itself is refreshed by the middleware on every
  // page load, so what arrives here is current.
  const autoAppliedRef = useRef(false);

  useEffect(() => {
    if (identityLoading) return;
    if (autoAppliedRef.current) return;
    autoAppliedRef.current = true;
    if (identityError || !detected) return;
    applyDiscord(identity, "fill");
  }, [applyDiscord, detected, identity, identityError, identityLoading]);

  /**
   * The Sync button: ask Discord for the member's roles right now, then make
   * the saved values match the answer - including clearing what Discord no
   * longer reports.
   *
   * The result is applied from the read itself rather than from `identity`, so
   * there is no window where the button copies the previous render's values.
   * If the read could not be made at all, nothing is changed and `syncOutcome`
   * says why - a button that looks like it did nothing is worse than one that
   * explains itself. And because a role change also changes what the *server*
   * lets this member open, the hook re-renders the route when a read happens.
   */
  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncOutcome(null);
    try {
      const read = await refresh({ force: true });
      applyDiscord(read.identity, read.answered ? "replace" : "fill");
      setSyncOutcome(read);
    } finally {
      setSyncing(false);
    }
  };

  const isCredentialsEmpty =
    !medicCredentials.name ||
    !medicCredentials.signature ||
    !medicCredentials.rank;

  const directorRole = medicCredentials.directorRole;
  const savedDirectorTitle =
    directorRole?.enabled && directorRole.title ? directorRole.title : null;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-violet-500/20 bg-slate-950/80 shadow-2xl shadow-violet-950/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.15),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.10),_transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsla(0,0%,100%,0.1) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative space-y-8 p-5 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div className="flex flex-col">
              <h2 className="mb-1 text-xl font-semibold text-white">{title}</h2>
              <p className="text-sm text-slate-400">{description}</p>
              {!isCredentialsEmpty && !showEditForm && (
                <div className="mt-2 flex flex-col gap-1 text-sm text-slate-400">
                  <p>
                    {medicCredentials.rank} {medicCredentials.name}
                  </p>
                  {savedDirectorTitle && (
                    <p className="inline-flex items-center gap-1.5 text-violet-300">
                      <Crown className="h-3.5 w-3.5" />
                      <span>{savedDirectorTitle}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {!isCredentialsEmpty &&
              medicCredentials.signature &&
              !showEditForm && (
                <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-slate-800/50 p-2 transition-all duration-200 hover:border-white/20 sm:mt-0">
                  <Image
                    src={medicCredentials.signature}
                    alt={`${medicCredentials.name} signature`}
                    width={200}
                    height={64}
                    style={{ objectFit: "contain", height: "auto" }}
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}
          </div>

          {isCredentialsEmpty || showEditForm ? (
            <MedicCredentials
              medicCredentials={medicCredentials}
              setMedicCredentialsAction={(values) => {
                setMedicCredentials(values);
                setShowEditForm(false);
              }}
            />
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowEditForm(true)}
              className="whitespace-nowrap border-slate-600 text-slate-300 transition-all duration-200 hover:scale-[1.02] hover:border-violet-500/40 hover:bg-violet-950/20 hover:text-violet-200 active:scale-95"
            >
              Edit Credentials
            </Button>
          )}
        </div>

        {hasDiscordAnswer && (
          <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-3">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                    <Sparkles className="h-4 w-4" />
                    Detected from your Discord roles
                  </h3>
                  <p className="text-xs text-slate-400">
                    Read from your roles on every page load and saved here, so a
                    new rank shows up without signing in again. Anything Discord
                    cannot see is left as you set it.
                  </p>
                </div>

                {syncOutcome && (
                  <SyncOutcomeNote
                    outcome={syncOutcome}
                    returnTo={ROUTES.workspace.staff}
                  />
                )}

                {!detected && (
                  <p className="text-xs text-slate-300">
                    None of your Discord roles are a rank, a director role or a
                    division membership the app can name. If you hold one, it
                    may need adding to the app&apos;s role registry.
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {identity.rankLabel && (
                    <DetectedChip label="Rank" value={identity.rankLabel} />
                  )}
                  {identity.directorTitle && (
                    <DetectedChip label="Director" value={identity.directorTitle} />
                  )}
                  {identity.divisionMembership.map((division) => (
                    <DetectedChip
                      key={division}
                      label={division}
                      value={identity.divisionRanks[division] ?? "Division member"}
                    />
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleSync}
                disabled={syncing}
                className="whitespace-nowrap border-emerald-400/30 bg-slate-900/40 text-emerald-200 transition-all duration-200 hover:scale-[1.02] hover:border-emerald-300/50 hover:bg-emerald-950/30 active:scale-95 disabled:opacity-60"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                />
                {syncing ? "Checking Discord" : "Sync from Discord"}
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/90 p-5 transition-colors duration-200 hover:border-white/20">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Division Ranks</h3>
            <p className="text-sm text-slate-400">
              Set your saved rank for each division here so template tools can
              reuse them automatically.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rankManagedDivisions.map((division) => (
              <div
                key={division.label}
                className="rounded-xl border border-white/10 bg-slate-800/50 p-4 transition-all duration-200 hover:border-white/20 hover:bg-slate-800/70"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700/50">
                    <Image
                      src={division.image}
                      alt={division.label}
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-white">{division.label}</p>
                    <p className="text-xs text-slate-400">
                      {division.data.divisionName}
                    </p>
                  </div>
                </div>

                <Select
                  value={divisionRanks[division.label] || ""}
                  onValueChange={(value) =>
                    setDivisionRanks((prev) => ({
                      ...prev,
                      [division.label]:
                        value === NONE_DIVISION_RANK ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full border-slate-700 bg-slate-800 text-white transition-all duration-200 hover:border-slate-500">
                    <SelectValue placeholder="Choose your division rank" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-900 text-white">
                    <SelectItem value={NONE_DIVISION_RANK} className="transition-all duration-150 hover:bg-slate-700/60">None</SelectItem>

                    {division.data.ranks.map((rank) => (
                      <SelectItem
                        key={rank.name}
                        value={rank.name}
                        className="transition-all duration-150 hover:bg-slate-700/60"
                      >
                        {rank.name}
                      </SelectItem>
                    ))}

                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
