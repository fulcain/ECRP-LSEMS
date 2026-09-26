/**
 * Keeps the toolbar badge honest, and turns the keyboard shortcut into a fill
 * command for whatever GOV tab is in front.
 *
 * Install/startup sync the badge once so it is right after a browser restart.
 *
 * Chrome loads this as a service worker, where `importScripts` brings
 * `shared.js` in. Firefox loads it as a background script with `shared.js`
 * already ahead of it in the manifest's `scripts` array, so the guard below
 * skips the import there rather than throwing on the missing function.
 */
if (typeof importScripts === "function") {
  importScripts("shared.js");
}

async function syncBadge() {
  const pending = await LSEMS.getPending();
  await chrome.action.setBadgeBackgroundColor({ color: "#0891b2" });
  await chrome.action.setBadgeText({ text: pending ? "1" : "" });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message && message.type === LSEMS.MSG_BADGE) {
    syncBadge();
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "fill-post") return;
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab || tab.id === undefined) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "lsems:fill-now" });
  } catch {
    // The tab in front is not a GOV page, so there is nothing to fill.
  }
});

chrome.runtime.onInstalled.addListener(syncBadge);
chrome.runtime.onStartup.addListener(syncBadge);
