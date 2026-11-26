/**
 * Whether the Paperwork Maker may run here.
 *
 * File generation is development-only. A configured MongoDB store also enables
 * the AMU editor on deployment, where saves update data rather than source files.
 */
export function isPaperworkMakerAvailable(): boolean {
  return (
    (process.env.NODE_ENV !== "production" && !process.env.VERCEL) ||
    Boolean(process.env.MONGODB_URI)
  );
}
