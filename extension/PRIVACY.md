# Privacy policy - LSEMS Forum Poster

_Last updated: 25 September 2026_

LSEMS Forum Poster is an internal tool for members of the LSEMS department on
Eclipse RP. This policy describes exactly what it does with your browser, and the
short answer is that nothing leaves it.

## What it stores

When you press a Copy or Copy & Open button in the LSEMS app, the extension saves
that prepared post - its title, its BBCode body, any private-message recipients,
and the page it belongs on - in your browser's own extension storage
(`chrome.storage.local`). It stays on your machine.

That post is deleted when you clear it from the extension's toolbar popup, when a
new Copy & Open replaces it, or (if you turn on that setting) once it has been
filled. Uninstalling the extension removes it with the rest of its data.

## What it reads

- **The LSEMS app's own pages**, to receive the post you prepared.
- **gov.eclipse-rp.net**, to find the form to fill - the subject field, the
  message field and the recipient field.
- **Your clipboard**, and only at the moment you ask for a fill: pressing Fill, or
  Alt+Shift+F. This exists so any tool's Copy button can fill an editor. It never
  reads the clipboard on its own, and never in the background.

It does not read Discord, your messages, your browsing history, other tabs, or any
other website.

## What it sends

Nothing. There is no server behind this extension, no analytics, no telemetry, and
no network request of its own anywhere in its code. The only traffic it causes is
the forum page your own browser is loading, and the post goes into the forum's form
for you to submit - or not - yourself.

## Who can see your data

Only you. Nothing is shared, sold or transferred to anyone, because nothing is
collected in the first place.

## Contact

Raise it in the LSEMS tools repository, or with the department member who
maintains the LSEMS app.
