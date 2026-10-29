"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ExternalLink,
  Clock3,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  EMPLOYEE_GROUPS,
  employeeMatchesSearch,
  type EmployeeGroup,
  type EmployeeRecord,
} from "@/app/constants/employees";
import { useEmployeeRoster } from "@/components/employees/employee-roster-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseEmployeeRecord } from "@/lib/employee-records";
import { EMPLOYEE_DIRECTORY_HANDOFF_KEY, type EmployeeDirectoryHandoff } from "@/lib/employee-directory-handoff";
import { INPUT_LIMITS } from "@/lib/validation";

type GroupFilter = EmployeeGroup | "All";
type DirectoryResponse = {
  employees: EmployeeRecord[];
  canEdit: boolean;
  writable: boolean;
  configured: boolean;
  storedInConfig: boolean;
  sourceError?: string;
};

const blankEmployee = (): EmployeeRecord => ({
  callsign: "",
  name: "",
  group: "EMTs",
  govProfileUrl: "",
  personnelFileUrl: "",
});

function readApplicantHandoff(): EmployeeDirectoryHandoff | null {
  try {
    const raw = window.sessionStorage.getItem(EMPLOYEE_DIRECTORY_HANDOFF_KEY);
    window.sessionStorage.removeItem(EMPLOYEE_DIRECTORY_HANDOFF_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    return {
      name: typeof record.name === "string" ? record.name : "",
      govProfileUrl: typeof record.govProfileUrl === "string" ? record.govProfileUrl : "",
      personnelFileUrl: typeof record.personnelFileUrl === "string" ? record.personnelFileUrl : "",
    };
  } catch {
    return null;
  }
}

export function EmployeeDirectory() {
  const { employees, setEmployees } = useEmployeeRoster();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<GroupFilter>("All");
  const [canEdit, setCanEdit] = useState(false);
  const [writable, setWritable] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [storedInConfig, setStoredInConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savedToConfig, setSavedToConfig] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [draft, setDraft] = useState<EmployeeRecord>(blankEmployee);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<EmployeeRecord | null>(null);

  useEffect(() => {
    let active = true;
    void fetch("/api/employees?initialize=1", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as DirectoryResponse & { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not load the employee roster.");
        if (!active) return;
        setEmployees(data.employees);
        setCanEdit(data.canEdit);
        setWritable(data.writable);
        setConfigured(data.configured);
        setStoredInConfig(data.storedInConfig);
        setLoadError(data.sourceError ?? null);
        const destination = new URL(window.location.href);
        if (destination.searchParams.get("addEmployee") === "1") {
          destination.searchParams.delete("addEmployee");
          window.history.replaceState(
            null,
            "",
            `${destination.pathname}${destination.search}${destination.hash}`,
          );
          const handoff = readApplicantHandoff();
          const candidate = {
            ...blankEmployee(),
            ...(handoff ?? {}),
            group: "Applicants" as const,
          };
          const parsed = parseEmployeeRecord(candidate);
          setDraft(parsed.ok ? parsed.value : candidate);
          setEditingName(null);
          setFormError(handoff && !parsed.ok ? parsed.error : null);
          if (data.canEdit && data.writable) {
            setGroup("Applicants");
            setEditorOpen(true);
          } else {
            toast.info("You can view the employee directory, but your account cannot add roster entries.");
          }
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Could not load the employee roster.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [setEmployees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesGroup = group === "All" || employee.group === group;
      const matchesQuery = employeeMatchesSearch(employee, query);
      return matchesGroup && matchesQuery;
    });
  }, [employees, group, query]);

  const canManage = canEdit && writable;

  function openAdd() {
    setEditingName(null);
    setDraft(blankEmployee());
    setFormError(null);
    setEditorOpen(true);
  }

  function openEdit(employee: EmployeeRecord) {
    setEditingName(employee.name);
    setDraft({ ...employee });
    setFormError(null);
    setEditorOpen(true);
  }

  async function submitEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseEmployeeRecord(draft);
    if (!parsed.ok) {
      setFormError(parsed.error);
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingName ? "edit" : "add",
          currentName: editingName ?? undefined,
          employee: parsed.value,
        }),
      });
      const data = (await response.json()) as {
        employees?: EmployeeRecord[];
        storedInConfig?: boolean;
        unchanged?: boolean;
        error?: string;
      };
      if (!response.ok || !data.employees) {
        throw new Error(data.error ?? "The employee could not be saved.");
      }
      setEmployees(data.employees);
      setStoredInConfig(data.storedInConfig ?? true);
      setSavedToConfig(true);
      setEditorOpen(false);
      toast[data.unchanged ? "info" : "success"](
        data.unchanged ? "No roster changes to save." : "Roster saved.",
      );
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "The employee could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function removeEmployee() {
    if (!pendingDelete) return;
    setSaving(true);
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", currentName: pendingDelete.name }),
      });
      const data = (await response.json()) as {
        employees?: EmployeeRecord[];
        storedInConfig?: boolean;
        error?: string;
      };
      if (!response.ok || !data.employees) {
        throw new Error(data.error ?? "The employee could not be removed.");
      }
      setEmployees(data.employees);
      setStoredInConfig(data.storedInConfig ?? true);
      setSavedToConfig(true);
      setPendingDelete(null);
      toast.success("Roster saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The employee could not be removed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5" aria-labelledby="employee-directory-title">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-primary/10 p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Users className="h-3.5 w-3.5" />
              LSEMS Personnel
            </div>
            <h2 id="employee-directory-title" className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Employee Directory
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Find a member, open their GOV profile, or jump straight to their personnel file.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-background/70 px-4 py-3">
              <span className="font-mono text-2xl font-semibold text-foreground">{employees.length}</span>
              <span className="max-w-20 text-xs leading-tight text-muted-foreground">roster entries</span>
            </div>
            {canManage && (
              <>
                <Button type="button" onClick={openAdd}>
                  <Plus className="h-4 w-4" /> Add employee
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {loadError} The displayed roster may be out of date; reload the page before editing.
        </div>
      )}
      {savedToConfig && (
        <div className="flex items-start gap-3 rounded-xl border border-sky-500/25 bg-sky-500/10 px-4 py-3 text-sm text-sky-900 dark:text-sky-100">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Roster changes can take a few seconds to appear in other sessions. Refresh a page if an already-open employee picker has not updated.
          </p>
        </div>
      )}
      {!configured && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Roster editing is unavailable right now, so the directory is read-only.
        </p>
      )}
      {configured && !storedInConfig && writable && !loadError && (
        <p className="text-xs text-muted-foreground">
          The existing roster will be initialized when an authorized editor opens this page.
        </p>
      )}
      {configured && !storedInConfig && !writable && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Roster setup is incomplete, and editing is currently unavailable.
        </p>
      )}
      {configured && !writable && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Roster changes are currently unavailable.
        </p>
      )}

      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or callsign"
            aria-label="Search employees by name or callsign"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter employees by group">
          {(["All", ...EMPLOYEE_GROUPS] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={group === item}
              onClick={() => setGroup(item)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                group === item
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Personnel roster</h3>
            <p className="text-xs text-muted-foreground">{filteredEmployees.length} of {employees.length} entries</p>
          </div>
          {loading && <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Loading employees" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead className="bg-background/70 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold sm:px-5">Employee</th>
                <th scope="col" className="px-4 py-3 font-semibold">Group</th>
                <th scope="col" className="px-4 py-3 font-semibold">GOV profile</th>
                <th scope="col" className="px-4 py-3 font-semibold">Personnel file</th>
                {canManage && <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {filteredEmployees.map((employee) => (
                <tr key={`${employee.name}-${employee.callsign}`} className="transition-colors hover:bg-background/45">
                  <th scope="row" className="px-4 py-3 text-left font-normal sm:px-5">
                    <div className="flex min-w-48 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                        {employee.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{employee.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{employee.callsign || "No callsign assigned"}</p>
                      </div>
                    </div>
                  </th>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {employee.group}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {employee.govProfileUrl ? (
                      <a href={employee.govProfileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-primary hover:underline">
                        Open profile <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : <span className="text-xs text-muted-foreground">Not added</span>}
                  </td>
                  <td className="px-4 py-3">
                    {employee.personnelFileUrl ? (
                      <a href={employee.personnelFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-primary hover:underline">
                        Open file <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : <span className="text-xs text-muted-foreground">Not added</span>}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(employee)} aria-label={`Edit ${employee.name}`}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setPendingDelete(employee)} aria-label={`Remove ${employee.name}`}>
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground/60" />
                    <p className="mt-3 text-sm font-medium text-foreground">No employees match that search.</p>
                    <p className="mt-1 text-xs text-muted-foreground">Try another name, callsign, or group.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={editorOpen} onOpenChange={(open) => !saving && setEditorOpen(open)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingName ? "Edit employee" : "Add employee"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitEmployee}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee-name">Name</Label>
                <Input id="employee-name" value={draft.name} maxLength={INPUT_LIMITS.name} required onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-callsign">Callsign <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="employee-callsign" value={draft.callsign} maxLength={INPUT_LIMITS.short} onChange={(event) => setDraft({ ...draft, callsign: event.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="employee-group">Group</Label>
                <select
                  id="employee-group"
                  value={draft.group}
                  onChange={(event) => setDraft({ ...draft, group: event.target.value as EmployeeGroup })}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {EMPLOYEE_GROUPS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="employee-profile-link">GOV profile link <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="employee-profile-link" type="url" value={draft.govProfileUrl} maxLength={INPUT_LIMITS.url} placeholder="https://gov.eclipse-rp.net/memberlist.php?..." onChange={(event) => setDraft({ ...draft, govProfileUrl: event.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="employee-file-link">Personnel file link <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="employee-file-link" type="url" value={draft.personnelFileUrl} maxLength={INPUT_LIMITS.url} placeholder="https://gov.eclipse-rp.net/viewtopic.php?..." onChange={(event) => setDraft({ ...draft, personnelFileUrl: event.target.value })} />
              </div>
            </div>
            {formError && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" disabled={saving} onClick={() => setEditorOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{editingName ? "Save changes" : "Add employee"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !saving && !open && setPendingDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove employee?</DialogTitle>
            <DialogDescription>
              {pendingDelete ? `${pendingDelete.name} will be removed from the employee roster.` : "This employee will be removed from the roster."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => setPendingDelete(null)}>Cancel</Button>
            <Button type="button" variant="destructive" loading={saving} onClick={() => void removeEmployee()}>Remove employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
