# Publishing the extension

**The plan: a free, hidden listing on the Microsoft Edge Add-ons site.** A store
listing is what turns the install into two clicks and, more importantly, into
*updates that arrive by themselves* - nobody re-downloads a zip, nobody presses
reload, nobody has to turn on Developer mode. Edge charges nothing for it, and a
hidden listing is only reachable by the link you hand out. Chrome still needs its
one-off $5 to do the same thing, so it can wait; the zip covers Chrome members
today, exactly as it does now. Nothing about the extension changes either way, and
a hand-installed folder keeps working, so this is an upgrade rather than a
migration anyone has to finish.

Everything the repo can do is already done:

- `icons/` - the LSEMS emblem at 16/32/48/128, wired into `manifest.json` (toolbar,
  extensions page, listing icon).
- `npm run extension:zip` - writes `build/lsems-forum-poster-<version>.zip` with
  `manifest.json` **at the root**, which is the shape a store accepts. The in-app
  download is the other shape on purpose: one folder, for *Load unpacked*.
- `npm run extension:assets` - the 300x300 listing logo, a 440x280 promo tile, and
  any raw screenshot fitted to the exact sizes a store accepts.
- `PRIVACY.md` - both stores ask for a privacy policy URL; the text is ready.
- The app page is store-ready: `NEXT_PUBLIC_EXTENSION_STORE_URL` turns it into a
  single **Add to Edge** button, with the zip demoted to the manual fallback.

There is nothing else to build. What is left needs your account, so it is a
checklist below.

## What I need from you

1. **A Microsoft account**, and a free Partner Center registration for the Edge
   program (outlook.com / live.com; no card, no fee). Decide which account owns
   it - a personal one is normal and the listing can be transferred later. Nothing
   in the repo depends on it.
2. **Two screenshots.** At least one is required and they must show the extension
   doing its job - I can't take them, because the forum needs your login:
   - prepare any post (a meeting agenda is a good one), open the GOV posting page,
     and capture the page **with the bar visible** in the corner;
   - click the toolbar icon and capture the popup over the forum page.

   Windows + Shift + S is fine, at any size: drop the files in
   `extension/store/raw/` and `npm run extension:assets` fits them to exactly
   1280x800 (and 640x480), which is the size Edge requires. Check no member's
   private data is in frame.
3. **Say the word on the listing text** below - it is written to be pasted in
   as-is, but you own the community's voice.
4. **The listing URL once it is approved**, so the app page can point at it.
5. **Optionally, publishing without the dashboard.** Edge has a publish API: with
   an API key and the product id - or, for Chrome, a Web Store OAuth client id,
   secret, refresh token and item id - `npm run extension:publish` can upload a
   new version in one command instead of dragging a zip into a web form. Without
   one, the upload is the whole process, once per release.

## Free options, and what they cost instead of money

Chrome charges a **one-off $5** developer registration (per account, not per item
and not yearly). Two routes avoid it. Both trade money for something else, so the
choice is which currency you'd rather spend.

| Route | Cost | Members get | What it costs you |
| --- | --- | --- | --- |
| **Edge Add-ons** | Free, no fee | One-click install, auto-updates - **in Edge only** | Nothing beyond the listing. The same zip uploads as-is. |
| **Tampermonkey userscript** | Free | One-click install, auto-updates from this app's own URL - **in Chrome** | A port of the fill logic, plus members installing Tampermonkey |
| **Chrome Web Store** | $5 once, ever | One-click install, auto-updates - in Chrome | The $5, and the review |
| **Keep the zip** | Free | Manual install, manual updates | Every member does it by hand, forever |

**Edge is the free win.** Build a Microsoft account, publish at the Partner
Center, set **Visibility: Hidden** to keep it out of search while still sharing
the listing link, and the zip is unchanged - `manifest.json` is already MV3, which
is all Edge accepts today. If a member uses Edge, they get the whole experience for
nothing. If they use Chrome, nothing changes for them: the zip is still there.

**The userscript route works in Chrome**, and it is the only free way to get
one-click installs and automatic updates there: a userscript with `@updateURL`
and `@downloadURL` pointing at a route on this app updates itself the way a store
listing does, and `GM_addValueChangeListener` carries the prepared post from the
app's tab to the forum's tab the way `window.postMessage` does today. Two honest
caveats: members must install Tampermonkey first, and current Chrome requires
Developer mode plus the *Allow user scripts* toggle for userscript managers - so
it is one toggle instead of "load unpacked", not zero. The fill logic in
`src/forum-fill.js` is plain DOM code and ports almost line for line; the storage
and messaging layers are the real work.

