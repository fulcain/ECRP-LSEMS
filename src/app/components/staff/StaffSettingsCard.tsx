"use client";

import { MedicCredentials } from "@/app/(routes)/operations/division-templates/components/MedicCredentials";
import { PersonnelCredentialCard } from "@/app/components/staff/PersonnelCredentialCard";
import { divisions } from "@/app/constants/divisions";
import { useMedic } from "@/app/context/MedicContext";
import {
  useGuildIdentity,
  type GuildIdentityRead,
  type GuildUser,
} from "@/app/hooks/useGuildIdentity";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import type { MemberIdentity } from "@/lib/member-identity";
import { SyncOutcomeNote } from "@/app/components/staff/SyncOutcomeNote";
import { ROUTES } from "@/configs/routes";
import {
  autoFilledDivisionRanks,
  syncedDirectorRole,
  syncedName,
  syncedRank,
} from "@/lib/staff-sync";
import { useCallback, useEffect, useRef, useState } from "react";

const rankManagedDivisions = divisions.filter(
  (division) => division.key !== "ar" && division.data.ranks.length > 0,
);

export function StaffSettingsCard() {
  const {
    medicCredentials,
    setMedicCredentials,
    divisionRanks,
    setDivisionRanks,
    divisionRanksHydrated,
  } = useMedic();
  const [showEditForm, setShowEditForm] = useState(false);
  const [reloadingRanks, setReloadingRanks] = useState(false);
  const [reloadOutcome, setReloadOutcome] =
    useState<GuildIdentityRead | null>(null);

  const {
    user,
    identity,
    isLoading: identityLoading,
    error: identityError,
    refresh,
  } = useGuildIdentity();

  // Track automatic fills and explicit picks separately so a pick cannot be
  // mistaken for a Discord value on the next login.
  const [lastSyncedRanks, setLastSyncedRanks, lastSyncedRanksHydrated] =
    useLocalStorage<Record<string, string>>("division-ranks-last-synced", {});
  const [manualDivisionRanks, setManualDivisionRanks, manualRanksHydrated] =
    useLocalStorage<Record<string, boolean>>("division-ranks-manual", {});
  const rankPreferencesHydrated =
    divisionRanksHydrated && lastSyncedRanksHydrated && manualRanksHydrated;
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

      const { ranks, lastSynced } = autoFilledDivisionRanks(
        divisionRanks,
        lastSyncedRef.current,
        next,
        rankManagedDivisions.map((division) => division.label),
        manualDivisionRanks,
      );
      lastSyncedRef.current = lastSynced;
      setDivisionRanks(ranks);
      setLastSyncedRanks(lastSynced);
    },
    [
      setDivisionRanks,
      setLastSyncedRanks,
      setMedicCredentials,
      manualDivisionRanks,
      divisionRanks,
    ],
  );

  const handleReloadRanks = async () => {
    setReloadingRanks(true);
    setReloadOutcome(null);
    try {
      const outcome = await refresh({ force: true });
      setReloadOutcome(outcome);
      if (outcome.answered && outcome.user) {
        applyDiscord(outcome.identity, outcome.user);
      }
    } finally {
      setReloadingRanks(false);
    }
  };

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
    if (identityLoading || !rankPreferencesHydrated) return;
    if (autoAppliedRef.current) return;
    autoAppliedRef.current = true;
    if (identityError || !user) return;
    applyDiscord(identity, user);
  }, [
    applyDiscord,
    identity,
    identityError,
    identityLoading,
    rankPreferencesHydrated,
    user,
  ]);

  // Discord reports no rank - either the member holds none or the role id isn't
  // in the registry yet - so they get the picker and are not locked out of the
  // tools that refuse to generate a document without a rank.
  const showRankFallback = !identityLoading && !identity.rankLabel;

  const needsSignature = !medicCredentials.signature;
  return (
    <PersonnelCredentialCard
      credentials={medicCredentials}
      identity={identity}
      user={user}
      loading={identityLoading || !rankPreferencesHydrated}
      divisionRanks={divisionRanks}
      rankManagedDivisions={rankManagedDivisions}
      rankSelectionsDisabled={
        identityLoading || !rankPreferencesHydrated || reloadingRanks
      }
      onDivisionRankChange={(divisionLabel, value) => {
        setDivisionRanks((prev) => ({
          ...prev,
          [divisionLabel]: value,
        }));
        setManualDivisionRanks((prev) => ({
          ...prev,
          [divisionLabel]: true,
        }));
      }}
      canEditSignature={!needsSignature && !showEditForm}
      onEditSignature={() => setShowEditForm(true)}
      signatureEditor={
        needsSignature || showEditForm ? (
          <MedicCredentials
            medicCredentials={medicCredentials}
            showRankFallback={showRankFallback}
            setMedicCredentialsAction={(values) => {
              setMedicCredentials(values);
              setShowEditForm(false);
            }}
          />
        ) : null
      }
      reloadingRanks={reloadingRanks}
      onReloadRanks={handleReloadRanks}
      reloadStatus={
        reloadOutcome ? (
          <SyncOutcomeNote
            outcome={reloadOutcome}
            returnTo={ROUTES.workspace.staff}
          />
        ) : null
      }
    />
  );
}
