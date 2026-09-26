This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser - the app has no `/` page, so `/` redirects to FT Sessions, which redirects you to `/login` until you sign in.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Routes

Every page lives under the sidebar section it belongs to, and the directory tree mirrors the sidebar exactly:

```text
/workspace/staff               Workspace
/divisions/red                 Divisions  RED
/divisions/bls                 Divisions  BLS
/divisions/ftd                 Divisions  FTD  (redirects to its first tab)
/divisions/ftd/ft-session                     tab: Sessions
/divisions/ftd/paperwork                      tab: Paperwork
/divisions/ftd/fd-command                     tab: Command
/divisions/ftd/fti                            tab: FTI
/operations/division-templates Operations
/operations/templates          Operations
/resources/quick-links         Resources
/resources/availability        Resources
/management/supervisor         Management
/system/changelog              System
```

Nothing hardcodes these strings. `src/configs/routes.ts` is the single `ROUTES` registry - the sidebar, the FTD tab bar, the matrix rows in `src/configs/access-matrix.ts`, the 404 page and the login fallback all import from it, so a path changes in one place.

The FTD tabs are links between those four routes, and their bar renders once from `src/app/(routes)/divisions/ftd/layout.tsx` - the per-page layouts underneath only set metadata. Every pre-nesting URL (`/paperwork`, `/ft-session`, `/staff`, `/red-formats`, ...) is still a permanent redirect in `next.config.ts`, so bookmarks and older `returnTo` values keep working.

The app's entry point, `/`, has no page of its own: the middleware sends each member to the first page their own roles open (FT Sessions for a trainer, a division page for a divisional rank holder, the Supervisor tools for a supervisor, the Staff Page otherwise), which is why login and the 404 page both come back to `/` instead of hard-coding a destination that suits only some members. `/` is deliberately absent from the `redirects()` list above, since a static redirect would intercept it before the middleware could resolve it. The sidebar's own brand links there for the same reason - pointing it at one section would send everyone else to an access-denied page.

