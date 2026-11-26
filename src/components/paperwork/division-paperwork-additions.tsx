"use client";

import { useEffect, useState } from "react";

import { GENERATED_PAPERWORK } from "@/app/constants/paperwork/generated";
import { PaperworkWorkspace } from "@/components/paperwork/paperwork-workspace";
import type { PaperworkConfig } from "@/lib/paperwork/schema";

/** The database-backed paperwork workspace embedded in a division page. */
export function DivisionPaperworkAdditions({
  divisionKey,
}: {
  divisionKey: string;
}) {
  const fileConfig = GENERATED_PAPERWORK.find(
    (entry) => entry.division.key === divisionKey,
  );
  const [databaseConfig, setDatabaseConfig] = useState<PaperworkConfig | null | false>(null);

  useEffect(() => {
    let active = true;
    void fetch(`/api/paperwork/${divisionKey}`)
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as { config?: PaperworkConfig | null };
      })
      .then((result) => {
        if (active && result?.config) {
          setDatabaseConfig(result.config);
        }
      })
      .catch(() => {
        // The checked-in config remains the recovery path if the store is down.
      });
    return () => {
      active = false;
    };
  }, [divisionKey]);

  const config = databaseConfig === false ? fileConfig : databaseConfig ?? fileConfig;
  if (!config) return null;

  return (
    <section className="mt-10 space-y-4 border-t border-border pt-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Paperwork</h2>
        <p className="text-sm text-muted-foreground">
          {databaseConfig
            ? "Division forms and templates loaded from the shared paperwork database."
            : "Bundled paperwork is shown while the shared database is unavailable."}
        </p>
      </div>
      <PaperworkWorkspace config={config} showHeader={false} />
    </section>
  );
}
