export const getCurrentDateFormatted = (): string => {
  const now = new Date();
  const day = now.getUTCDate().toString().padStart(2, "0");
  const monthNames = [
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
  const month = monthNames[now.getUTCMonth()];
  const year = now.getUTCFullYear();
  return `${day}/${month}/${year}`;
};
