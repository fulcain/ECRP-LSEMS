"use client";

import { useSearchParams } from "next/navigation";
import { MessageCircleWarning } from "lucide-react";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { DEFAULT_RETURN_TO } from "@/lib/cookies";

/**
 * Client island for /login. Reads ?returnTo / ?error / ?reason / ?loggedOut
 * and renders the appropriate CTA.
 *
 * Kept as a separate client component because `useSearchParams` requires
 * a Suspense boundary on the page (see Next 15 docs on Client Components
 * in a Server Component).
 */
export function LoginButton() {
  const params = useSearchParams();
  const returnTo = params.get("returnTo") ?? DEFAULT_RETURN_TO;
  const reason = params.get("reason");
  const error = params.get("error");
  const loggedOut = params.get("loggedOut");

  const loginHref = `/api/auth/discord/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <div className="flex flex-col gap-3">
      {loggedOut === "1" && (
        <p className="text-sm text-muted-foreground text-center">
          You&apos;ve been signed out.
        </p>
      )}
      {reason === "expired" && (
        <p className="text-sm text-amber-600 dark:text-amber-500 text-center flex items-center justify-center gap-2">
          <MessageCircleWarning className="h-4 w-4" />
          Your session expired. Please sign in again.
        </p>
      )}
      {error && <ErrorBanner error={error} />}

      <a
        href={loginHref}
        className="inline-flex items-center justify-center gap-2 w-full rounded-md bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold py-3 px-4 transition-colors shadow-md"
      >
        <DiscordIcon className="w-5 h-5" />
        Continue with Discord
      </a>
    </div>
  );
}

function ErrorBanner({ error }: { error: string }) {
  const messages: Record<string, string> = {
    config:
      "OAuth is not configured correctly on the server. Contact an admin.",
    missing_params: "Discord's response was missing parameters. Try again.",
    bad_state:
      "Could not verify the OAuth response (state mismatch). Try again.",
    callback_failed:
      "Discord callback failed. Try again, and contact an admin if it persists.",
    access_denied: "You declined the authorization. Try again to continue.",
  };
  const msg = messages[error] ?? `OAuth error: ${error}`;
  return (
    <p className="text-sm text-red-600 dark:text-red-500 text-center flex items-center justify-center gap-2">
      <MessageCircleWarning className="h-4 w-4" />
      {msg}
    </p>
  );
}


