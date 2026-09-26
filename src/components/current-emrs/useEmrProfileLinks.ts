"use client";

import { useEffect, useState } from "react";
import { fetchEMRProfileLinks, type EMRProfileLink } from "./fetchCurrentEMRs";

/**
 * The current-EMR list, fetched once per mount. Shared by the pickers so they
 * all read the same sheet, and so a card can resolve a stored name back to the
 * profile link that belongs to it.
 */
export function useEmrProfileLinks(): EMRProfileLink[] {
  const [emrs, setEmrs] = useState<EMRProfileLink[]>([]);

  useEffect(() => {
    fetchEMRProfileLinks().then(setEmrs);
  }, []);

  return emrs;
}
