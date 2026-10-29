"use client";

import type { MedicCredentials } from "@/app/context/MedicContext";
import { divisions, type Divisions } from "@/app/constants/divisions";
import { divisionsForDirector } from "@/app/constants/general/directorRoles";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GuildUser } from "@/app/hooks/useGuildIdentity";
import type { MemberIdentity } from "@/lib/member-identity";
import { discordDefaultAvatarUrl } from "@/lib/discord";
import { memberDisplayName } from "@/lib/member-name";
import { BadgeCheck, Pencil, RefreshCw, ShieldCheck } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";

const NONE_DIVISION_RANK = "__none__";

type PersonnelCredentialCardProps = {
  credentials: MedicCredentials;
  identity: MemberIdentity;
  user: GuildUser | null;
  loading: boolean;
  divisionRanks: Record<string, string>;
  rankManagedDivisions: readonly Divisions[];
  rankSelectionsDisabled: boolean;
  onDivisionRankChange: (divisionLabel: string, value: string) => void;
  canEditSignature: boolean;
  onEditSignature: () => void;
  signatureEditor: ReactNode;
  reloadingRanks: boolean;
  onReloadRanks: () => void;
  reloadStatus: ReactNode;
};

export function PersonnelCredentialCard({
  credentials,
  identity,
  user,
  loading,
  divisionRanks,
  rankManagedDivisions,
  rankSelectionsDisabled,
  onDivisionRankChange,
  canEditSignature,
  onEditSignature,
  signatureEditor,
  reloadingRanks,
  onReloadRanks,
  reloadStatus,
}: PersonnelCredentialCardProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const displayName =
    memberDisplayName(user) ?? (credentials.name || "Personnel record");
  const rankLabel = identity.rankLabel ?? credentials.rank;
  const identityDivisions = divisions.filter(
    ({ key, label }) =>
      key !== "ar" && identity.divisionMembership.includes(label),
  );
  const rankManagedDivisionLabels = new Set(
    rankManagedDivisions.map(({ label }) => label),
  );
  const assignmentDivisions = divisions.filter(
    ({ key, label }) =>
      key !== "ar" &&
      (rankManagedDivisionLabels.has(label) ||
        identity.divisionMembership.includes(label)),
  );
  const directorTitle =
    identity.directorTitle ??
    (credentials.directorRole.enabled ? credentials.directorRole.title : null);
  const directorCoverage = directorTitle
    ? divisionsForDirector(directorTitle)
    : [];
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const avatarSrc = user
    ? user.avatarUrl ?? discordDefaultAvatarUrl(user.discordId)
    : null;

  return (
    <section className="space-y-3" aria-label="Personnel credential">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-primary/80">Personnel Credential</p>
        </div>
      </div>

      <article
        data-personnel-card
        aria-label="Los Santos Emergency Medical Services personnel credential"
        className="relative isolate mx-auto w-full overflow-hidden rounded-[1.5rem] border border-[#c4a36a]/30 bg-[radial-gradient(ellipse_at_78%_0%,rgba(151,43,38,.22),transparent_48%),linear-gradient(145deg,#101923,#1b2634)] p-5 text-[#f6f1e6] shadow-[0_24px_70px_-35px_rgba(0,0,0,.75)] sm:p-7"
      >
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 z-20 w-1 bg-gradient-to-b from-[#a43e38] via-[#d1b16e] to-[#a43e38]"
        />
        <Image
          src="/General.png"
          alt=""
          width={260}
          height={260}
          className="pointer-events-none absolute -right-12 top-1/2 z-0 h-64 w-64 -translate-y-1/2 object-contain opacity-[0.045]"
        />

        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#c4a36a]/35 bg-white/[0.04] p-1.5 shadow-inner">
                <Image
                  src="/General.png"
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d6c397]">
                  City of Los Santos
                </p>
                <h2 className="mt-0.5 text-sm font-semibold uppercase tracking-[0.12em] text-white sm:text-base">
                  Emergency Medical Services
                </h2>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReloadRanks}
              disabled={loading || reloadingRanks}
              className="shrink-0 border-[#d6c397]/30 bg-white/[0.04] text-[#f1dcae] hover:bg-white/[0.1] hover:text-white"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${reloadingRanks ? "animate-spin" : ""}`}
              />
              Reload Ranks
            </Button>
          </div>
          {reloadStatus}

          <div className="grid items-start gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(250px,0.7fr)]">
            <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-black/[0.12] p-4">
              <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#d6c397]/40 bg-white/10 shadow-lg ring-4 ring-white/[0.04]">
                {avatarSrc && !avatarFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc}
                    alt={`${displayName}'s profile`}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <span className="text-lg font-semibold tracking-wider text-[#f1dcae]">
                    {initials || "LS"}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b5c0cd]">
                  Personnel Record
                </p>
                <p className="mt-1 truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  {displayName}
                </p>
                <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#d6c397]/25 bg-[#d6c397]/[0.08] px-2.5 py-1 text-xs font-medium text-[#f1dcae]">
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {loading ? "Checking role" : rankLabel || "Rank not detected"}
                  </span>
                </span>
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-white/10 bg-black/[0.12] p-4">
              {signatureEditor ? (
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9eabba]">
                    Member Signature
                  </p>
                  <div className="mt-3 w-full min-w-0">{signatureEditor}</div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9eabba]">
                      Member Signature
                    </p>
                    {credentials.signature ? (
                      <Image
                        src={credentials.signature}
                        alt={`${displayName} signature`}
                        width={150}
                        height={42}
                        className="mt-1 h-9 w-auto max-w-40 object-contain object-left"
                      />
                    ) : (
                      <p className="mt-1 text-xs italic text-[#9eabba]">
                        No signature on file
                      </p>
                    )}
                  </div>
                  {canEditSignature && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onEditSignature}
                      className="border-[#d6c397]/30 bg-white/[0.04] text-[#f1dcae] hover:bg-white/[0.1] hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Signature
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/[0.16] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d6c397]">
                  Current Assignments
                </p>
                <p className="mt-1 text-xs text-[#9eabba]">
                  {identityDivisions.length === 1
                    ? "1 division found on Discord"
                    : `${identityDivisions.length} Assignments found in the personnel files.`}
                </p>
                <p className="mt-1 text-[10px] text-[#9eabba]">
                  Choose or clear a saved rank for each division below.
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-[#d6c397]" />
            </div>

            {assignmentDivisions.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {assignmentDivisions.map((division) => {
                  const isMember = identity.divisionMembership.includes(
                    division.label,
                  );
                  const canSelectRank = rankManagedDivisionLabels.has(
                    division.label,
                  );

                  return (
                    <div
                      key={division.label}
                      className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Image
                          src={division.image}
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 shrink-0 object-contain"
                        />
                        <span className="min-w-0 truncate text-[11px] font-medium text-white/90">
                          {division.data.divisionName}
                        </span>
                      </div>
                      <p className="mt-1 truncate pl-7 text-[10px] text-[#b5c0cd]">
                        {isMember
                          ? identity.divisionRanks[division.label] ?? "Member"
                          : "Vacant"}
                      </p>
                      {canSelectRank && (
                        <Select
                          value={divisionRanks[division.label] || ""}
                          disabled={rankSelectionsDisabled}
                          onValueChange={(value) =>
                            onDivisionRankChange(
                              division.label,
                              value === NONE_DIVISION_RANK ? "" : value,
                            )
                          }
                        >
                          <SelectTrigger
                            aria-label={`Rank for ${division.data.divisionName}`}
                            className="mt-2 w-full border-white/10 bg-black/20 text-xs text-white hover:bg-black/30"
                          >
                            <SelectValue placeholder="Choose your division rank" />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-surface text-foreground">
                            <SelectItem value={NONE_DIVISION_RANK}>
                              None
                            </SelectItem>
                            {division.data.ranks.map((rank) => (
                              <SelectItem key={rank.name} value={rank.name}>
                                {rank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-white/10 px-3 py-4 text-xs leading-relaxed text-[#b5c0cd]">
                {loading
                  ? "Checking current division assignments…"
                  : "No division assignments are currently reflected on your Discord profile."}
              </p>
            )}

            {directorTitle && (
              <div className="mt-3 rounded-xl border border-[#c4a36a]/20 bg-[#c4a36a]/[0.07] px-3 py-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#d6c397]">
                  Director Appointment
                </p>
                <p className="mt-1 text-xs font-semibold text-white/95">
                  {directorTitle}
                </p>
                {directorCoverage.length > 0 && (
                  <p className="mt-1 text-[10px] leading-relaxed text-[#b5c0cd]">
                    Covers {directorCoverage.join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
