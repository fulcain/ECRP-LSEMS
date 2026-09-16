import Link from "next/link";
import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "LSEMS | Access Denied",
  description: "Your Discord account doesn't have access to this page.",
};

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string; reason?: string; division?: string }>;
}) {
  const sp = await searchParams;
  const path = sp.path ?? "this page";
  const reason = sp.reason;
  // Set by the middleware when the refused page belongs to a division, so the
  // message says *whose* page it is instead of leaving people guessing.
  const division = sp.division;

  const heading =
    reason === "not_in_guild"
      ? "You're not in the ECRP Discord server"
      : "Access denied";

  const body =
    reason === "not_in_guild" ? (
      <>
        Your Discord account isn&apos;t a member of the ECRP server, so it
        can&apos;t be granted access.{" "}
        <Link
          href={
            process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.com/"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium hover:underline"
        >
          Join the server
        </Link>
        , then{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          sign in again
        </Link>
        .
      </>
    ) : (
      <>
        Your Discord account doesn&apos;t have a role that grants access to{" "}
        <code className="rounded bg-surface-hover px-1.5 py-0.5 text-xs">{path}</code>
        {division ? (
          <>
            {" "}
            - that page belongs to the{" "}
            <span className="font-medium text-foreground">{division}</span>{" "}
            division, so one of its Discord roles is required.
          </>
        ) : (
          "."
        )}{" "}
        Contact an LSEMS administrator to request the appropriate role.
      </>
    );

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-border/40 bg-surface p-8 text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/20">
            <ShieldAlert className="h-6 w-6 text-amber-500" />
          </div>
          <h1 className="text-lg font-semibold">{heading}</h1>
        </div>

        <p className="text-sm text-muted-foreground">{body}</p>

        <div className="flex flex-col gap-2 pt-4 border-t border-border/30">
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full rounded-md bg-primary text-primary-foreground font-medium text-sm py-2.5 px-4 hover:opacity-90 transition-opacity"
          >
            Sign in with a different account
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}