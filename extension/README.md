# LSEMS Forum Poster (browser extension)

Fills GOV forum posts and private messages with the BBCode the LSEMS app just
prepared, so a `Copy & Open` button means the post is in the editor, reviewed and
ready to submit instead of waiting for a paste.

A `Copy & Open` marks the post it hands over, and the GOV page that opens pastes
it in **once**. Any button that opens the GOV page it hands to is a `Copy & Open`
in this sense, whatever its label says - the app marks the post in one helper
(`handOffAndOpenForumPost`) and `npm run extension:check` fails if a second place
starts writing the mark. That is the whole of it: a reload, a forum **Preview** (which
reloads the page with your text in it) and the same page opened twice all find a
post that has already been pasted and leave the editor alone. Pasting it again
takes another `Copy & Open`, and nothing is ever written into a page that was not
marked - a plain **Copy** waits in extension storage for the shortcut.

It lives in this repo on purpose: the app and the extension share one protocol,
and a change on either side is visible in the same commit.

Members install it from **Resources → Browser Extension** in the app, which
hands out this exact folder as a zip (built per request by
`/api/extension`, so it can't be stale). The steps below are the same ones that
page prints.

## Install (Chrome / Edge)

1. Open `chrome://extensions` (or `edge://extensions`).
2. Turn on **Developer mode**.
3. **Load unpacked** → select this `extension/` folder.
4. Pin it, then open the popup to check the version and the settings.

Reload the extension after editing any file here - content scripts are injected
at page load, so an already-open tab keeps the old copy. `npm run extension:check`
drives the whole handoff protocol with a stub browser (including that the version
in `shared.js` matches the manifest) and is worth running before anyone
re-downloads the folder.

Firefox runs the same files (its manifest carries the `browser_specific_settings.gecko`
id Firefox requires, and Firefox 121+ loads the `background.scripts` entry). Loaded
through `about:debugging` → *Load Temporary Add-on*, the install is temporary: it is
gone when the browser closes. A permanent Firefox install needs the add-on reviewed
on AMO - see `PUBLISHING.md`.

## How it works

```
LSEMS app  ──window.postMessage──▶  app-bridge.js  ──▶  chrome.storage.local
                                                             │
gov.eclipse-rp.net  ◀── posting / PM page ─── forum-fill.js ─┘
```

- The app posts `{ __lsems: "lsems:handoff", payload }` on its own window
  (`src/app/helpers/forumHandoff.ts`). No extension id, no shared secret, no
  host permission on the app itself beyond reading that one message.
- `app-bridge.js` stores the payload as the pending post and answers `ready` /
  `saved`, which is how the app's toast knows whether to say "press
  Alt+Shift+F" or just "copied".
- `forum-fill.js` runs on every GOV page. Wherever there is a phpBB editor - the
  full posting form, a **topic's quick reply**, or the PM composer - it writes the
  subject, the recipients and the body in. A payload may only hold a title
  (workflow steps that copy just a title), in which case only the subject is
  written.

**A tool hands over a whole post, not half of one.** Where a step has both a title
and a body, every one of its copy buttons sends both - so pressing "Copy Title"
puts the title on the clipboard *and* leaves the extension able to fill the
subject and the body together when the posting page opens. A step that genuinely
has no body sends none, and a body is never borrowed from the step before it: a
stale body under a fresh title is worse than an empty editor.

The section a post belongs to is read from the **form's `action`**, not the URL:
a topic's quick reply lives on `viewtopic.php?t=…` but posts to
`posting.php?mode=reply&f=…&t=…`, which is what makes "Reply to the BLS report
topic and the report is there" work. An editor that appears later (an AJAX-loaded
quick reply) is picked up for up to twenty seconds after load.

A post prepared for a *topic* (a course report into its report thread, an entry
into a personnel file) only pastes itself into that topic's editor; a page that
was not what the button meant shows a moment of warning saying so. A post with no
target at all fills whatever editor you open.

