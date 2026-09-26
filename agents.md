# Agent Instructions

- Do not add a commit signature (e.g., a "Co-Authored-By" or "Generated with" trailer) to commits.

## Git & commit conventions

- Use Conventional Commits for commit messages:
  - `feat:` - new feature
  - `fix:` - bug fix
  - `refactor:` - code restructuring that does not change behavior
  - `docs:` - documentation only
  - `style:` - formatting, missing semicolons, etc.
  - `test:` - adding or updating tests
  - `chore:` - maintenance tasks, dependency updates, tooling
  - `perf:` - performance improvements
  - `build:` - build system or external dependencies
  - `ci:` - CI configuration changes
- Keep the commit subject short, imperative mood, and no trailing period.
- Optional scope: `feat(auth): add password reset`.
- Branch naming:
  - `feat/<short-description>` for features
  - `fix/<short-description>` for bug fixes
  - `refactor/<short-description>` for refactoring
  - `chore/<short-description>` for chores
- Avoid mixing unrelated changes in a single commit; split them into logical commits.

## Coding conventions

### Stack

- Next.js 16 (App Router) + React 19 + TypeScript (`strict`) - server components by default; add `"use client"` only where interactivity requires it.
- Tailwind CSS v4 - style with utility classes; the theme tokens live in `app/globals.css`. Keep custom CSS to a minimum.
- MongoDB for persistence via `lib/store.ts`, falling back to `data/db.json` locally when `MONGODB_URI` is unset.
- Capacitor (Android) and Electron (desktop) are thin shells that load the live web app - don't add web features to `android/` or `electron/`; only `electron/main.cjs` and `electron/preload.cjs` are hand-edited.
- Import with the `@/*` alias (maps to the repo root).

### Structure

- `app/` - routes and server components; server actions in per-feature `*-actions.ts` files (e.g. `actions.ts`, `party-actions.ts`, `admin-actions.ts`).
- `components/` - React components grouped by feature (`ui/`, `parties/`, `admin/`, ...); prefer reusing existing `components/ui` primitives over adding new ones.
- `lib/` - shared logic: `store.ts` (DB), `auth.ts`, `types.ts`, `i18n/`, and `ui.ts` (`cn()`).
- User-facing strings go through `lib/i18n` (`tServer` / `t`) for the fa/en switch - no hardcoded UI text.

### Routes

- **Every page sits under its sidebar section**, and the directory tree mirrors the sidebar exactly: `app/(routes)/divisions/ftd/paperwork`, `app/(routes)/operations/templates`, `app/(routes)/system/changelog`, and so on. A new page goes in the folder of the section it belongs to - don't add a flat top-level route.
- Never type a path in a component. `src/configs/routes.ts` is the `ROUTES` registry; the sidebar, the FTD tab bar, the matrix rows (`ROUTE_META`), the 404 page and the login fallback read from it.
- **Access is the permission matrix - one stored item, not a table in the repository.** `src/configs/access-matrix.ts` declares the *rows* (`ROUTE_META`), and the rules themselves live in the `access-matrix` item of the Vercel Global Config, edited at `/management/access`. A page with no stored row opens to `DEFAULT_PAGE_ROLES` (`Employee`), a stored row *is* the rule for its route and every page beneath it (longest prefix wins, so `/divisions/ftd/fd-command` can be narrower than `/divisions/ftd`), and `EVERY_PAGE_ROLES` is merged back in on every managed page. **Never reintroduce a per-route rule table in `configs/roles.ts`, and never make the repository a second source of a decision** - that duplication is what the matrix replaced.
- **A page is only managed if it is named in `ROUTE_META`**, and `npm run matrix:check` fails when a page in the sidebar or the FTD tab bar has no row, so a new page cannot be added and then forgotten by the editor. A route with no row is not gated at all beyond the employee fallback, which is a wide default, not a safe one.
- **A division's `ranks` list is leadership only, so it is not enough to recognise the division's members.** `membership` names the role everyone in the division holds, so a row meant to admit the whole division has to list both; it is also what `resolveMemberIdentity` reports as `divisionMembership` (the divisions you are in) as opposed to `divisionRanks` (your standing in them), because a generated document's rank line must not print a membership role. FTD deliberately has no `membership`: it is rank-only. A new division needs both fields, or only its leadership can be named.
- `npm run routes:report` prints who each page opens to today, read from the live store (plus the fallback for pages nobody has ruled on), and it typechecks as app code (it imports through the `@/` alias via `scripts/lib/ts-config-loader.mjs`). Run it after changing the matrix or adding a division - it needs no build.
- The entry point `/` has no page. The middleware resolves it per member (`landingRouteFor`) to the first page their roles open, so login and the 404 page send people to `/` instead of one hard-coded destination that only suits some members. Don't add `/` to `redirects()` in `next.config.ts` - a static redirect there intercepts the root before the middleware can run.
- **Never render a nav entry or tab whose `href` the member can't open.** The sidebar is filtered on the server - `app/layout.tsx` runs `filterAccessibleLinks(headerLinks, session.roles, session.discordId)` and passes the allowed hrefs to the client shell - and `app/(routes)/divisions/ftd/layout.tsx` filters the FTD tab bar the same way. Only hrefs travel to the client: nav icons are components and can't cross that boundary, so the client pairs the hrefs with its own icon list rather than deciding access itself.
- When a path moves, add an old-to-new entry to `redirects()` in `next.config.ts` so existing bookmarks and stored `returnTo` values keep working. FTD is one section with a shared tab bar rendered by `app/(routes)/divisions/ftd/layout.tsx`; the per-page layouts beneath it only set metadata.

