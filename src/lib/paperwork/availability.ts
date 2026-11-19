/**
 * Whether the Paperwork Maker may run here.
 *
 * It writes project files, so the server answers this and not the browser: a
 * deployment has no checkout to write, and a production build must never be able
 * to change its own source. A page or API route that asks this can only say no in
 * production - hiding the navigation item is not the gate.
 */
export function isPaperworkMakerAvailable(): boolean {
  return process.env.NODE_ENV !== "production" && !process.env.VERCEL;
}
