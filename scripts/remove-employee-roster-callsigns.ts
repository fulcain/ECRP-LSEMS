import {
  EMPLOYEE_ROSTER_KEY,
  type EmployeeRecord,
} from "@/app/constants/employees";
import { parseEmployeeRoster } from "@/lib/employee-records";
import {
  readGlobalConfigItem,
  writeGlobalConfigItem,
} from "@/lib/global-config-store";

const read = await readGlobalConfigItem(EMPLOYEE_ROSTER_KEY, {
  consistentRead: true,
});
if (!read.ok) throw new Error("Could not read the employee roster config.");
if (!Array.isArray(read.value)) {
  throw new Error("The employee roster config is missing or is not a list; nothing was changed.");
}

const validation = parseEmployeeRoster(read.value);
if (!validation) throw new Error("The employee roster is invalid; nothing was changed.");

const rosterWithoutCallsigns = read.value.map((entry) => {
  const { callsign: _removed, ...employee } = entry as EmployeeRecord & {
    callsign?: unknown;
  };
  return employee;
});
const removedCount = read.value.filter(
  (entry) =>
    entry !== null &&
    typeof entry === "object" &&
    Object.prototype.hasOwnProperty.call(entry, "callsign"),
).length;

if (removedCount === 0) {
  console.log("The employee roster already has no callsign fields.");
} else {
  const write = await writeGlobalConfigItem(
    EMPLOYEE_ROSTER_KEY,
    rosterWithoutCallsigns,
  );
  if (!write.ok) throw new Error("Could not save the employee roster migration.");

  const verify = await readGlobalConfigItem(EMPLOYEE_ROSTER_KEY, {
    consistentRead: true,
  });
  if (!verify.ok || JSON.stringify(verify.value) !== JSON.stringify(rosterWithoutCallsigns)) {
    throw new Error("The roster migration could not be verified.");
  }
  console.log(`Removed callsign fields from ${removedCount} roster records; all other record data was preserved.`);
}
