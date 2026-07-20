export const getCurrentDateFormatted = (): string => {
  const now = new Date();
  const day = now.getUTCDate().toString()
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

  let daySuffix = "th";
  if (day === "1") {
    daySuffix = "st";
  } else if (day === "2") {
    daySuffix = "nd";
  } else if (day === "3") {
    daySuffix = "rd";
  }

  return `${month} ${day}${daySuffix}, ${year}`;
};
