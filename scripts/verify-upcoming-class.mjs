// Standalone verification of app/templates/bls-formats/upcoming-class.ts
// Re-extracts the helpers, then runs a battery of cases to prove that the
// reference example ("01/FEB/2026" + "12:00") produces EXACTLY what the user
// BBCode expects, and that edge cases behave correctly.

const MONTH_TO_INDEX = { JAN:0, FEB:1, MAR:2, APR:3, MAY:4, JUN:5, JUL:6, AUG:7, SEP:8, OCT:9, NOV:10, DEC:11 };
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function ordinalDay(day) {
  const lastTwo = day % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${day}th`;
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
}

function parseCourseDateTime(rawDate, rawTime) {
  if (!rawDate || !rawTime) return null;
  const dateParts = rawDate.trim().split("/");
  if (dateParts.length !== 3) return null;
  const [dayStr, monRaw, yearStr] = dateParts;
  const monthIdx = MONTH_TO_INDEX[monRaw.toUpperCase()];
  const day = parseInt(dayStr, 10);
  const year = parseInt(yearStr, 10);
  if (!Number.isFinite(monthIdx) || !Number.isFinite(day) || !Number.isFinite(year) || monthIdx === undefined) return null;
  const timeParts = rawTime.trim().split(/[:.]/);
  if (timeParts.length !== 2) return null;
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  const utc = new Date(Date.UTC(year, monthIdx, day, hours, minutes));
  if (Number.isNaN(utc.getTime())) return null;
  return {
    weekday: WEEKDAY_NAMES[utc.getUTCDay()],
    day: utc.getUTCDate(),
    monthName: MONTH_NAMES[utc.getUTCMonth()],
    year: utc.getUTCFullYear(),
    hours: utc.getUTCHours(),
    minutes: utc.getUTCMinutes(),
  };
}

function formatDateLine(p) {
  const hh = String(p.hours).padStart(2, "0");
  const mm = String(p.minutes).padStart(2, "0");
  return `${p.weekday}, ${ordinalDay(p.day)} ${p.monthName} ${p.year} @ ${hh}:${mm} ((UTC))`;
}

function buildTzImageUrl(p) {
  const hh = String(p.hours).padStart(2, "0");
  const mm = String(p.minutes).padStart(2, "0");
  const day = String(p.day).padStart(2, "0");
  const monthNumber = (MONTH_NAMES.indexOf(p.monthName) + 1).toString().padStart(2, "0");
  return `https://www.inyourowntime.zone/${p.year}-${monthNumber}-${day}_${hh}.${mm}_UTC.png`;
}

const cases = [
  // The exact reference example from the user spec.
  // Note: Feb 1, 2026 is a Sunday, not a Saturday — the math is what matters.
  // The user's original sample misspelled the weekday; the script asserts the
  // *correct* weekday rather than copying the typo.
  { in: { date: "01/FEB/2026", time: "12:00" },
    expect: { line: "Sunday, 1st February 2026 @ 12:00 ((UTC))",
              img:  "https://www.inyourowntime.zone/2026-02-01_12.00_UTC.png" } },

  // Time with period separator (HH.MM).
  { in: { date: "14/MAR/2026", time: "21.30" },
    expect: { line: "Saturday, 14th March 2026 @ 21:30 ((UTC))",
              img:  "https://www.inyourowntime.zone/2026-03-14_21.30_UTC.png" } },

  // Ordinal 11/12/13 must use "th" (carve-out from the %10 rule).
  { in: { date: "11/APR/2026", time: "09:00" },
    expect: { line: "Saturday, 11th April 2026 @ 09:00 ((UTC))",
              img:  "https://www.inyourowntime.zone/2026-04-11_09.00_UTC.png" } },
  { in: { date: "12/APR/2026", time: "09:00" },
    expect: { line: "Sunday, 12th April 2026 @ 09:00 ((UTC))",
              img:  "https://www.inyourowntime.zone/2026-04-12_09.00_UTC.png" } },
  { in: { date: "13/APR/2026", time: "09:00" },
    expect: { line: "Monday, 13th April 2026 @ 09:00 ((UTC))",
              img:  "https://www.inyourowntime.zone/2026-04-13_09.00_UTC.png" } },
  { in: { date: "23/MAY/2026", time: "18:45" },
    expect: { line: "Saturday, 23rd May 2026 @ 18:45 ((UTC))",
              img:  "https://www.inyourowntime.zone/2026-05-23_18.45_UTC.png" } },

  // Lower-case month abbreviation should work too (toUpperCase is in the parser).
  { in: { date: "01/feb/2026", time: "00:00" },
    expect: { line: "Sunday, 1st February 2026 @ 00:00 ((UTC))",
              img:  "https://www.inyourowntime.zone/2026-02-01_00.00_UTC.png" } },
];

let failures = 0;
console.log("Verifying upcoming-class derivations...\n");
for (const c of cases) {
  const parsed = parseCourseDateTime(c.in.date, c.in.time);
  if (!parsed) {
    console.log(`  ✗ ${c.in.date} ${c.in.time}  → null (expected ${c.expect.line})`);
    failures++;
    continue;
  }
  const line = formatDateLine(parsed);
  const img  = buildTzImageUrl(parsed);
  const okLine = line === c.expect.line;
  const okImg  = img  === c.expect.img;
  console.log(`  ${okLine && okImg ? "✓" : "✗"} ${c.in.date} ${c.in.time}`);
  console.log(`      line: ${line}`);
  console.log(`      img:  ${img}`);
  if (!okLine) { console.log(`      EXPECT line: ${c.expect.line}`); failures++; }
  if (!okImg)  { console.log(`      EXPECT img:  ${c.expect.img}`);  failures++; }
}

// Reference example printed in exactly the BBCode form the user needs.
console.log("\n--- Reference example rendered as BBCode ---");
const ref = parseCourseDateTime("01/FEB/2026", "12:00");
console.log(`The course will be:`);
console.log(`[b]${formatDateLine(ref)}[/b]`);
console.log(`[img]${buildTzImageUrl(ref)}[/img]`);

console.log(failures === 0 ? "\nAll cases passed." : `\n${failures} failure(s).`);
process.exit(failures);