**Self-hosting is not an option**, and this one is worth knowing before anyone
spends an evening on it: Chrome's own documentation states that *"Linux is the
only platform where Chrome users can install extensions that are hosted outside
of the Chrome Web Store"*. A `.crx` on your own server with an `update_url` in
the manifest - the classic free auto-update trick - is dead on Windows and macOS,
which is where your members are. Firefox's add-on site is free but is a different
browser with its own review (see below).

The app does not care which you pick: set `NEXT_PUBLIC_EXTENSION_STORE_URL` to
the listing and the page becomes a one-click button. The label reads the URL - a
Chrome link says *Add to Chrome*, an Edge link says *Add to Edge* - so an Edge
listing needs no code change.

## Edge, step by step (the route we are taking)

Edge takes the same zip, needs no fee, and has the same two-click install and
automatic updates. Its Partner Center asks for slightly different fields, so here
is the list in the order it asks.

**Everything it needs is already generated:**

| Upload | File |
| --- | --- |
| Package | `npm run extension:zip` -> `build/lsems-forum-poster-<version>.zip` |
| Listing logo (300x300) | `extension/store/store-logo-300x300.png` |
| Small promo tile (440x280) | `extension/store/promo-tile-440x280.png` |
| Screenshots | `extension/store/screenshot-N-1280x800.png` |

Regenerate any of it, or fit your own screenshots to the exact size, with
`npm run extension:assets`. Both archives deliberately exclude `extension/store/`,
so none of this art reaches a member's browser.

**Fields, and the gotcha worth knowing first:** Edge fills your listing's name and
description **from the manifest**. `manifest.json` already carries the name and a
short description that reads as the store blurb, and Partner Center will show
them read-only - to change them you edit the manifest and re-upload, not the form.

1. **A Microsoft account** (outlook.com / live.com), then Partner Center -> Edge
   program. Free; no card.
2. **Create new extension** -> upload the zip. It validates the package before you
   go further, which is the fastest way to catch a manifest mistake.
3. **Availability** -> Visibility **Hidden** (removes it from search and browsing;
   the listing URL is what you share with members), Markets as they are.
4. **Properties** -> Category: *Productivity* or *Workflow & Planning*; Website
   optional (`ecrplsems.com` if you want one); Support contact optional.
5. **Privacy** -> paste the single-purpose text and the permission justifications
   from the sections above, answer **No** to remote code, and take the data-usage
   option that says nothing is collected. The line that matters, and it is true of
   this extension: it has no server, makes no network request of its own, and has
   nothing to share. Privacy policy URL: point it at wherever `PRIVACY.md` is
   hosted publicly (a raw GitHub link works if this repo is public; otherwise a
   gist is fine).
6. **Store listing** -> per language: description (paste the detailed description
   from above), screenshots (1280x800, one is enough), the 300x300 logo, the
   440x280 tile, and search terms if you want any.
7. **Certification testing notes** -> this is the field that decides how smooth
   the review goes, and it is free text. Suggested wording:

   ```
   This extension only acts on gov.eclipse-rp.net, the forum of a private
gaming community, and it receives its content from the LSEMS web app that our
department uses. Both require a membership account, so it cannot be exercised
without one. What can be verified without an account: the extension has no
network requests of its own, requests only storage and clipboard permissions,
declares no remote code, and never submits a form - the Submit click is always
the user's.
   ```
8. **Submit.** Review for a hidden listing with no remote code is usually quick.

After it is approved, take the listing URL from the Partner Center overview page,
set `NEXT_PUBLIC_EXTENSION_STORE_URL` to it, and redeploy: the app's page becomes
a single **Add to Edge** button and the zip drops to the manual fallback. The
button label reads the URL, so no code changes with it.

## The upload, in order (Chrome, if you ever pay the $5)

