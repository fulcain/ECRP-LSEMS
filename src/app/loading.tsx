import { Loader2 } from "lucide-react";

/**
 * The page-level loading state. Server components read the store on every
 * navigation, and this keeps the wait visible instead of leaving the previous
 * page on screen with no sign anything is happening.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex min-h-screen items-center justify-center"
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
