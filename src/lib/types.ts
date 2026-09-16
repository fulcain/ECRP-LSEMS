/**
 * Row shape shared by every pivot/CSV-backed table in the app (FT sessions,
 * employee stats, EMRs, monthly session stats).
 *
 * The source data arrives as a parsed CSV/Sheets grid, so rows are
 * string-keyed maps rather than a rigid model. Kept in `lib` so tables and
 * the routes that render them share one definition instead of each page
 * redeclaring it.
 */
export type TableDataType = {
  [key: string]: string | number;
};
