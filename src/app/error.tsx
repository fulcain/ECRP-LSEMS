"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { ENTRY_ROUTE } from "@/configs/routes";
import { Button } from "@/components/ui/button";

/**
 * The route error boundary. Without one, any render error fell through to
 * Next's own screen, which leaves the shell and offers no way back.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-5 rounded-xl border bg-card p-8 text-center text-card-foreground shadow-2xl">
        <div className="flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertOctagon className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            This page could not be rendered. Trying again usually helps; if it
            keeps failing, report it from the Report Form.
          </p>
          {error.digest ? (
            <p className="font-mono text-[11px] text-muted-foreground/70">
              {error.digest}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Button type="button" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="ghost">
            <Link href={ENTRY_ROUTE}>Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