1. `npm run extension:zip` -> `build/lsems-forum-poster-<version>.zip`.
2. [Developer dashboard](https://chrome.google.com/webstore/devconsole) -> **New
   item** -> drop in that zip.
3. Store listing: paste the copy from the next section; upload `icon-128.png` from
   `extension/icons/` and the screenshots.
4. Privacy: paste the answers from the permissions section, and point the policy
   URL at wherever `PRIVACY.md` is hosted publicly (a raw GitHub link is fine **if
   this repo is public** - if it isn't, put the text on a gist or a simple page).
5. Distribution: **Unlisted**, unless you want it searchable by anyone on the
   internet. Unlisted still auto-updates and still installs from a link; it just
   isn't in the store's search results. This is the right setting for a tool that
   only makes sense to LSEMS members - and it keeps the review focused.
6. Submit. First review is usually a day or two, sometimes longer; updates are
   usually faster.

The reviewer tests in a fresh browser with no GOV account, so they cannot log in
and cannot see it fill anything. Say so in **Notes for review**: the extension
only acts on pages of a membership forum, it is published unlisted for that
community, and the flow is app -> forum editor. Being explicit is what avoids a
"can't verify functionality" rejection.

## Listing copy (paste-ready)

**Name:** LSEMS Forum Poster

**Short description** (132 characters max):

```
Fills GOV forum posts and PMs with the BBCode the LSEMS app prepared - title, recipients and body, ready to submit.
```

**Category:** Workflow & Planning

**Single purpose:**

```
Fill the GOV forum's own post and private-message editors with the BBCode an LSEMS member prepared in the LSEMS app, so a prepared post never has to be pasted by hand: open the posting page, press Fill, and the title, recipients and body are written in.
```

**Detailed description:**

```
The LSEMS app writes the paperwork - promotion and resignation steps, LOA approvals, meeting agendas, course reports, division emails, FTO requests. This extension carries that text into the GOV forum's own editor: press Copy & Open in the app, land on the forum page, and press Fill on the bar in the corner - the subject, the recipients and the BBCode are written into the form for you to review.

It writes nothing on its own. Opening a page, reloading it, or using the forum's own Preview never fills anything: the post waits until you press Fill. It never posts either - the Submit button is always yours to press.

What it fills:
- a posting page (posting.php?mode=post): subject and message
- a topic's quick reply: the message, and the subject when there is one
- the private-message composer: recipient, subject and message

Where it works:
- gov.eclipse-rp.net, which it writes to
- the LSEMS app itself, which hands it the prepared post

It reads nothing else: no Discord, no other tabs, no browsing history. The prepared post sits in this browser's own extension storage until it is filled, cleared from the toolbar popup, or replaced by the next Copy & Open.

Built by and for the LSEMS department of Eclipse RP.
```

**Permissions, with the justification the dashboard asks for:**

| Permission | Answer |
| --- | --- |
| `storage` | Holds the prepared post - title, BBCode, target page - in the browser's own extension storage until it is filled or cleared. |
| `clipboardWrite` | Keeps the app's copy buttons working when the page's own clipboard write is blocked, and lets the popup re-copy a post. |
| `clipboardRead` | The clipboard fallback: a fill from the clipboard happens only when the member presses Fill or Alt+Shift+F, never on its own. |
| `https://gov.eclipse-rp.net/*` | The only site the extension writes to - the forum whose editor it fills. |
| App origins (content script) | Receives the prepared post, and nothing else, from the LSEMS app's own pages. |
| Remote code | **No.** Everything it runs is inside the package; it fetches nothing and loads no remote scripts. |
| Data collection | **None.** No analytics, no servers, no network requests of its own; nothing is sold or shared. |

## Releasing an update

1. Bump `version` in `extension/manifest.json`. The store rejects an upload that
   reuses a version, so this is the one step that must not be forgotten.
2. `npm run extension:check` and `npm run extension:zip`.
3. Upload the new zip (dashboard, or `npm run extension:publish` if the API
   credential exists) and submit for review.

Installs update themselves within a few hours of approval; a member never has to
do anything. The app's own download keeps working throughout, and both copies are
the same folder in this repo - there is no second place to edit.

## Other browsers

- **Edge** - the same zip uploads to the Microsoft Partner Center (free, no fee),
  with a **Hidden** listing if you do not want it searchable. See the table above:
  this is the free route to one-click installs and auto-updates.
- **Firefox** - needs a `browser_specific_settings.gecko.id` in the manifest and
  AMO review. Ask before relying on it.