`npm run routes:report` prints the route tree and who each page opens to, read from the config itself - see [Who can open what](#who-can-open-what).

## Discord role IDs

Every role id and every role display name the app uses is declared once, in `src/configs/roles.ts`:

```ts
HeadOfBLS: { id: "123456789012345678", name: "Head of BLS" },
```

That one registry is both the **gate** - the permission matrix names aliases, and `userHasAccess` resolves them to those snowflakes - and the **collection**: the department ladder (`app/constants/general/ranks.ts`), every division's rank list, the directors (`general/directorRoles.ts`) and the staff and paperwork templates read their id *and* their display name from it.

A division is declared once too, in `DIVISIONS` in the same file: its label, its ranks in hierarchy order, and - when it has a page - the route that page lives at.

```ts
bls: {
  label: "Basic Life Support",
  route: ROUTES.divisions.bls,
  ranks: ["HeadOfBLS", "InterimHeadOfBLS", ...],
},
```

Everything else follows from that one declaration:

- **the page is gated** on those ranks, so a divisional rank is what identifies a member inside their own division - see *Division access* below;
- `ranksForDivision("bls")` hands `app/constants/divisions/bls.ts` its rank list, so a division file never spells a role out:

  ```ts
  ranks: ranksForDivision("bls"),
  ```

- `app/constants/divisions/index.ts` builds the app's division list from it, so the division selector, the Quick Links page and the Staff Page follow `DIVISIONS` order, and a division marked `dormant` (CRU today) stays out of the app.

Adding a division is therefore one entry in `DIVISIONS` plus a module for its artwork and forum links - and `DIVISION_PAGES` is typed as a full record of the division keys, so declaring one without a module is a compile error rather than a page that quietly disappears.

Adding a *role* is one registry entry plus a reference to it, and renaming one is a single edit. `id: null` means the guild has no such role - see [Maintaining the registry](#maintaining-the-registry).

The member-facing side reads the same registry from the other direction: the roles a signed-in member holds ride in their session (`guilds.members.read`, refreshed on every page load - see *Staying current with Discord* below), and `src/lib/member-identity.ts` turns them into a rank, their division ranks and a director title. The Staff Page writes what Discord says into its saved fields on each load, and offers a **Sync from Discord** button for an immediate re-check (`useGuildIdentity`). A role with no id can't be detected, so a member holding only such roles is simply unknown to the rank tools - which is how a wrong id announces itself.

### Staying current with Discord

A rank granted in Discord shows up on the next page load, without signing out and back in. Three things make that true:

- **The middleware refreshes the session on a page load.** It re-reads the member's profile and guild roles, re-signs the `ftd_auth` cookie and sets it on the response - and, because a page reads the cookie off the *request*, it forwards the refreshed one in the request headers too, so the sidebar, the route gates and the page itself all decide with the same current roles. A promotion therefore opens the newly-granted pages on that very reload, not the one after it.
- **Automatic reads are spaced out.** `lib/session-refresh.ts` allows one Discord round-trip per member per `SESSION_REFRESH_INTERVAL_SECONDS` (60) on a normal load, and a much shorter `FORCED_REFRESH_MIN_INTERVAL_SECONDS` (5) when something asks for a current read - a document load, or `GET /api/auth/me?refresh=1`. Parallel requests for the same member share one round-trip, which also keeps Discord's rotating refresh token safe.
- **A button is not throttled at all.** Sync from Discord and Re-read from Discord both post to `/api/auth/refresh`, the one caller that passes `explicit: true`, so it always asks Discord instead of answering from cache. The throttles exist to stop *automatic* reads from looping; answering a deliberate click with the roles it already had is the one outcome that reads as the feature being broken.
- **A change re-renders the route.** The sidebar, the division tabs and the route gates are decided on the *server*, from the cookie the refresh just re-signed - client state cannot reach them. When a re-read moves the roles, the hook calls `router.refresh()`, so a section just gained (or lost) appears without a navigation or a sign-out.
- **Nothing can end the session.** If the refresh token is missing, revoked, or Discord is unreachable, the app keeps the cached session: stale roles, never a forced sign-out. That failure is logged once per member rather than on every page load.
- **A refresh that can't happen says so.** Every read reports why it did or didn't happen (`ok`, `no-refresh-token`, `throttled`, `not-configured`, `left-guild`, `discord-error`), and the Staff Page prints the answer under the button. This matters most for `no-refresh-token`: the session cookie lives for a hundred years, so a sign-in minted before the app stored a refresh token could never be re-read - not on a page load, not by the button. That used to look like a broken feature; now it says which it is and offers the one thing that fixes it (signing in again, which Discord completes silently via `prompt=none`).

### Who can open what

**Access is the permission matrix, not a table in the repository.** The rules live
in one item - `access-matrix` in the Vercel Global Config - and are edited in the
app at `/management/access`. `src/configs/roles.ts` declares roles and divisions;
it no longer says which page opens to which rank, so there is no second copy of a
decision to drift out of step or to argue with the editor, and changing access
does not need a deploy.

What the code does still decide, because the store must not be able to:

| rule | why |
| --- | --- |
| a page with no stored row opens to `Employee` | so a missing row - or an unreadable store - widens access instead of closing the app |
| `EVERY_PAGE_ROLES` (the Command ranks and `CommandPlusTeam`) keeps every page | a row decides who *else* gets in; it can never lock HQ, or the team running the matrix, out of the app |
| `/management/access` is `CommandPlusTeam` only, and is never stored | the page that decides access cannot be opened, closed or granted from inside itself |
| a `DISCORD_ADMIN_IDS` entry opens everything | the developer's way in, independent of Discord |

Everything else is a row. `npm run routes:report` prints the live answer, read
from the store itself (`--env-file-if-exists=.env`), so it can't drift from what
the middleware enforces:

```text
Pages, and who each one opens to today
  Sessions  (/divisions/ftd/ft-session)
      Head of FTD, Assistant Head of FTD, Field Training Instructor, ...
      14 Discord ids can open it  [stored]
  Staff Page  (/workspace/staff)
      Employee
      9 Discord ids can open it  [no row: the fallback]
```

**Belonging to a division is not the same as holding a rank in it.** A division's
`ranks` list names only its leadership, so an ordinary member - who holds "BLS
Division" or "Recruitment and Employment Division" and no rung at all - is
recognised through the division's `membership` role instead. A row that should let
a division in usually wants both: its leadership ranks *and* its membership role.
`membership` is also what the Staff Page reads to say which divisions you are in.

A division with no membership role (FTD today) is rank-only by design, so its
rows name its ranks and nothing else.

A director's coverage is written once, on the division
(`directors: ["DirectorOfAdministration"]`), and `general/directorRoles.ts` reads
the same fact the other way round - so the divisions a director's signature says
they cover can't disagree with each other.

A `*` in the report marks a rank whose id is `null`. The gate cannot see such a
rank, so listing it in a row does nothing, and a row naming *only* id-less ranks
closes the page to everyone but HQ - the editor flags both cases. When someone is
refused, the middleware passes the division to `/unauthorized`, which names it:
"that page belongs to the Field Training division" beats a bare "access denied".

`npm run routes:check` asserts the shape of that decision - the fallback, the
merge, the locked page, and the sidebar answering the same question as the gate -
and exits non-zero if a change ever contradicts it.

### Maintaining the registry

`src/configs/roles.ts` is edited by hand. There is no import step and no sync script: a new rank, division or director is one entry in that file, and a renamed role is one edit that the divisions, the ladder, the signature text, the paperwork dropdowns and every matrix row all follow. A division needs two fields beside its `ranks`: the `route` of the page it owns, and the `membership` role its ordinary members hold - without the second, only its leadership can be named in a row.

Nothing has to be kept in step by a tool, because the app checks the ids itself. On every page load the session refresh re-reads the member's roles from Discord and the registry resolves them (`src/lib/member-identity.ts`): a role whose id is wrong simply never matches its holder, who loses the pages it opens and sees a rank the app can't confirm. `npm run routes:report` shows every rank the matrix names that has no id, and the editor flags the rows they are listed in.

`id: null` means "this rank has no Discord role" rather than "not collected yet" - an entry with no id is inert, it can't identify anyone, and it is skipped when the app resolves roles. It is the honest state for a rank the guild doesn't have (the interim rungs, the trainee rungs), and it is safe: a gated route whose required ids are all blank denies rather than silently opening.

### Seeing only what you can open

The navigation is filtered with the same rules as the routes. `src/app/layout.tsx` reads the session and runs `filterAccessibleLinks(headerLinks, ...)`, so the sidebar receives only the pages that member may open - signed out, that list is empty and the sidebar renders no navigation at all. The FTD tab bar works the same way in its section layout: an instructor sees Sessions and Paperwork, while the Command and FTI tabs are never rendered for them.

The decision is the server's, because a nav item's icon is a component and components can't cross into the client sidebar. So the layout sends hrefs and the shell pairs them with its own icons - both reading the one matrix, which is what stops a route from being reachable by URL but invisible in the nav, or listed for someone the gate would refuse.

### The live permission matrix

`/management/access` lets `CommandPlusTeam` (and any `DISCORD_ADMIN_IDS` developer) decide which ranks may open which tabs and pages, and the change takes effect for everyone within a few seconds - no deploy, no restart.

The rows are declared in `src/configs/access-matrix.ts` (`ROUTE_META`), and the ranks it can grant are every alias in the registry - a ladder rung, a division's rank or membership role, or one of the guild roles nothing gates on. A rank the app can name is a rank the matrix can grant, and `npm run matrix:check` fails if a page in the sidebar or the FTD tab bar has no row.

Because the FTD section gets a row of its own, an entry on it applies to every FTD page that has no row of its own, and an entry on a tab narrows just that tab.

Three rules keep it honest:

- **a row is the whole rule**, which is what "these ranks and no others" means - and a page with no row opens to every employee rather than to nobody;
- **no row can take a page from HQ**, because `EVERY_PAGE_ROLES` is merged back in on every managed page - the Command ranks *and* `CommandPlusTeam`, so the matrix cannot lock the team that administers it out of the app either;
- **the Access Manager is locked**, and is the one page the Command ranks are *not* merged into and the one page a stored row may never touch - it is shown in the editor but can never be edited, so the page that decides access can't be edited (or granted) away by the people using it. A rank with no Discord id is flagged in the editor, because granting it would do nothing.

Only the rows someone actually changed are stored. Everything else keeps following `configs/roles.ts`, so a later registry edit still flows through.

**A row can be stored and still move nobody**, and the editor says so: it resolves a row's ranks to Discord ids and, if the result is the same set the default already opens, marks the row "no effect". There are two ways to get there - the ranks it adds or drops have no id (so the gate never recognised them), or they are ranks that keep every page anyway. Without that verdict a stored row looks like a real decision that appears to do nothing, which is how a working store reads as a broken one.

**`access-matrix.json`** at the repo root is the paste-ready value for the store's `access-matrix` item: the live matrix in one file, so the store can be restored - or set up on a new Vercel project - without walking the editor. It is a record of what is stored, not a second source of truth; the app reads the store, and every row in it is a pinned row.

#### How a save works

Three properties matter, and all three exist because the alternative was silent data loss:

1. **One item, one write.** The store holds the whole matrix under a single key (`access-matrix`), and a save is an upsert of *that key only* - never `PATCH` of the whole config. Rewriting items nobody touched would be a way to destroy them for no gain, and there is nothing to gain: the failure modes here are a bad token, a bad scope or no network, and none of those improve by writing more keys. One item also means a save either lands complete or not at all.
2. **The payload is the whole override set**, not the rows edited in this session. The item is *replaced*, so a "what just changed?" diff would discard every override made in an earlier visit.
3. **It won't overwrite something it hasn't read.** The editor sends what it loaded (`base`), the route re-reads the stored value and compares: if they differ, the save is refused with a `409` and the current value returned, and the editor offers to load the latest. A store that cannot be read refuses the write too rather than treating an unreadable store as an empty one. Without this the store is last-write-wins, and two people editing at once means the slower save silently crumples the faster one's rows.


**Where it lives, and why.** The decision has to be made in the middleware, which runs on the Edge runtime - a database read there would put a network hop in front of every navigation. The matrix is therefore stored in a **Vercel Global Config** (formerly Edge Config): globally replicated, readable from Edge in milliseconds, updates visible in seconds. Reads use the SDK and `GLOBAL_CONFIG`; writes use the Vercel REST API with `VERCEL_API_TOKEN`, only ever from the editor's API route on the Node runtime.

**With no store configured the app is unchanged**: every page follows `configs/roles.ts`, the editor says so, and saving is disabled. That is deliberate - an unset, empty or unreachable store must never be what closes a page.

`npm run matrix:check` asserts that every row the editor offers is a page the app really has, that it is labelled the way the sidebar or the tab bar labels it, and that the defaults are the registry's own rather than a second copy - so the editor can gain a code change without silently gaining a decision that does nothing.

#### Connecting the store

Four environment variables. The first is written for you when you create the store; the rest are yours to add, and only the first is needed for the app to *read* a matrix:

| variable | what it is |
| --- | --- |
| `GLOBAL_CONFIG` | the **connection string** (config id + a read token). Created automatically when the store is connected to the project. Reads use it, in the middleware. |
| `GLOBAL_CONFIG_ID` | the config's id - shown on the store's page (its **Tokens** tab, and its URL). Required to write. |
| `VERCEL_API_TOKEN` | a Vercel access token that may update that config. Required to write. |
| `VERCEL_TEAM_ID` | only for a **Full Account** token whose config lives in a team. A team- or project-scoped token infers the team, so leave this unset. Found at `vercel.com/teams/<team-slug>/settings#team-id`, or team dashboard → Settings → General → Team ID. |

One-time setup:

1. Open the project in the Vercel dashboard, click **Storage** → **Create Storage** → **Global Config**, name it, and create it. Vercel generates the read token, the connection string and the `GLOBAL_CONFIG` environment variable, so **the read side needs nothing from you**. (Creating it at the account level instead leaves it unconnected until you attach a project, and no variables are made until then.)
2. Copy the config's id into `GLOBAL_CONFIG_ID` — **on the project**, not only in your local `.env`, or saving works locally and fails in production.
3. Create an access token and set it as `VERCEL_API_TOKEN`. Scope it to the **team that owns the project** (scope → team → *All Projects*), or to **Full Account** if the project is on a personal account. Copy it immediately — Vercel shows the value once.
4. Redeploy so the new variables reach the running app, then open `/management/access`.

For local development, `vercel env pull` brings `GLOBAL_CONFIG` down into `.env` (and, since reads go over the public internet when you develop locally, expect higher latency than production).

Without `GLOBAL_CONFIG` the editor renders read-only with a setup banner; without the two write variables it renders with a "store is read-only from here" banner. Either way the rest of the app is unaffected.


## Staff Page

The Staff Page (`/workspace/staff`) is where a member says who they are, and it has two tabs:

- **Staff Settings** - name, signature, rank and director role, plus their saved rank in every division. What Discord says is written in on every page load, so a promotion lands here without pressing anything; anything Discord can't see (a division whose ranks have no ids) is left as it was set. The detected panel lists every division the member belongs to, marked "Division member" where they hold the division's role without a rank in it.

  **Sync from Discord** asks Discord for the member's roles on the spot and then makes the saved values match the answer - *including clearing* a rank or division it no longer reports, so deleting a role in Discord actually removes it here. The automatic pass can only add, because it must not mistake "Discord can't see this rank" for "no rank"; a deliberate press is allowed to take the answer as the whole truth. A read that failed changes nothing, and every press prints what it did - a role change that empties the panel leaves it on screen saying "none of your roles are one the app can name", rather than removing the panel and the button with it.
- **Discord Profile** - the account the app reads all of this from: avatar, handle, user id, the rank / director / divisions it resolved, and which of their Discord roles it recognised to get there. Divisions are listed even with no rank, because those are the sections the member can open.

Everything the member fills in is reused rather than re-typed, because one rank and one signature should not live in five tools:

- the FTD paperwork forms prefill their rank from the saved rank (`useHighestRank` prefers it, and falls back to Discord detection), and their signature field is seeded from the saved signature once per session (`SessionProvider`);
- the BLS and RED processors, the supervisor tools and the division templates read the credentials through `useMedic()`;
- the shared signature bar above the FTD email tools fills its name, rank, FTD rank and signature from the same place, with a **From Staff Page** button to re-read it.

So the Staff Page is the source of truth for an employee's own details, and `useGuildIdentity` is what proves them: the roles a signed-in member holds ride in their session, and `member-identity.ts` resolves them without a second Discord call.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
