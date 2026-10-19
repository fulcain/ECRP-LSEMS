"use client";

import "./globals.css";

/**
 * The last-resort boundary: it replaces the root layout, so it has to render
 * its own <html>/<body>. Kept deliberately dependency-free - this runs when
 * the shell itself failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground antialiased">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            The app could not start this page. Reloading is the quickest way
            back.
          </p>
          {error.digest ? (
            <p className="font-mono text-[11px] text-muted-foreground/70">
              {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
