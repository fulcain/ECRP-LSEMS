const DAY_SUFFIXES = ["th", "st", "nd", "rd"];

export const getCurrentDateFormatted = (): string => {
  const now = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[now.getUTCMonth()];
  const year = now.getUTCFullYear();

  // 11th-13th take "th"; the teens are the exception to the 1/2/3 rule.
  const day = now.getUTCDate();
  const suffix = day % 100 === 11 || day % 100 === 12 || day % 100 === 13
    ? "th"
    : DAY_SUFFIXES[Math.min(day % 10, 4)];

  return `${month} ${day}${suffix}, ${year}`;
};

const SHORT_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/**
 * Today as the forum's short date - `01/OCT/2026`, the DD/MMM/YYYY a
 * completion or hire line carries. Padded to two digits, like the format asks.
 */
export const getCurrentDateShort = (): string => {
  const now = new Date();
  const day = now.getUTCDate().toString().padStart(2, "0");
  return `${day}/${SHORT_MONTHS[now.getUTCMonth()]}/${now.getUTCFullYear()}`;
};
