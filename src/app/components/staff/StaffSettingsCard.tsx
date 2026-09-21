"use client";

import { MedicCredentials } from "@/app/(routes)/operations/division-templates/components/MedicCredentials";
import { divisions } from "@/app/constants/divisions";
import { divisionsForDirector } from "@/app/constants/general/directorRoles";
import { useMedic } from "@/app/context/MedicContext";
import { useGuildIdentity, type GuildUser } from "@/app/hooks/useGuildIdentity";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import type { MemberIdentity } from "@/lib/member-identity";
import {
  autoFilledDivisionRanks,
  syncedDirectorRole,
  syncedName,
  syncedRank,
} from "@/lib/staff-sync";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Crown } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type StaffSettingsCardProps = {
  title?: string;
  description?: string;
};

const rankManagedDivisions = divisions.filter(
  (division) => division.data.ranks.length > 0,
);
const NONE_DIVISION_RANK = "__none__";

export function StaffSettingsCard({
  title = "Staff Settings",
  description = "Your name, rank and director role come from Discord. Save your signature here to reuse it across tools.",
}: StaffSettingsCardProps) {
  const { medicCredentials, setMedicCredentials, divisionRanks, setDivisionRanks } =
    useMedic();
  const [showEditForm, setShowEditForm] = useState(false);

  const {
    user,
    identity,
    isLoading: identityLoading,
    error: identityError,
  } = useGuildIdentity();

  // What the last automatic fill wrote, per division. A saved rank that no
  // longer matches it is a manual pick and the fill pass leaves it alone.
  const [lastSyncedRanks, setLastSyncedRanks] = useLocalStorage<
    Record<string, string>
  >("division-ranks-last-synced", {});
  const lastSyncedRef = useRef(lastSyncedRanks);
  lastSyncedRef.current = lastSyncedRanks;

  /**
   * Copy what Discord says onto the saved credentials.
   *
   * The name, rank and director role always follow Discord when it reports
   * them - there is no longer an input for any of the three, so Discord is the
   * only source; the division ranks go through the three-way merge so a rank
   * the member picked themselves survives the next page load. The rules live in
   * `lib/staff-sync.ts`; this is only the wiring into the saved stores.
   */
  const applyDiscord = useCallback(
    (next: MemberIdentity, nextUser: GuildUser | null) => {
      setMedicCredentials((prev) => ({
        ...prev,
        name: syncedName(prev.name, nextUser),
        rank: syncedRank(prev.rank, next),
        directorRole: syncedDirectorRole(prev.directorRole, next),
      }));

      setDivisionRanks((prev) => {
        const { ranks, lastSynced } = autoFilledDivisionRanks(
          prev,
          lastSyncedRef.current,
          next,
          rankManagedDivisions.map((division) => division.label),
        );
        setLastSyncedRanks(lastSynced);
        return ranks;
      });
    },
    [
      setDivisionRanks,
      setLastSyncedRanks,
      setMedicCredentials,
    ],
  );

  // Re-read the member's roles once per page load, as soon as Discord answers,
  // so a rank added since the last visit is in place without anyone pressing
  // anything - the session itself is refreshed by the middleware on every
  // page load, so what arrives here is current.
  //
  // Gated on Discord having answered at all, never on it having found
  // something: the name comes from the profile, so a member with no rank yet
  // still needs this pass to run.
  const autoAppliedRef = useRef(false);

  useEffect(() => {
    if (identityLoading) return;
    if (autoAppliedRef.current) return;
    autoAppliedRef.current = true;
    if (identityError || !user) return;
    applyDiscord(identity, user);
  }, [applyDiscord, identity, identityError, identityLoading, user]);

  // Discord reports no rank - either the member holds none or the role id isn't
  // in the registry yet - so they get the picker and are not locked out of the
  // tools that refuse to generate a document without a rank.
  const showRankFallback = !identityLoading && !identity.rankLabel;

  const needsSignature = !medicCredentials.signature;
  const identityLine = [medicCredentials.rank, medicCredentials.name]
    .filter(Boolean)
    .join(" ");

  const directorRole = medicCredentials.directorRole;
  const savedDirectorTitle =
    directorRole?.enabled && directorRole.title ? directorRole.title : null;

  // Read from Discord rather than the saved dropdown: access is granted by the
  // role, so this is the coverage the member actually has. Same declaration
  // the route gate reads, so the two can't disagree.
  const coveredDivisions = divisionsForDirector(identity.directorTitle);

  return (
    <div className="panel relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="relative space-y-6 p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div className="flex flex-col">
              <h2 className="mb-1 text-xl font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
              {!showEditForm && identityLine && (
                <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                  <p>{identityLine}</p>
                  {savedDirectorTitle && (
                    <p className="inline-flex items-center gap-1.5 text-violet-700 dark:text-violet-300">
                      <Crown className="h-3.5 w-3.5" />
                      <span>{savedDirectorTitle}</span>
                    </p>
                  )}
                </div>
              )}
              {coveredDivisions.length > 0 && (
                <p className="mt-2 inline-flex items-start gap-1.5 text-xs text-violet-700/80 dark:text-violet-300/80">
                  <Crown className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Your director role covers {coveredDivisions.join(", ")}.
                  </span>
                </p>
              )}
            </div>

            {medicCredentials.signature && !showEditForm && (
                <div className="mt-2 flex items-center rounded-xl border border-border bg-surface-hover/50 p-2 transition-all duration-200 hover:border-border sm:mt-0">
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

          {needsSignature || showEditForm ? (
            <MedicCredentials
              medicCredentials={medicCredentials}
              showRankFallback={showRankFallback}
              setMedicCredentialsAction={(values) => {
                setMedicCredentials(values);
                setShowEditForm(false);
              }}
            />
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowEditForm(true)}
              className="whitespace-nowrap border-border text-muted-foreground transition-all duration-200 hover:scale-[1.02] hover:border-violet-500/40 hover:bg-violet-50/20 dark:hover:bg-violet-950/20 hover:text-violet-200 active:scale-[0.98]"
            >
              Edit Signature
            </Button>
          )}
        </div>

        <div className="panel-inner p-5 transition-colors hover:border-primary/30">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Division Ranks</h3>
            <p className="text-sm text-muted-foreground">
              Set your saved rank for each division here so template tools can
              reuse them automatically.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rankManagedDivisions.map((division) => (
              <div
                key={division.label}
                className="rounded-xl border border-border bg-surface-raised p-4 transition-colors hover:border-primary/30"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-hover/50">
                    <Image
                      src={division.image}
                      alt={division.label}
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{division.label}</p>
                    <p className="text-xs text-muted-foreground">
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
                  <SelectTrigger className="w-full border-border bg-surface-hover text-foreground transition-all duration-200 hover:border-border">
                    <SelectValue placeholder="Choose your division rank" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-surface text-foreground">
                    <SelectItem value={NONE_DIVISION_RANK} className="transition-colors duration-200 hover:bg-surface-hover/60">None</SelectItem>

                    {division.data.ranks.map((rank) => (
                      <SelectItem
                        key={rank.name}
                        value={rank.name}
                        className="transition-colors duration-200 hover:bg-surface-hover/60"
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
