"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { AlertTriangle, Plus, Save, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  FALLBACK_ACCESS_MATRIX,
  EDITABLE_ENTRIES,
  MANAGED_ENTRIES,
  MATRIX_ROLE_TIERS,
  fallbackRolesForRoute,
  overridesFromMatrix,
  rowHasNoEffect,
  sameMatrix,
  sameRoleSet,
  type AccessMatrix,
  type AccessMatrixGroup,
} from "@/configs/access-matrix";
import { ROLES, type RoleName } from "@/configs/roles";

/**
 * The live permission editor.
 *
 * This is where access is decided, and the Global Config is where it is kept: a
 * row is what the store says, and a page with no row opens to `Employee`. Only
 * the rows that differ from that fallback are written, so the store stays a
 * record of deliberate decisions rather than a copy of the app's defaults.
 *
 * A role with no Discord id is shown with a warning, because granting it does
 * nothing: `userHasAccess` drops blank ids and a rule whose ids are all blank
 * denies. Better to see that in the editor than to wonder why the tab never
 * appeared.
 */

const GROUP_ORDER: readonly AccessMatrixGroup[] = [
  "FTD",
  "Workspace",
  "Divisions",
  "Operations",
  "Resources",
  "Management",
  "System",
];

/** How many roles the picker can offer in total. */
const MATRIX_ROLE_COUNT = MATRIX_ROLE_TIERS.reduce(
  (total, tier) => total + tier.roles.length,
  0,
);

/** Defaults with the stored overrides laid on top, for every editable row. */
function effectiveMatrix(stored: AccessMatrix | null): AccessMatrix {
  const matrix: AccessMatrix = {};
  for (const entry of EDITABLE_ENTRIES) {
    matrix[entry.route] = [...(stored?.[entry.route] ?? FALLBACK_ACCESS_MATRIX[entry.route] ?? [])];
  }
  return matrix;
}

type AddRoleProps = {
  disabled?: boolean;
  excluded: readonly RoleName[];
  onPick: (alias: RoleName) => void;
};

