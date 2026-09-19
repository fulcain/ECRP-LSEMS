import { ENTRY_ROUTE } from "@/configs/routes";
import Link from "next/link";
import { Home } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

/**
 * /not-found (Next.js built-in)
 *
 * Rendered whenever a route is not matched or notFound() is called.
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 text-card-foreground shadow-2xl">
        <div className="flex flex-col items-center gap-3">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-hover text-3xl font-bold text-muted-foreground">
            404
          </span>
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="text-center text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href={ENTRY_ROUTE}
            className="inline-flex items-center justify-center gap-2 w-full rounded-md bg-primary text-primary-foreground font-semibold py-2.5 px-4 hover:opacity-90 transition-opacity"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
