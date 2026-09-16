"use client";

import { useMedic } from "@/app/context/MedicContext";
import { useGuildIdentity } from "@/app/hooks/useGuildIdentity";

export interface HighestRankState {
  rankLabel: string | null;
  /** True until the /api/auth/me request settles. */
  isLoading: boolean;
  /** Error from the fetch, or null on success. */
  error: Error | null;
}

/**
 * The rank to prefill forms with - used by the paperwork tools so nobody has
 * to type it.
 *
 * The rank saved on the Staff Page comes first: that is the member's own
 * statement of what they are, and it is what the page's own editor shows.
 * Discord detection is the fallback, for anyone who hasn't filled the Staff
 * Page in yet - `useGuildIdentity` owns that request and resolves divisions
 * and the director role from the same role list.
 */
export function useHighestRank(): HighestRankState {
  const { identity, isLoading, error } = useGuildIdentity();
  const { medicCredentials } = useMedic();

  return {
    rankLabel: medicCredentials.rank || identity.rankLabel,
    isLoading,
    error,
  };
}
