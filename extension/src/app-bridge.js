/**
 * Runs on the LSEMS app. Receives the post the app prepared, stores it as the
 * pending post, and answers the app's questions about itself.
 *
 * Only `postMessage` is used, so the app needs no knowledge of this extension's
 * id and the extension needs no access to the app's internals.
 *
 * The app runs this at `document_start`, where `<html>` may not exist yet, so
 * nothing here may assume a DOM: the announcement goes out first and the marker
 * on `<html>` is best-effort.
 */
(function () {
  function announce() {
    LSEMS.postToPage({
      __lsems: LSEMS.MSG_READY,
      version: LSEMS.VERSION,
      // A reloaded extension leaves this script on the page without its APIs,
      // still able to answer. Without this flag the app would report a working
      // extension that has nowhere to put a post.
      alive: LSEMS.isContextAlive(),
    });
    try {
      document.documentElement.setAttribute(
        `data-${LSEMS.READY_FLAG}`,
        LSEMS.VERSION,
      );
    } catch {
      // Too early for a document element; the message above is what matters.
    }
  }

  async function save(raw) {
    const entry = LSEMS.normalisePayload(raw);
    if (!entry) return;
    // The app sends a step's whole post - title and body - from every one of its
    // copy buttons, so the handoff is complete and the newest one simply wins.
    entry.appUrl = window.location.href;
    // Null means it could not be stored, so claiming it was would be a lie the
    // member only discovers on the GOV page.
    if (!(await LSEMS.setPending(entry))) {
      report();
      return;
    }
    LSEMS.syncBadge();
    LSEMS.postToPage({
      __lsems: LSEMS.MSG_SAVED,
      id: entry.id,
      subject: entry.subject,
    });
    report();
  }

  /**
   * What the app's Browser Extension page shows: the bridge is obviously alive
   * (it answered), and the last post handed over, so "it isn't working" can be
   * told apart from "nothing was handed over yet".
   */
  async function report() {
    const pending = await LSEMS.getPending();
    LSEMS.postToPage({
      __lsems: LSEMS.MSG_STATUS,
      version: LSEMS.VERSION,
      alive: LSEMS.isContextAlive(),
      pending: pending
        ? {
            subject: pending.subject || "",
            url: pending.url || "",
            feature: pending.feature || "",
            createdAt: pending.createdAt || 0,
          }
        : null,
    });
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.__lsems === LSEMS.MSG_PING) {
      announce();
      report();
      return;
    }
    if (data.__lsems === LSEMS.MSG_STATUS_REQUEST) {
      report();
      return;
    }
    if (data.__lsems === LSEMS.MSG_HANDOFF) {
      save(data.payload);
    }
  });

  announce();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", announce);
  }
})();
