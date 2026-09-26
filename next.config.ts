import type { NextConfig } from "next";

const clientEnv: Record<string, string> = {};
for (const key of ["DIVISIONAL_AGENDA_URL", "SUPERVISOR_AGENDA_URL"]) {
  const value = process.env[key];
  if (value) clientEnv[key] = value;
}

const nextConfig: NextConfig = {
  env: clientEnv,
  async redirects() {
    return [
      // `/` is deliberately not here: the middleware owns the entry point and
      // sends each member to the first page their own roles open. A static
      // redirect would intercept the root before it could.

      // Every page moved under its sidebar section. The old flat URLs stay as
      // permanent redirects so bookmarks, paperwork links and old login
      // `returnTo` values keep working.
      { source: "/staff", destination: "/workspace/staff", permanent: true },
      { source: "/red-formats", destination: "/divisions/red", permanent: true },
      { source: "/bls-formats", destination: "/divisions/bls", permanent: true },
      { source: "/ft-session", destination: "/divisions/ftd/ft-session", permanent: true },
      { source: "/paperwork", destination: "/divisions/ftd/paperwork", permanent: true },
      { source: "/fd-command", destination: "/divisions/ftd/fd-command", permanent: true },
      { source: "/fti", destination: "/divisions/ftd/fti", permanent: true },
      {
        source: "/email-templates",
        destination: "/operations/division-templates",
        permanent: true,
      },
      { source: "/templates", destination: "/operations/templates", permanent: true },
      { source: "/quick-links", destination: "/resources/quick-links", permanent: true },
      { source: "/availability", destination: "/resources/availability", permanent: true },
      { source: "/supervisor", destination: "/management/supervisor", permanent: true },
      // The FTD section itself lands on its first page.
      {
        source: "/divisions/ftd",
        destination: "/divisions/ftd/ft-session",
        permanent: true,
      },

      // Older still: URLs from before the LSEMS merge, kept working.
      { source: "/change-log", destination: "/system/changelog", permanent: true },
      { source: "/changelog", destination: "/system/changelog", permanent: true },
      { source: "/ftd", destination: "/divisions/ftd/ft-session", permanent: true },
      {
        source: "/upcoming-course",
        destination: "/divisions/bls?tab=upcoming-course",
        permanent: true,
      },
    ];
  },
  images: { domains: ["i.imgur.com", "i.vgy.me", "i.ibb.co"] },
  // The download route and the installer page read `extension/` off disk, so the
  // folder has to travel with the build - without this they work in dev and find
  // nothing once deployed.
  outputFileTracingIncludes: {
    "/api/extension": ["./extension/**/*"],
    "/resources/browser-extension": ["./extension/**/*"],
  },
};

export default nextConfig;