### Linting

- ESLint 9 flat config (`eslint.config.mjs`) with `eslint-config-next` (core-web-vitals + typescript).
- Run `npm run lint` before finishing. `electron/**` is intentionally ignored (CommonJS main process, Node-style require).

### Type checking & tests

- There is no test suite in this repo yet. Verify changes with:
  - `npx tsc --noEmit` (typecheck)
  - `npm run build` (production build, includes typecheck)
  - `npm run lint`
  - `npm run routes:check` after touching `configs/roles.ts` or the merge in `lib/role-config.ts` - it asserts the shape of the access decision (the employee fallback, the roles no row may lock out, the locked Access Manager, the sidebar agreeing with the gate) and exits non-zero on a regression
  - `npm run matrix:check` after adding a page or touching `configs/access-matrix.ts` - it asserts every page has a row, that the fallback is one role, and that a save can never drop another row's override

### Discord roles

- **One declaration per role.** `src/configs/roles.ts` (`ROLES`) is the only place a Discord role id or display name is written down: `Alias: { id, name }`. It is both the access gate (the matrix names aliases) and the collection the rest of the app reads. Never hand-copy a snowflake or a role name into a constant, a component or a template.
- Everything else derives from it. The ladder (`app/constants/general/ranks.ts`) declares only alias, promotion key and short label, and takes its label and id from the registry; the directors do the same. So adding a rank is one registry entry plus a reference, and renaming one is a single edit that the whole app follows.
- **A division is declared once, in `DIVISIONS` in the same file**: key, `label`, its `ranks` in hierarchy order, its `membership` role, `route` when it has a page, and the `directors` that cover it. Its `route` is the page it owns, not a rule for it - who may open that page is a matrix row like any other - and the `directors` list is what `general/directorRoles.ts` reads back as a director's coverage, so a director's signature and the divisions they cover can't disagree. `ranksForDivision(key)` and `membershipForDivision(key)` are what `app/constants/divisions/*.ts` calls (templates, paperwork and the Staff Page read those rank lists), and `DIVISION_PAGES` in `app/constants/divisions/index.ts` is a full `Record<DivisionKey, DivisionPage>`, so a division declared without a module fails the typecheck. The membership role reaches the division modules through `divisions` (which attaches it alongside `key`) rather than being repeated in each module.
- A rule whose role ids are all blank denies access rather than silently opening, and nothing anywhere guesses a role from its name: an entry with no id is inert. A row naming only id-less ranks therefore closes its page to everyone but HQ, and `npm run routes:report` marks those ranks with `*` while the editor flags every row they appear in.
- The signed-in member's own roles - carried in the session JWT from `guilds.members.read` - are resolved into a rank, division ranks, the divisions they belong to and a director title by `src/lib/member-identity.ts` (pure, no I/O) and served by the `useGuildIdentity` hook. A role whose id is still `null` can never be detected. `heldRoles` is the same resolution the other way round (every role the app can name), and it is what the Staff Page's Discord Profile tab lists - the member's other Discord roles are deliberately not shown.
- `divisionRanks` and `divisionMembership` answer different questions and both are needed: `divisionRanks` is the member's *rank* in a division (what a signature or a generated document prints, and what the Staff Settings tab saves into the per-division dropdowns), while `divisionMembership` is which divisions they are in, rank or not. Filling a signature from `divisionMembership` would print a membership role where a rank belongs; recognising a member by `divisionRanks` alone would hide every division they belong to without a title.
- **Client state and the server-decided shell are two different layers, and a refresh has to move both.** The sidebar, the division tabs and the route gates are decided on the server from the `ftd_auth` cookie; `useGuildIdentity` resolving new roles cannot reach them. So a re-read that moves the roles calls `router.refresh()` (`hooks/useGuildIdentity.ts`) - without it, a section the member just gained or lost stays wrong on the current page until they navigate or sign out and back in, which is what "I had to log in again" means. An RSC refresh is cheap: the middleware sees no document load and the cookie was just re-signed, so it makes no Discord call of its own.
- **Refreshes come in two strengths and the button gets the strong one.** `refreshSessionIfStale` treats `explicit: true` (only `/api/auth/refresh`, only ever from a button) as "a person asked", which skips the age throttle entirely; `force` (a document load, `/api/auth/me?refresh=1`) keeps the short window and everything else waits out the long one. The throttles are there to stop automatic reads from looping into Discord - they must never swallow a click, because a click answered from cache is indistinguishable from a broken feature.
- **A refresh returns an outcome, not a nullable payload.** `RefreshResult` is `{ ok: true, payload, token } | { ok: false, reason }`, and `reason` is one of `no-refresh-token | throttled | not-configured | left-guild | discord-error`. Never collapse these back into a silent `null`: the whole reason "the button does nothing" survived several rounds of fixes is that a failed refresh and a no-op refresh looked identical from the outside. `no-refresh-token` in particular is permanent for that session - the cookie lasts a hundred years, so the member has to sign in again, and the UI has to tell them so.
- **A panel that shows what Discord said must not disappear when Discord says nothing.** `StaffSettingsCard` gates the detected panel on "Discord answered" (a user in the session), never on "something was found": gating it on findings removed the panel, the Sync button and any explanation at exactly the moment a member deleted their last role, which read as the feature breaking. Show the empty state instead, with the button still there.
- **Merging Discord's answer into the Staff Page's saved values is a policy, and it lives in `lib/staff-sync.ts` as pure functions.** `"fill"` (the automatic pass) only writes what Discord reports; `"replace"` (the Sync button) also clears what it no longer reports. Never make the automatic pass authoritative: it cannot tell "the member holds no rank" from "this rank's id isn't in the registry", so clearing there would erase a real member's rank. The mirror rule applies to a division: a saved division rank is only cleared when the member is not in that division at all (`divisionMembership`), never merely because no rank was detected in it.
- **A page load refreshes the session.** The middleware calls `refreshSessionIfStale` (in `lib/session-refresh.ts`, which imports no `next/headers`, so it works in the Edge runtime) on every document request, forces a current read there, and continues with the refreshed payload - so a rank granted in Discord opens its pages on that reload instead of at the next sign-in. Two things are easy to break and worth knowing: the response must also *forward* the re-signed cookie in the request headers (`NextResponse.next({ request: { headers } })`), because server components read the cookie off the request and would otherwise render the old roles on that load; and the throttle (`SESSION_REFRESH_INTERVAL_SECONDS` for background fetches, `FORCED_REFRESH_MIN_INTERVAL_SECONDS` for a load or an explicit read) is what keeps a reload loop from becoming a Discord loop. A failed refresh must always fall back to the cached session - stale roles, never a sign-out.
- **The Staff Page is the source of truth for a member's own details.** Name, signature, rank and director role are saved there (`MedicContext`), and tools read them instead of asking again: `useHighestRank` prefers the saved rank over Discord detection, the FTD paperwork session seeds its signature from it, and the FTD email cards and FTI page read their sender identity straight from `useMedic()` (FTD rank from `divisionRanks`). Add a rank or signature field by reading `useMedic()`, never by asking the member to retype one.
- Never hand-copy a role snowflake into a component, a constant or a template: `src/configs/roles.ts` is the one place an id lives, and it is edited by hand. There is deliberately no sync script - the app is the check. The session refresh re-reads the member's roles on every page load and the registry resolves them, so a stale or wrong id shows up immediately as a member losing the pages their rank should open.
- `id: null` means "the guild has no such role" (or none worth gating on), not "not collected yet". Never invent an id to make a gate appear to work, and never hand-copy one into a component: the registry entry is the id's only home.

### Comments

- Keep comments short and explain *why*, not *what*. Don't write long comments narrating what the code does or what happened - the code should speak for itself. Reserve comments for non-obvious decisions, invariants, and gotchas.
