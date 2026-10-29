"use client";

import { useId, useRef, useState, type ComponentProps } from "react";
import { Check, ChevronsUpDown, ExternalLink } from "lucide-react";

import {
  employeeMatchesSearch,
  findEmployeeByName,
  type EmployeeRecord,
} from "@/app/constants/employees";
import { useEmployeeRoster } from "@/components/employees/employee-roster-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { INPUT_LIMITS } from "@/lib/validation";

type EmployeeNameInputProps = Omit<
  ComponentProps<typeof Input>,
  "value" | "onChange" | "list"
> & {
  value: string;
  onChange: (value: string) => void;
  onEmployeeSelect?: (employee: EmployeeRecord) => void;
};

export function EmployeeNameInput({
  id,
  value,
  onChange,
  onEmployeeSelect,
  placeholder = "Search roster or enter a name",
  className,
  "aria-label": ariaLabel,
  ...inputProps
}: EmployeeNameInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customNameSelected, setCustomNameSelected] = useState(false);
  const { employees, loading } = useEmployeeRoster();
  const selectedEmployee = findEmployeeByName(value, employees);
  const showCustomName = !selectedEmployee && (customNameSelected || Boolean(value));
  const listId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const chooseEmployee = (employee: EmployeeRecord) => {
    setCustomNameSelected(false);
    onChange(employee.name);
    onEmployeeSelect?.(employee);
    setSearch("");
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-label={ariaLabel ?? "Employee name"}
            aria-invalid={inputProps["aria-invalid"]}
            disabled={inputProps.disabled}
            className={`w-full justify-between border-border bg-background text-left font-normal text-foreground hover:bg-background ${className ?? ""}`}
          >
            <span className="truncate">
              {selectedEmployee?.name ??
                (value || (customNameSelected ? "Enter a new name…" : ""))}
              {!selectedEmployee && !value && !customNameSelected && (
                <span className="text-muted-foreground">
                  {loading ? "Loading employees…" : "Choose an employee or enter a new name"}
                </span>
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            searchInputRef.current?.focus();
          }}
        >
          <div className="border-b border-border p-2">
            <Input
              ref={searchInputRef}
              aria-label="Search employees by name or callsign"
              placeholder="Search by name or callsign…"
              value={search}
              maxLength={INPUT_LIMITS.name}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div id={listId} role="listbox" aria-label="Employees" className="max-h-64 overflow-y-auto p-1">
            {loading && employees.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">Loading employees…</p>
            ) : (
              <>
                {employees
                  .filter((employee) => employeeMatchesSearch(employee, search))
                  .map((employee) => (
                    <button
                      key={`${employee.callsign}-${employee.name}`}
                      type="button"
                      role="option"
                      aria-selected={selectedEmployee?.name === employee.name}
                      onClick={() => chooseEmployee(employee)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="font-mono text-xs text-muted-foreground">
                            {employee.callsign || "Applicant"}
                          </span>
                          <span>{employee.name}</span>
                        </span>
                        <span className="block text-xs text-muted-foreground">{employee.group}</span>
                      </span>
                      {selectedEmployee?.name === employee.name && (
                        <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  ))}
                {!employees.some((employee) => employeeMatchesSearch(employee, search)) && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    No employees match that name or callsign.
                  </p>
                )}
              </>
            )}
          </div>
          <div className="border-t border-border p-1">
            <button
              type="button"
              onClick={() => {
                setCustomNameSelected(true);
                onChange("");
                setSearch("");
                setOpen(false);
              }}
              className="w-full rounded-md px-2 py-2 text-left text-sm text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
            >
              Enter a new name…
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {showCustomName && (
        <Input
          id={id ? `${id}-custom` : undefined}
          value={value}
          onChange={(event) => {
            const enteredName = event.target.value;
            const employee = findEmployeeByName(enteredName, employees);
            if (employee) {
              chooseEmployee(employee);
              return;
            }
            onChange(enteredName);
          }}
          placeholder={placeholder}
          aria-label={ariaLabel ? `${ariaLabel} (new name)` : "New employee name"}
          {...inputProps}
        />
      )}
      {selectedEmployee && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono text-foreground/80">{selectedEmployee.callsign}</span>
          {selectedEmployee.govProfileUrl && (
            <a
              href={selectedEmployee.govProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              GOV profile <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {selectedEmployee.personnelFileUrl && (
            <a
              href={selectedEmployee.personnelFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              Personnel file <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
