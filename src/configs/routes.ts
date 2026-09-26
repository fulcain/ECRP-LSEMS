/**
 * The app's URL structure, in one place.
 *
 * Every page sits under the sidebar section it belongs to, so the navigation
 * and the route tree describe the same shape:
 *
 *   Workpace   `/workspace/staff`
 *   Divisions  `/divisions/red`, `/divisions/bls`, `/divisions/ftd/<page>`
 *   Operations `/operations/<page>`
 *   Resources  `/resources/<page>`
 *   Management `/management/<page>`
 *   System     `/system/<page>`
 *
 * Import from here rather than typing a path - `ROUTE_ACCESS` in
 * `configs/roles.ts`, the sidebar, the FTD tabs, the 404 page and the login
 * fallback all read these same strings.
 */
export const ROUTES = {
  workspace: {
    staff: "/workspace/staff",
  },
  divisions: {
    red: "/divisions/red",
    bls: "/divisions/bls",
    ftd: {
      /** The section root - redirects to Sessions. */
      base: "/divisions/ftd",
      sessions: "/divisions/ftd/ft-session",
      paperwork: "/divisions/ftd/paperwork",
      command: "/divisions/ftd/fd-command",
      fti: "/divisions/ftd/fti",
    },
  },
  operations: {
    divisionTemplates: "/operations/division-templates",
    templates: "/operations/templates",
  },
  resources: {
    quickLinks: "/resources/quick-links",
    availability: "/resources/availability",
    browserExtension: "/resources/browser-extension",
  },
  management: {
    supervisor: "/management/supervisor",
    /** The live tab-permission editor - CommandPlusTeam and admins only. */
    access: "/management/access",
  },
  system: {
    changelog: "/system/changelog",
  },
} as const;

/**
 * The app's entry point. It has no page of its own: the middleware sends each
 * signed-in member on to the first page their own roles open (see
 * `landingRouteFor` in `lib/role-config.ts`), so login and the 404 page come
 * back here instead of hard-coding one destination that suits only some
 * members.
 */
export const ENTRY_ROUTE = "/";