function AddRole({ disabled, excluded, onPick }: AddRoleProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const tiers = useMemo(
    () =>
      MATRIX_ROLE_TIERS.map((tier) => ({
        label: tier.label,
        roles: tier.roles.filter((alias) => {
          if (excluded.includes(alias)) return false;
          if (!needle) return true;
          return (
            ROLES[alias].name.toLowerCase().includes(needle) ||
            alias.toLowerCase().includes(needle)
          );
        }),
      })).filter((tier) => tier.roles.length > 0),
    [excluded, needle],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-7 rounded-lg px-2 text-xs"
        >
          <Plus className="h-3 w-3" />
          Add role
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search roles..."
            className="h-8 pl-7 text-xs"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {tiers.length === 0 && (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              {excluded.length === MATRIX_ROLE_COUNT
                ? "Every role is already allowed here."
                : "No role matches that."}
            </p>
          )}
          {tiers.map((tier) => (
            <div key={tier.label} className="mb-1">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {tier.label}
              </p>
              {tier.roles.map((alias) => {
                const inert = !ROLES[alias].id;
                return (
                  <button
                    key={alias}
                    type="button"
                    onClick={() => {
                      onPick(alias);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-surface-hover"
                  >
                    <span className="truncate">{ROLES[alias].name}</span>
                    {inert && (
                      <span className="shrink-0 text-[10px] text-amber-500">
                        no id
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

type AccessMatrixEditorProps = {
  stored: AccessMatrix | null;
  configured: boolean;
  writable: boolean;
  /**
   * Whether the write token really works, checked read-only before any edit.
   * `writable` only means the variables are set.
   */
  writeAccess: "ok" | "unauthorized" | "unknown" | "not-configured";
};

export function AccessMatrixEditor({
  stored,
  configured,
  writable,
  writeAccess,
}: AccessMatrixEditorProps) {
  const router = useRouter();
  const [baseline, setBaseline] = useState<AccessMatrix>(() =>
    effectiveMatrix(stored),
  );
  const [matrix, setMatrix] = useState<AccessMatrix>(() =>
    effectiveMatrix(stored),
  );
  // Exactly what the store held when this editor opened, so the save can prove
  // it is overwriting that and not somebody else's newer version.
  const [base, setBase] = useState<AccessMatrix>(() => ({ ...(stored ?? {}) }));
  const [conflict, setConflict] = useState(false);
  const [saving, setSaving] = useState(false);

  // "Load latest" (and any other navigation) re-renders the server component
  // with a fresh `stored`, and this is what adopts it. It only fires when the
  // store really moved on: after our own save `stored` equals `base`, so local
  // edits are never thrown away for nothing.
  useEffect(() => {
    const latest = stored ?? {};
    if (sameMatrix(base, latest)) return;
    const next = effectiveMatrix(stored);
    setMatrix(next);
    setBaseline(next);
    setBase(latest);
    setConflict(false);
  }, [stored, base]);

  const changedRoutes = useMemo(
    () =>
      EDITABLE_ENTRIES.filter(
        (entry) =>
          !sameRoleSet(matrix[entry.route] ?? [], baseline[entry.route] ?? []),
      ).map((entry) => entry.route),
    [matrix, baseline],
  );

  const dirty = changedRoutes.length > 0;
  const canSave = dirty && writable && !saving;

  // Rows that are stored but decide nothing: they differ from the config's list,
  // yet open the page to exactly the same people. Left alone they quietly pin a
  // rule nobody meant to pin, so the editor offers to hand them back.
  const inertOverrides = useMemo(
    () =>
      EDITABLE_ENTRIES.filter(
        (entry) =>
          !sameRoleSet(
            matrix[entry.route] ?? [],
            FALLBACK_ACCESS_MATRIX[entry.route] ?? [],
          ) && rowHasNoEffect(entry.route, matrix[entry.route] ?? []),
      ).map((entry) => entry.route),
    [matrix],
  );

  function clearInertOverrides() {
    setMatrix((prev) => {
      const next = { ...prev };
      for (const route of inertOverrides) {
        next[route] = [...(FALLBACK_ACCESS_MATRIX[route] ?? [])];
      }
      return next;
    });
  }

  function setRoles(route: string, roles: RoleName[]) {
    setMatrix((prev) => ({ ...prev, [route]: roles }));
  }

  function addRole(route: string, alias: RoleName) {
    const current = matrix[route] ?? [];
    if (current.includes(alias)) return;
    setRoles(route, [...current, alias]);
  }

  function removeRole(route: string, alias: RoleName) {
    setRoles(route, (matrix[route] ?? []).filter((role) => role !== alias));
  }

  function discard() {
    setMatrix(baseline);
  }

  async function save() {
    setSaving(true);
    try {
      // The *whole* override set, not just this session's edits: the item is
      // replaced on save, so a narrower payload would drop every row changed in
      // an earlier visit. Rows left at their default simply aren't in it.
      const overrides = overridesFromMatrix(matrix);

      const res = await fetch("/api/access-matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix: overrides, base }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        reason?: string;
        conflict?: boolean;
        dropped?: string[];
      };

      if (!res.ok || !data.success) {
        if (data.conflict) {
          setConflict(true);
          toast.error(
            data.error ?? "Somebody else changed the matrix first.",
            { theme: "dark", autoClose: 8000 },
          );
          return;
        }
        toast.error(
          data.error ??
            "Could not save the matrix. Check the store configuration.",
          { theme: "dark" },
        );
        return;
      }

      setBaseline(matrix);
      setBase(overrides);
      setConflict(false);
      if (data.dropped && data.dropped.length > 0) {
        toast.warning(
          `Saved, but ${data.dropped.length} stale entr${
            data.dropped.length === 1 ? "y was" : "ies were"
          } ignored: ${data.dropped.slice(0, 3).join(", ")}`,
          { theme: "dark" },
        );
      } else {
        toast.success("Saved - live within a few seconds.", { theme: "dark" });
      }
      // The sidebar and the tab bars are server-rendered from the same matrix,
      // so they only move on a refresh.
      router.refresh();
    } catch {
      toast.error("Could not reach the server.", { theme: "dark" });
    } finally {
      setSaving(false);
    }
  }

  // Includes the locked row: showing it - inert - is how someone learns the
  // Access Manager is deliberately not theirs to change.
  const groups = GROUP_ORDER.map((group) => ({
    group,
    entries: MANAGED_ENTRIES.filter((entry) => entry.group === group),
  })).filter((section) => section.entries.length > 0);

  return (
    <div className="space-y-5">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />

      {!configured && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">No permission store is connected yet.</p>
            <p className="text-xs leading-5">
              Until one is, every page keeps using the rules in{" "}
              <code className="rounded bg-black/10 px-1 dark:bg-white/10">
                configs/roles.ts
              </code>
              , and saving will not work. Connect a Vercel Global Config and set{" "}
              <code className="rounded bg-black/10 px-1 dark:bg-white/10">
                GLOBAL_CONFIG
              </code>
              .
            </p>
          </div>
        </div>
      )}

      {configured && !writable && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">The store is read-only from here.</p>
            <p className="text-xs leading-5">
              Set{" "}
              <code className="rounded bg-black/10 px-1 dark:bg-white/10">
                VERCEL_API_TOKEN
              </code>{" "}
              and{" "}
              <code className="rounded bg-black/10 px-1 dark:bg-white/10">
                GLOBAL_CONFIG_ID
              </code>{" "}
              to save changes from the app.
            </p>
          </div>
        </div>
      )}

      <p className="text-xs leading-5 text-muted-foreground">
        Each row decides who may open that page. Command+ always keeps every
        page, whatever a row says - the Command ranks and the Command+ Team role
        alike - so an edit can narrow access but never lock HQ out, and never
        lock the team editing it out either. The Access Manager is the only page
        the Command ranks cannot open.
      </p>

      {inertOverrides.length > 0 && (
        <div className="flex flex-wrap items-start gap-3 rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="font-medium">
              {inertOverrides.length === 1
                ? "One row here is stored but changes nothing."
                : `${inertOverrides.length} rows here are stored but change nothing.`}
            </p>
            <p className="text-xs leading-5">
              Each one is stored as a row while opening its page to exactly the
              same people the default already opens it to, so the store holds an
              entry that decides nothing. Clearing puts the row back to{" "}
              <code className="rounded bg-black/10 px-1 dark:bg-white/10">
                Employee
              </code>{" "}
              - and a row that says no more than the default drops out of the
              store on the next save.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={clearInertOverrides}
          >
            Clear them
          </Button>
        </div>
      )}

      {conflict && (
        <div className="flex flex-wrap items-start gap-3 rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="font-medium">
              Somebody else saved the matrix while you were editing.
            </p>
            <p className="text-xs leading-5">
              Your changes were not written. Load the latest version, check it,
              then re-apply what you meant ({changedRoutes.length} of your rows
              differ from what was loaded).
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.refresh()}
          >
            Load latest
          </Button>
        </div>
      )}

      {writeAccess === "unauthorized" && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">The write token is being refused.</p>
            <p className="text-xs leading-5">
              Vercel answered not authorized for this config, so saving will
              fail. Check VERCEL_API_TOKEN: it must be scoped to the team that
              owns this config (or be a Full Account token), and VERCEL_TEAM_ID
              must be left unset for a team-scoped token.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {groups.map(({ group, entries }) => (
          <div key={group} className="space-y-2">
            <h2 className="eyebrow text-primary/80">{group}</h2>
            <Card>
              <CardContent className="divide-y divide-border/40 p-0">
                {entries.map((entry) => {
                  const locked = Boolean(entry.locked);
                  const roles = locked
                    ? fallbackRolesForRoute(entry.route)
                    : matrix[entry.route] ?? [];
                  const isDefault = sameRoleSet(
                    roles,
                    FALLBACK_ACCESS_MATRIX[entry.route] ?? [],
                  );
                  // Stored, but no different at the door: whatever it adds or
                  // drops either has no Discord id or keeps every page.
                  const noEffect =
                    !locked && !isDefault && rowHasNoEffect(entry.route, roles);

                  return (
                    <div
                      key={entry.route}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0 sm:w-56 sm:shrink-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {entry.label}
                          </p>
                          {locked && (
                            <Badge variant="muted" className="shrink-0">
                              locked
                            </Badge>
                          )}
                          {noEffect && (
                            <Badge variant="muted" className="shrink-0">
                              no effect
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                          {entry.route}
                        </p>
                      </div>

                      <div className="flex flex-1 flex-wrap items-center gap-1.5">
                        {locked && (
                          <span className="text-xs text-muted-foreground">
                            Fixed here on purpose - this page can only be
                            changed in the code, so the people using it cannot
                            edit away their own way in.
                          </span>
                        )}
                        {!locked && roles.length === 0 && (
                          <span className="text-xs text-muted-foreground">
                            Nobody - this page is closed to everyone except
                            admin ids.
                          </span>
                        )}
                        {roles.map((alias) => {
                          const inert = !ROLES[alias].id;
                          return (
                            <span
                              key={alias}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium",
                                inert
                                  ? "border-amber-300/50 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                                  : "border-border bg-surface-hover text-foreground",
                              )}
                              title={
                                inert
                                  ? `${alias} has no Discord id, so the gate can never recognise it.`
                                  : alias
                              }
                            >
                              {ROLES[alias].name}
                              {inert && <AlertTriangle className="h-3 w-3" />}
                              {!locked && (
                                <button
                                  type="button"
                                  aria-label={`Remove ${ROLES[alias].name}`}
                                  onClick={() => removeRole(entry.route, alias)}
                                  className="ml-0.5 rounded p-0.5 text-muted-foreground hover:bg-black/10 hover:text-foreground dark:hover:bg-white/10"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </span>
                          );
                        })}

                        {noEffect && (
                          <p className="w-full text-[11px] leading-4 text-amber-600 dark:text-amber-400">
                            Changes nothing: what it adds or drops either has no
                            Discord id, or already opened every page anyway.
                          </p>
                        )}

                        {!locked && (
                          <>
                            <AddRole
                              disabled={saving}
                              excluded={roles}
                              onPick={(alias) => addRole(entry.route, alias)}
                            />

                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-surface/95 px-4 py-3 shadow-lg backdrop-blur">
        <p className="text-xs text-muted-foreground">
          {dirty
            ? `${changedRoutes.length} ${changedRoutes.length === 1 ? "entry" : "entries"} changed, not saved.`
            : "Nothing changed."}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!dirty || saving}
            onClick={discard}
          >
            Discard
          </Button>
          <Button type="button" size="sm" disabled={!canSave} onClick={save}>
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
