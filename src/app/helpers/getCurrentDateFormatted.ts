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
