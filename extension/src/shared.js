/**
 * Constants and storage helpers shared by the content scripts, the popup and the
 * service worker. Declared with `var` so every script gets the same object.
 *
 * The page <-> extension protocol lives here too: the app posts `MSG_HANDOFF`
 * on the window, the bridge stores it, and a GOV page reads it back. Nothing
 * crosses that boundary except plain data.
 */
var LSEMS = {
  // Kept in step with `manifest.json` by `npm run extension:check`.
  VERSION: "1.3.0",
  APP_SOURCE: "lsems-app",
  EXT_SOURCE: "lsems-extension",
  MSG_HANDOFF: "lsems:handoff",
  MSG_PING: "lsems:ping",
  MSG_READY: "lsems:ready",
  MSG_SAVED: "lsems:saved",
  MSG_STATUS: "lsems:status",
  // A request and its answer share the window, so they must not share a name:
  // the bridge hears its own posts, and answering one would answer itself.
  MSG_STATUS_REQUEST: "lsems:status-request",
  MSG_BADGE: "lsems:sync-badge",
  STORAGE_PENDING: "pendingPost",
  STORAGE_SETTINGS: "settings",
  READY_FLAG: "lsemsExtension",
  DEFAULT_SETTINGS: { clearAfterFill: false },
};

LSEMS.makeId = function () {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

/** Post a message to the page (content script -> app, or app -> content script). */
LSEMS.postToPage = function (data) {
  window.postMessage(data, window.location.origin);
};

/**
 * The storage area, or null when there is no extension context left to use.
 *
 * A content script outlives its extension: reload or update the extension and
 * the copy already running on the page keeps going, but Chrome has taken its
 * APIs away. `chrome` is then either undefined or has no `storage`, so every
 * helper here would throw "Cannot read properties of undefined (reading
 * 'local')" - which is why nothing below touches `chrome.storage` directly.
 */
LSEMS.storageArea = function () {
  try {
    return chrome && chrome.storage && chrome.storage.local
      ? chrome.storage.local
      : null;
  } catch {
    return null;
  }
};

/** False once this script's extension has gone away underneath it. */
LSEMS.isContextAlive = function () {
  try {
    return Boolean(chrome && chrome.runtime && chrome.runtime.id);
  } catch {
    return false;
  }
};

LSEMS.getSettings = async function () {
  const area = LSEMS.storageArea();
  if (!area) return Object.assign({}, LSEMS.DEFAULT_SETTINGS);
  try {
    const stored = await area.get(LSEMS.STORAGE_SETTINGS);
    return Object.assign(
      {},
      LSEMS.DEFAULT_SETTINGS,
      stored[LSEMS.STORAGE_SETTINGS] || {},
    );
  } catch {
    return Object.assign({}, LSEMS.DEFAULT_SETTINGS);
  }
};

LSEMS.saveSettings = async function (patch) {
  const next = Object.assign({}, await LSEMS.getSettings(), patch);
  const area = LSEMS.storageArea();
  if (area) {
    try {
      await area.set({ [LSEMS.STORAGE_SETTINGS]: next });
    } catch {
      // A stale context can't save, and the caller can't do anything about it.
    }
  }
  return next;
};

LSEMS.getPending = async function () {
  const area = LSEMS.storageArea();
  if (!area) return null;
  try {
    const stored = await area.get(LSEMS.STORAGE_PENDING);
    return stored[LSEMS.STORAGE_PENDING] || null;
  } catch {
    return null;
  }
};

/** Returns the entry it saved, or **null** when it could not be saved at all. */
LSEMS.setPending = async function (entry) {
  const area = LSEMS.storageArea();
  if (!area) return null;
  try {
    await area.set({ [LSEMS.STORAGE_PENDING]: entry });
    return entry;
  } catch {
    return null;
  }
};

LSEMS.clearPending = async function () {
  const area = LSEMS.storageArea();
  if (!area) return;
  try {
    await area.remove(LSEMS.STORAGE_PENDING);
  } catch {
    // Same as above: nothing left to clear it with.
  }
};

/** Ask the service worker to re-read storage and update the toolbar badge. */
LSEMS.syncBadge = function () {
  try {
    chrome.runtime.sendMessage({ type: LSEMS.MSG_BADGE });
  } catch {
    // Service worker asleep or the script is running in a page without it.
  }
};

/**
 * A single short line with no BBCode in it: what a tool's "Copy Title" leaves on
 * the clipboard. The clipboard fallback uses it to tell a title from a body, so a
 * copied title lands in the subject box instead of being pasted into the post.
 *
 * The app hands over the whole post wherever it can - title and body together -
 * so this only decides for copies that were never handed over at all.
 */
LSEMS.looksLikeTitle = function (text) {
  const value = (text || "").trim();
  if (!value || value.length > 120) return false;
  if (value.indexOf("\n") !== -1) return false;
  return !/\[\/?[a-z]/i.test(value);
};

/**
 * Normalise a handoff payload coming from the app. Returns null when there is
 * nothing postable in it, so a stray message can never blank the saved post.
 */
LSEMS.normalisePayload = function (raw) {
  if (!raw || typeof raw !== "object") return null;
  const bbcode = typeof raw.bbcode === "string" ? raw.bbcode.trim() : "";
  const subject = typeof raw.subject === "string" ? raw.subject.trim() : "";
  if (!bbcode && !subject) return null;
  return {
    id: LSEMS.makeId(),
    createdAt: Date.now(),
    feature: typeof raw.feature === "string" ? raw.feature : "",
    subject,
    bbcode,
    recipient: typeof raw.recipient === "string" ? raw.recipient.trim() : "",
    url: typeof raw.url === "string" ? raw.url : "",
  };
};