The two sides of that comparison are keys of different shapes - the post was
prepared as `topic:<t>` and the quick reply that serves it reads
`post:<section>:<t>` - so the topic is pulled out of whichever shape each side has
(`topicId`), never compared field by field. **A quick reply's action only has to
name the section**, because phpBB posts the topic in a hidden field instead, so
the topic is read from that field first, the action second, and the page's own
`viewtopic.php?t=…` last. Reading the action alone is what made a reply match
nothing at all, however clearly the post was prepared for it.

**Tools that know where their post goes say so**, and the app picks that target
for them: `posting.php` means a new post (subject + body), a `viewtopic.php` link
means that topic's quick reply, and `ucp.php` means the PM composer. Where a tool
only links a listing (`viewforum.php`), the topic the member pasted - the LOA
request, the applicant's personnel file, the resignation post - is used instead,
because that is where the content actually goes.

A quick reply has no subject box to speak of, so a payload's title is written to
whichever subject field the form has and nothing else is touched.

**The clipboard can carry a title too.** A tool that hands nothing over - or one
that has no title of its own - still leaves its text on the clipboard, and a fill
from there reads it sensibly: a single short line with no BBCode in it goes to the
subject box, anything longer or tagged goes to the post. The bar says which one it
did, and Undo puts the page back.

After a fill the caret sits in the post so it can be edited straight away, and
the Submit button is ringed so it is obvious which button finishes the job. The
confirmation that a page pasted by itself stays for about three seconds and then
gets out of the way - it is news, not a control panel.

`Alt`+`Shift`+`F` fills the page in front at any time: the saved post, or the
clipboard when nothing was prepared. That is the way back after a page declined
to paste, and the way to write a post into a section it was not prepared for. The
key is changeable at `chrome://extensions/shortcuts`.

**This extension never submits anything.** It has no code path that clicks a
post button: the post is written into the forum's own editor and Submit is always
your click, with the forum's own confirmation flow behind it.

### The clipboard fallback

Every copy button in the app leaves a GOV post on the clipboard, so an editor can
also be filled from there - a tool that is not wired yet, a post marked for
somewhere else, or a tool that only copies.

**The clipboard is only read when somebody asks for it:** `Alt`+`Shift`+`F` on a
page with nothing prepared opens a bar whose button does the same thing. No pass
reads the clipboard on arrival.

The prepared post itself used to be written in on arrival too, and that was the
wrong trade: a forum **Preview** reloads the page with your text in it, and
nothing here can tell "this page just loaded" from "this page just reloaded", so
the post was pasted over your edits again. The fix is not "never paste" but "paste
once": a `Copy & Open` marks its post, the matching page pastes it in as it loads,
and the fill is recorded against the post. The mark is what a Preview, a reload or
a reopened page runs into, and it is why your edits survive them.

That also makes the shortcut safe to use anywhere: it writes whatever is on the
clipboard, because that time somebody asked, without asking whether the text looks
like a post.

Reading the clipboard is what the install prompt's *read data you copy and paste*
covers, and it only ever happens for the actions above.

**The saved post is kept after a fill.** That is what a marked post needs - the
mark, not a deletion, is what stops a second paste - and it means the shortcut can
still paste it by hand, or the popup can clear it.

The extension asks for `storage` (the prepared post), `clipboardWrite` and
`clipboardRead` (the fallback above). It has no host permission on the app beyond
reading the one handoff message, and none at all on any other site.

Nothing here ever opens a panel by itself. A page with an editor and nothing
prepared for it is left completely alone: no bar, no popup, nothing to dismiss.
The only thing a page load can show is a `Copy & Open`'s own paste, a warning when
that paste would have replaced a draft or an edit, and two last-resort notes for a
marked post that could not be pasted: **no editor appeared on the page**, so the
reply form has to be opened first, and a fill that went into a **box the member
cannot see** - a collapsed reply box submits fine, and saying so is the difference
between "it worked" and "nothing happened". All of them take themselves away after
a few seconds. Replacing text in the editor still takes the shortcut, which does
exactly what it says because somebody asked.

## When it doesn't work

**`TypeError: Cannot read properties of undefined (reading 'local')` from
`shared.js`.** The copy answering on that page is older than the file in this
repo. Every storage helper goes through `LSEMS.storageArea()`, which returns
`null` instead of throwing, and `npm run extension:check` asserts that no other
file touches `chrome.storage` at all - so this error can only come from code that
is no longer here. Two causes, and the version tells them apart:

- **The page outlived an update.** Reload it. The bar says so itself and offers a
  Reload button.
- **Two copies are installed.** Then the old one keeps answering, and reloading
  never helps. Resources -> Browser Extension names every version answering on
  the page: two versions listed means two installs. Remove the older card at
  `chrome://extensions` and keep the newest.

## Maintaining it

**The posting-page selectors are the only theme-dependent part.** phpBB keeps raw
BBCode in the message textarea, which is why this works at all. If Eclipse's theme
is ever re-templated, fix the first list in `src/forum-fill.js`:

| Field | Selectors tried, in order |
| --- | --- |
| Message body | `textarea[name="message"]`, `#message` |
| Subject | `input[name="subject"]`, `#subject` |
| PM recipients | `input[name="username_list"]`, `#username_list` |
| Submit button | `input[name="post"]`, `button[name="post"]` - only ever ringed, never clicked |

These match Eclipse's quick reply today (`<textarea name="message">` plus
`<input name="subject" id="subject">`), which is also the full posting form's
markup - prosilver renders the quick reply as `<form id="qr_postform">` with the
textarea directly inside it, and `quickReply` is read from that `qr_` prefix.
Two editors on one page (a quick reply and a full editor) is handled: the visible
one wins.

To see what the forum really serves, open a posting page and run in the console:

```js
document.querySelector('textarea[name="message"], #message')
document.querySelector('input[name="subject"]')
document.querySelector('input[name="username_list"]') // PM composer only
```

**App origins.** `content_scripts[0].matches` in `manifest.json` lists where the
app is served from: localhost on any port and `*.vercel.app` (the production
alias `ecrp-lsems.vercel.app` and every preview). A bridge on an origin that is
not listed never runs, the handoff silently does nothing, and posts fill by hand
as they used to - so a new domain belongs in that list **before** wondering why
nothing happens. The Browser Extension page in the app reports whether the
bridge is alive in the browser you are looking at, which is the fastest way to
tell the two apart.

## Releasing it

A store release is two commands and one web form, and the whole checklist - the
account, the screenshots only you can take, the paste-ready listing copy and
the permission justifications - is in `PUBLISHING.md`.

```
npm run extension:check    # the handoff, the manifest, both archive shapes
npm run extension:zip      # build/lsems-forum-poster-<version>.zip -> the store
npm run extension:assets   # icons, listing logo, promo tile, screenshot sizes
```

Bump `version` in `manifest.json` before every upload: the store refuses a
version it has already seen. `extension:check` fails if the manifest and
`src/shared.js` disagree about the version, so that mistake is caught here rather
than by a rejection email.

## Files

| File | Runs on | Purpose |
| --- | --- | --- |
| `manifest.json` | - | MV3 declaration: origins, permissions, icons, popup |
| `icons/` | - | The LSEMS emblem at 16/32/48/128, from `public/General.png` |
| `store/` | - | Listing art (logo, promo tile, screenshots) - generated, never archived |
| `PUBLISHING.md` | - | The Web Store checklist, listing copy and justifications |
| `PRIVACY.md` | - | The privacy policy the store review asks for |
| `src/shared.js` | everywhere | Message names, storage helpers, payload validation |
| `src/background.js` | service worker | Keeps the toolbar badge in sync |
| `src/app-bridge.js` | the LSEMS app | Receives handoffs, stores the pending post |
| `src/forum-fill.js` | gov.eclipse-rp.net | Fills posting/PM forms, pastes a marked post, shows the confirmation |
| `popup/` | toolbar popup | Pending post, manual open/copy/clear |
